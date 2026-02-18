from django.contrib.auth.models import AbstractUser
from django.db import models



# Table: User
class User(AbstractUser):
    ROLE_CHOICES = ( 
        ('student', 'Student'),
        ('alumni', 'Alumni'),
    )
    role = models.CharField(max_length=10, choices=ROLE_CHOICES)
    phone = models.CharField(max_length=15, blank=True, null=True)
    college = models.CharField(max_length=100)
    degree = models.CharField(max_length=100)
    batch_year = models.IntegerField()
    bio = models.TextField(blank=True, null=True)
    image = models.ImageField(upload_to='profile_images/', blank=True, null=True)

    def __str__(self):
        return self.username


# Table: MentorshipType
class MentorshipType(models.Model):
    name = models.CharField(max_length=100, unique=True)

    def __str__(self):
        return self.name
    

# Table: AlumniProfile
class AlumniProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='alumni_profile')
    current_company = models.CharField(max_length=100, blank=True, null=True)
    job_title = models.CharField(max_length=100, blank=True, null=True)
    industry = models.CharField(max_length=100, blank=True, null=True)
    years_of_experience = models.IntegerField(blank=True, null=True)
    linkedin_url = models.URLField(blank=True, null=True)
    willing_to_mentor = models.BooleanField(default=False)
    available_for = models.ManyToManyField(MentorshipType, blank=True)

    def __str__(self):
        return f"{self.user.username}'s Alumni Profile"


# Table: Event
class Event(models.Model):
    EVENT_TYPE_CHOICES = (
        ('online', 'Online'),
        ('offline', 'Offline'),
    )

    title = models.CharField(max_length=200)
    description = models.TextField()
    date = models.DateField()
    time = models.TimeField()
    location = models.CharField(max_length=200) # URL for online, Address for offline
    type = models.CharField(max_length=10, choices=EVENT_TYPE_CHOICES)
    organizer = models.ForeignKey(User, on_delete=models.CASCADE, related_name='organized_events')
    registered_users = models.ManyToManyField(User, related_name='registered_events', blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title


# Table: MentorshipRequest
class MentorshipRequest(models.Model):
    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('accepted', 'Accepted'),
        ('rejected', 'Rejected'),
        ('cancelled', 'Cancelled'),
    )

    student = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sent_mentorship_requests')
    alumni = models.ForeignKey(User, on_delete=models.CASCADE, related_name='received_mentorship_requests')
    message = models.TextField(blank=True, null=True)
    mentorship_types = models.ManyToManyField(MentorshipType)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    requested_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Request from {self.student.username} to {self.alumni.username} - {self.status}"


# Table: MentorshipActivity
class MentorshipActivity(models.Model):
    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('in_progress', 'In Progress'),
        ('completed', 'Completed'),
        ('scheduled', 'Scheduled'),
    )

    mentorship_request = models.ForeignKey(MentorshipRequest, on_delete=models.CASCADE, related_name='activities')
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True, null=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    date = models.DateTimeField(blank=True, null=True)
    file = models.FileField(upload_to='mentorship_activities/', blank=True, null=True)
    meeting_link = models.URLField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.title} - {self.mentorship_request.student.username}"


# Table: Job
class Job(models.Model):
    JOB_TYPE_CHOICES = (
        ('full_time', 'Full Time'),
        ('internship', 'Internship'),
        ('contract', 'Contract'),
    )

    title = models.CharField(max_length=200)
    company = models.CharField(max_length=200)
    location = models.CharField(max_length=200)
    description = models.TextField()
    job_type = models.CharField(max_length=20, choices=JOB_TYPE_CHOICES, default='full_time')
    link = models.URLField(blank=True, null=True)
    posted_at = models.DateTimeField(auto_now_add=True)
    posted_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='posted_jobs')

    def __str__(self):
        return f"{self.title} at {self.company}"


# Table: ReferralRequest
class ReferralRequest(models.Model):
    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('viewed', 'Viewed'),
        ('referred', 'Referred'),
        ('rejected', 'Rejected'),
    )

    job = models.ForeignKey(Job, on_delete=models.CASCADE, related_name='referral_requests')
    student = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sent_referral_requests')
    message = models.TextField(blank=True, null=True)
    resume = models.FileField(upload_to='referral_resumes/')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    requested_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Referral for {self.student.username} - {self.job.title}"
