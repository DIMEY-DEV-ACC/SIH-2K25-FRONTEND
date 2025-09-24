import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Download, Edit, Trash2, Eye, Phone, Mail } from 'lucide-react'
import { useAppContext } from '../../context/AppContext'
import { guardianService } from '../../services/soapClient'
import Table from '../../components/ui/Table'
import Button from '../../components/ui/Button'
import SearchBar from '../../components/ui/SearchBar'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import ErrorAlert from '../../components/ui/ErrorAlert'
import Modal from '../../components/ui/Modal'
import Pagination from '../../components/ui/Pagination'

const GuardianList = () => {
  const { state, dispatch } = useAppContext()
  const { guardians, students, loading, error } = state
  const [searchTerm, setSearchTerm] = useState('')
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, guardian: null })
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  useEffect(() => {
    loadGuardians()
    loadStudents()
  }, [])

  const loadGuardians = async () => {
    dispatch({ type: 'SET_LOADING', payload: true })
    try {
      const data = await guardianService.list()
      dispatch({ type: 'SET_GUARDIANS', payload: data })
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

  const handleDelete = async (guardianId) => {
    try {
      await guardianService.remove(guardianId)
      dispatch({ type: 'REMOVE_GUARDIAN', payload: guardianId })
      dispatch({ 
        type: 'ADD_NOTIFICATION', 
        payload: { type: 'success', message: 'Guardian deleted successfully' }
      })
      setDeleteModal({ isOpen: false, guardian: null })
    } catch (error) {
      dispatch({ 
        type: 'ADD_NOTIFICATION', 
        payload: { type: 'error', message: 'Failed to delete guardian' }
      })
    }
  }

  const getStudentName = (studentId) => {
    const student = students.find(s => s.student_id === studentId)
    return student ? `${student.first_name} ${student.last_name}` : 'Unknown Student'
  }

  // Filter and search logic
  const filteredGuardians = guardians.filter(guardian => {
    const fullName = `${guardian.first_name} ${guardian.last_name}`.toLowerCase()
    const studentName = getStudentName(guardian.student_id).toLowerCase()
    const matchesSearch = fullName.includes(searchTerm.toLowerCase()) ||
                         guardian.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         guardian.phone?.includes(searchTerm) ||
                         studentName.includes(searchTerm.toLowerCase()) ||
                         guardian.guardian_id?.toString().includes(searchTerm.toLowerCase())
    return matchesSearch
  })

  // Pagination logic
  const totalItems = filteredGuardians.length
  const totalPages = Math.ceil(totalItems / pageSize)
  const startIndex = (currentPage - 1) * pageSize
  const paginatedGuardians = filteredGuardians.slice(startIndex, startIndex + pageSize)

  const columns = [
    {
      key: 'guardian_id',
      label: 'GUARDIAN ID',
      sortable: true,
      render: (guardian) => (
        <span className="font-medium text-gray-900">#{guardian.guardian_id}</span>
      )
    },
    {
      key: 'name',
      label: 'GUARDIAN NAME',
      sortable: true,
      render: (guardian) => (
        <div>
          <div className="font-medium text-gray-900">
            {guardian.first_name} {guardian.last_name}
          </div>
          <div className="text-sm text-gray-500 flex items-center mt-1">
            <Mail className="h-3 w-3 mr-1" />
            {guardian.email}
          </div>
        </div>
      )
    },
    {
      key: 'phone',
      label: 'CONTACT',
      sortable: true,
      render: (guardian) => (
        <div className="flex items-center text-gray-900">
          <Phone className="h-4 w-4 mr-2 text-gray-400" />
          {guardian.phone}
        </div>
      )
    },
    {
      key: 'student_id',
      label: 'STUDENT',
      sortable: true,
      render: (guardian) => (
        <div>
          <div className="font-medium text-gray-900">{getStudentName(guardian.student_id)}</div>
          <div className="text-sm text-gray-500">ID: {guardian.student_id}</div>
        </div>
      )
    },
    {
      key: 'actions',
      label: 'ACTIONS',
      render: (guardian) => (
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {/* View details */}}
            className="text-blue-600 hover:text-blue-700"
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Link to={`/guardians/${guardian.guardian_id}/edit`}>
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
            onClick={() => setDeleteModal({ isOpen: true, guardian })}
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
            Guardian Management
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Manage student guardians and their contact information
          </p>
        </div>
        <div className="mt-4 flex md:mt-0 md:ml-4 space-x-3">
          <Button variant="secondary" className="flex items-center">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Link to="/guardians/new">
            <Button className="flex items-center">
              <Plus className="h-4 w-4 mr-2" />
              Add Guardian
            </Button>
          </Link>
        </div>
      </div>

      {/* Error Alert */}
      {error && <ErrorAlert message={error} />}

      {/* Search */}
      <div className="grid grid-cols-1 gap-4">
        <SearchBar
          placeholder="Search by guardian name, email, phone, or student name..."
          value={searchTerm}
          onChange={setSearchTerm}
        />
      </div>

      {/* Table */}
      <div className="card">
        <Table
          columns={columns}
          data={paginatedGuardians}
          emptyMessage="No guardians found"
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
        onClose={() => setDeleteModal({ isOpen: false, guardian: null })}
        title="Delete Guardian"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Are you sure you want to delete this guardian? This action cannot be undone.
          </p>
          {deleteModal.guardian && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <p><strong>Name:</strong> {deleteModal.guardian.first_name} {deleteModal.guardian.last_name}</p>
              <p><strong>Email:</strong> {deleteModal.guardian.email}</p>
              <p><strong>Phone:</strong> {deleteModal.guardian.phone}</p>
              <p><strong>Student:</strong> {getStudentName(deleteModal.guardian.student_id)}</p>
            </div>
          )}
          <div className="flex justify-end space-x-3">
            <Button
              variant="secondary"
              onClick={() => setDeleteModal({ isOpen: false, guardian: null })}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={() => handleDelete(deleteModal.guardian.guardian_id)}
            >
              Delete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default GuardianList