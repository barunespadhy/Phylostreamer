from django.shortcuts import render,redirect
from django.contrib.auth.decorators import login_required
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
from django.http import HttpResponseRedirect, HttpResponse, JsonResponse
from django.views.decorators.clickjacking import xframe_options_exempt
from django.views.decorators.csrf import csrf_exempt
import json
from django.core.files.storage import FileSystemStorage
import shutil
import os
import subprocess

@csrf_exempt
@xframe_options_exempt
def redirectToFrontend(request):
    response = redirect('/phylostreamer/')
    return response