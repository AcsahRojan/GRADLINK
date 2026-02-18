from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.permissions import IsAuthenticated, IsAuthenticatedOrReadOnly
from .permissions import IsOrganizerOrReadOnly
from rest_framework.response import Response
from rest_framework import status
from rest_framework.authtoken.models import Token
from django.contrib.auth import authenticate, login, logout
from django.db.models import Q
from django.core.mail import send_mail
from django.conf import settings
from .models import User, Event, MentorshipType, MentorshipRequest, MentorshipActivity, Job, ReferralRequest
from .serializers import (
    SignupSerializer, UserSerializer, UserUpdateSerializer, 
    EventSerializer, AlumniCardSerializer, MentorshipTypeSerializer,
    MentorshipRequestSerializer, MentorshipActivitySerializer,
    JobSerializer, ReferralRequestSerializer
)

# =========================
# SIGNUP API
# =========================
@api_view(['POST'])
def signup(request):
    serializer = SignupSerializer(data=request.data)

    if serializer.is_valid():
        user = serializer.save()
        token, created = Token.objects.get_or_create(user=user)
        return Response(
            {
                "message": "Signup successful",
                "token": token.key,
                "user": UserSerializer(user).data
            },
            status=status.HTTP_201_CREATED
        )

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# =========================
# LOGIN API
# =========================
 
@api_view(['POST'])
def login_view(request):
    username = request.data.get('username')
    password = request.data.get('password')

    if not username or not password:
        return Response(
            {"error": "Username and password required"},
            status=status.HTTP_400_BAD_REQUEST
        )

    user = authenticate(username=username, password=password)

    if user is None:
        return Response(
            {"error": "Invalid credentials"},
            status=status.HTTP_401_UNAUTHORIZED
        )

    login(request, user)
    token, created = Token.objects.get_or_create(user=user)

    serializer = UserSerializer(user)
    return Response(
        {
            "message": "Login successful",
            "token": token.key,
            "user": serializer.data
        },
        status=status.HTTP_200_OK
    )

# =========================
# UPDATE PROFILE API
#==========================

@api_view(['GET', 'PUT'])
@permission_classes([IsAuthenticated])
def update_profile(request):
    """
    Allows logged-in user to view or update their profile.
    Includes alumni fields if user is alumni.
    """
    user = request.user
    if request.method == 'GET':
        return Response({"user": UserSerializer(user).data})
        
    serializer = UserUpdateSerializer(user, data=request.data, partial=True)
    if serializer.is_valid():
        user = serializer.save()
        # Return full user detailed data
        return Response({"message": "Profile updated successfully", "user": UserSerializer(user).data})
    return Response(serializer.errors, status=400)


# =========================
# LOGOUT API
# =========================
@api_view(['POST'])
def logout_view(request):
    logout(request)
    return Response(
        {"message": "Logout successful"},
        status=status.HTTP_200_OK
    )


from rest_framework import viewsets
from .serializers import SignupSerializer, UserSerializer, UserUpdateSerializer, EventSerializer, AlumniCardSerializer
from .models import User, Event

# =========================
# EVENTS VIEWSET
# =========================
class EventViewSet(viewsets.ModelViewSet):
    queryset = Event.objects.all().order_by('-date')
    serializer_class = EventSerializer
    permission_classes = [IsAuthenticatedOrReadOnly, IsOrganizerOrReadOnly]

    def perform_create(self, serializer):
        serializer.save(organizer=self.request.user)

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def register(self, request, pk=None):
        event = self.get_object()
        user = request.user
        
        if event.registered_users.filter(id=user.id).exists():
            event.registered_users.remove(user)
            return Response({'status': 'unregistered'}, status=status.HTTP_200_OK)
        else:
            event.registered_users.add(user)
            return Response({'status': 'registered'}, status=status.HTTP_200_OK)


# =========================
# ALUMNI VIEWSET
# =========================
class AlumniViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = User.objects.filter(role='alumni')
    permission_classes = [IsAuthenticated]

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return UserSerializer
        return AlumniCardSerializer


# =========================
# MENTORSHIP TYPE VIEWSET
# =========================
class MentorshipTypeViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = MentorshipType.objects.all()
    serializer_class = MentorshipTypeSerializer
    permission_classes = [IsAuthenticated]


# =========================
# MENTORSHIP REQUEST VIEWSET
# =========================
class MentorshipRequestViewSet(viewsets.ModelViewSet):
    serializer_class = MentorshipRequestSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'student':
            return MentorshipRequest.objects.filter(student=user).order_by('-requested_at')
        elif user.role == 'alumni':
            return MentorshipRequest.objects.filter(alumni=user).order_by('-requested_at')
        return MentorshipRequest.objects.none()

    def perform_create(self, serializer):
        serializer.save(student=self.request.user)

    @action(detail=True, methods=['post'])
    def accept(self, request, pk=None):
        mentorship_request = self.get_object()
        if request.user != mentorship_request.alumni:
            return Response({'error': 'Not authorized'}, status=status.HTTP_403_FORBIDDEN)
        
        mentorship_request.status = 'accepted'
        mentorship_request.save()
        return Response({'status': 'accepted'})

    @action(detail=True, methods=['post'])
    def reject(self, request, pk=None):
        mentorship_request = self.get_object()
        if request.user != mentorship_request.alumni:
            return Response({'error': 'Not authorized'}, status=status.HTTP_403_FORBIDDEN)
        
        mentorship_request.status = 'rejected'
        mentorship_request.save()
        return Response({'status': 'rejected'})

    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        mentorship_request = self.get_object()
        if request.user != mentorship_request.student:
            return Response({'error': 'Not authorized'}, status=status.HTTP_403_FORBIDDEN)
        
        mentorship_request.status = 'cancelled'
        mentorship_request.save()
        return Response({'status': 'cancelled'})


# =========================
# ALUMNI DASHBOARD STATS API
# =========================
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def alumni_dashboard_stats(request):
    """
    Returns dashboard statistics for alumni:
    - Total mentees (accepted requests)
    - Hours mentored (from completed activities)
    - Average rating (placeholder for now)
    - Success rate
    """
    if request.user.role != 'alumni':
        return Response({'error': 'Only alumni can access this endpoint'}, status=status.HTTP_403_FORBIDDEN)
    
    user = request.user
    
    # Total accepted mentorship requests (unique students)
    accepted_requests = MentorshipRequest.objects.filter(
        alumni=user, 
        status='accepted'
    )
    total_mentees = accepted_requests.values('student').distinct().count()
    
    # Hours mentored - sum from completed activities
    # Assuming each completed activity is 1 hour for now
    completed_activities = MentorshipActivity.objects.filter(
        mentorship_request__alumni=user,
        status='completed'
    ).count()
    hours_mentored = completed_activities  # Can be enhanced later with actual duration field
    
    # Average rating - placeholder (4.9) until rating system is implemented
    avg_rating = 4.9
    
    # Success rate - percentage of accepted vs total requests
    total_requests = MentorshipRequest.objects.filter(alumni=user).exclude(status='cancelled').count()
    success_rate = round((accepted_requests.count() / total_requests * 100), 0) if total_requests > 0 else 0
    
    return Response({
        'total_mentees': total_mentees,
        'hours_mentored': hours_mentored,
        'avg_rating': avg_rating,
        'success_rate': f"{int(success_rate)}%"
    })


from rest_framework.parsers import JSONParser, MultiPartParser, FormParser


# =========================
# MENTORSHIP ACTIVITY VIEWSET
# =========================
class MentorshipActivityViewSet(viewsets.ModelViewSet):
    serializer_class = MentorshipActivitySerializer
    permission_classes = [IsAuthenticated]
    parser_classes = (JSONParser, MultiPartParser, FormParser)

    def get_queryset(self):
        user = self.request.user
        request_id = self.request.query_params.get('request_id')
        status_filter = self.request.query_params.get('status')
        
        # Base queryset: user must be student or alumni of the request
        queryset = MentorshipActivity.objects.filter(
            Q(mentorship_request__student=user) | Q(mentorship_request__alumni=user)
        )
        
        if request_id:
            queryset = queryset.filter(mentorship_request_id=request_id)
            
        if status_filter:
            queryset = queryset.filter(status=status_filter)
            
        return queryset.order_by('-created_at')

    def perform_create(self, serializer):
        # We might want to add some validation here, e.g., only alumni can create certain types
        # or just ensure the user is part of the request.
        mentorship_request = serializer.validated_data.get('mentorship_request')
        if mentorship_request.student != self.request.user and mentorship_request.alumni != self.request.user:
             raise serializer.ValidationError("You are not part of this mentorship request.")
 # ---------------------------------------------------------------------------------------------------
        activity = serializer.save()

        # Send email notification if a meeting is scheduled
        if activity.status == 'scheduled':
            try:
                subject = f"New Mentorship Session Scheduled: {activity.title}"
                message = f"""
Hello {mentorship_request.student.first_name},

Your mentor, {mentorship_request.alumni.first_name} {mentorship_request.alumni.last_name}, has scheduled a new mentorship session for you.

Details:
- Title: {activity.title}
- Date/Time: {activity.date}
- Meeting Link: {activity.meeting_link}

Message from your mentor:
{activity.description}

Please make sure to attend the session on time.

Best regards,
GradNexus Team
"""
                send_mail(
                    subject,
                    message,
                    settings.DEFAULT_FROM_EMAIL,
                    [mentorship_request.student.email],
                    fail_silently=False,
                )
                print(f"Email sent to {mentorship_request.student.email}")
            except Exception as e:
                print(f"Failed to send email: {e}")



# =========================
# JOB & REFERRAL VIEWSETS
# =========================

class JobViewSet(viewsets.ModelViewSet):
    queryset = Job.objects.all().order_by('-posted_at')
    serializer_class = JobSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        if self.request.user.role != 'alumni':
            raise serializer.ValidationError("Only alumni can post jobs.")
        serializer.save(posted_by=self.request.user)

    def get_queryset(self):
        queryset = Job.objects.all().order_by('-posted_at')
        my_jobs = self.request.query_params.get('my_jobs')
        if my_jobs == 'true':
            queryset = queryset.filter(posted_by=self.request.user)
        return queryset


class ReferralRequestViewSet(viewsets.ModelViewSet):
    serializer_class = ReferralRequestSerializer
    permission_classes = [IsAuthenticated]
    parser_classes = (MultiPartParser, FormParser, JSONParser)

    def get_queryset(self):
        user = self.request.user
        if user.role == 'student':
            return ReferralRequest.objects.filter(student=user).order_by('-requested_at')
        elif user.role == 'alumni':
            # See referrals for jobs they posted
            return ReferralRequest.objects.filter(job__posted_by=user).order_by('-requested_at')
        return ReferralRequest.objects.none()

    def perform_create(self, serializer):
        if self.request.user.role != 'student':
            raise serializer.ValidationError("Only students can request referrals.")
        serializer.save(student=self.request.user)


