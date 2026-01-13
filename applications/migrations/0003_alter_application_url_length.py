from django.db import migrations, models

class Migration(migrations.Migration):
    dependencies = [
        ('applications', '0002_add_location'),
    ]

    operations = [
        migrations.AlterField(
            model_name='jobapplication',
            name='application_url',
            field=models.URLField(blank=True, null=True, max_length=500),
        ),
    ]
