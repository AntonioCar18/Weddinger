from datetime import date
from database import takeFromBase, executeQuery

def delete_expired_users():
    select_query = """
        SELECT id, email, delete_date
        FROM users
        WHERE delete_date IS NOT NULL AND delete_date < %s;
    """
    users_to_delete = takeFromBase(select_query, (date.today(),))

    if not users_to_delete:
        print("Nema korisnika za brisanje.")
        return

    print(f"Pronađeno {len(users_to_delete)} korisnika za brisanje.")

    for user in users_to_delete:
        delete_query = "DELETE FROM users WHERE id = %s;"
        success = executeQuery(delete_query, (user["id"],))

        if success:
            print(f"Obrisan: {user['email']} (id={user['id']}, delete_date={user['delete_date']})")
        else:
            print(f"Greška prilikom brisanja: {user['email']} (id={user['id']})")

if __name__ == "__main__":
    delete_expired_users()