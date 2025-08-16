# backend/urls.py
from django.contrib import admin
from django.urls import path
from django.conf import settings
from django.conf.urls.static import static
from api import views as api_views

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/generate", api_views.generate),
    path("api/refine", api_views.refine),
    path("api/complete", api_views.complete),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
