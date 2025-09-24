import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Save, ArrowLeft } from 'lucide-react';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import ErrorAlert from '../../components/ui/ErrorAlert';
import { useForm } from '../../hooks/useForm';
import { useFetch, useCrud } from '../../hooks/useFetch';
import { useAppContext } from '../../context/AppContext';
import { validators } from '../../utils/validators';

const DepartmentForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);
  const { actions } = useAppContext();

  // Fetch department data if editing
  const { data: department, loading: departmentLoading, error: departmentError } = useFetch('department', id);

  // CRUD operations
  const { create, update, loading: saveLoading, error: saveError } = useCrud('department');

  // Form validation rules
  const validationRules = {
    dept_name: [validators.required, validators.maxLength(100)]
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
    dept_name: ''
  }, validationRules);

  // Load department data into form when editing
  useEffect(() => {
    if (isEdit && department) {
      setFormValues({
        dept_name: department.dept_name || ''
      });
    }
  }, [isEdit, department, setFormValues]);

  const handleFormSubmit = async (formData) => {
    try {
      let result;
      if (isEdit) {
        result = await update(id, formData);
      } else {
        result = await create(formData);
      }

      if (result.success) {
        actions.showSuccess(
          isEdit ? 'Department updated successfully' : 'Department created successfully'
        );
        navigate('/departments');
      } else {
        actions.showError(result.error || 'Failed to save department');
      }
    } catch (error) {
      actions.showError('An unexpected error occurred');
    }
  };

  if (departmentLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" text="Loading department..." />
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
              onClick={() => navigate('/departments')}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
                {isEdit ? 'Edit Department' : 'Add New Department'}
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                {isEdit ? 'Update department information' : 'Create a new academic department'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Error Alerts */}
      {departmentError && (
        <ErrorAlert message={departmentError} />
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
          {/* Department Information */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Department Information
            </h3>
            <div className="grid grid-cols-1 gap-6">
              <Input
                label="Department Name"
                required
                placeholder="Enter department name"
                {...getFieldProps('dept_name')}
              />
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/departments')}
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
              {isEdit ? 'Update Department' : 'Create Department'}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default DepartmentForm;