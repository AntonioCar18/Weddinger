from database import takeFromBase, executeQuery
from email_service import send_email

def suspend_user ():
    query = """
        SELECT id, email, partner_one, partner_two, trial_reminder_sent, solo_offer_number, solo_offer_pdf_url
        FROM users
        WHERE DATE(created_at) + interval '4 days' = CURRENT_DATE
        AND is_paid = false
        AND trial_reminder_sent = true
        AND is_active = true
    """

    users = takeFromBase(query)

    if not users:
        print("Nema korisnika koji zadovoljavaju uvjete za deaktivaciju računa.")
        return

    for user in users:
        try:
            executeQuery(
                "UPDATE users SET is_active = false WHERE id = %s", (user["id"],)
            )
            print(f"Deaktiviran je korisnik: {user['email']}")
        except Exception as error:
            print(f"Greška prilikom deaktivacije korisnika: {user['email']}: {error}")
            continue

        offer_section = ""
        if user.get("solo_offer_pdf_url"):
            offer_section = f""" Vašu ponudu (broj: <strong>{user['solo_offer_number']}</strong>) možete pronaći u prethodnim mailovima, a u slučaju da ste svoju ponudu zagubili/obrisali, ista Vam se nalazi na <strong><a href={user['solo_offer_pdf_url']}>poveznici</a></strong>"""

        subject = "Privremena deaktivacija korisničkog računa na platformi Weddinger 💛"
        body = f"""
            <html>
        <body style="font-family: Arial, sans-serif; color: #2D2A26; line-height: 1.6;">
            <p>Poštovani/a {user['partner_one']} i {user['partner_two']},</p>
            <p>Budući da uplata za korištenje aplikacije Weddinger nije zaprimljena unutar besplatnog probnog razdoblja, Vaš pristup aplikaciji je privremeno onemogućen.</p>
            {offer_section}
            <p>Ako imate pitanja ili je uplata već izvršena, javite nam se na <a href="mailto:helpdesk@weddinger.com.hr">helpdesk@weddinger.com.hr</a>.</p>
            <p>Srdačan pozdrav,<br>Weddinger tim</p>
        </body>
        </html>
        """

        try:
            send_email(to=user["email"], subject=subject, body=body, is_html=True)
        except Exception as error:
            print(f"Dogodila se pogreška prilikom slanja E-maila korisniku, {user['email']: {error}}")

if __name__ == "__main__":
    suspend_user()