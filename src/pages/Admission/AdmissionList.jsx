import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Download, Edit, Trash2, Eye } from 'lucide-react'
import { useAppContext } from '../../context/AppContext'
import { admissionService } from '../../services/soapClient'
import Table from '../../components/ui/Table'
import Button from '../../components/ui/Button'
import SearchBar from '../../components/ui/SearchBar'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import ErrorAlert from '../../components/ui/ErrorAlert'
import Modal from '../../components/ui/Modal'
import Pagination from '../../components/ui/Pagination'
import { formatDate } from '../../utils/formatters'
import { STATUS_OPTIONS } from '../../utils/constants'

const AdmissionList = () => {
  const { state, dispatch } = useAppContext()
  const { admissions, students, loading, error } = state
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, admission: null })
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  useEffect(() => {
    loadAdmissions()
    loadStudents()
  }, [])

  const loadAdmissions = async () => {
    dispatch({ type: 'SET_LOADING', payload: true })
    try {
      const data = await admissionService.list()
      dispatch({ type: 'SET_ADMISSIONS', payload: data })
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message })
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false })
    }
  }

  const loadStudents = async () => {
    try {
      const { studentService } = await import('../../services/soapClient')
      const data = await studentService.list()
      dispatch({ type: 'SET_STUDENTS', payload: data })
    } catch (error) {
      console.error('Failed to load students:', error)
    }
  }

  const handleDelete = async (admissionId) => {
    try {
      await admissionService.remove(admissionId)
      dispatch({ type: 'REMOVE_ADMISSION', payload: admissionId })
      dispatch({ 
        type: 'ADD_NOTIFICATION', 
        payload: { type: 'success', message: 'Admission record deleted successfully' }
      })
      setDeleteModal({ isOpen: false, admission: null })
    } catch (error) {
      dispatch({ 
        type: 'ADD_NOTIFICATION', 
        payload: { type: 'error', message: 'Failed to delete admission record' }
      })
    }
  }

  const getStudentName = (studentId) => {
    const student = students.find(s => s.student_id === studentId)
    return student ? `${student.first_name} ${student.last_name}` : 'Unknown Student'
  }

  const getStatusBadge = (status) => {
    const statusColors = {
      'Applied': 'bg-blue-100 text-blue-800',
      'Approved': 'bg-green-100 text-green-800',
      'Rejected': 'bg-red-100 text-red-800',
      'Enrolled': 'bg-purple-100 text-purple-800'
    }
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[status] || 'bg-gray-100 text-gray-800'}`}>
        {status}
      </span>
    )
  }

  // Filter and search logic
  const filteredAdmissions = admissions.filter(admission => {
    const studentName = getStudentName(admission.student_id).toLowerCase()
    const matchesSearch = studentName.includes(searchTerm.toLowerCase()) ||
                         admission.admission_id?.toString().includes(searchTerm.toLowerCase())
    const matchesStatus = !statusFilter || admission.status === statusFilter
    return matchesSearch && matchesStatus
  })

  // Pagination logic
  const totalItems = filteredAdmissions.length
  const totalPages = Math.ceil(totalItems / pageSize)
  const startIndex = (currentPage - 1) * pageSize
  const paginatedAdmissions = filteredAdmissions.slice(startIndex, startIndex + pageSize)

  const columns = [
    {
      key: 'admission_id',
      label: 'ADMISSION ID',
      sortable: true,
      render: (admission) => (
        <span className="font-medium text-gray-900">#{admission.admission_id}</span>
      )
    },
    {
      key: 'student_id',
      label: 'STUDENT',
      sortable: true,
      render: (admission) => (
        <div>
          <div className="font-medium text-gray-900">{getStudentName(admission.student_id)}</div>
          <div className="text-sm text-gray-500">ID: {admission.student_id}</div>
        </div>
      )
    },
    {
      key: 'admission_date',
      label: 'ADMISSION DATE',
      sortable: true,
      render: (admission) => (
        <span className="text-gray-900">{formatDate(admission.admission_date)}</span>
      )
    },
    {
      key: 'status',
      label: 'STATUS',
      sortable: true,
      render: (admission) => getStatusBadge(admission.status)
    },
    {
      key: 'actions',
      label: 'ACTIONS',
      render: (admission) => (
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {/* View details */}}
            className="text-blue-600 hover:text-blue-700"
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Link to={`/admissions/${admission.admission_id}/edit`}>
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
            onClick={() => setDeleteModal({ isOpen: true, admission })}
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
            Admission Management
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Manage student admissions and application status
          </p>
        </div>
        <div className="mt-4 flex md:mt-0 md:ml-4 space-x-3">
          <Button variant="secondary" className="flex items-center">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Link to="/admissions/new">
            <Button className="flex items-center">
              <Plus className="h-4 w-4 mr-2" />
              Add Admission
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
            placeholder="Search by student name or admission ID..."
            value={searchTerm}
            onChange={setSearchTerm}
          />
        </div>
        <div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="input w-full"
          >
            <option value="">All Status</option>
            {STATUS_OPTIONS.ADMISSION.map(status => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="card">
        <Table
          columns={columns}
          data={paginatedAdmissions}
          emptyMessage="No admission records found"
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
        onClose={() => setDeleteModal({ isOpen: false, admission: null })}
        title="Delete Admission Record"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Are you sure you want to delete this admission record? This action cannot be undone.
          </p>
          {deleteModal.admission && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <p><strong>Student:</strong> {getStudentName(deleteModal.admission.student_id)}</p>
              <p><strong>Date:</strong> {formatDate(deleteModal.admission.admission_date)}</p>
              <p><strong>Status:</strong> {deleteModal.admission.status}</p>
            </div>
          )}
          <div className="flex justify-end space-x-3">
            <Button
              variant="secondary"
              onClick={() => setDeleteModal({ isOpen: false, admission: null })}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={() => handleDelete(deleteModal.admission.admission_id)}
            >
              Delete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default AdmissionList