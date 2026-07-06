import datetime
import os
from datetime import timedelta
from typing import Optional
from fastapi import FastAPI, Depends, HTTPException, Response, Cookie
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from passlib.context import CryptContext
import jwt
from dotenv import load_dotenv

from database import takeFromBase, executeQuery

load_dotenv()

app = FastAPI()

# Konfiguracija
SECRET_KEY = os.getenv("JWT_SECRET_KEY")
ALGORITHM = "HS256"
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
    allow_credentials=True,
)

# --- Autentifikacija ---
def get_current_user(access_token: str = Cookie(None)):
    if not access_token:
        raise HTTPException(status_code=401, detail="Niste prijavljeni")
    try:
        payload = jwt.decode(access_token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Nevaljani token")

def create_access_token(user_id: int, email: str):
    expire = datetime.datetime.utcnow() + timedelta(minutes=60)
    payload = {"sub": str(user_id), "email": email, "exp": expire}
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)

# --- Modeli ---
class LoginModel(BaseModel):
    email: str
    password: str

class RegisterModel(BaseModel):
    email: str
    password: str
    partner_one: str
    partner_two: str
    wedding_date: str = None
    weddning_location: str = None

class GuestModel(BaseModel):
    name: str
    plus_one: bool = False
    plus_one_name: Optional[str] = None
    status: str = "Na čekanju"
    phone: Optional[str] = None
    menu_type: str = "Standard"
    menu_type_plus_one: str = "Standard"
    table_number: Optional[int] = None
    notes: Optional[str] = None

class TableModel(BaseModel):
    capacity: int = 10
    notes: Optional[str] = None

class MoveGuestRequest(BaseModel):
    table_id: Optional[int] = None

class BudgetModel(BaseModel):
    item_title: str
    item_amount: float
    item_status: str
    item_category: str
    deposit_amount: Optional[float] = None
    item_notes: Optional[str] = None

# --- Rute ---
@app.post("/api/login")
def login(login_data: LoginModel, response: Response):
    user = takeFromBase("SELECT * FROM users WHERE email = %s;", (login_data.email,))
    if not user or not pwd_context.verify(login_data.password, user[0]["password"]):
        raise HTTPException(status_code=401, detail="Neispravan email ili lozinka")
    
    token = create_access_token(user_id=user[0]["id"], email=user[0]["email"])
    response.set_cookie(key="access_token", value=token, httponly=True, samesite="lax", max_age=3600)
    return {"message": "Uspješna prijava"}

@app.post("/api/logout")
def logout(response: Response):
    response.delete_cookie("access_token")
    return {"message": "Odjavljeni ste"}

@app.get("/api/me")
def get_me(current_user: dict = Depends(get_current_user)):
    user_id = current_user.get("sub")
    user = takeFromBase("SELECT partner_one, partner_two FROM users WHERE id = %s;", (user_id,))
    if not user:
        raise HTTPException(status_code=404, detail="Korisnik nije nađen")
    return {"user": user[0]}
    

@app.post("/api/register")
def register(register_data: RegisterModel):
    if takeFromBase("SELECT * FROM users WHERE email = %s;", (register_data.email,)):
        raise HTTPException(status_code=400, detail="Korisnik već postoji")
    
    hashed = pwd_context.hash(register_data.password)
    query = "INSERT INTO users (email, password, partner_one, partner_two, wedding_date, wedding_location) VALUES (%s, %s, %s, %s, %s, %s);"
    if not executeQuery(query, (register_data.email, hashed, register_data.partner_one, register_data.partner_two, register_data.wedding_date, register_data.weddning_location)):
        raise HTTPException(status_code=500, detail="Greška pri registraciji")
    return {"message": "Uspješna registracija"}

# Gosti

@app.get("/api/guests")
def get_guests(current_user: dict = Depends(get_current_user)):
    return takeFromBase("SELECT * FROM guests WHERE user_id = %s ORDER BY id ASC;", (current_user.get("sub"),))

@app.post("/api/guests")
def add_guest(guest_data: GuestModel, current_user: dict = Depends(get_current_user)):
    query = "INSERT INTO guests (user_id, name, plus_one, plus_one_name, status, phone, menu_type, menu_type_plus_one, table_number, notes) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s);"
    success = executeQuery(query, (current_user.get("sub"), guest_data.name, guest_data.plus_one, guest_data.plus_one_name, guest_data.status, guest_data.phone, guest_data.menu_type, guest_data.menu_type_plus_one, guest_data.table_number, guest_data.notes))
    return {"message": "Gost uspješno dodan"} if success else HTTPException(status_code=500)

@app.delete("/api/guests/{guest_id}")
def delete_guest(guest_id: int, current_user: dict = Depends(get_current_user)):
    success = executeQuery("DELETE FROM guests WHERE id = %s AND user_id = %s;", (guest_id, current_user.get("sub")))
    return {"message": "Obrisano"} if success else HTTPException(status_code=500)

@app.put("/api/guests/{guest_id}")
def update_guest(guest_id: int, guest_data: GuestModel, current_user: dict = Depends(get_current_user)):
    query = "UPDATE guests SET name = %s, plus_one = %s, plus_one_name = %s, status = %s, phone = %s, menu_type = %s, menu_type_plus_one = %s, table_number = %s, notes = %s WHERE id = %s AND user_id = %s;"
    success = executeQuery(query, (guest_data.name, guest_data.plus_one, guest_data.plus_one_name, guest_data.status, guest_data.phone, guest_data.menu_type, guest_data.menu_type_plus_one, guest_data.table_number, guest_data.notes, guest_id, current_user.get("sub")))
    return {"message": "Ažurirano"} if success else HTTPException(status_code=500)

@app.put("/api/guests/{guest_id}/move")
def move_guest(guest_id: int, data: MoveGuestRequest, current_user: dict = Depends(get_current_user)):
    user_id = current_user.get("sub")

    if data.table_id is None:
        success = executeQuery(
            "UPDATE guests SET table_id = NULL WHERE id = %s AND user_id = %s", 
            (guest_id, user_id)
        )
        if not success:
            raise HTTPException(status_code=500, detail="Greška pri uklanjanju gosta")
        return {"success": True, "table_id": None}

    table = takeFromBase("SELECT id, capacity FROM tables WHERE id = %s AND user_id = %s", (data.table_id, user_id))
    if not table:
        raise HTTPException(status_code=404, detail="Stol nije pronađen")
    table_capacity = table[0]['capacity']

    guest = takeFromBase("SELECT plus_one FROM guests WHERE id = %s AND user_id = %s", (guest_id, user_id))
    if not guest:
        raise HTTPException(status_code=404, detail="Gost nije pronađen")
    
    guest_size = 1 + (1 if guest[0]['plus_one'] else 0)

    occupancy_data = takeFromBase("""
        SELECT SUM(1 + CASE WHEN plus_one = true THEN 1 ELSE 0 END) as total 
        FROM guests 
        WHERE table_id = %s AND id != %s
    """, (data.table_id, guest_id))
    
    current_occupancy = occupancy_data[0]['total'] or 0

    if (current_occupancy + guest_size) > table_capacity:
        raise HTTPException(status_code=400, detail=f"Stol je popunjen! Kapacitet je {table_capacity}.")

    success = executeQuery(
        "UPDATE guests SET table_id = %s WHERE id = %s AND user_id = %s", 
        (data.table_id, guest_id, user_id)
    )
    
    return {"success": True, "table_id": data.table_id}

# Stolovi

@app.post("/api/tables")
def add_table(table_data: TableModel, current_user: dict = Depends(get_current_user)):
    user_id = current_user.get("sub")
    query_max = "SELECT COALESCE(MAX(table_number), 0) + 1 AS next_num FROM tables WHERE user_id = %s;"
    next_number = takeFromBase(query_max, (user_id,))[0]['next_num']
    
    insert_query = "INSERT INTO tables (user_id, table_number, capacity, table_notes) VALUES (%s, %s, %s, %s);"
    success = executeQuery(insert_query, (user_id, next_number, table_data.capacity, table_data.notes))
    return {"message": "Stol uspješno dodan"} if success else HTTPException(status_code=500)

@app.get("/api/tables")
def get_tables(current_user: dict = Depends(get_current_user)):
    tables = takeFromBase("SELECT * FROM tables WHERE user_id = %s ORDER BY table_number ASC;", (current_user.get("sub"),))
    return tables if tables is not None else []

@app.put("/api/tables/{table_id}")
def update_tables(table_id: int, data: TableModel, current_user: dict = Depends(get_current_user)):
    user_id = current_user.get("sub")
    query = """ UPDATE tables SET capacity = %s, table_notes = %s WHERE id = %s AND user_id = %s """
    success = executeQuery(query, (data.capacity, data.notes, table_id, user_id))
    return {"message": "Ažurirano"} if success else HTTPException(status_code=500)

@app.delete("/api/tables/{table_id}")
def delete_tables(table_id: int, current_user: dict = Depends(get_current_user)):
    success = executeQuery("DELETE FROM tables WHERE id = %s AND user_id = %s;", (table_id, current_user.get("sub")))
    return {"message": "Obrisano"} if success else HTTPException(status_code=500)

#Budget

@app.post("/api/budget")
def add_item(budget_data: BudgetModel, current_user: dict = Depends(get_current_user)):
    user_id = current_user.get("sub")
    query = "INSERT INTO budget (user_id, item_title, item_status, item_amount, item_category, item_deposit, item_notes) VALUES (%s, %s, %s, %s, %s, %s, %s);"
    success = executeQuery(query, (user_id, budget_data.item_title, budget_data.item_status, budget_data.item_amount, budget_data.item_category, budget_data.deposit_amount, budget_data.item_notes))
    return {"message": "Dodana stavka"} if success else HTTPException(status_code=500)

@app.get("/api/budget")
def get_item(current_user: dict = Depends(get_current_user)):
    budget = takeFromBase("SELECT * FROM budget WHERE user_id = %s ORDER BY id ASC;", (current_user.get("sub"),))
    budget = budget if budget is not None else []
    total_paid_so_far = 0
    for item in budget:
        if item['item_status'] == 'Plaćeno':
            total_paid_so_far += item['item_amount']
        elif item['item_status'] == 'Kapara':
            total_paid_so_far += item['item_deposit']
        else:
            total_paid_so_far += 0
    total_budget_plan = sum(item['item_amount'] for item in budget)
    return {
        "data": budget,
        "total_paid_so_far": total_paid_so_far,
        "total_budget_plan": total_budget_plan,
        "remaining_to_pay": total_budget_plan - total_paid_so_far
    }

@app.put("/api/budget/{budget_id}")
def put_item(budget_id: int, budget_data: BudgetModel, current_user: dict = Depends(get_current_user)):
    user_id = current_user.get("sub")
    query = """ UPDATE budget SET item_title = %s, item_status = %s, item_amount = %s, item_deposit = %s, item_notes = %s, item_category = %s WHERE id = %s AND user_id = %s  """
    success = executeQuery(query, (budget_data.item_title, budget_data.item_status, budget_data.item_amount, budget_data.deposit_amount, budget_data.item_notes, budget_data.item_category, budget_id , user_id))
    return {"message": "Uspješno ažurirano"} if success else HTTPException(status_code=500)

@app.delete("/api/budget/{budget_id}")
def delete_item(budget_id: int, current_user: dict = Depends(get_current_user)):
    success = executeQuery("DELETE FROM budget WHERE id = %s AND user_id = %s;", (budget_id, current_user.get("sub")))
    return{"message": "Uspješno obrisano"} if success else HTTPException(status_code=500)