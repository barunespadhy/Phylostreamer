# Generated by Django 3.2.15 on 2023-07-25 14:45

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('APIManager', '0007_upload'),
    ]

    operations = [
        migrations.AlterField(
            model_name='upload',
            name='upload',
            field=models.FileField(blank=True, null=True, upload_to='uploads/'),
        ),
    ]
