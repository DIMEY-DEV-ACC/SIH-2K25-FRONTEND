import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Download, Edit, Trash2, Eye, Home } from 'lucide-react'
import { useAppContext } from '../../context/AppContext'
import { hostelService } from '../../services/soapClient'
import Table from '../../components/ui/Table'
import Button from '../../components/ui/Button'
import SearchBar from '../../components/ui/SearchBar'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import ErrorAlert from '../../components/ui/ErrorAlert'
import Modal from '../../components/ui/Modal'
import Pagination from '../../components/ui/Pagination'

const HostelList = () => {
  const { state, dispatch } = useAppContext()
  const { hostels, loading, error } = state
  const [searchTerm, setSearchTerm] = useState('')
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, hostel: null })
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  useEffect(() => {
    loadHostels()
  }, [])

  const loadHostels = async () => {
    dispatch({ type: 'SET_LOADING', payload: true })
    try {
      const data = await hostelService.list()
      dispatch({ type: 'SET_HOSTELS', payload: data })
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message })
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false })
    }
  }

  const handleDelete = async (hostelId) => {
    try {
      await hostelService.remove(hostelId)
      dispatch({ type: 'REMOVE_HOSTEL', payload: hostelId })
      dispatch({ 
        type: 'ADD_NOTIFICATION', 
        payload: { type: 'success', message: 'Hostel deleted successfully' }
      })
      setDeleteModal({ isOpen: false, hostel: null })
    } catch (error) {
      dispatch({ 
        type: 'ADD_NOTIFICATION', 
        payload: { type: 'error', message: 'Failed to delete hostel' }
      })
    }
  }

  // Filter and search logic
  const filteredHostels = hostels.filter(hostel => {
    const matchesSearch = hostel.hostel_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         hostel.hostel_id?.toString().includes(searchTerm.toLowerCase()) ||
                         hostel.capacity?.toString().includes(searchTerm.toLowerCase())
    return matchesSearch
  })

  // Pagination logic
  const totalItems = filteredHostels.length
  const totalPages = Math.ceil(totalItems / pageSize)
  const startIndex = (currentPage - 1) * pageSize
  const paginatedHostels = filteredHostels.slice(startIndex, startIndex + pageSize)

  const columns = [
    {
      key: 'hostel_id',
      label: 'HOSTEL ID',
      sortable: true,
      render: (hostel) => (
        <span className="font-medium text-gray-900">#{hostel.hostel_id}</span>
      )
    },
    {
      key: 'hostel_name',
      label: 'HOSTEL NAME',
      sortable: true,
      render: (hostel) => (
        <div className="flex items-center">
          <Home className="h-4 w-4 mr-2 text-gray-400" />
          <span className="font-medium text-gray-900">{hostel.hostel_name}</span>
        </div>
      )
    },
    {
      key: 'capacity',
      label: 'CAPACITY',
      sortable: true,
      render: (hostel) => (
        <span className="text-gray-900">{hostel.capacity} students</span>
      )
    },
    {
      key: 'actions',
      label: 'ACTIONS',
      render: (hostel) => (
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {/* View details */}}
            className="text-blue-600 hover:text-blue-700"
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Link to={`/hostels/${hostel.hostel_id}/edit`}>
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
            onClick={() => setDeleteModal({ isOpen: true, hostel })}
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
            Hostel Management
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Manage hostels and accommodation facilities
          </p>
        </div>
        <div className="mt-4 flex md:mt-0 md:ml-4 space-x-3">
          <Button variant="secondary" className="flex items-center">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Link to="/hostels/new">
            <Button className="flex items-center">
              <Plus className="h-4 w-4 mr-2" />
              Add Hostel
            </Button>
          </Link>
        </div>
      </div>

      {/* Error Alert */}
      {error && <ErrorAlert message={error} />}

      {/* Search */}
      <div className="grid grid-cols-1 gap-4">
        <SearchBar
          placeholder="Search by hostel name, ID, or capacity..."
          value={searchTerm}
          onChange={setSearchTerm}
        />
      </div>

      {/* Table */}
      <div className="card">
        <Table
          columns={columns}
          data={paginatedHostels}
          emptyMessage="No hostels found"
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
        onClose={() => setDeleteModal({ isOpen: false, hostel: null })}
        title="Delete Hostel"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Are you sure you want to delete this hostel? This action cannot be undone.
          </p>
          {deleteModal.hostel && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <p><strong>Name:</strong> {deleteModal.hostel.hostel_name}</p>
              <p><strong>Capacity:</strong> {deleteModal.hostel.capacity} students</p>
            </div>
          )}
          <div className="flex justify-end space-x-3">
            <Button
              variant="secondary"
              onClick={() => setDeleteModal({ isOpen: false, hostel: null })}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={() => handleDelete(deleteModal.hostel.hostel_id)}
            >
              Delete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default HostelList