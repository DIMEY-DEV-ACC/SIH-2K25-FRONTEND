import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Save, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import ErrorAlert from '../../components/ui/ErrorAlert';
import { useForm } from '../../hooks/useForm';
import { useFetch, useCrud } from '../../hooks/useFetch';
import { useAppContext } from '../../context/AppContext';
import { validators } from '../../utils/validators';

const UserForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);
  const { actions } = useAppContext();
  const [showPassword, setShowPassword] = React.useState(false);

  // Fetch user data if editing
  const { data: user, loading: userLoading, error: userError } = useFetch('user', id);

  // CRUD operations
  const { create, update, loading: saveLoading, error: saveError } = useCrud('user');

  // Form validation rules
  const validationRules = {
    username: [validators.required, validators.minLength(3), validators.maxLength(50)],
    email: [validators.required, validators.email],
    role_id: [validators.required],
    ...(isEdit ? {} : { password: [validators.required, validators.minLength(6)] })
  };

  // Initialize form
  const {
    values,
    errors,
    isSubmitting,
    isValid,
    isDirty,
    handleSubmit,
    setFormValues,
    getFieldProps
  } = useForm({
    username: '',
    email: '',
    role_id: '',
    password: ''
  }, validationRules);

  // Load user data into form when editing
  useEffect(() => {
    if (isEdit && user) {
      setFormValues({
        username: user.username || '',
        email: user.email || '',
        role_id: user.role_id || '',
        password: '' // Don't populate password for security
      });
    }
  }, [isEdit, user, setFormValues]);

  const handleFormSubmit = async (formData) => {
    try {
      // Remove password from update if it's empty
      if (isEdit && !formData.password) {
        delete formData.password;
      }

      let result;
      if (isEdit) {
        result = await update(id, formData);
      } else {
        result = await create(formData);
      }

      if (result.success) {
        actions.showSuccess(
          isEdit ? 'User updated successfully' : 'User created successfully'
        );
        navigate('/users');
      } else {
        actions.showError(result.error || 'Failed to save user');
      }
    } catch (error) {
      actions.showError('An unexpected error occurred');
    }
  };

  // Role options
  const roleOptions = [
    { value: '1', label: 'Administrator' },
    { value: '2', label: 'Teacher' },
    { value: '3', label: 'Student' }
  ];

  if (userLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" text="Loading user..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="md:flex md:items-center md:justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/users')}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
                {isEdit ? 'Edit User' : 'Add New User'}
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                {isEdit ? 'Update user information and permissions' : 'Create a new system user'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Error Alerts */}
      {userError && (
        <ErrorAlert message={userError} />
      )}
      {saveError && (
        <ErrorAlert message={saveError} />
      )}

      {/* Form */}
      <form onSubmit={(e) => {
        e.preventDefault();
        handleSubmit(handleFormSubmit);
      }}>
        <div className="card p-6 space-y-6">
          {/* User Information */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              User Information
            </h3>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <Input
                label="Username"
                required
                placeholder="Enter username"
                {...getFieldProps('username')}
              />
              <Input
                label="Email"
                type="email"
                required
                placeholder="Enter email address"
                {...getFieldProps('email')}
              />
              <Select
                label="Role"
                required
                options={roleOptions}
                placeholder="Select user role"
                {...getFieldProps('role_id')}
              />
              <div className="relative">
                <Input
                  label={isEdit ? "New Password (leave blank to keep current)" : "Password"}
                  type={showPassword ? "text" : "password"}
                  required={!isEdit}
                  placeholder={isEdit ? "Enter new password" : "Enter password"}
                  {...getFieldProps('password')}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 top-8"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          </div>

          {/* Security Notice */}
          {isEdit && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
              <div className="flex">
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-yellow-800">
                    Security Notice
                  </h3>
                  <div className="mt-2 text-sm text-yellow-700">
                    <p>
                      Leave the password field blank to keep the current password. 
                      Only enter a new password if you want to change it.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Form Actions */}
          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/users')}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              loading={isSubmitting || saveLoading}
              disabled={!isValid || (!isDirty && isEdit)}
            >
              <Save className="h-4 w-4 mr-2" />
              {isEdit ? 'Update User' : 'Create User'}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default UserForm;