import resend
from django.conf import settings

resend.api_key = settings.RESEND_API_KEY

r = resend.Emails.send({
    "from": "onboarding@resend.dev",
    "to": "muralishankar1016@gmail.com",
    "subject": "TaskForge Test",
    "html": "<h1>Email Working!</h1>"
})

print(r)