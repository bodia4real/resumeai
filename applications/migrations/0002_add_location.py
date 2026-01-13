from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('applications', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='jobapplication',
            name='location',
            field=models.CharField(blank=True, max_length=255, null=True),
        ),
    ]
