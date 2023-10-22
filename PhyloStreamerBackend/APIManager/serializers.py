from django.contrib.auth import get_user_model, authenticate, login, logout
from django.contrib.auth.models import User
from django.db.models import Q
from django.urls import reverse
from django.utils import timezone
from rest_framework import serializers
from .models import (
	NodeData,
	NodeParams,
	CommonParams,
)

class NodeDataSerializer(serializers.ModelSerializer):
	
	class Meta:
		model  = NodeData
		fields = [
			'title',
			'slug',
			'nodeData',
		]

class NodeParamsSerializer(serializers.ModelSerializer):
	
	class Meta:
		model  = NodeParams
		fields = [
			'title',
			'slug',
			'nodeData',
		]

class CommonParamsSerializer(serializers.ModelSerializer):
	
	class Meta:
		model  = CommonParams
		fields = [
			'title',
			'slug',
			'paramData',
		]


class FileSerializer(serializers.Serializer):
    file = serializers.ListField(
        child=serializers.FileField(max_length=100000, allow_empty_file=False, use_url=False)
    )
    nodeName = serializers.CharField()
    preferredFormat = serializers.CharField(allow_blank=True)