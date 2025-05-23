"""
URL configuration for backend project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from users.views import RegisterView, LoginView, LogoutView, CustomTokenObtainPairView, CustomTokenRefreshView, DashboardStatsView, LandingPageStatsView, VerifyEmailAPIView, RequestPasswordResetView, PasswordResetConfirmView
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView

urlpatterns = [
    path('', include('devlog.urls')),
    path("admin/", admin.site.urls),
    path("register/", RegisterView.as_view(), name='register'),
    path("login/", LoginView.as_view(), name='login'),
    path("logout/", LogoutView.as_view(), name='logout'),
    path('verify-email/<uidb64>/<token>/', VerifyEmailAPIView.as_view(), name='verify-email'),
    path('request-reset-password/', RequestPasswordResetView.as_view(), name='request-reset-password'),
    path('reset-password/<uidb64>/<token>/', PasswordResetConfirmView.as_view(), name='reset-password-confirm'),

    #token
    path("token/",  CustomTokenObtainPairView.as_view(), name='get_token'),
    path("token/refresh/", CustomTokenRefreshView.as_view(), name='token_refresh'),
    path("api-auth/", include("rest_framework.urls")),

    # Admin Panel
    path("dashboard/stats/", DashboardStatsView.as_view(), name="dashboard-stats"),

    #Main Features
    path("courses/", include('courses.urls')),
    path("users/", include('users.urls')),
    path("forum/", include('forum.urls')),
    path("quiz/", include('quiz.urls')),

    #Landing Page
    path("landingpage/stats/", LandingPageStatsView.as_view(), name="landingpage-stats"),

    #API Documentation
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/schema/swagger-ui/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
]
