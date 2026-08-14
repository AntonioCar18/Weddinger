#Briše račune kojima je prošla svadba

from datetime import date
from minio import Minio
from minio.error import S3Error
from database import takeFromBase, executeQuery
import os
from dotenv import load_dotenv

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
        docs = takeFromBase("SELECT storage_key FROM documents WHERE user_id = %s;", (user["id"],))
        if docs:
            for doc in docs:
                try:
                    minio_client.remove_object(MINIO_BUCKET, doc["storage_key"])
                except S3Error as e:
                    print(f"Greška pri brisanju datoteke {doc['storage_key']} iz MinIO-a: {e}")
        delete_query = "DELETE FROM users WHERE id = %s;"
        success = executeQuery(delete_query, (user["id"],))

        if success:
            print(f"Obrisan: {user['email']} (id={user['id']}, delete_date={user['delete_date']})")
        else:
            print(f"Greška prilikom brisanja: {user['email']} (id={user['id']})")

if __name__ == "__main__":
    delete_expired_users()
