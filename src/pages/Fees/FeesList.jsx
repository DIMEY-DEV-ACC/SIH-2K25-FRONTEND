import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Download, Edit, Trash2, Eye } from 'lucide-react'
import { useAppContext } from '../../context/AppContext'
import { feesService } from '../../services/soapClient'
import Table from '../../components/ui/Table'
import Button from '../../components/ui/Button'
import SearchBar from '../../components/ui/SearchBar'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import ErrorAlert from '../../components/ui/ErrorAlert'
import Modal from '../../components/ui/Modal'
import Pagination from '../../components/ui/Pagination'
import { formatCurrency, formatDate } from '../../utils/formatters'
import { STATUS_OPTIONS } from '../../utils/constants'

const FeesList = () => {
  const { state, dispatch } = useAppContext()
  const { fees, students, loading, error } = state
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, fees: null })
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  useEffect(() => {
    loadFees()
    loadStudents()
  }, [])

  const loadFees = async () => {
    dispatch({ type: 'SET_LOADING', payload: true })
    try {
      const data = await feesService.list()
      dispatch({ type: 'SET_FEES', payload: data })
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

  const handleDelete = async (feesId) => {
    try {
      await feesService.remove(feesId)
      dispatch({ type: 'REMOVE_FEES', payload: feesId })
      dispatch({ 
        type: 'ADD_NOTIFICATION', 
        payload: { type: 'success', message: 'Fees record deleted successfully' }
      })
      setDeleteModal({ isOpen: false, fees: null })
    } catch (error) {
      dispatch({ 
        type: 'ADD_NOTIFICATION', 
        payload: { type: 'error', message: 'Failed to delete fees record' }
      })
    }
  }

  const getStudentName = (studentId) => {
    const student = students.find(s => s.student_id === studentId)
    return student ? `${student.first_name} ${student.last_name}` : 'Unknown Student'
  }

  const getStatusBadge = (status) => {
    const statusColors = {
      'Paid': 'bg-green-100 text-green-800',
      'Pending': 'bg-yellow-100 text-yellow-800',
      'Overdue': 'bg-red-100 text-red-800'
    }
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[status] || 'bg-gray-100 text-gray-800'}`}>
        {status}
      </span>
    )
  }

  // Filter and search logic
  const filteredFees = fees.filter(fee => {
    const studentName = getStudentName(fee.student_id).toLowerCase()
    const matchesSearch = studentName.includes(searchTerm.toLowerCase()) ||
                         fee.fees_id?.toString().includes(searchTerm.toLowerCase()) ||
                         fee.amount?.toString().includes(searchTerm.toLowerCase())
    const matchesStatus = !statusFilter || fee.status === statusFilter
    return matchesSearch && matchesStatus
  })

  // Pagination logic
  const totalItems = filteredFees.length
  const totalPages = Math.ceil(totalItems / pageSize)
  const startIndex = (currentPage - 1) * pageSize
  const paginatedFees = filteredFees.slice(startIndex, startIndex + pageSize)

  const columns = [
    {
      key: 'fees_id',
      label: 'FEES ID',
      sortable: true,
      render: (fees) => (
        <span className="font-medium text-gray-900">#{fees.fees_id}</span>
      )
    },
    {
      key: 'student_id',
      label: 'STUDENT',
      sortable: true,
      render: (fees) => (
        <div>
          <div className="font-medium text-gray-900">{getStudentName(fees.student_id)}</div>
          <div className="text-sm text-gray-500">ID: {fees.student_id}</div>
        </div>
      )
    },
    {
      key: 'amount',
      label: 'AMOUNT',
      sortable: true,
      render: (fees) => (
        <span className="font-medium text-gray-900">{formatCurrency(fees.amount)}</span>
      )
    },
    {
      key: 'status',
      label: 'STATUS',
      sortable: true,
      render: (fees) => getStatusBadge(fees.status)
    },
    {
      key: 'due_date',
      label: 'DUE DATE',
      sortable: true,
      render: (fees) => (
        <span className="text-gray-900">{formatDate(fees.due_date)}</span>
      )
    },
    {
      key: 'actions',
      label: 'ACTIONS',
      render: (fees) => (
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {/* View details */}}
            className="text-blue-600 hover:text-blue-700"
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Link to={`/fees/${fees.fees_id}/edit`}>
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
            onClick={() => setDeleteModal({ isOpen: true, fees })}
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
            Fees Management
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Manage student fees, payments, and billing records
          </p>
        </div>
        <div className="mt-4 flex md:mt-0 md:ml-4 space-x-3">
          <Button variant="secondary" className="flex items-center">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Link to="/fees/new">
            <Button className="flex items-center">
              <Plus className="h-4 w-4 mr-2" />
              Add Fees Record
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
            placeholder="Search by student name, fees ID, or amount..."
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
            {STATUS_OPTIONS.FEES.map(status => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="card">
        <Table
          columns={columns}
          data={paginatedFees}
          emptyMessage="No fees records found"
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
        onClose={() => setDeleteModal({ isOpen: false, fees: null })}
        title="Delete Fees Record"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Are you sure you want to delete this fees record? This action cannot be undone.
          </p>
          {deleteModal.fees && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <p><strong>Student:</strong> {getStudentName(deleteModal.fees.student_id)}</p>
              <p><strong>Amount:</strong> {formatCurrency(deleteModal.fees.amount)}</p>
              <p><strong>Status:</strong> {deleteModal.fees.status}</p>
            </div>
          )}
          <div className="flex justify-end space-x-3">
            <Button
              variant="secondary"
              onClick={() => setDeleteModal({ isOpen: false, fees: null })}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={() => handleDelete(deleteModal.fees.fees_id)}
            >
              Delete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default FeesList