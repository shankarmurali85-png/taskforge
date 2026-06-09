from django.urls import path
from .views import RegisterView
from .views import CreateProjectView
from .views import ProjectListView
from .views import CreateBidView
from .views import UpdateBidView
from .views import AcceptBidView,CreateDeliveryView
from .views import CompleteProjectView
from .views import CreateReviewView
from .views import ForgotPasswordView, ResetPasswordView, UserListView
from .views import BanUserView, UnbanUserView
from .views import VerifyEmailView, CurrentUserView, CustomTokenObtainPairView
from rest_framework_simplejwt.views import (
    TokenRefreshView,
)

urlpatterns = [
    path('register/', RegisterView.as_view()),

    path('login/', CustomTokenObtainPairView.as_view()),
    path('refresh/', TokenRefreshView.as_view()),
    path('me/', CurrentUserView.as_view()),
    path('projects/create/', CreateProjectView.as_view()),
    path('projects/', ProjectListView.as_view()),
    path('bids/create/', CreateBidView.as_view()),
    path('bids/<int:pk>/', UpdateBidView.as_view()),
    path('bids/<int:bid_id>/accept/', AcceptBidView.as_view()),
    path('deliveries/create/',CreateDeliveryView.as_view()),
    path('projects/<int:project_id>/complete/', CompleteProjectView.as_view()),
    path('reviews/create/', CreateReviewView.as_view()),
    path('forgot-password/', ForgotPasswordView.as_view()),
    path('reset-password/', ResetPasswordView.as_view()),
    path('admin/users/', UserListView.as_view()),
    path('admin/users/<int:user_id>/ban/', BanUserView.as_view()),
    path('admin/users/<int:user_id>/unban/', UnbanUserView.as_view()),
    path("verify-email/",VerifyEmailView.as_view()),
]
