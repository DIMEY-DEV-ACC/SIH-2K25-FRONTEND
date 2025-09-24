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

const DepartmentList = () => {
  const { actions } = useAppContext();
  const { data: departments, loading, error, refetch } = useFetch('department');
  const { remove, loading: deleteLoading } = useCrud('department');
  
  const [selectedDepartments, setSelectedDepartments] = useState([]);
  const [deleteModal, setDeleteModal] = useState({ open: false, department: null });
  const [bulkDeleteModal, setBulkDeleteModal] = useState(false);

  const {
    data: paginatedDepartments,
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
  } = usePagination(departments || [], 10);

  const searchFields = ['dept_name', 'dept_id'];

  useEffect(() => {
    handleSearch(searchTerm, searchFields);
  }, [searchTerm]);

  const handleDelete = async (department) => {
    const result = await remove(department.dept_id);
    if (result.success) {
      actions.showSuccess('Department deleted successfully');
      refetch();
      setDeleteModal({ open: false, department: null });
    } else {
      actions.showError(result.error || 'Failed to delete department');
    }
  };

  const handleBulkDelete = async () => {
    setBulkDeleteModal(false);
    setSelectedDepartments([]);
    actions.showSuccess(`${selectedDepartments.length} departments deleted successfully`);
  };

  const columns = [
    {
      key: 'dept_id',
      label: 'Department ID',
      sortable: true
    },
    {
      key: 'dept_name',
      label: 'Department Name',
      sortable: true
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, department) => (
        <TableActions>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {/* View department details */}}
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Link to={`/departments/${department.dept_id}/edit`}>
            <Button variant="ghost" size="sm">
              <Edit className="h-4 w-4" />
            </Button>
          </Link>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setDeleteModal({ open: true, department })}
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
        <LoadingSpinner size="lg" text="Loading departments..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="md:flex md:items-center md:justify-between">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
            Departments
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Manage academic departments and organizational units
          </p>
        </div>
        <div className="mt-4 flex space-x-3 md:mt-0 md:ml-4">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Link to="/departments/new">
            <Button variant="primary">
              <Plus className="h-4 w-4 mr-2" />
              Add Department
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
            placeholder="Search departments by name or ID..."
            value={searchTerm}
            onChange={handleSearch}
            className="sm:max-w-xs"
          />
          
          {selectedDepartments.length > 0 && (
            <div className="flex items-center space-x-3">
              <span className="text-sm text-gray-700">
                {selectedDepartments.length} selected
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

      {/* Departments Table */}
      <div className="card">
        <Table
          columns={columns}
          data={paginatedDepartments}
          sortField={sortField}
          sortDirection={sortDirection}
          onSort={handleSort}
          emptyMessage="No departments found"
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
        onClose={() => setDeleteModal({ open: false, department: null })}
        title="Delete Department"
        footer={
          <div className="flex space-x-3">
            <Button
              variant="outline"
              onClick={() => setDeleteModal({ open: false, department: null })}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              loading={deleteLoading}
              onClick={() => handleDelete(deleteModal.department)}
            >
              Delete
            </Button>
          </div>
        }
      >
        <p className="text-sm text-gray-500">
          Are you sure you want to delete{' '}
          <strong>{deleteModal.department?.dept_name}</strong>? 
          This action cannot be undone and may affect related courses and students.
        </p>
      </Modal>

      {/* Bulk Delete Confirmation Modal */}
      <Modal
        isOpen={bulkDeleteModal}
        onClose={() => setBulkDeleteModal(false)}
        title="Delete Multiple Departments"
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
              Delete {selectedDepartments.length} Departments
            </Button>
          </div>
        }
      >
        <p className="text-sm text-gray-500">
          Are you sure you want to delete {selectedDepartments.length} selected departments? 
          This action cannot be undone and may affect related courses and students.
        </p>
      </Modal>
    </div>
  );
};

export default DepartmentList;