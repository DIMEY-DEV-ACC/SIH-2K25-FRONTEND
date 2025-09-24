import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  BookOpen,
  Building,
  CreditCard,
  FileText,
  Home,
  Library,
  Award,
  TrendingUp,
  Calendar,
  AlertCircle
} from 'lucide-react';
import DashboardCard from '../../components/ui/DashboardCard';
import StatsCard from '../../components/ui/StatsCard';
import Button from '../../components/ui/Button';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { useFetch } from '../../hooks/useFetch';
import { formatters } from '../../utils/formatters';

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState({
    totalStudents: 0,
    totalCourses: 0,
    totalDepartments: 0,
    pendingFees: 0,
    upcomingExams: 0,
    totalHostels: 0,
    totalBooks: 0,
    recentResults: 0
  });

  // Fetch data for dashboard stats
  const { data: students, loading: studentsLoading } = useFetch('student');
  const { data: courses, loading: coursesLoading } = useFetch('course');
  const { data: departments, loading: departmentsLoading } = useFetch('department');
  const { data: fees, loading: feesLoading } = useFetch('fees');
  const { data: exams, loading: examsLoading } = useFetch('exam');
  const { data: hostels, loading: hostelsLoading } = useFetch('hostel');
  const { data: library, loading: libraryLoading } = useFetch('library');
  const { data: results, loading: resultsLoading } = useFetch('result');

  const isLoading = studentsLoading || coursesLoading || departmentsLoading || 
                   feesLoading || examsLoading || hostelsLoading || 
                   libraryLoading || resultsLoading;

  useEffect(() => {
    // Calculate dashboard statistics
    const calculateStats = () => {
      const today = new Date();
      const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);

      setDashboardData({
        totalStudents: students?.length || 0,
        totalCourses: courses?.length || 0,
        totalDepartments: departments?.length || 0,
        pendingFees: fees?.filter(fee => fee.status === 'Pending')?.length || 0,
        upcomingExams: exams?.filter(exam => {
          const examDate = new Date(exam.exam_date);
          return examDate >= today && examDate <= nextWeek;
        })?.length || 0,
        totalHostels: hostels?.length || 0,
        totalBooks: library?.reduce((sum, book) => sum + (book.available_copies || 0), 0) || 0,
        recentResults: results?.filter(result => {
          const resultDate = new Date(result.created_date);
          const lastMonth = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
          return resultDate >= lastMonth;
        })?.length || 0
      });
    };

    if (!isLoading) {
      calculateStats();
    }
  }, [students, courses, departments, fees, exams, hostels, library, results, isLoading]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" text="Loading dashboard..." />
      </div>
    );
  }

  const quickActions = [
    { label: 'Add Student', href: '/students/new', color: 'primary' },
    { label: 'Create Course', href: '/courses/new', color: 'success' },
    { label: 'Add Department', href: '/departments/new', color: 'warning' },
    { label: 'Manage Users', href: '/users', color: 'info' }
  ];

  const recentActivities = [
    { action: 'New student enrolled', time: '2 hours ago', type: 'success' },
    { action: 'Fee payment received', time: '4 hours ago', type: 'info' },
    { action: 'Exam scheduled', time: '6 hours ago', type: 'warning' },
    { action: 'Book issued', time: '8 hours ago', type: 'info' }
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="md:flex md:items-center md:justify-between">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
            Dashboard
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Welcome back! Here's what's happening in your ERP system.
          </p>
        </div>
        <div className="mt-4 flex md:mt-0 md:ml-4">
          <Button variant="primary">
            <Calendar className="h-4 w-4 mr-2" />
            View Calendar
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <DashboardCard
          title="Total Students"
          value={formatters.formatNumber(dashboardData.totalStudents)}
          icon={Users}
          color="blue"
          onClick={() => window.location.href = '/students'}
        />
        <DashboardCard
          title="Active Courses"
          value={formatters.formatNumber(dashboardData.totalCourses)}
          icon={BookOpen}
          color="green"
          onClick={() => window.location.href = '/courses'}
        />
        <DashboardCard
          title="Departments"
          value={formatters.formatNumber(dashboardData.totalDepartments)}
          icon={Building}
          color="purple"
          onClick={() => window.location.href = '/departments'}
        />
        <DashboardCard
          title="Pending Fees"
          value={formatters.formatNumber(dashboardData.pendingFees)}
          icon={CreditCard}
          color="red"
          onClick={() => window.location.href = '/fees'}
        />
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Upcoming Exams"
          value={dashboardData.upcomingExams}
          subtitle="Next 7 days"
          icon={FileText}
          color="warning"
        />
        <StatsCard
          title="Total Hostels"
          value={dashboardData.totalHostels}
          subtitle="Accommodation"
          icon={Home}
          color="info"
        />
        <StatsCard
          title="Library Books"
          value={formatters.formatNumber(dashboardData.totalBooks)}
          subtitle="Available copies"
          icon={Library}
          color="success"
        />
        <StatsCard
          title="Recent Results"
          value={dashboardData.recentResults}
          subtitle="Last 30 days"
          icon={Award}
          color="primary"
        />
      </div>

      {/* Quick Actions and Recent Activity */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Quick Actions */}
        <div className="card p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-3">
            {quickActions.map((action, index) => (
              <Link key={index} to={action.href}>
                <Button
                  variant="outline"
                  className="w-full justify-center"
                >
                  {action.label}
                </Button>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="card p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h3>
          <div className="space-y-3">
            {recentActivities.map((activity, index) => (
              <div key={index} className="flex items-center space-x-3">
                <div className={`flex-shrink-0 w-2 h-2 rounded-full ${
                  activity.type === 'success' ? 'bg-green-400' :
                  activity.type === 'warning' ? 'bg-yellow-400' :
                  'bg-blue-400'
                }`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900">{activity.action}</p>
                  <p className="text-xs text-gray-500">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4">
            <Link to="/activity" className="text-sm text-primary-600 hover:text-primary-500">
              View all activity →
            </Link>
          </div>
        </div>
      </div>

      {/* Alerts and Notifications */}
      <div className="card p-6">
        <div className="flex items-center mb-4">
          <AlertCircle className="h-5 w-5 text-yellow-400 mr-2" />
          <h3 className="text-lg font-medium text-gray-900">System Alerts</h3>
        </div>
        <div className="space-y-3">
          {dashboardData.pendingFees > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
              <p className="text-sm text-yellow-800">
                <strong>{dashboardData.pendingFees}</strong> students have pending fee payments.
                <Link to="/fees" className="ml-2 text-yellow-600 hover:text-yellow-500 underline">
                  Review fees →
                </Link>
              </p>
            </div>
          )}
          {dashboardData.upcomingExams > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
              <p className="text-sm text-blue-800">
                <strong>{dashboardData.upcomingExams}</strong> exams are scheduled for the next 7 days.
                <Link to="/exams" className="ml-2 text-blue-600 hover:text-blue-500 underline">
                  View schedule →
                </Link>
              </p>
            </div>
          )}
          {dashboardData.pendingFees === 0 && dashboardData.upcomingExams === 0 && (
            <p className="text-sm text-gray-500">No alerts at this time.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;