from django.db import migrations, models

class Migration(migrations.Migration):
    dependencies = [
        ('applications', '0003_alter_application_url_length'),
    ]

    operations = [
        migrations.AddField(
            model_name='jobapplication',
            name='date_updated',
            field=models.DateTimeField(auto_now=True, help_text='When the application was last updated'),
        ),
    ]
