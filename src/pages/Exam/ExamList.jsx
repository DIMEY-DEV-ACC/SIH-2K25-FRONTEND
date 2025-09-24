import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Download, Edit, Trash2, Eye, Calendar } from 'lucide-react'
import { useAppContext } from '../../context/AppContext'
import { examService } from '../../services/soapClient'
import Table from '../../components/ui/Table'
import Button from '../../components/ui/Button'
import SearchBar from '../../components/ui/SearchBar'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import ErrorAlert from '../../components/ui/ErrorAlert'
import Modal from '../../components/ui/Modal'
import Pagination from '../../components/ui/Pagination'
import { formatDate, formatDateTime } from '../../utils/formatters'

const ExamList = () => {
  const { state, dispatch } = useAppContext()
  const { exams, courses, loading, error } = state
  const [searchTerm, setSearchTerm] = useState('')
  const [courseFilter, setCourseFilter] = useState('')
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, exam: null })
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  useEffect(() => {
    loadExams()
    loadCourses()
  }, [])

  const loadExams = async () => {
    dispatch({ type: 'SET_LOADING', payload: true })
    try {
      const data = await examService.list()
      dispatch({ type: 'SET_EXAMS', payload: data })
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message })
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false })
    }
  }

  const loadCourses = async () => {
    try {
      const { courseService } = await import('../../services/soapClient')
      const data = await courseService.list()
      dispatch({ type: 'SET_COURSES', payload: data })
    } catch (error) {
      console.error('Failed to load courses:', error)
    }
  }

  const handleDelete = async (examId) => {
    try {
      await examService.remove(examId)
      dispatch({ type: 'REMOVE_EXAM', payload: examId })
      dispatch({ 
        type: 'ADD_NOTIFICATION', 
        payload: { type: 'success', message: 'Exam deleted successfully' }
      })
      setDeleteModal({ isOpen: false, exam: null })
    } catch (error) {
      dispatch({ 
        type: 'ADD_NOTIFICATION', 
        payload: { type: 'error', message: 'Failed to delete exam' }
      })
    }
  }

  const getCourseName = (courseId) => {
    const course = courses.find(c => c.course_id === courseId)
    return course ? course.course_name : 'Unknown Course'
  }

  const getExamStatus = (examDate) => {
    const now = new Date()
    const exam = new Date(examDate)
    
    if (exam > now) {
      return { status: 'Upcoming', color: 'bg-blue-100 text-blue-800' }
    } else if (exam.toDateString() === now.toDateString()) {
      return { status: 'Today', color: 'bg-yellow-100 text-yellow-800' }
    } else {
      return { status: 'Completed', color: 'bg-green-100 text-green-800' }
    }
  }

  // Filter and search logic
  const filteredExams = exams.filter(exam => {
    const courseName = getCourseName(exam.course_id).toLowerCase()
    const matchesSearch = courseName.includes(searchTerm.toLowerCase()) ||
                         exam.exam_id?.toString().includes(searchTerm.toLowerCase()) ||
                         exam.max_marks?.toString().includes(searchTerm.toLowerCase())
    const matchesCourse = !courseFilter || exam.course_id?.toString() === courseFilter
    return matchesSearch && matchesCourse
  })

  // Pagination logic
  const totalItems = filteredExams.length
  const totalPages = Math.ceil(totalItems / pageSize)
  const startIndex = (currentPage - 1) * pageSize
  const paginatedExams = filteredExams.slice(startIndex, startIndex + pageSize)

  const columns = [
    {
      key: 'exam_id',
      label: 'EXAM ID',
      sortable: true,
      render: (exam) => (
        <span className="font-medium text-gray-900">#{exam.exam_id}</span>
      )
    },
    {
      key: 'course_id',
      label: 'COURSE',
      sortable: true,
      render: (exam) => (
        <div>
          <div className="font-medium text-gray-900">{getCourseName(exam.course_id)}</div>
          <div className="text-sm text-gray-500">Course ID: {exam.course_id}</div>
        </div>
      )
    },
    {
      key: 'exam_date',
      label: 'EXAM DATE',
      sortable: true,
      render: (exam) => (
        <div>
          <div className="font-medium text-gray-900">{formatDate(exam.exam_date)}</div>
          <div className="text-sm text-gray-500">{formatDateTime(exam.exam_date)}</div>
        </div>
      )
    },
    {
      key: 'max_marks',
      label: 'MAX MARKS',
      sortable: true,
      render: (exam) => (
        <span className="font-medium text-gray-900">{exam.max_marks}</span>
      )
    },
    {
      key: 'status',
      label: 'STATUS',
      sortable: true,
      render: (exam) => {
        const { status, color } = getExamStatus(exam.exam_date)
        return (
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${color}`}>
            {status}
          </span>
        )
      }
    },
    {
      key: 'actions',
      label: 'ACTIONS',
      render: (exam) => (
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {/* View details */}}
            className="text-blue-600 hover:text-blue-700"
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Link to={`/exams/${exam.exam_id}/edit`}>
            <Button
              variant="ghost"
              size="sm"
              className="text-gray-600 hover:text-gray-700"
            >
              <Edit className="h-4 w-4" />
            </Button>
          </Link>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setDeleteModal({ isOpen: true, exam })}
            className="text-red-600 hover:text-red-700"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      )
    }
  ]

  if (loading) return <LoadingSpinner />

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="md:flex md:items-center md:justify-between">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
            Exam Management
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Manage exams, schedules, and assessment details
          </p>
        </div>
        <div className="mt-4 flex md:mt-0 md:ml-4 space-x-3">
          <Button variant="secondary" className="flex items-center">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="secondary" className="flex items-center">
            <Calendar className="h-4 w-4 mr-2" />
            Schedule View
          </Button>
          <Link to="/exams/new">
            <Button className="flex items-center">
              <Plus className="h-4 w-4 mr-2" />
              Add Exam
            </Button>
          </Link>
        </div>
      </div>

      {/* Error Alert */}
      {error && <ErrorAlert message={error} />}

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2">
          <SearchBar
            placeholder="Search by course name, exam ID, or marks..."
            value={searchTerm}
            onChange={setSearchTerm}
          />
        </div>
        <div>
          <select
            value={courseFilter}
            onChange={(e) => setCourseFilter(e.target.value)}
            className="input w-full"
          >
            <option value="">All Courses</option>
            {courses.map(course => (
              <option key={course.course_id} value={course.course_id}>
                {course.course_name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="card">
        <Table
          columns={columns}
          data={paginatedExams}
          emptyMessage="No exams found"
        />
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          pageSize={pageSize}
          totalItems={totalItems}
          onPageChange={setCurrentPage}
          onPageSizeChange={setPageSize}
        />
      )}

      {/* Delete Modal */}
      <Modal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, exam: null })}
        title="Delete Exam"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Are you sure you want to delete this exam? This action cannot be undone.
          </p>
          {deleteModal.exam && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <p><strong>Course:</strong> {getCourseName(deleteModal.exam.course_id)}</p>
              <p><strong>Date:</strong> {formatDate(deleteModal.exam.exam_date)}</p>
              <p><strong>Max Marks:</strong> {deleteModal.exam.max_marks}</p>
            </div>
          )}
          <div className="flex justify-end space-x-3">
            <Button
              variant="secondary"
              onClick={() => setDeleteModal({ isOpen: false, exam: null })}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={() => handleDelete(deleteModal.exam.exam_id)}
            >
              Delete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default ExamList