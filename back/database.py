import psycopg2
from psycopg2.extras import RealDictCursor
from dotenv import load_dotenv
import os

load_dotenv()

def db_connection():
    # Connection to DB
    connection = psycopg2.connect(
        host=os.getenv("DB_HOST"),
        database=os.getenv("DB_NAME"),
        user=os.getenv("DB_USER"),
        password=os.getenv("DB_PASSWORD"),
        port=os.getenv("DB_PORT")
    )
    # UTF-8 decoding/encoding for Croatian characters
    connection.set_client_encoding('UTF8')
    psycopg2.extensions.register_type(psycopg2.extensions.UNICODE, connection)
    psycopg2.extensions.register_type(psycopg2.extensions.UNICODEARRAY, connection)

    return connection

def takeFromBase(query, params=None):
    conn = None
    cur = None
    try:
        conn = db_connection()
        cur = conn.cursor(cursor_factory=RealDictCursor)

        if params:
            cur.execute(query, params)
        else:
            cur.execute(query)

        result = cur.fetchall()

        cur.close()
        conn.close()

        return result
    
    except Exception as e:
        print(f"Database error: {e}")
        return None
    
    finally:
        if cur:
            cur.close()
        if conn:
            conn.close()

def executeQuery(query, params=None):
    conn = None
    cur = None
    try:
        conn = db_connection()
        cur = conn.cursor()

        cur.execute(query, params)
        
        # PROVJERITE JE LI ŠTO AŽURIRANO
        rows_affected = cur.rowcount 
        
        conn.commit()
        
        print(f"DEBUG: Broj promijenjenih redaka: {rows_affected}")
        
        return rows_affected > 0 # Vraća True samo ako je stvarno nešto promijenjeno
    
    except Exception as e:
        if conn: conn.rollback() # Ako pukne, poništi sve
        print(f"Database error: {e}")
        return False
    
    finally:
        if cur: cur.close()
        if conn: conn.close()