#######################Django related imports####################
import os
import subprocess
import ast
import shutil
from django.shortcuts import render
from django.contrib.auth.models import User
from django.http import HttpResponseRedirect
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.decorators import api_view
from rest_framework.generics import GenericAPIView
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework import generics, permissions, views, serializers, status
#################################################################
#API related imports
from .models import (
	NodeData,
	NodeParams,
    CommonParams,
)
from .serializers import (
    NodeDataSerializer,
	NodeParamsSerializer,
    CommonParamsSerializer,
    FileSerializer
)
#################################################################
#Custom Imports
from .FileHandler import (
    FileHandler,
)


class NodeRetrieveAPIView(generics.RetrieveAPIView):
    queryset            = NodeData.objects.all()
    serializer_class    = NodeDataSerializer
    lookup_field        = 'slug'

class NodeUpdateAPIView(generics.RetrieveUpdateAPIView):
    queryset            = NodeData.objects.all()
    serializer_class    = NodeDataSerializer
    lookup_field        = 'slug'

class SaveNodeAPIView(generics.CreateAPIView):
    queryset            = NodeData.objects.all()
    serializer_class    = NodeDataSerializer
    lookup_field        = 'slug'

class ListNodeAPIView(generics.ListAPIView):
    queryset            = NodeData.objects.all()
    serializer_class    = NodeDataSerializer
    lookup_field        = 'slug'

class DeleteNodeAPIView(generics.DestroyAPIView):
    queryset            = NodeData.objects.all()
    serializer_class    = NodeDataSerializer
    lookup_field        = 'slug'

class CommonParamsListAPIView(generics.ListAPIView):
    queryset            = CommonParams.objects.all()
    serializer_class    = CommonParamsSerializer
    lookup_field        = 'slug'

class CommonParamsRetrieveAPIView(generics.RetrieveAPIView):
    queryset            = CommonParams.objects.all()
    serializer_class    = CommonParamsSerializer
    lookup_field        = 'slug'

class ETLData(serializers.Serializer):
    operation = serializers.CharField()
    postData = serializers.CharField()
    oldTitle = serializers.CharField()

class InterimData(serializers.Serializer):
    finalParameter = serializers.CharField()
    nodeName = serializers.CharField()

class FileUploadView(APIView):
    parser_classes = (MultiPartParser, FormParser)

    def post(self, request, *args, **kwargs):
        file_serializer = FileSerializer(data=request.data)
        if file_serializer.is_valid():
            files = dict((f, f) for f in request.FILES.getlist('file'))
            nodeName = file_serializer.validated_data['nodeName']
            preferredFormat = file_serializer.validated_data['preferredFormat']
            for f in files.values():
                fileHandlerObject = FileHandler(f, preferredFormat, nodeName)
                fileProcessed = fileHandlerObject.handleUploadedFile()
                if not fileProcessed[0]:
                    return Response(file_serializer.errors, status=status.HTTP_400_BAD_REQUEST)
                else:
                    return Response(file_serializer.data, status=status.HTTP_201_CREATED)


            return Response(file_serializer.data, status=status.HTTP_201_CREATED)
        else:
            return Response(file_serializer.errors, status=status.HTTP_400_BAD_REQUEST)



class ETLFunctions(GenericAPIView):

    serializer_class = ETLData

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.data
        if data['operation'] == "create-folder":
            os.mkdir('../Analysis/'+data['postData'])
            with open('../Analysis/'+data['postData']+'/'+data['postData']+'-run.log', 'w') as fp:
                pass
            fp.close()

        if data['operation'] == "rename-folder":
            os.rename('../Analysis/'+data['oldTitle'], '../Analysis/'+data['postData'])

        if data['operation'] == "create-partition-file":
            print(os.getcwd())
            print(os.listdir(os.getcwd()))
            partInfo = (data['postData'].split('|'))
            with open(f'"{partInfo[0]}.part"', "w") as fpp:
                pass
            fpp.close()
            partitionFile = open(f'"{partInfo[0]}.part"', "w+")
            partitionFile.write(partInfo[1])
            partitionFile.close()

        if data['operation'] == "move-file":
            pass
                
        return Response("Success", status=status.HTTP_200_OK)

class BioTools(APIView):
    def get(self, request):
        params = request.GET.get('function', '')
        params = params.split(";")
        output = subprocess.check_output(f'seqmagick extract-ids ../Analysis/"{params[1]}"/"{(params[2])[:-1]}"', shell=True)
        outgroups = (output.decode("utf-8")).split('\n')
        outgroups = outgroups[:len(outgroups)-1]
        return Response({'outgroups': outgroups})

class CommandRunner(GenericAPIView):

    serializer_class = InterimData

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.data
        runLogFile = f'../Analysis/{data["nodeName"]}/{data["nodeName"]}-run.log'
        
        try:
            commands = ast.literal_eval(data['finalParameter'])
            for key, value in commands.items():
                process = subprocess.Popen(value+f" > {runLogFile}", shell=True)
        except:
            process = subprocess.Popen(data['finalParameter']+f" > {runLogFile}", shell=True)
        return Response("Command successfully sent for execution", status=status.HTTP_200_OK)