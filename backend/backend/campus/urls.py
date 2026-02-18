from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    signup, login_view, update_profile, logout_view, 
    EventViewSet, AlumniViewSet, MentorshipTypeViewSet,
    MentorshipRequestViewSet, MentorshipActivityViewSet,
    JobViewSet, ReferralRequestViewSet, alumni_dashboard_stats
)

router = DefaultRouter()
router.register(r'events', EventViewSet)
router.register(r'alumni', AlumniViewSet)
router.register(r'mentorship-types', MentorshipTypeViewSet, basename='mentorship-types')
router.register(r'mentorship-requests', MentorshipRequestViewSet, basename='mentorship-requests')
router.register(r'mentorship-activities', MentorshipActivityViewSet, basename='mentorship-activities')
router.register(r'jobs', JobViewSet, basename='job')
router.register(r'referrals', ReferralRequestViewSet, basename='referral')

urlpatterns = [
    path('signup/', signup),  
    path('login/', login_view),
    path('profile/update/', update_profile),
    path('logout/', logout_view),
    path('alumni/dashboard-stats/', alumni_dashboard_stats),
    path('', include(router.urls)),       
]
