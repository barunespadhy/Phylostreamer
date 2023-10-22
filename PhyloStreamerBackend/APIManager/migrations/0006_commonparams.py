# Generated by Django 3.2.15 on 2022-09-04 18:43

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('APIManager', '0005_rename_formdata_nodedata_nodedata_and_more'),
    ]

    operations = [
        migrations.CreateModel(
            name='CommonParams',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('title', models.CharField(max_length=120)),
                ('slug', models.SlugField(blank=True, null=True)),
                ('paramData', models.CharField(default='m', max_length=10000)),
            ],
        ),
    ]