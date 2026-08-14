#Briše račune koji NISU platili

import os
from datetime import date
from dotenv import load_dotenv
from minio import Minio
from minio.error import S3Error
from database import takeFromBase, executeQuery
from email_service import send_email

load_dotenv()

MINIO_ENDPOINT = os.getenv("MINIO_ENDPOINT")
MINIO_ACCESS_KEY = os.getenv("MINIO_ACCESS_KEY")
MINIO_SECRET_KEY = os.getenv("MINIO_SECRET_KEY")
MINIO_BUCKET = os.getenv("MINIO_BUCKET")

minio_client = Minio(
    MINIO_ENDPOINT,
    access_key=MINIO_ACCESS_KEY,
    secret_key=MINIO_SECRET_KEY,
    secure=False,
)

def delete_suspended_users():
    query = """
        SELECT id, email
        FROM users
        WHERE DATE(created_at) + interval '8 days' = CURRENT_DATE
        AND is_active = false
        AND is_paid = false
    """

    user_to_delete = takeFromBase(query)

    if not user_to_delete:
        print("Nema korisnika za brisanje.")
        return

    for user in user_to_delete:
        docs = takeFromBase("SELECT storage_key FROM documents WHERE user_id = %s;", (user["id"],))
        if docs:
            for doc in docs:
                try:
                    minio_client.remove_object(MINIO_BUCKET, doc["storage_key"])
                except S3Error as e:
                    print(f"Greška pri brisanju datoteke {doc['storage_key']} iz MinIO-a: {e}")

        delete_query = "DELETE FROM users WHERE id = %s;"
        success = executeQuery(delete_query, (user['id'],))

        body = f"""
                    <html>
                <body style="font-family: Arial, sans-serif; color: #2D2A26; line-height: 1.6;">
                    <p>Poštovani/a</p>
                    <p>Budući da uplata za korištenje aplikacije Weddinger nije zaprimljena unutar 7 dana od registracije, Vaš pristup aplikaciji je trajno onemogućen.</p>
                    <p>Ako imate pitanja ili ste eventualno izvršili uplatu, molimo Vas da nam se što prije javite na <a href="mailto:helpdesk@weddinger.com.hr">helpdesk@weddinger.com.hr</a>.</p>
                    <p>Srdačan pozdrav,<br>Weddinger tim</p>
                </body>
                </html>
        """

        if success:
            print(f"Obrisan je korisnički račun {user['email']}")
            try:
                send_email(
                    to=user["email"],
                    subject="Vaš Weddinger korisnički račun je obrisan",
                    body=body,
                    is_html=True
                )
            except Exception as error:
                print(f"Dogodila se pogreška prilikom slanja E-maila korisniku, {user['email']: {error}}")

        else:
            print(f"Pogreška prilikom brisanja korisničko računa: {user['email']}.")

if __name__ == "__main__":
    delete_suspended_users()