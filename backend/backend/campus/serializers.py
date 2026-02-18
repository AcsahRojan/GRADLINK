from rest_framework import serializers
from django.db import transaction
from .models import User, AlumniProfile, MentorshipType, Event, MentorshipRequest, MentorshipActivity, Job, ReferralRequest


# =========================
# SIGNUP SERIALIZER
# =========================
class SignupSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    confirm_password = serializers.CharField(write_only=True)

    # alumni-only extra fields
    job_title = serializers.CharField(required=False, allow_blank=True)
    current_company = serializers.CharField(required=False, allow_blank=True)
    willing_to_mentor = serializers.BooleanField(required=False)

    class Meta:
        model = User
        fields = [
            'username', 'email', 'password', 'confirm_password',
            'first_name', 'last_name',
            'role', 'phone', 'college', 'degree',
            'batch_year', 'bio',

            # alumni fields
            'job_title', 'current_company', 'willing_to_mentor',
        ]

    def validate(self, data):
        # check password match
        if data['password'] != data['confirm_password']:
            raise serializers.ValidationError("Passwords do not match")

        # alumni must give job details
        if data['role'] == 'alumni':
            if not data.get('job_title') or not data.get('current_company'):
                raise serializers.ValidationError(
                    "Job title and company are required for alumni"
                )
        return data

#This is called after validation to save data in DB.
    def create(self, validated_data):
        validated_data.pop('confirm_password')
        job_title = validated_data.pop('job_title', None)
        current_company = validated_data.pop('current_company', None)
        willing_to_mentor = validated_data.pop('willing_to_mentor', False)

        # atomic = if anything fails, nothing is saved
        with transaction.atomic():
            user = User.objects.create_user(**validated_data)

            # create alumni profile only for alumni
            if user.role == 'alumni':
                AlumniProfile.objects.create(
                    user=user,
                    job_title=job_title,
                    current_company=current_company,
                    willing_to_mentor=willing_to_mentor
                )

        return user


# =========================
# MENTORSHIP TYPE SERIALIZER
# =========================
class MentorshipTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = MentorshipType
        fields = ['id', 'name']


# =========================
# ALUMNI PROFILE SERIALIZER
# =========================
class AlumniProfileSerializer(serializers.ModelSerializer):
    available_for = MentorshipTypeSerializer(many=True, read_only=True)

    class Meta:
        model = AlumniProfile
        fields = [
            'job_title',
            'current_company',
            'industry',
            'years_of_experience',
            'linkedin_url',
            'willing_to_mentor',
            'available_for',
        ]

# =========================
# USER SERIALIZER (READ)
# =========================
class UserSerializer(serializers.ModelSerializer):
    alumni_profile = AlumniProfileSerializer(read_only=True)

    class Meta:
        model = User
        fields = [
            'id', 'username', 'email',
            'first_name', 'last_name',
            'role', 'phone', 'college',
            'degree', 'batch_year', 'bio',
            'image', 'alumni_profile',
        ]


# =========================
# Serializer for editing user and alumni profile
# =========================
class UserUpdateSerializer(serializers.ModelSerializer):
    # Field names for AlumniProfile to be extracted from initial_data
    ALUMNI_FIELDS = [
        'job_title', 'current_company', 'industry', 
        'years_of_experience', 'linkedin_url', 'willing_to_mentor'
    ]

    class Meta:
        model = User
        fields = [
            'first_name', 'last_name', 'email', 'phone',
            'college', 'degree', 'batch_year', 'bio',
            'image',
        ]

    def update(self, instance, validated_data):
        # Update user fields
        for attr, value in validated_data.items():
            if attr == 'batch_year' and value == '':
                value = None
            setattr(instance, attr, value)
        instance.save()

        # Update alumni profile fields if user is alumni
        if instance.role == 'alumni' and hasattr(instance, 'alumni_profile'):
            profile = instance.alumni_profile
            # Update available_for (ManyToMany) if provided as list of IDs
            if 'available_for' in self.initial_data:
                profile.available_for.set(self.initial_data['available_for'])
            
            # Update other fields
            for key in self.ALUMNI_FIELDS:
                if key in self.initial_data:
                    val = self.initial_data[key]
                    # Sanitize: convert empty string to None for nullable/numeric fields
                    if val == '' and key in ['years_of_experience', 'linkedin_url', 'industry', 'current_company', 'job_title']:
                        val = None
                    setattr(profile, key, val)
            profile.save()

        return instance


# =========================
# EVENT SERIALIZER
# =========================
class EventSerializer(serializers.ModelSerializer):
    organizer_name = serializers.CharField(source='organizer.username', read_only=True)
    is_registered = serializers.SerializerMethodField()
    participants_count = serializers.IntegerField(source='registered_users.count', read_only=True)
    participants = serializers.SerializerMethodField()

    class Meta:
        model = Event
        fields = ['id', 'title', 'description', 'date', 'time', 'location', 'type', 'organizer', 'organizer_name', 'registered_users', 'created_at', 'is_registered', 'participants_count', 'participants']
        read_only_fields = ['organizer', 'created_at', 'registered_users']

    def get_is_registered(self, obj):
        user = self.context.get('request').user
        if user.is_authenticated:
            return obj.registered_users.filter(id=user.id).exists()
        return False

    def get_participants(self, obj):
        user = self.context.get('request').user
        if user.is_authenticated and user == obj.organizer:
            # Return specific fields for participants
            return obj.registered_users.values('id', 'first_name', 'last_name', 'email', 'username')
        return None

# =========================
# ALUMNI CARD SERIALIZER
# =========================
class AlumniCardSerializer(serializers.ModelSerializer):
    name = serializers.SerializerMethodField()
    role = serializers.CharField(source='alumni_profile.job_title', read_only=True)
    company = serializers.CharField(source='alumni_profile.current_company', read_only=True)
    dept = serializers.CharField(source='degree', read_only=True)
    batch = serializers.IntegerField(source='batch_year', read_only=True)
    skills = serializers.StringRelatedField(source='alumni_profile.available_for', many=True, read_only=True)
    mentorship = serializers.BooleanField(source='alumni_profile.willing_to_mentor', read_only=True)
    industry = serializers.CharField(source='alumni_profile.industry', read_only=True)

    class Meta:
        model = User
        fields = ['id', 'name', 'role', 'company', 'dept', 'batch', 'skills', 'mentorship', 'industry', 'image']

    def get_name(self, obj):
        return f"{obj.first_name} {obj.last_name}"


# =========================
# MENTORSHIP REQUEST SERIALIZER
# =========================
class MentorshipRequestSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source='student.username', read_only=True)
    student_full_name = serializers.SerializerMethodField()
    alumni_name = serializers.CharField(source='alumni.username', read_only=True)
    alumni_full_name = serializers.SerializerMethodField()
    alumni_company = serializers.SerializerMethodField()
    alumni_role = serializers.SerializerMethodField()
    student_dept = serializers.SerializerMethodField()
    student_image = serializers.ImageField(source='student.image', read_only=True)
    alumni_image = serializers.ImageField(source='alumni.image', read_only=True)
    mentorship_types_details = MentorshipTypeSerializer(source='mentorship_types', many=True, read_only=True)

    class Meta:
        model = MentorshipRequest
        fields = [
            'id', 'student', 'student_name', 'student_full_name', 'student_dept', 'student_image',
            'alumni', 'alumni_name', 'alumni_full_name', 'alumni_company', 'alumni_role', 'alumni_image',
            'message', 'mentorship_types', 'mentorship_types_details',
            'status', 'requested_at', 'updated_at'
        ]
        read_only_fields = ['student', 'requested_at', 'updated_at']

    def get_student_full_name(self, obj):
        return f"{obj.student.first_name} {obj.student.last_name}"

    def get_student_dept(self, obj):
        return obj.student.degree

    def get_alumni_full_name(self, obj):
        return f"{obj.alumni.first_name} {obj.alumni.last_name}"

    def get_alumni_company(self, obj):
        if hasattr(obj.alumni, 'alumni_profile'):
            return obj.alumni.alumni_profile.current_company
        return None

    def get_alumni_role(self, obj):
        if hasattr(obj.alumni, 'alumni_profile'):
            return obj.alumni.alumni_profile.job_title
        return None


class MentorshipActivitySerializer(serializers.ModelSerializer):
    class Meta:
        model = MentorshipActivity
        fields = '__all__'


class JobSerializer(serializers.ModelSerializer):
    posted_by_name = serializers.CharField(source='posted_by.username', read_only=True)
    posted_by_full_name = serializers.SerializerMethodField()

    class Meta:
        model = Job
        fields = '__all__'
        read_only_fields = ['posted_by', 'posted_at']

    def get_posted_by_full_name(self, obj):
        return f"{obj.posted_by.first_name} {obj.posted_by.last_name}"


class ReferralRequestSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source='student.username', read_only=True)
    student_full_name = serializers.SerializerMethodField()
    job_title = serializers.CharField(source='job.title', read_only=True)
    company = serializers.CharField(source='job.company', read_only=True)

    class Meta:
        model = ReferralRequest
        fields = '__all__'
        read_only_fields = ['student', 'requested_at']

    def get_student_full_name(self, obj):
        return f"{obj.student.first_name} {obj.student.last_name}"
