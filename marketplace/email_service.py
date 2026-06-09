import resend
from django.conf import settings

resend.api_key = settings.RESEND_API_KEY


def send_reset_email(email, reset_link):

    resend.Emails.send({
        "from": "onboarding@resend.dev",
        "to": "muralishankar1016@gmail.com",
        "subject": "Reset Your Password",
        "html": f"""
        <h2>Password Reset</h2>

        <p>Click below to reset your password:</p>

        <a href="{reset_link}">
            Reset Password
        </a>
        """
    })