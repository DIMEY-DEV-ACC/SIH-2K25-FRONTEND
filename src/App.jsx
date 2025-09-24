import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/layout/Layout'
import Dashboard from './pages/Dashboard/Dashboard'
import StudentList from './pages/Student/StudentList'
import StudentForm from './pages/Student/StudentForm'
import CourseList from './pages/Course/CourseList'
import CourseForm from './pages/Course/CourseForm'
import DepartmentList from './pages/Department/DepartmentList'
import DepartmentForm from './pages/Department/DepartmentForm'
import UserList from './pages/User/UserList'
import UserForm from './pages/User/UserForm'
import FeesList from './pages/Fees/FeesList'
import FeesForm from './pages/Fees/FeesForm'
import ExamList from './pages/Exam/ExamList'
import ExamForm from './pages/Exam/ExamForm'
import GuardianList from './pages/Guardian/GuardianList'
import GuardianForm from './pages/Guardian/GuardianForm'
import AdmissionList from './pages/Admission/AdmissionList'
import AdmissionForm from './pages/Admission/AdmissionForm'
import HostelList from './pages/Hostel/HostelList'
import HostelForm from './pages/Hostel/HostelForm'
import LibraryList from './pages/Library/LibraryList'
import { AppProvider } from './context/AppContext'

// Placeholder component for entities still being implemented
const PlaceholderList = ({ title }) => (
  <div className="space-y-6">
    <div className="md:flex md:items-center md:justify-between">
      <div className="flex-1 min-w-0">
        <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
          {title}
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          This page is under development. Full implementation coming soon.
        </p>
      </div>
    </div>
    <div className="card p-12 text-center">
      <h3 className="text-lg font-medium text-gray-900 mb-2">{title} Management</h3>
      <p className="text-gray-500">
        This module will provide full CRUD operations for {title.toLowerCase()}.
      </p>
    </div>
  </div>
)

function App() {
  return (
    <AppProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            
            {/* Student Routes */}
            <Route path="/students" element={<StudentList />} />
            <Route path="/students/new" element={<StudentForm />} />
            <Route path="/students/:id/edit" element={<StudentForm />} />
            
            {/* Course Routes */}
            <Route path="/courses" element={<CourseList />} />
            <Route path="/courses/new" element={<CourseForm />} />
            <Route path="/courses/:id/edit" element={<CourseForm />} />
            
            {/* Department Routes */}
            <Route path="/departments" element={<DepartmentList />} />
            <Route path="/departments/new" element={<DepartmentForm />} />
            <Route path="/departments/:id/edit" element={<DepartmentForm />} />
            
            {/* User Routes */}
            <Route path="/users" element={<UserList />} />
            <Route path="/users/new" element={<UserForm />} />
            <Route path="/users/:id/edit" element={<UserForm />} />
            
            {/* Fees Routes */}
            <Route path="/fees" element={<FeesList />} />
            <Route path="/fees/new" element={<FeesForm />} />
            <Route path="/fees/:id/edit" element={<FeesForm />} />
            
            {/* Exam Routes */}
            <Route path="/exams" element={<ExamList />} />
            <Route path="/exams/new" element={<ExamForm />} />
            <Route path="/exams/:id/edit" element={<ExamForm />} />
            
            {/* Guardian Routes */}
            <Route path="/guardians" element={<GuardianList />} />
            <Route path="/guardians/new" element={<GuardianForm />} />
            <Route path="/guardians/:id/edit" element={<GuardianForm />} />
            
            {/* Admission Routes */}
            <Route path="/admissions" element={<AdmissionList />} />
            <Route path="/admissions/new" element={<AdmissionForm />} />
            <Route path="/admissions/:id/edit" element={<AdmissionForm />} />
            
            {/* Hostel Routes */}
            <Route path="/hostels" element={<HostelList />} />
            <Route path="/hostels/new" element={<HostelForm />} />
            <Route path="/hostels/:id/edit" element={<HostelForm />} />
            
            {/* Library Routes */}
            <Route path="/library" element={<LibraryList />} />
            <Route path="/library/new" element={<PlaceholderList title="Add Book" />} />
            <Route path="/library/:id/edit" element={<PlaceholderList title="Edit Book" />} />
            
            {/* Placeholder Routes for Remaining Entities */}
            <Route path="/rooms" element={<PlaceholderList title="Rooms" />} />
            <Route path="/hostel-allocations" element={<PlaceholderList title="Hostel Allocations" />} />
            <Route path="/book-issues" element={<PlaceholderList title="Book Issues" />} />
            <Route path="/results" element={<PlaceholderList title="Results" />} />
            <Route path="/user-roles" element={<PlaceholderList title="User Roles" />} />
            <Route path="/contact-details" element={<PlaceholderList title="Contact Details" />} />
            
            {/* 404 Route */}
            <Route path="*" element={
              <div className="text-center py-12">
                <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
                <p className="text-gray-600 mb-8">Page not found</p>
                <a href="/dashboard" className="text-primary-600 hover:text-primary-500">
                  Return to Dashboard
                </a>
              </div>
            } />
          </Routes>
        </Layout>
      </Router>
    </AppProvider>
  )
}

export default App