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

const CourseList = () => {
  const { actions } = useAppContext();
  const { data: courses, loading, error, refetch } = useFetch('course');
  const { data: departments } = useFetch('department');
  const { remove, loading: deleteLoading } = useCrud('course');
  
  const [selectedCourses, setSelectedCourses] = useState([]);
  const [deleteModal, setDeleteModal] = useState({ open: false, course: null });
  const [bulkDeleteModal, setBulkDeleteModal] = useState(false);

  const {
    data: paginatedCourses,
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
  } = usePagination(courses || [], 10);

  const searchFields = ['course_name', 'course_id'];

  useEffect(() => {
    handleSearch(searchTerm, searchFields);
  }, [searchTerm]);

  const handleDelete = async (course) => {
    const result = await remove(course.course_id);
    if (result.success) {
      actions.showSuccess('Course deleted successfully');
      refetch();
      setDeleteModal({ open: false, course: null });
    } else {
      actions.showError(result.error || 'Failed to delete course');
    }
  };

  const handleBulkDelete = async () => {
    setBulkDeleteModal(false);
    setSelectedCourses([]);
    actions.showSuccess(`${selectedCourses.length} courses deleted successfully`);
  };

  // Create department lookup map
  const departmentMap = departments?.reduce((acc, dept) => {
    acc[dept.dept_id] = dept.dept_name;
    return acc;
  }, {}) || {};

  const columns = [
    {
      key: 'course_id',
      label: 'Course ID',
      sortable: true
    },
    {
      key: 'course_name',
      label: 'Course Name',
      sortable: true
    },
    {
      key: 'department_id',
      label: 'Department',
      sortable: true,
      render: (value) => departmentMap[value] || `Dept ${value}`
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, course) => (
        <TableActions>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {/* View course details */}}
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Link to={`/courses/${course.course_id}/edit`}>
            <Button variant="ghost" size="sm">
              <Edit className="h-4 w-4" />
            </Button>
          </Link>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setDeleteModal({ open: true, course })}
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
        <LoadingSpinner size="lg" text="Loading courses..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="md:flex md:items-center md:justify-between">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
            Courses
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Manage course offerings and curriculum
          </p>
        </div>
        <div className="mt-4 flex space-x-3 md:mt-0 md:ml-4">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Link to="/courses/new">
            <Button variant="primary">
              <Plus className="h-4 w-4 mr-2" />
              Add Course
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
            placeholder="Search courses by name or ID..."
            value={searchTerm}
            onChange={handleSearch}
            className="sm:max-w-xs"
          />
          
          {selectedCourses.length > 0 && (
            <div className="flex items-center space-x-3">
              <span className="text-sm text-gray-700">
                {selectedCourses.length} selected
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

      {/* Courses Table */}
      <div className="card">
        <Table
          columns={columns}
          data={paginatedCourses}
          sortField={sortField}
          sortDirection={sortDirection}
          onSort={handleSort}
          emptyMessage="No courses found"
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
        onClose={() => setDeleteModal({ open: false, course: null })}
        title="Delete Course"
        footer={
          <div className="flex space-x-3">
            <Button
              variant="outline"
              onClick={() => setDeleteModal({ open: false, course: null })}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              loading={deleteLoading}
              onClick={() => handleDelete(deleteModal.course)}
            >
              Delete
            </Button>
          </div>
        }
      >
        <p className="text-sm text-gray-500">
          Are you sure you want to delete{' '}
          <strong>{deleteModal.course?.course_name}</strong>? 
          This action cannot be undone.
        </p>
      </Modal>

      {/* Bulk Delete Confirmation Modal */}
      <Modal
        isOpen={bulkDeleteModal}
        onClose={() => setBulkDeleteModal(false)}
        title="Delete Multiple Courses"
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
              Delete {selectedCourses.length} Courses
            </Button>
          </div>
        }
      >
        <p className="text-sm text-gray-500">
          Are you sure you want to delete {selectedCourses.length} selected courses? 
          This action cannot be undone.
        </p>
      </Modal>
    </div>
  );
};

export default CourseList;