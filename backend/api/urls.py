from django.urls import path
from api import views

urlpatterns = [
    path("generate/", views.generate, name="generate"),  # POST
]