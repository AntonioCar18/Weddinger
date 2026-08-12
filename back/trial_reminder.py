import requests
from database import takeFromBase, executeQuery
from email_service import send_email


def send_trial_reminders():
    query = """
        SELECT id, email, partner_one, partner_two, solo_offer_number, solo_offer_pdf_url
        FROM users
        WHERE DATE(created_at) + interval '3 days' = CURRENT_DATE
        AND trial_reminder_sent = false
        AND is_paid = false
    """
    users = takeFromBase(query)

    if not users:
        print("Nema korisnika kojima danas treba poslati podsjetnik.")
        return

    for user in users:
        subject = "Danas je zadnji dan besplatnog korištenja Weddingera 💛"

        offer_section = ""
        pdf_bytes = None
        pdf_filename = None

        if user.get("solo_offer_pdf_url"):
            offer_section = f"""
            <p>U prilogu Vam ponovno šaljemo ponudu (broj ponude: <strong>{user['solo_offer_number']}</strong>), za svaki slučaj da je nemate pri ruci. Ako Vam privitak ne stigne, ponudu možete preuzeti i <a href="{user['solo_offer_pdf_url']}">ovdje</a>.</p>
            """
            try:
                pdf_response = requests.get(user["solo_offer_pdf_url"], timeout=10)
                if pdf_response.status_code == 200:
                    pdf_bytes = pdf_response.content
                    pdf_filename = f"ponuda-{user['solo_offer_number']}.pdf"
            except Exception as e:
                print(f"Greška pri preuzimanju PDF ponude za {user['email']}: {e}")

        body = f"""
        <html>
        <body style="font-family: Arial, sans-serif; color: #2D2A26; line-height: 1.6;">
            <p>Dragi/a {user['partner_one']} i {user['partner_two']},</p>
            <p>Ne možemo vjerovati koliko je vrijeme brzo prošlo! Danas je posljednji dan Vašeg besplatnog probnog razdoblja u Weddingeru, i iskreno se nadamo da Vam je aplikacija dosad barem malo olakšala pripreme za Vaš veliki dan. 💛</p>
            <p>Kako biste bez prekida nastavili čuvati sve svoje planove, popise gostiju, budžet i uspomene na jednom mjestu, potrebna je jednokratna uplata od <strong>30 €</strong> - to je to, bez skrivenih troškova i bez pretplate.</p>
            <p>Molimo Vas da uplatu izvršite <strong>do kraja dana</strong>, kako Vam pristup ne bi bio privremeno onemogućen.</p>
            {offer_section}
            <p>Hvala Vam što ste dio Weddinger priče, uz Vas smo na svakom koraku do oltara. 🤍</p>
            <p>Srdačan pozdrav,<br>Weddinger tim</p>
        </body>
        </html>
        """

        try:
            send_email(
                to=user["email"],
                subject=subject,
                body=body,
                is_html=True,
                attachment_bytes=pdf_bytes,
                attachment_filename=pdf_filename
            )
            executeQuery(
                "UPDATE users SET trial_reminder_sent = true WHERE id = %s",
                (user["id"],)
            )
            print(f"Poslan podsjetnik korisniku {user['email']}")
        except Exception as e:
            print(f"Greška prilikom slanja maila korisniku {user['email']}: {e}")


if __name__ == "__main__":
    send_trial_reminders()
