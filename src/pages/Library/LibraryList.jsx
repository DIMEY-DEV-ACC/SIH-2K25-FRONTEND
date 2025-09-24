import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Download, Edit, Trash2, Eye, Book } from 'lucide-react'
import { useAppContext } from '../../context/AppContext'
import { libraryService } from '../../services/soapClient'
import Table from '../../components/ui/Table'
import Button from '../../components/ui/Button'
import SearchBar from '../../components/ui/SearchBar'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import ErrorAlert from '../../components/ui/ErrorAlert'
import Modal from '../../components/ui/Modal'
import Pagination from '../../components/ui/Pagination'

const LibraryList = () => {
  const { state, dispatch } = useAppContext()
  const { library, loading, error } = state
  const [searchTerm, setSearchTerm] = useState('')
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, book: null })
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  useEffect(() => {
    loadBooks()
  }, [])

  const loadBooks = async () => {
    dispatch({ type: 'SET_LOADING', payload: true })
    try {
      const data = await libraryService.list()
      dispatch({ type: 'SET_LIBRARY', payload: data })
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message })
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false })
    }
  }

  const handleDelete = async (bookId) => {
    try {
      await libraryService.remove(bookId)
      dispatch({ type: 'REMOVE_BOOK', payload: bookId })
      dispatch({ 
        type: 'ADD_NOTIFICATION', 
        payload: { type: 'success', message: 'Book deleted successfully' }
      })
      setDeleteModal({ isOpen: false, book: null })
    } catch (error) {
      dispatch({ 
        type: 'ADD_NOTIFICATION', 
        payload: { type: 'error', message: 'Failed to delete book' }
      })
    }
  }

  // Filter and search logic
  const filteredBooks = library.filter(book => {
    const matchesSearch = book.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         book.author?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         book.isbn?.includes(searchTerm.toLowerCase()) ||
                         book.publisher?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         book.book_id?.toString().includes(searchTerm.toLowerCase())
    return matchesSearch
  })

  // Pagination logic
  const totalItems = filteredBooks.length
  const totalPages = Math.ceil(totalItems / pageSize)
  const startIndex = (currentPage - 1) * pageSize
  const paginatedBooks = filteredBooks.slice(startIndex, startIndex + pageSize)

  const columns = [
    {
      key: 'book_id',
      label: 'BOOK ID',
      sortable: true,
      render: (book) => (
        <span className="font-medium text-gray-900">#{book.book_id}</span>
      )
    },
    {
      key: 'title',
      label: 'BOOK DETAILS',
      sortable: true,
      render: (book) => (
        <div>
          <div className="flex items-center">
            <Book className="h-4 w-4 mr-2 text-gray-400" />
            <span className="font-medium text-gray-900">{book.title}</span>
          </div>
          <div className="text-sm text-gray-500 mt-1">
            by {book.author} • {book.publisher}
          </div>
        </div>
      )
    },
    {
      key: 'isbn',
      label: 'ISBN',
      sortable: true,
      render: (book) => (
        <span className="text-gray-900 font-mono text-sm">{book.isbn}</span>
      )
    },
    {
      key: 'available_copies',
      label: 'AVAILABLE COPIES',
      sortable: true,
      render: (book) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          book.available_copies > 0 
            ? 'bg-green-100 text-green-800' 
            : 'bg-red-100 text-red-800'
        }`}>
          {book.available_copies} copies
        </span>
      )
    },
    {
      key: 'actions',
      label: 'ACTIONS',
      render: (book) => (
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {/* View details */}}
            className="text-blue-600 hover:text-blue-700"
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Link to={`/library/${book.book_id}/edit`}>
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
            onClick={() => setDeleteModal({ isOpen: true, book })}
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
            Library Management
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Manage books, inventory, and library resources
          </p>
        </div>
        <div className="mt-4 flex md:mt-0 md:ml-4 space-x-3">
          <Button variant="secondary" className="flex items-center">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Link to="/library/new">
            <Button className="flex items-center">
              <Plus className="h-4 w-4 mr-2" />
              Add Book
            </Button>
          </Link>
        </div>
      </div>

      {/* Error Alert */}
      {error && <ErrorAlert message={error} />}

      {/* Search */}
      <div className="grid grid-cols-1 gap-4">
        <SearchBar
          placeholder="Search by title, author, ISBN, or publisher..."
          value={searchTerm}
          onChange={setSearchTerm}
        />
      </div>

      {/* Table */}
      <div className="card">
        <Table
          columns={columns}
          data={paginatedBooks}
          emptyMessage="No books found"
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
        onClose={() => setDeleteModal({ isOpen: false, book: null })}
        title="Delete Book"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Are you sure you want to delete this book? This action cannot be undone.
          </p>
          {deleteModal.book && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <p><strong>Title:</strong> {deleteModal.book.title}</p>
              <p><strong>Author:</strong> {deleteModal.book.author}</p>
              <p><strong>ISBN:</strong> {deleteModal.book.isbn}</p>
            </div>
          )}
          <div className="flex justify-end space-x-3">
            <Button
              variant="secondary"
              onClick={() => setDeleteModal({ isOpen: false, book: null })}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={() => handleDelete(deleteModal.book.book_id)}
            >
              Delete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default LibraryList