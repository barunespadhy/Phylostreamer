from django.contrib import admin
from .models import (
	NodeData,
	NodeParams,
	CommonParams
)
# Register your models here.
admin.site.register(NodeData)
admin.site.register(NodeParams)
admin.site.register(CommonParams)
