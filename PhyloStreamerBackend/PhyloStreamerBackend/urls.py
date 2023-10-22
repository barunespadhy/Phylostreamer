"""URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/3.0/topics/http/urls/
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
from django.urls import path, re_path
from django.views.generic import TemplateView
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack


from APIManager.views import (
    NodeRetrieveAPIView,
    SaveNodeAPIView,
    ListNodeAPIView,
    FileUploadView,
    BioTools,
    ETLFunctions,
    CommonParamsListAPIView,
    CommonParamsRetrieveAPIView,
    CommandRunner,
    NodeUpdateAPIView,
    DeleteNodeAPIView
)

from .views import(
    redirectToFrontend
)

from .consumers import TerminalConsumer

urlpatterns = [
    path('admin/', admin.site.urls),
    #re_path(r'api/(?P<slug>[\w-]+)/$', formRUDView.as_view(), name = 'form-rud'),
    re_path(r'^node/(?P<slug>[\w-]+)/$', NodeRetrieveAPIView.as_view(), name='node-view'),
    re_path(r'^node-update/(?P<slug>[\w-]+)/$', NodeUpdateAPIView.as_view(), name='node-update-view'),
    re_path(r'^delete/(?P<slug>[\w-]+)/$', DeleteNodeAPIView.as_view(), name='delete'),
    re_path(r'^save-node/', SaveNodeAPIView.as_view(), name='save-node'),
    path('list-node/', ListNodeAPIView.as_view(), name='list-node'),
    path('etl-functions/', ETLFunctions.as_view(), name='etl-process'),
    re_path(r'^common-params/(?P<slug>[\w-]+)/$', CommonParamsRetrieveAPIView.as_view(), name='common-params'),
    path('fetch-common-params/', CommonParamsListAPIView.as_view(), name='fetch-common-params'),
    path('biotools/', BioTools.as_view()),
    path('runcommand/', CommandRunner.as_view()),
    path('upload/', FileUploadView.as_view(), name='upload'),
    re_path(r'^phylostreamer/', TemplateView.as_view(template_name='react.html')),

    
    #django
    path('', redirectToFrontend)
]

websocket_urlpatterns = [
    re_path(r'ws/terminal/$', TerminalConsumer.as_asgi()),
]