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
import uuid
import magic
from io import BytesIO
from minio import Minio
from minio.error import S3Error
from fastapi import UploadFile, File
from fastapi.responses import StreamingResponse
import random
import smtplib
from email.mime.text import MIMEText
from typing import Optional, List
import requests
from email.mime.multipart import MIMEMultipart
from email.mime.application import MIMEApplication
from pydantic import BaseModel, EmailStr
from fastapi.exceptions import RequestValidationError
from fastapi.responses import StreamingResponse, JSONResponse

from database import takeFromBase, executeQuery

load_dotenv()

app = FastAPI()

MINIO_ENDPOINT = os.getenv("MINIO_ENDPOINT")
MINIO_ACCESS_KEY = os.getenv("MINIO_ACCESS_KEY")
MINIO_SECRET_KEY = os.getenv("MINIO_SECRET_KEY")
MINIO_BUCKET = os.getenv("MINIO_BUCKET")

SMTP_HOST = os.getenv("SMTP_HOST")
SMTP_PORT = int(os.getenv("SMTP_PORT", 587))
SMTP_USER = os.getenv("SMTP_USER")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD")
SMTP_FROM = os.getenv("SMTP_FROM", SMTP_USER)

SOLO_API_TOKEN = os.getenv("SOLO_API_TOKEN")
SOLO_SERVICE_TYPE_ID = os.getenv("SOLO_SERVICE_TYPE_ID")

BASELINE_TASKS = [
    {"task_name": "Rezervacija lokacije", "category": "Prostor", "days_before": 300},
    {"task_name": "Odabir fotografa", "category": "Ostalo", "days_before": 240},
    {"task_name": "Odabir glazbe", "category": "Glazba", "days_before": 180},
]

TAG_TASKS = {
    "crkveno": [{"task_name": "Dogovoriti termin vjenčanja u crkvi", "category": "Administracija", "days_before": 270}],
    "otvoreno": [{"task_name": "Osigurati rezervni plan za slučaj kiše (šator/dvorana)", "category": "Prostor", "days_before": 200}],
    "glazba": [{"task_name": "Rezervirati bend ili DJ-a i potpisati ugovor", "category": "Glazba", "days_before": 150}],
    "foto": [{"task_name": "Dogovoriti fotografiranje uoči vjenčanja (engagement shoot)", "category": "Ostalo", "days_before": 120}],
    "gosti_izvan": [{"task_name": "Pripremiti prijedloge smještaja za goste izvan grada", "category": "Ostalo", "days_before": 90}],
}

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request, exc):
    first_error = exc.errors()[0] if exc.errors() else None
    if first_error and "email" in str(first_error.get("loc", [])):
        message = "Adresa e-pošte nije u ispravnom formatu."
    else:
        message = "Neispravno popunjen obrazac. Provjerite unesene podatke."
    return JSONResponse(status_code=422, content={"detail": message})

def send_email(to: str, subject: str, body: str, is_html: bool = False, attachment_bytes: bytes = None, attachment_filename: str = None):
    body_part = MIMEText(body, 'html' if is_html else 'plain', 'utf-8')

    if attachment_bytes and attachment_filename:
        msg = MIMEMultipart()
        msg.attach(body_part)
        part = MIMEApplication(attachment_bytes, Name=attachment_filename)
        part['Content-Disposition'] = f'attachment; filename="{attachment_filename}"'
        msg.attach(part)
    else:
        msg = body_part

    msg["Subject"] = subject
    msg["From"] = SMTP_FROM
    msg["To"] = to

    with smtplib.SMTP(SMTP_HOST, SMTP_PORT) as server:
        server.starttls()
        server.login(SMTP_USER, SMTP_PASSWORD)
        server.sendmail(SMTP_FROM, [to], msg.as_string())

def create_solo_offer(email: str):
    data = {
        "token": SOLO_API_TOKEN,
        "tip_usluge": SOLO_SERVICE_TYPE_ID,
        "tip_kupca": 1,  # B2C - fizička osoba
        "usluga": 1,
        "opis_usluge_1": "Weddinger - jednokratni pristup aplikaciji",
        "cijena_1": "30,00",
        "kolicina_1": 1,
        "popust_1": 0,
        "porez_stopa_1": 0,
        "nacin_placanja": 1,  # Transakcijski račun
        "napomene": f"Korisnički račun: {email}",
    }
    response = requests.post("https://api.solo.com.hr/ponuda", data=data, timeout=10)
    result = response.json()
    if result.get("status") != 0:
        raise Exception(f"Solo API greška: {result.get('message')}")
    return result["ponuda"]

def build_starter_tasks(user_id: int, wedding_date_str: str, tags: list):
    try:
        wedding_date = datetime.datetime.strptime(wedding_date_str, "%Y-%m-%d").date()
    except (ValueError, TypeError):
        return

    today = datetime.date.today()
    min_due_date = today + timedelta(days=7)

    task_list = list(BASELINE_TASKS)
    for tag in tags:
        task_list.extend(TAG_TASKS.get(tag, []))

    for task in task_list:
        due_date = wedding_date - timedelta(days=task["days_before"])
        if due_date < min_due_date:
            due_date = min_due_date

        query = "INSERT INTO tasks (user_id, task_name, owner, category, priority, due_date, is_completed, notes) VALUES (%s, %s, %s, %s, %s, %s, %s, %s);"
        executeQuery(query, (
            user_id,
            task["task_name"],
            "Oboje",
            task["category"],
            "Srednji",
            due_date.isoformat(),
            False,
            None
        ))

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

minio_client = Minio(
    MINIO_ENDPOINT,
    access_key=MINIO_ACCESS_KEY,
    secret_key=MINIO_SECRET_KEY,
    secure=False,
)

MAX_FILE_SIZE = 5 * 1024 * 1024  # 5MB
ALLOWED_MIME_TYPES = {
    "application/pdf": ".pdf",
    "application/msword": ".doc",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": ".docx",
}

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
    email: EmailStr
    password: str

class RegisterModel(BaseModel):
    email: EmailStr
    password: str

class GuestModel(BaseModel):
    name: str
    plus_one: bool = False
    plus_one_name: Optional[str] = None
    status: str = "Na čekanju"
    phone: Optional[str] = None
    menu_type: str = "Standard"
    menu_type_plus_one: str = "Standard"
    table_id: Optional[int] = None
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

class TaskModel(BaseModel):
    task_name: str
    task_owner: str
    task_category: str
    task_priority: str
    task_due_date: Optional[str] = None
    task_is_completed: bool = False
    task_notes: Optional[str] = None
    
class StatusUpdateModel(BaseModel):
    is_completed: bool

class UpdateUserModel(BaseModel):
    partner_one: str
    partner_two: str

class UpdateEmailModel(BaseModel):
    partner_one: str
    partner_two: Optional[str] = None

class UpdatePasswordModel(BaseModel):
    current_password: str
    new_password: str

class EngagementDateModel(BaseModel):
    engagement_date: str    

class UpdateDateModel(BaseModel):
    wedding_date: str

class UpdateLocationModel(BaseModel):
    wedding_location: str

class OnboardingModel(BaseModel):
    partner_one: str
    partner_two: str
    email: str
    partner_email: Optional[str] = None
    wedding_date: Optional[str] = None
    wedding_location: Optional[str] = None
    engagement_date: str
    onboarding_completed: bool = True
    seed_tasks: bool = False
    tags: Optional[List[str]] = []

class ForgotPasswordModel(BaseModel):
    email: str

class ResetPasswordModel(BaseModel):
    email: str
    code: str
    new_password: str

class VerifyEmailModel(BaseModel):
    email: str
    code: str

class SeenAnnouncementModel(BaseModel):
    page: str

# --- Rute ---
@app.post("/api/login")
def login(login_data: LoginModel, response: Response):
    user = takeFromBase("SELECT * FROM users WHERE email = %s OR partner_email = %s;", (login_data.email, login_data.email))
    if not user or not pwd_context.verify(login_data.password, user[0]["password"]):
        raise HTTPException(status_code=401, detail="Neispravan email ili lozinka")

    if user[0]["is_active"] is False:
        raise HTTPException(status_code=403, detail="Vaš račun je privremeno deaktiviran zbog neizvršene uplate. Kontaktirajte nas na info@4solutions.hr.")

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
    user = takeFromBase("SELECT partner_one, partner_two, wedding_date, wedding_location, email, partner_email, engagement_date, onboarding_completed, created_at, seen_announcements, pricing_onboarding, solo_offer_pdf_url FROM users WHERE id = %s;", (user_id,))
    if not user:
        raise HTTPException(status_code=404, detail="Korisnik nije nađen")
    return {"user": user[0]}

@app.put("/api/me")
def update_me(update_data: UpdateUserModel, current_user: dict = Depends(get_current_user)):
    user_id = current_user.get("sub")
    query = "UPDATE users SET partner_one = %s, partner_two = %s WHERE id = %s;"
    success = executeQuery(query, (update_data.partner_one, update_data.partner_two, user_id))
    if success:
        return {"message": "Uspješno ažurirano"}
    else:
        raise HTTPException(status_code=500, detail="Greška pri ažuriranju")

@app.put("/api/me/engagement-date")
def update_engagement_date(update_data: EngagementDateModel, current_user: dict = Depends(get_current_user)):
    user_id = current_user.get("sub")
    query = "UPDATE users SET engagement_date = %s WHERE id = %s;"
    success = executeQuery(query, (update_data.engagement_date, user_id))
    if success:
        return {"message": "Uspješno ažurirano"}
    else:
        raise HTTPException(status_code=500, detail="Greška pri ažuriranju datuma zaruka")

@app.put("/api/me/date")
def update_date(update_data: UpdateDateModel, current_user: dict = Depends(get_current_user)):
    user_id = current_user.get("sub")
    query = "UPDATE users SET wedding_date = %s WHERE id = %s;"
    success = executeQuery(query, (update_data.wedding_date, user_id))
    if success:
        return {"message": "Uspješno ažurirano"}
    else:
        raise HTTPException(status_code=500, detail="Greška pri ažuriranju datuma")

@app.put("/api/me/location")
def update_location(update_data: UpdateLocationModel, current_user: dict = Depends(get_current_user)):
    user_id = current_user.get("sub")
    query = "UPDATE users SET wedding_location = %s WHERE id = %s;"
    success = executeQuery(query, (update_data.wedding_location, user_id))
    if success:
        return {"message": "Uspješno ažurirano"}
    else:
        raise HTTPException(status_code=500, detail="Greška pri ažuriranju lokacije")

@app.put("/api/me/email")
def update_email(update_data: UpdateEmailModel, current_user: dict = Depends(get_current_user)):
    user_id = current_user.get("sub")
    query = "UPDATE users SET email = %s, partner_email = %s WHERE id = %s;"
    success = executeQuery(query, (update_data.partner_one, update_data.partner_two, user_id))
    if success:
        return {"message": "Uspješno ažurirano"}
    else:
        raise HTTPException(status_code=500, detail="Greška pri ažuriranju")

@app.put("/api/me/password")
def update_password(update_data: UpdatePasswordModel, current_user: dict = Depends(get_current_user)):
    user_id = current_user.get("sub")
    user = takeFromBase("SELECT password FROM users WHERE id = %s;", (user_id,))
    if not user:
        raise HTTPException(status_code=404, detail="Korisnik nije nađen")
    if not pwd_context.verify(update_data.current_password, user[0]["password"]):
        raise HTTPException(status_code=400, detail="Trenutna lozinka nije ispravna")

    hashed = pwd_context.hash(update_data.new_password)
    query = "UPDATE users SET password = %s WHERE id = %s;"
    success = executeQuery(query, (hashed, user_id))
    if success:
        return {"message": "Uspješno ažurirano"}
    else:
        raise HTTPException(status_code=500, detail="Greška pri ažuriranju lozinke")

@app.post("/api/register")
def register(register_data: RegisterModel):
    existing_as_partner = takeFromBase("SELECT id FROM users WHERE partner_email = %s;", (register_data.email,))
    if existing_as_partner:
        raise HTTPException(status_code=400, detail="Ovaj email je već povezan s postojećim računom. Pokušajte se prijaviti.")

    existing = takeFromBase("SELECT * FROM users WHERE email = %s;", (register_data.email,))

    if existing:
        if existing[0]["email_verified"]:
            raise HTTPException(status_code=400, detail="Ovaj email je već povezan s postojećim računom. Pokušajte se prijaviti.")

        # Račun postoji, ali nikad nije verificiran - pošalji novi kod umjesto blokiranja
        code = f"{random.randint(0, 999999):06d}"
        expires = datetime.datetime.utcnow() + timedelta(minutes=15)
        executeQuery(
            "UPDATE users SET verify_code = %s, verify_code_expires = %s WHERE email = %s;",
            (code, expires, register_data.email)
        )

        offer_number = existing[0].get("solo_offer_number")
        offer_pdf_url = existing[0].get("solo_offer_pdf_url")
        offer_section = ""
        if offer_pdf_url:
            offer_section = f"""
                <hr style="border: none; border-top: 1px solid #efe9e0; margin: 24px 0;">
                <p>Podsjetnik: ponuda za korištenje aplikacije Weddinger (broj ponude: <strong>{offer_number}</strong>) i dalje čeka na uplatu. Preuzmite je <a href="{offer_pdf_url}">ovdje</a>.</p>
            """

        resend_html = f"""
        <html>
        <body style="font-family: Arial, sans-serif; color: #2D2A26; line-height: 1.6;">
            <p>Poštovani,</p>
            <p>Dobrodošli natrag u Weddinger! Vaš novi kod za potvrdu emaila je: <strong style="font-size: 20px;">{code}</strong> (vrijedi 15 minuta).</p>
            {offer_section}
            <p>Molimo Vas da na ovaj mail ne odgovarate, a ukoliko imate pitanja ili nejasnoća, javite nam se na <a href="mailto:helpdesk@weddinger.com.hr">helpdesk@weddinger.com.hr</a>.</p>
            <p>Srdačan pozdrav,<br>Weddinger tim</p>
        </body>
        </html>
        """

        try:
            send_email(
                to=register_data.email,
                subject="Vaš novi kod za potvrdu - Weddinger",
                body=resend_html,
                is_html=True
            )
        except Exception as e:
            print(f"Greška pri slanju maila: {e}")
        return {"message": "Poslali smo novi kod za potvrdu na vaš email."}

    hashed = pwd_context.hash(register_data.password)
    code = f"{random.randint(0, 999999):06d}"
    expires = datetime.datetime.utcnow() + timedelta(minutes=15)

    query = "INSERT INTO users (email, password, verify_code, verify_code_expires) VALUES (%s, %s, %s, %s);"
    if not executeQuery(query, (register_data.email, hashed, code, expires)):
        raise HTTPException(status_code=500, detail="Greška pri registraciji")

    # Pokušaj kreirati Solo ponudu - ako ne uspije, kod za potvrdu i dalje ide dalje
    pdf_bytes = None
    offer = None
    try:
        offer = create_solo_offer(register_data.email)
        executeQuery(
            "UPDATE users SET solo_offer_id = %s, solo_offer_number = %s, solo_offer_pdf_url = %s WHERE email = %s;",
            (offer["id"], offer["broj_ponude"], offer["pdf"], register_data.email)
        )
        try:
            pdf_response = requests.get(offer["pdf"], timeout=10)
            if pdf_response.status_code == 200:
                pdf_bytes = pdf_response.content
        except Exception as e:
            print(f"Greška pri preuzimanju PDF ponude: {e}")
    except Exception as e:
        print(f"Greška pri kreiranju Solo ponude: {e}")

    offer_section = ""
    if offer:
        offer_section = f"""
            <hr style="border: none; border-top: 1px solid #efe9e0; margin: 24px 0;">
            <p>U prilogu je i ponuda za korištenje aplikacije Weddinger (broj ponude: <strong>{offer['broj_ponude']}</strong>). Ponuda vrijedi 7 dana, a potvrdu o uplati nije potrebno slati. Ukoliko naiđete na poteškoće s plaćanjem, slobodno nas kontaktirajte.</p>
            <p>Ako privitak ne stigne, ponudu možete preuzeti i <a href="{offer['pdf']}">ovdje</a>.</p>
        """

    welcome_html = f"""
    <html>
    <body style="font-family: Arial, sans-serif; color: #2D2A26; line-height: 1.6;">
        <p>Poštovani,</p>
        <p>Dobrodošli u Weddinger! Presretni smo što ste se odlučili pridružiti našoj Weddinger obitelji i nadamo se da će Vam korištenje aplikacije biti ugodno i korisno.</p>
        <p>Vaš kod za potvrdu emaila je: <strong style="font-size: 20px;">{code}</strong> (vrijedi 15 minuta).</p>
        {offer_section}
        <p>Molimo Vas da na ovaj mail ne odgovarate, a ukoliko imate pitanja ili nejasnoća, javite nam se na <a href="mailto:helpdesk@weddinger.com.hr">helpdesk@weddinger.com.hr</a>.</p>
        <p>Srdačan pozdrav,<br>Weddinger tim</p>
    </body>
    </html>
    """

    try:
        send_email(
            to=register_data.email,
            subject="Dobrodošli u Weddinger - kod za potvrdu i ponuda",
            body=welcome_html,
            is_html=True,
            attachment_bytes=pdf_bytes,
            attachment_filename=f"ponuda-{offer['broj_ponude']}.pdf" if (pdf_bytes and offer) else None
        )
    except Exception as e:
        print(f"Greška pri slanju maila: {e}")

    return {"message": "Registracija uspješna. Provjerite email za kod."}

@app.post("/api/verify-email")
def verify_email(data: VerifyEmailModel):
    user = takeFromBase(
        "SELECT id, verify_code, verify_code_expires FROM users WHERE email = %s;",
        (data.email,)
    )
    if not user or user[0]['verify_code'] != data.code or user[0]['verify_code_expires'] < datetime.datetime.utcnow():
        raise HTTPException(status_code=400, detail="Kod je netočan ili je istekao.")

    executeQuery(
        "UPDATE users SET email_verified = true, verify_code = NULL, verify_code_expires = NULL WHERE id = %s;",
        (user[0]['id'],)
    )
    return {"message": "Email uspješno potvrđen."}

@app.delete("/api/me")
def delete_account(current_user: dict = Depends(get_current_user)):
    user_id = current_user.get("sub")
    success = executeQuery("DELETE FROM users WHERE id = %s;", (user_id,))
    if success:
        return {"message": "Obrisano"}
    else:
        raise HTTPException(status_code=500, detail="Greška pri brisanju računa")

@app.post("/api/me/onboarding")
def onboarding(onboarding_data: OnboardingModel, current_user: dict = Depends(get_current_user)):
    user_id = current_user.get("sub")
    wedding_date = onboarding_data.wedding_date or None
    engagement_date = onboarding_data.engagement_date or None
    wedding_location = onboarding_data.wedding_location or None
    query = "UPDATE users SET partner_one = %s, partner_two = %s, email = %s, wedding_date = %s, wedding_location = %s, engagement_date = %s, onboarding_completed = true WHERE id = %s;"
    success = executeQuery(query, (onboarding_data.partner_one, onboarding_data.partner_two, onboarding_data.email, wedding_date, wedding_location, engagement_date, user_id))

    if not success:
        raise HTTPException(status_code=500, detail="Greška pri završetku onboardinga")

    if onboarding_data.seed_tasks and wedding_date:
        build_starter_tasks(user_id, wedding_date, onboarding_data.tags or [])

    return {"message": "Onboarding završen"}

@app.post("/api/forgot-password")
def forgot_password(data: ForgotPasswordModel):
    user = takeFromBase("SELECT id FROM users WHERE email = %s OR partner_email = %s;", (data.email, data.email))
    if user:
        code = f"{random.randint(0, 999999):06d}"
        expires = datetime.datetime.utcnow() + timedelta(minutes=15)
        executeQuery(
            "UPDATE users SET reset_code = %s, reset_code_expires = %s WHERE id = %s;",
            (code, expires, user[0]['id'])
        )
        try:
            send_email(
                to=data.email,
                subject="Kod za reset lozinke - Weddinger",
                body=f"Vaš kod za reset lozinke je: {code}\n\nVrijedi 15 minuta.\n\nAko niste vi tražili reset lozinke, slobodno ignorirajte ovaj mail."
            )
        except Exception as e:
            print(f"Greška pri slanju maila: {e}")
    return {"message": "Ako email postoji u sustavu, poslali smo kod za reset lozinke."}

@app.post("/api/reset-password")
def reset_password(data: ResetPasswordModel):
    user = takeFromBase(
        "SELECT id, reset_code, reset_code_expires FROM users WHERE email = %s OR partner_email = %s;",
        (data.email, data.email)
    )
    if not user or user[0]['reset_code'] != data.code or user[0]['reset_code_expires'] < datetime.datetime.utcnow():
        raise HTTPException(status_code=400, detail="Kod je netočan ili je istekao.")

    hashed = pwd_context.hash(data.new_password)
    executeQuery(
        "UPDATE users SET password = %s, reset_code = NULL, reset_code_expires = NULL WHERE id = %s;",
        (hashed, user[0]['id'])
    )
    return {"message": "Lozinka je uspješno promijenjena."}

@app.put("/api/me/announcement")
def date_seen_announcement(data: SeenAnnouncementModel, current_user: dict = Depends(get_current_user)):
    user_id = current_user.get("sub")
    query = """ UPDATE users SET seen_announcements = COALESCE (seen_announcements, '{}'::jsonb) || jsonb_build_object(%s, %s::text) WHERE id = %s """
    success = executeQuery(query, (data.page, datetime.datetime.utcnow().isoformat(), user_id))
    if success:
        return {"message": "Uspješno ažurirano."}
    else:
        raise HTTPException(status_code=500, detail="Pogreška prilikom ažuriranja stanja.")

@app.put("/api/me/pricing-onboarding")
def pricing_onboarding_seen(current_user: dict = Depends(get_current_user)):
    user_id = current_user.get("sub")
    query = "UPDATE users SET pricing_onboarding = true WHERE id = %s;"
    success = executeQuery(query, (user_id,))
    if (success):
        return {"message": "Uspješno ažurirano."}
    else:
        raise HTTPException(status_code=500, detail="Pogreška prilikom ažuriranja.")

    
# Gosti

@app.get("/api/guests")
def get_guests(current_user: dict = Depends(get_current_user)):
    return takeFromBase("SELECT * FROM guests WHERE user_id = %s ORDER BY id ASC;", (current_user.get("sub"),))

@app.get("/api/guests/numbers")
def get_guests_numbers(current_user: dict = Depends(get_current_user)):
    total_guests = takeFromBase("SELECT COUNT(*) AS total FROM guests WHERE user_id = %s;", (current_user.get("sub"),))[0]['total']
    total_plus_one_guests = takeFromBase("SELECT COUNT(*) AS total_plus_one FROM guests WHERE user_id = %s AND plus_one = true;", (current_user.get("sub"),))[0]['total_plus_one']
    total_guests_with_plus_ones = total_guests + total_plus_one_guests
    confirmed_guests = takeFromBase("SELECT COUNT(*) AS confirmed FROM guests WHERE user_id = %s AND status = 'Potvrđeno';", (current_user.get("sub"),))[0]['confirmed']
    confirmed_plus_one_guests = takeFromBase("SELECT COUNT(*) AS confirmed_plus_one FROM guests WHERE user_id = %s AND status = 'Potvrđeno' AND plus_one = true;", (current_user.get("sub"),))[0]['confirmed_plus_one']
    confirmed_total = confirmed_guests + confirmed_plus_one_guests
    return {
        "total_guests": total_guests_with_plus_ones,
        "confirmed_guests": confirmed_total,
    }

@app.post("/api/guests")
def add_guest(guest_data: GuestModel, current_user: dict = Depends(get_current_user)):
    user_id = current_user.get("sub")

    table_number = None
    if guest_data.table_id:
        table = takeFromBase("SELECT table_number, capacity FROM tables WHERE id = %s AND user_id = %s", (guest_data.table_id, user_id))
        if not table:
            raise HTTPException(status_code=404, detail="Odabrani stol ne postoji")
        table_number = table[0]['table_number']
        table_capacity = table[0]['capacity']

        guest_size = 1 + (1 if guest_data.plus_one else 0)
        occupancy_data = takeFromBase(
            "SELECT SUM(1 + CASE WHEN plus_one = true THEN 1 ELSE 0 END) as total FROM guests WHERE table_id = %s",
            (guest_data.table_id,)
        )
        current_occupancy = occupancy_data[0]['total'] or 0

        if (current_occupancy + guest_size) > table_capacity:
            raise HTTPException(status_code=400, detail=f"Stol je popunjen! Kapacitet je {table_capacity}.")

    query = "INSERT INTO guests (user_id, name, plus_one, plus_one_name, status, phone, menu_type, menu_type_plus_one, table_id, table_number, notes) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s);"
    success = executeQuery(query, (
        user_id, guest_data.name, guest_data.plus_one, guest_data.plus_one_name,
        guest_data.status, guest_data.phone, guest_data.menu_type, guest_data.menu_type_plus_one,
        guest_data.table_id, table_number, guest_data.notes
    ))
    return {"message": "Gost uspješno dodan"} if success else HTTPException(status_code=500)

@app.delete("/api/guests/{guest_id}")
def delete_guest(guest_id: int, current_user: dict = Depends(get_current_user)):
    success = executeQuery("DELETE FROM guests WHERE id = %s AND user_id = %s;", (guest_id, current_user.get("sub")))
    return {"message": "Obrisano"} if success else HTTPException(status_code=500)

@app.put("/api/guests/{guest_id}")
def update_guest(guest_id: int, guest_data: GuestModel, current_user: dict = Depends(get_current_user)):
    user_id = current_user.get("sub")

    table_number = None
    if guest_data.table_id:
        table = takeFromBase("SELECT table_number, capacity FROM tables WHERE id = %s AND user_id = %s", (guest_data.table_id, user_id))
        if not table:
            raise HTTPException(status_code=404, detail="Odabrani stol ne postoji")
        table_number = table[0]['table_number']
        table_capacity = table[0]['capacity']

        guest_size = 1 + (1 if guest_data.plus_one else 0)
        occupancy_data = takeFromBase(
            "SELECT SUM(1 + CASE WHEN plus_one = true THEN 1 ELSE 0 END) as total FROM guests WHERE table_id = %s AND id != %s",
            (guest_data.table_id, guest_id)
        )
        current_occupancy = occupancy_data[0]['total'] or 0

        if (current_occupancy + guest_size) > table_capacity:
            raise HTTPException(status_code=400, detail=f"Stol je popunjen! Kapacitet je {table_capacity}.")

    query = "UPDATE guests SET name = %s, plus_one = %s, plus_one_name = %s, status = %s, phone = %s, menu_type = %s, menu_type_plus_one = %s, table_id = %s, table_number = %s, notes = %s WHERE id = %s AND user_id = %s;"
    success = executeQuery(query, (
        guest_data.name, guest_data.plus_one, guest_data.plus_one_name, guest_data.status,
        guest_data.phone, guest_data.menu_type, guest_data.menu_type_plus_one,
        guest_data.table_id, table_number, guest_data.notes, guest_id, user_id
    ))
    return {"message": "Ažurirano"} if success else HTTPException(status_code=500)

@app.put("/api/guests/{guest_id}/move")
def move_guest(guest_id: int, data: MoveGuestRequest, current_user: dict = Depends(get_current_user)):
    user_id = current_user.get("sub")

    if data.table_id is None:
        success = executeQuery(
            "UPDATE guests SET table_id = NULL, table_number = NULL WHERE id = %s AND user_id = %s", 
            (guest_id, user_id)
        )
        if not success:
            raise HTTPException(status_code=500, detail="Greška pri uklanjanju gosta")
        return {"success": True, "table_id": None}

    table = takeFromBase("SELECT id, capacity, table_number FROM tables WHERE id = %s AND user_id = %s", (data.table_id, user_id))
    if not table:
        raise HTTPException(status_code=404, detail="Stol nije pronađen")
    table_capacity = table[0]['capacity']
    table_number = table[0]['table_number']

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
        "UPDATE guests SET table_id = %s, table_number = %s WHERE id = %s AND user_id = %s", 
        (data.table_id, table_number, guest_id, user_id)
    )
    
    return {"success": True, "table_id": data.table_id, "table_number": table_number}

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
    tables = takeFromBase("""
        SELECT t.*, 
               COALESCE(SUM(1 + CASE WHEN g.plus_one = true THEN 1 ELSE 0 END), 0) AS current_occupancy
        FROM tables t
        LEFT JOIN guests g ON g.table_id = t.id
        WHERE t.user_id = %s
        GROUP BY t.id
        ORDER BY t.table_number ASC;
    """, (current_user.get("sub"),))
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
    return {"message": "Uspješno obrisano"} if success else HTTPException(status_code=500)

#Zadaci

@app.post("/api/tasks")
def add_task(task_data: TaskModel, current_user: dict = Depends(get_current_user)):
    user_id = current_user.get("sub")
    query = "INSERT INTO tasks (user_id, task_name, owner, category, priority, due_date, is_completed, notes) VALUES (%s, %s, %s, %s, %s, %s, %s, %s);"
    success = executeQuery(query, (user_id, task_data.task_name, task_data.task_owner, task_data.task_category, task_data.task_priority, task_data.task_due_date, task_data.task_is_completed, task_data.task_notes))
    return {"message": "Zadatak uspješno dodan"} if success else HTTPException(status_code=500)

@app.get("/api/tasks")
def get_tasks(current_user: dict = Depends(get_current_user)):
    tasks = takeFromBase("SELECT * FROM tasks WHERE user_id = %s ORDER BY task_id ASC;", (current_user.get("sub"),))
    return {
        "data": tasks if tasks is not None else [],
        "completed_tasks": sum(1 for task in tasks if task['is_completed']) if tasks else 0,
        "incomplete_tasks": sum(1 for task in tasks if not task['is_completed']) if tasks else 0
    }

@app.get("/api/tasks/summary")
def get_tasks_summary(current_user: dict = Depends(get_current_user)):
    query = """
        SELECT 
            category,
            COUNT(*) AS total_tasks,
            SUM(CASE WHEN is_completed THEN 1 ELSE 0 END) AS completed_tasks
        FROM tasks
        WHERE user_id = %s
        GROUP BY category
        ORDER BY category ASC;
    """

    stats = takeFromBase(query, (current_user.get("sub"),))
    return {
        "data": stats if stats is not None else [],
        "total_tasks": sum(stat['total_tasks'] for stat in stats) if stats else 0,
        "total_completed_tasks": sum(stat['completed_tasks'] for stat in stats) if stats else 0,
        "total_incomplete_tasks": sum(stat['total_tasks'] - stat['completed_tasks'] for stat in stats) if stats else 0
    }

@app.put("/api/tasks/{task_id}")
def update_task(task_id: int, task_data: TaskModel, current_user: dict = Depends(get_current_user)):
    user_id = current_user.get("sub")
    query = """ UPDATE tasks SET task_name = %s, owner = %s, category = %s, priority = %s, due_date = %s, is_completed = %s, notes = %s WHERE task_id = %s AND user_id = %s """
    success = executeQuery(query, (task_data.task_name, task_data.task_owner, task_data.task_category, task_data.task_priority, task_data.task_due_date, task_data.task_is_completed, task_data.task_notes, task_id , user_id))
    return {"message": "Uspješno ažurirano"} if success else HTTPException(status_code=500)

@app.put("/api/tasks/status/{task_id}")
def update_task_status(task_id: int, status_data: StatusUpdateModel, current_user: dict = Depends(get_current_user)):
    user_id = current_user.get("sub")
    query = """ UPDATE tasks SET is_completed = %s WHERE task_id = %s AND user_id = %s """
    success = executeQuery(query, (status_data.is_completed, task_id , user_id))
    return {"message": "Uspješno ažurirano"} if success else HTTPException(status_code=500)

@app.delete("/api/tasks/{task_id}")
def delete_task(task_id: int, current_user: dict = Depends(get_current_user)):
    success = executeQuery("DELETE FROM tasks WHERE task_id = %s AND user_id = %s;", (task_id, current_user.get("sub")))
    return {"message": "Uspješno obrisano"} if success else HTTPException(status_code=500)


#Partneri

@app.get("/api/partners")
def get_partners():
    partners = takeFromBase("SELECT * FROM partners ORDER BY id ASC;")
    return {
        "data": partners if partners is not None else [],
        "total_partners": len(partners) if partners else 0,
        "foto_video_partners": len([p for p in partners if p['partner_category'] == 'Fotograf/Videograf']) if partners else 0,
        "catering_partners": len([p for p in partners if p['partner_category'] == 'Catering/Vjenčanje']) if partners else 0,
        "flower_partners": len([p for p in partners if p['partner_category'] == 'Cvijeće/Dekoracije']) if partners else 0,
        "music_partners": len([p for p in partners if p['partner_category'] == 'Glazba/Pratnja/DJ']) if partners else 0,
        "accommodation_partners": len([p for p in partners if p['partner_category'] == 'Smještaj']) if partners else 0      
    }


#Dokumenti

@app.post("/api/documents")
async def upload_document(file: UploadFile = File(...), current_user: dict = Depends(get_current_user)):
    user_id = current_user.get("sub")
    contents = await file.read()

    if len(contents) > MAX_FILE_SIZE:
        raise HTTPException(status_code=400, detail="Datoteka je prevelika, maksimalno 5MB")

    real_mime = magic.from_buffer(contents, mime=True)
    if real_mime not in ALLOWED_MIME_TYPES:
        raise HTTPException(status_code=400, detail="Dozvoljeni su samo PDF i Word dokumenti")

    storage_key = f"{user_id}/{uuid.uuid4()}{ALLOWED_MIME_TYPES[real_mime]}"

    minio_client.put_object(MINIO_BUCKET, storage_key, BytesIO(contents), length=len(contents), content_type=real_mime)

    query = "INSERT INTO documents (user_id, file_name, storage_key, file_type, file_size) VALUES (%s, %s, %s, %s, %s);"
    if not executeQuery(query, (user_id, file.filename, storage_key, real_mime, len(contents))):
        raise HTTPException(status_code=500, detail="Greška pri spremanju dokumenta")

    return {"message": "Dokument uspješno dodan"}


@app.get("/api/documents")
def get_documents(current_user: dict = Depends(get_current_user)):
    docs = takeFromBase(
        "SELECT id, file_name, file_type, file_size, uploaded_at FROM documents WHERE user_id = %s ORDER BY uploaded_at DESC;",
        (current_user.get("sub"),)
    )
    docs = docs if docs is not None else []
    return {
        "data": docs,
        "total_documents": len(docs) if docs else 0,
        "total_size": sum(doc['file_size'] for doc in docs) if docs else 0,
        "last_uploaded": max(doc['uploaded_at'] for doc in docs) if docs else None
    }


@app.get("/api/documents/{doc_id}/download")
def download_document(doc_id: int, current_user: dict = Depends(get_current_user)):
    user_id = current_user.get("sub")
    doc = takeFromBase("SELECT storage_key, file_name, file_type FROM documents WHERE id = %s AND user_id = %s;", (doc_id, user_id))
    if not doc:
        raise HTTPException(status_code=404, detail="Dokument nije pronađen")

    doc = doc[0]
    try:
        obj = minio_client.get_object(MINIO_BUCKET, doc["storage_key"])
    except S3Error:
        raise HTTPException(status_code=404, detail="Datoteka nije pronađena u pohrani")

    return StreamingResponse(
        obj.stream(32 * 1024),
        media_type=doc["file_type"],
        headers={"Content-Disposition": f'attachment; filename="{doc["file_name"]}"'}
    )


@app.delete("/api/documents/{doc_id}")
def delete_document(doc_id: int, current_user: dict = Depends(get_current_user)):
    user_id = current_user.get("sub")
    doc = takeFromBase("SELECT storage_key FROM documents WHERE id = %s AND user_id = %s;", (doc_id, user_id))
    if not doc:
        raise HTTPException(status_code=404, detail="Dokument nije pronađen")

    try:
        minio_client.remove_object(MINIO_BUCKET, doc[0]["storage_key"])
    except S3Error:
        raise HTTPException(status_code=500, detail="Greška pri brisanju datoteke iz pohrane")

    if executeQuery("DELETE FROM documents WHERE id = %s AND user_id = %s;", (doc_id, user_id)):
        return {"message": "Dokument obrisan"}
    raise HTTPException(status_code=500, detail="Greška pri brisanju iz baze")