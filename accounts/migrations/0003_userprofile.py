import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('accounts', '0002_alter_user_datejoined'),
    ]

    operations = [
        migrations.CreateModel(
            name='UserProfile',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('handle', models.CharField(max_length=30, unique=True)),
                ('gamertag', models.CharField(max_length=50)),
                ('show_real_name', models.BooleanField(default=True)),
                ('pronouns', models.CharField(blank=True, max_length=30)),
                ('bio', models.TextField(blank=True, max_length=500)),
                ('grad_year', models.PositiveSmallIntegerField(blank=True, null=True)),
                ('game', models.CharField(blank=True, max_length=50)),
                ('role', models.CharField(blank=True, max_length=50)),
                ('rank', models.CharField(blank=True, max_length=50)),
                ('looking_for_team', models.BooleanField(default=False)),
                ('interests', models.JSONField(blank=True, default=list)),
                ('avatar', models.CharField(blank=True, max_length=255)),
                ('banner', models.CharField(blank=True, max_length=255)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('user', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, related_name='profile', to=settings.AUTH_USER_MODEL)),
            ],
        ),
    ]
