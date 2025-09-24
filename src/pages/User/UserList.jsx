import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Edit, Trash2, Eye, Download, Shield } from 'lucide-react';
import Table, { TableActions, StatusBadge } from '../../components/ui/Table';
import Button from '../../components/ui/Button';
import SearchBar from '../../components/ui/SearchBar';
import Pagination from '../../components/ui/Pagination';
import Modal from '../../components/ui/Modal';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import ErrorAlert from '../../components/ui/ErrorAlert';
import { useFetch, useCrud } from '../../hooks/useFetch';
import { usePagination } from '../../hooks/usePagination';
import { useAppContext } from '../../context/AppContext';

const UserList = () => {
  const { actions } = useAppContext();
  const { data: users, loading, error, refetch } = useFetch('user');
  const { remove, loading: deleteLoading } = useCrud('user');
  
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [deleteModal, setDeleteModal] = useState({ open: false, user: null });
  const [bulkDeleteModal, setBulkDeleteModal] = useState(false);

  const {
    data: paginatedUsers,
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
  } = usePagination(users || [], 10);

  const searchFields = ['username', 'email', 'user_id'];

  useEffect(() => {
    handleSearch(searchTerm, searchFields);
  }, [searchTerm]);

  const handleDelete = async (user) => {
    const result = await remove(user.user_id);
    if (result.success) {
      actions.showSuccess('User deleted successfully');
      refetch();
      setDeleteModal({ open: false, user: null });
    } else {
      actions.showError(result.error || 'Failed to delete user');
    }
  };

  const handleBulkDelete = async () => {
    setBulkDeleteModal(false);
    setSelectedUsers([]);
    actions.showSuccess(`${selectedUsers.length} users deleted successfully`);
  };

  const getRoleVariant = (roleId) => {
    switch (roleId) {
      case '1': return 'error'; // Admin
      case '2': return 'warning'; // Teacher
      case '3': return 'info'; // Student
      default: return 'default';
    }
  };

  const getRoleName = (roleId) => {
    switch (roleId) {
      case '1': return 'Admin';
      case '2': return 'Teacher';
      case '3': return 'Student';
      default: return 'Unknown';
    }
  };

  const columns = [
    {
      key: 'user_id',
      label: 'User ID',
      sortable: true
    },
    {
      key: 'username',
      label: 'Username',
      sortable: true
    },
    {
      key: 'email',
      label: 'Email',
      sortable: true
    },
    {
      key: 'role_id',
      label: 'Role',
      sortable: true,
      render: (value) => (
        <StatusBadge 
          status={getRoleName(value)} 
          variant={getRoleVariant(value)} 
        />
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, user) => (
        <TableActions>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {/* View user details */}}
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {/* Manage user roles */}}
          >
            <Shield className="h-4 w-4" />
          </Button>
          <Link to={`/users/${user.user_id}/edit`}>
            <Button variant="ghost" size="sm">
              <Edit className="h-4 w-4" />
            </Button>
          </Link>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setDeleteModal({ open: true, user })}
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
        <LoadingSpinner size="lg" text="Loading users..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="md:flex md:items-center md:justify-between">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
            Users
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Manage system users and access permissions
          </p>
        </div>
        <div className="mt-4 flex space-x-3 md:mt-0 md:ml-4">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Link to="/users/new">
            <Button variant="primary">
              <Plus className="h-4 w-4 mr-2" />
              Add User
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
            placeholder="Search users by username, email, or ID..."
            value={searchTerm}
            onChange={handleSearch}
            className="sm:max-w-xs"
          />
          
          {selectedUsers.length > 0 && (
            <div className="flex items-center space-x-3">
              <span className="text-sm text-gray-700">
                {selectedUsers.length} selected
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

      {/* Users Table */}
      <div className="card">
        <Table
          columns={columns}
          data={paginatedUsers}
          sortField={sortField}
          sortDirection={sortDirection}
          onSort={handleSort}
          emptyMessage="No users found"
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
        onClose={() => setDeleteModal({ open: false, user: null })}
        title="Delete User"
        footer={
          <div className="flex space-x-3">
            <Button
              variant="outline"
              onClick={() => setDeleteModal({ open: false, user: null })}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              loading={deleteLoading}
              onClick={() => handleDelete(deleteModal.user)}
            >
              Delete
            </Button>
          </div>
        }
      >
        <p className="text-sm text-gray-500">
          Are you sure you want to delete user{' '}
          <strong>{deleteModal.user?.username}</strong>? 
          This action cannot be undone and will revoke all access permissions.
        </p>
      </Modal>

      {/* Bulk Delete Confirmation Modal */}
      <Modal
        isOpen={bulkDeleteModal}
        onClose={() => setBulkDeleteModal(false)}
        title="Delete Multiple Users"
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
              Delete {selectedUsers.length} Users
            </Button>
          </div>
        }
      >
        <p className="text-sm text-gray-500">
          Are you sure you want to delete {selectedUsers.length} selected users? 
          This action cannot be undone and will revoke all access permissions.
        </p>
      </Modal>
    </div>
  );
};

export default UserList;