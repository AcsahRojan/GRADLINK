import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { CssBaseline } from '@mui/material'
import ProtectedRoute from './components/ProtectedRoute'
import Home from './components/Home'
import Login from './components/Login'
import Register from './components/Register'

import StudentHome from './components/StudentHome'
import FindAlumni from './components/FindAlumni'
import Events from './components/Events'
import MentorshipRequests from './components/MentorshipRequest'
import MyMentors from './components/MyMentors'
import MembershipActivities from './components/MentorshipActivities'
import AlumniProfile from './components/AlumniProfile'
import SProfile from './components/SProfile'

import AProfile from './components/AProfile'
import AlumniHome from './components/AlumniHome'
import MyMentees from './components/MyMentees'
import MenteeActivities from './components/MenteeActivities'
import MenteeRequests from './components/MenteeRequests'
import JobBoard from './components/JobBoard'
import AlumniJobs from './components/AlumniJobs'

const App = () => {
  return (
    <>
      <CssBaseline />
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/login' element={<Login />} />
        <Route path='/register' element={<Register />} />
        <Route path='/events' element={<Events />} />
        {/* STUDENT PAGES */}
        <Route path="/studenthome" element={<ProtectedRoute allowedRole="student"><StudentHome /></ProtectedRoute>} />
        <Route path='/sprofile' element={<ProtectedRoute allowedRole="student"><SProfile /></ProtectedRoute>} />
        <Route path='/findalumni' element={<ProtectedRoute allowedRole="student"><FindAlumni /></ProtectedRoute>} />
        <Route path='/mentorshiprequests' element={<ProtectedRoute allowedRole="student"><MentorshipRequests /></ProtectedRoute>} />
        <Route path='/mymentors' element={<ProtectedRoute allowedRole="student"><MyMentors /></ProtectedRoute>} />
        <Route path='/mentorshipactivities/:id' element={<ProtectedRoute allowedRole="student"><MembershipActivities /></ProtectedRoute>} />
        <Route path='/alumniprofile/:id' element={<ProtectedRoute allowedRole="student"><AlumniProfile /></ProtectedRoute>} />
        <Route path='/jobs' element={<ProtectedRoute allowedRole="student"><JobBoard /></ProtectedRoute>} />

        {/* ALUMNI PAGES */}
        <Route path='/alumnihome' element={<ProtectedRoute allowedRole="alumni"><AlumniHome /></ProtectedRoute>} />
        <Route path='/aprofile' element={<ProtectedRoute allowedRole="alumni"><AProfile /></ProtectedRoute>} />
        <Route path='/mymentees' element={<ProtectedRoute allowedRole="alumni"><MyMentees /></ProtectedRoute>} />
        <Route path='/menteeactivities/:id' element={<ProtectedRoute allowedRole="alumni"><MenteeActivities /></ProtectedRoute>} />
        <Route path='/menteerequests' element={<ProtectedRoute allowedRole="alumni"><MenteeRequests /></ProtectedRoute>} />     
        <Route path='/alumnijobs' element={<ProtectedRoute allowedRole="alumni"><AlumniJobs /></ProtectedRoute>} />
      </Routes>
    </>
  )
}

export default App
