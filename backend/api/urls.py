from django.urls import path
from api import views

urlpatterns = [
    path("/api/generate/", views.generate, name="generate"),  # POST
]