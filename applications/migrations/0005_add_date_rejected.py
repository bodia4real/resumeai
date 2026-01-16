from django.db import migrations, models

class Migration(migrations.Migration):
    dependencies = [
        ('applications', '0004_add_date_updated'),
    ]

    operations = [
        migrations.AddField(
            model_name='jobapplication',
            name='date_rejected',
            field=models.DateField(blank=True, null=True, help_text='Date of rejection'),
        ),
    ]
