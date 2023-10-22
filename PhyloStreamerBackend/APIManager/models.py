from django.db import models
from django.conf import settings

User = settings.AUTH_USER_MODEL
# Create your models here.
class NodeData(models.Model):
	title		= models.CharField(max_length=120)
	slug		= models.SlugField(null=True, blank=True)
	nodeData 	= models.CharField(default="m", max_length=10000)

class NodeParams(models.Model):
	title		= models.CharField(max_length=120)
	slug		= models.SlugField(null=True, blank=True)
	nodeData 	= models.CharField(default="m", max_length=10000)

class CommonParams(models.Model):
	title		= models.CharField(max_length=120)
	slug		= models.SlugField(null=True, blank=True)
	paramData 	= models.CharField(default="m", max_length=10000)