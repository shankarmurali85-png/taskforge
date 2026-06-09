from rest_framework import generics
from .models import User
from .serializers import RegisterSerializer, CustomTokenObtainPairSerializer
from rest_framework.permissions import IsAuthenticated
from .models import Project
from .project_serializers import ProjectSerializer
from .permissions import IsClient, IsVerifiedAndNotBanned
from .models import Bid
from .bid_serializers import BidSerializer
from .permissions import IsFreelancer
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import Delivery
from .delivery_serializers import DeliverySerializer
from .models import Review
from .review_serializers import ReviewSerializer
from django.contrib.auth.tokens import default_token_generator
from django.contrib.auth import get_user_model
from rest_framework.views import APIView
from rest_framework.response import Response
from django.contrib.auth.tokens import default_token_generator
from .user_serializers import UserSerializer
from .permissions import IsAdmin
from django.conf import settings
from .email_service import send_reset_email
from django.shortcuts import get_object_or_404
from rest_framework_simplejwt.views import TokenObtainPairView
from django.db.models import Prefetch


class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer

class UserListView(generics.ListAPIView):

    queryset = User.objects.all()
    serializer_class = UserSerializer

    permission_classes = [
        IsAuthenticated,
        IsAdmin
    ]


class CurrentUserView(APIView):

    permission_classes = [IsVerifiedAndNotBanned]

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)




class CreateProjectView(generics.CreateAPIView):

    serializer_class = ProjectSerializer
    permission_classes = [IsClient]

    def perform_create(self, serializer):
        serializer.save(client=self.request.user)

class ProjectListView(generics.ListAPIView):
    serializer_class = ProjectSerializer
    permission_classes = [IsVerifiedAndNotBanned]

    def get_queryset(self):
        user = self.request.user
        queryset = Project.objects.select_related('client')

        if user.role == 'client':
            return queryset.filter(client=user).prefetch_related(
                'bids',
                'delivery_set',
            )

        if user.role == 'freelancer':
            my_bids = Bid.objects.filter(
                freelancer=user
            ).select_related('freelancer')
            my_deliveries = Delivery.objects.filter(freelancer=user)
            return queryset.prefetch_related(
                Prefetch('bids', queryset=my_bids),
                Prefetch('delivery_set', queryset=my_deliveries),
            )

        if user.role == 'admin':
            return queryset.prefetch_related(
                'bids',
                'delivery_set',
            )

        return queryset.none()

class CreateBidView(generics.CreateAPIView):

    serializer_class = BidSerializer
    permission_classes = [IsFreelancer]

    def perform_create(self, serializer):
        serializer.save(freelancer=self.request.user)

class UpdateBidView(generics.UpdateAPIView):

    serializer_class = BidSerializer
    permission_classes = [IsFreelancer]
    http_method_names = ['patch']

    def get_queryset(self):
        return Bid.objects.filter(
            freelancer=self.request.user
        ).select_related('project', 'freelancer')

class AcceptBidView(APIView):

    permission_classes = [IsVerifiedAndNotBanned]

    def post(self, request, bid_id):

        bid = get_object_or_404(Bid, id=bid_id)

        if bid.project.client != request.user:
            return Response(
                {"error": "Not authorized"},
                status=status.HTTP_403_FORBIDDEN
            )

        if bid.project.status != "open":
            return Response(
                {"error": "Only open projects can accept a bid."},
                status=status.HTTP_400_BAD_REQUEST
            )

        bid.status = "accepted"
        bid.save()

        Bid.objects.filter(project=bid.project).exclude(id=bid.id).update(
            status="rejected"
        )

        bid.project.status = "in_progress"
        bid.project.save()

        return Response({
            "message": "Bid accepted successfully"
        })
    
class CreateDeliveryView(generics.CreateAPIView):

    serializer_class = DeliverySerializer
    permission_classes = [IsFreelancer]

    def perform_create(self, serializer):
        serializer.save(
            freelancer=self.request.user
        )

class CompleteProjectView(APIView):

    permission_classes = [IsVerifiedAndNotBanned]

    def post(self, request, project_id):

        project = get_object_or_404(Project, id=project_id)

        if project.client != request.user:
            return Response(
                {"error": "Not authorized"},
                status=status.HTTP_403_FORBIDDEN
            )

        if project.status != "in_progress":
            return Response(
                {"error": "Only in-progress projects can be completed."},
                status=status.HTTP_400_BAD_REQUEST
            )

        if not Delivery.objects.filter(project=project).exists():
            return Response(
                {"error": "A delivery must be submitted before completing the project."},
                status=status.HTTP_400_BAD_REQUEST
            )

        project.status = "completed"
        project.save()

        return Response({
            "message": "Project completed successfully"
        })
    
class CreateReviewView(generics.CreateAPIView):

    serializer_class = ReviewSerializer
    permission_classes = [IsVerifiedAndNotBanned]

    def perform_create(self, serializer):
        serializer.save(
            reviewer=self.request.user
        )

User = get_user_model()


class ForgotPasswordView(APIView):

    def post(self, request):

        email = request.data.get("email")

        user = User.objects.filter(email=email).first()

        if not user:
            return Response({
                "error": "User not found"
            }, status=404)

        token = default_token_generator.make_token(user)

        reset_link = (
            f"{settings.FRONTEND_URL}/reset-password/"
            f"?user_id={user.id}&token={token}"
        )
        send_reset_email(user.email, reset_link)

        return Response({
            "message": "Password reset email sent"
        })
        
class ResetPasswordView(APIView):

    def post(self, request):

        user_id = request.data.get("user_id")
        token = request.data.get("token")
        new_password = request.data.get("new_password")

        try:
            user = User.objects.get(id=user_id)

            if default_token_generator.check_token(user, token):

                user.set_password(new_password)
                user.save()

                return Response({
                    "message": "Password reset successful"
                })

            return Response({
                "error": "Invalid token"
            }, status=400)

        except User.DoesNotExist:
            return Response({
                "error": "User not found"
            }, status=404)
        
class BanUserView(APIView):

    permission_classes = [IsAuthenticated, IsAdmin]

    def post(self, request, user_id):

        user = get_object_or_404(User, id=user_id)

        user.is_banned = True
        user.save()

        return Response({
            "message": "User banned successfully"
        })
    
class UnbanUserView(APIView):

    permission_classes = [IsAuthenticated, IsAdmin]

    def post(self, request, user_id):

        user = get_object_or_404(User, id=user_id)

        user.is_banned = False
        user.save()

        return Response({
            "message": "User unbanned successfully"
        })
    
from rest_framework.views import APIView
from rest_framework.response import Response
from .models import EmailVerificationToken


class VerifyEmailView(APIView):

    def get(self, request):

        token = request.GET.get("token")

        try:
            verification = EmailVerificationToken.objects.get(
                token=token
            )

            user = verification.user

            user.is_verified = True
            user.save()

            verification.delete()

            return Response({
                "message": "Email verified successfully"
            })

        except EmailVerificationToken.DoesNotExist:

            return Response({
                "error": "Invalid token"
            }, status=400)
