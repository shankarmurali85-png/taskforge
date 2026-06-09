from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

import secrets
import resend

from django.conf import settings
from .models import User, EmailVerificationToken


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):

    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token['role'] = user.role
        token['is_verified'] = user.is_verified
        return token

    def validate(self, attrs):
        data = super().validate(attrs)
        user = self.user

        if user.is_banned:
            raise serializers.ValidationError(
                {'detail': 'Your account has been banned.'}
            )

        if not user.is_verified:
            raise serializers.ValidationError(
                {'detail': 'Please verify your email before logging in.'}
            )

        return data


class RegisterSerializer(serializers.ModelSerializer):

    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = [
            'username',
            'email',
            'password',
            'role'
        ]

    def validate_role(self, role):
        if role == 'admin':
            raise serializers.ValidationError(
                'Admin accounts cannot be created through public registration.'
            )

        return role

    def create(self, validated_data):

        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
            role=validated_data['role']
        )

        # Create verification token
        token = secrets.token_urlsafe(32)

        EmailVerificationToken.objects.create(
            user=user,
            token=token
        )

        # Configure Resend
        resend.api_key = settings.RESEND_API_KEY

        # Verification link
        verification_link = (
            f"http://localhost:8000/api/verify-email/"
            f"?token={token}"
        )

        # Send email
        resend.Emails.send({
            "from": "onboarding@resend.dev",
            "to": "muralishankar1016@gmail.com",
            "subject": "Verify Your Email",
            "html": f"""
            <h2>Welcome to TaskForge</h2>

            <p>Please verify your email address:</p>

            <a href="{verification_link}">
                Verify Email
            </a>
            """
        })

        return user
