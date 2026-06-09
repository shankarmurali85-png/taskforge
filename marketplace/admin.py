from django.contrib import admin
from .models import (
    User,
    Project,
    Bid,
    Delivery,
    Review,
    EmailVerificationToken,
)

admin.site.register(User)
admin.site.register(Project)
admin.site.register(Bid)
admin.site.register(Delivery)
admin.site.register(Review)
admin.site.register(EmailVerificationToken)
