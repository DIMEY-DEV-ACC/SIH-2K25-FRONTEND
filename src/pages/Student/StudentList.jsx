import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Edit, Trash2, Eye, Download } from 'lucide-react';
import Table, { TableActions } from '../../components/ui/Table';
import Button from '../../components/ui/Button';
import SearchBar from '../../components/ui/SearchBar';
import Pagination from '../../components/ui/Pagination';
import Modal from '../../components/ui/Modal';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import ErrorAlert from '../../components/ui/ErrorAlert';
import { useFetch, useCrud } from '../../hooks/useFetch';
import { usePagination } from '../../hooks/usePagination';
import { useAppContext } from '../../context/AppContext';
import { formatters } from '../../utils/formatters';

const StudentList = () => {
  const { actions } = useAppContext();
  const { data: students, loading, error, refetch } = useFetch('student');
  const { remove, loading: deleteLoading } = useCrud('student');
  
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [deleteModal, setDeleteModal] = useState({ open: false, student: null });
  const [bulkDeleteModal, setBulkDeleteModal] = useState(false);

  const {
    data: paginatedStudents,
    currentPage,
    totalPages,
    totalItems,
    pageSize,
    searchTerm,
    handlePageChange,
    handlePageSizeChange,
    handleSearch,
    handleSort,
    sortField,
    sortDirection
  } = usePagination(students || [], 10);

  // Search fields for students
  const searchFields = ['first_name', 'last_name', 'email', 'student_id'];

  useEffect(() => {
    handleSearch(searchTerm, searchFields);
  }, [searchTerm]);

  const handleDelete = async (student) => {
    const result = await remove(student.student_id);
    if (result.success) {
      actions.showSuccess('Student deleted successfully');
      refetch();
      setDeleteModal({ open: false, student: null });
    } else {
      actions.showError(result.error || 'Failed to delete student');
    }
  };

  const handleBulkDelete = async () => {
    // Implementation for bulk delete
    setBulkDeleteModal(false);
    setSelectedStudents([]);
    actions.showSuccess(`${selectedStudents.length} students deleted successfully`);
  };

  const columns = [
    {
      key: 'student_id',
      label: 'Student ID',
      sortable: true
    },
    {
      key: 'name',
      label: 'Name',
      sortable: true,
      render: (_, student) => formatters.formatName(student.first_name, student.last_name)
    },
    {
      key: 'email',
      label: 'Email',
      sortable: true
    },
    {
      key: 'dob',
      label: 'Date of Birth',
      sortable: true,
      render: (value) => formatters.formatDate(value)
    },
    {
      key: 'department_id',
      label: 'Department',
      render: (value) => `Dept ${value}` // This would be replaced with actual department name
    },
    {
      key: 'course_id',
      label: 'Course',
      render: (value) => `Course ${value}` // This would be replaced with actual course name
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, student) => (
        <TableActions>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {/* View student details */}}
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Link to={`/students/${student.student_id}/edit`}>
            <Button variant="ghost" size="sm">
              <Edit className="h-4 w-4" />
            </Button>
          </Link>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setDeleteModal({ open: true, student })}
            className="text-red-600 hover:text-red-700"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </TableActions>
      )
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" text="Loading students..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="md:flex md:items-center md:justify-between">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
            Students
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Manage student records and information
          </p>
        </div>
        <div className="mt-4 flex space-x-3 md:mt-0 md:ml-4">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Link to="/students/new">
            <Button variant="primary">
              <Plus className="h-4 w-4 mr-2" />
              Add Student
            </Button>
          </Link>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <ErrorAlert
          message={error}
          onClose={() => refetch()}
        />
      )}

      {/* Filters and Search */}
      <div className="card p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <SearchBar
            placeholder="Search students by name, email, or ID..."
            value={searchTerm}
            onChange={handleSearch}
            className="sm:max-w-xs"
          />
          
          {selectedStudents.length > 0 && (
            <div className="flex items-center space-x-3">
              <span className="text-sm text-gray-700">
                {selectedStudents.length} selected
              </span>
              <Button
                variant="danger"
                size="sm"
                onClick={() => setBulkDeleteModal(true)}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Selected
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Students Table */}
      <div className="card">
        <Table
          columns={columns}
          data={paginatedStudents}
          sortField={sortField}
          sortDirection={sortDirection}
          onSort={handleSort}
          emptyMessage="No students found"
        />
        
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalItems}
          pageSize={pageSize}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
        />
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModal.open}
        onClose={() => setDeleteModal({ open: false, student: null })}
        title="Delete Student"
        footer={
          <div className="flex space-x-3">
            <Button
              variant="outline"
              onClick={() => setDeleteModal({ open: false, student: null })}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              loading={deleteLoading}
              onClick={() => handleDelete(deleteModal.student)}
            >
              Delete
            </Button>
          </div>
        }
      >
        <p className="text-sm text-gray-500">
          Are you sure you want to delete{' '}
          <strong>
            {deleteModal.student && 
             formatters.formatName(deleteModal.student.first_name, deleteModal.student.last_name)}
          </strong>
          ? This action cannot be undone.
        </p>
      </Modal>

      {/* Bulk Delete Confirmation Modal */}
      <Modal
        isOpen={bulkDeleteModal}
        onClose={() => setBulkDeleteModal(false)}
        title="Delete Multiple Students"
        footer={
          <div className="flex space-x-3">
            <Button
              variant="outline"
              onClick={() => setBulkDeleteModal(false)}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              loading={deleteLoading}
              onClick={handleBulkDelete}
            >
              Delete {selectedStudents.length} Students
            </Button>
          </div>
        }
      >
        <p className="text-sm text-gray-500">
          Are you sure you want to delete {selectedStudents.length} selected students? 
          This action cannot be undone.
        </p>
      </Modal>
    </div>
  );
};

export default StudentList;