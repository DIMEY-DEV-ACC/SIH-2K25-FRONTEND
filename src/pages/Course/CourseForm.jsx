import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Save, ArrowLeft } from 'lucide-react';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import ErrorAlert from '../../components/ui/ErrorAlert';
import { useForm } from '../../hooks/useForm';
import { useFetch, useCrud } from '../../hooks/useFetch';
import { useAppContext } from '../../context/AppContext';
import { validators } from '../../utils/validators';

const CourseForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);
  const { actions } = useAppContext();

  // Fetch course data if editing
  const { data: course, loading: courseLoading, error: courseError } = useFetch('course', id);
  
  // Fetch departments for dropdown
  const { data: departments } = useFetch('department');

  // CRUD operations
  const { create, update, loading: saveLoading, error: saveError } = useCrud('course');

  // Form validation rules
  const validationRules = {
    course_name: [validators.required, validators.maxLength(100)],
    department_id: [validators.required]
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
    course_name: '',
    department_id: ''
  }, validationRules);

  // Load course data into form when editing
  useEffect(() => {
    if (isEdit && course) {
      setFormValues({
        course_name: course.course_name || '',
        department_id: course.department_id || ''
      });
    }
  }, [isEdit, course, setFormValues]);

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
          isEdit ? 'Course updated successfully' : 'Course created successfully'
        );
        navigate('/courses');
      } else {
        actions.showError(result.error || 'Failed to save course');
      }
    } catch (error) {
      actions.showError('An unexpected error occurred');
    }
  };

  // Prepare dropdown options
  const departmentOptions = departments?.map(dept => ({
    value: dept.dept_id,
    label: dept.dept_name
  })) || [];

  if (courseLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" text="Loading course..." />
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
              onClick={() => navigate('/courses')}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
                {isEdit ? 'Edit Course' : 'Add New Course'}
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                {isEdit ? 'Update course information' : 'Create a new course offering'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Error Alerts */}
      {courseError && (
        <ErrorAlert message={courseError} />
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
          {/* Course Information */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Course Information
            </h3>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <Input
                label="Course Name"
                required
                placeholder="Enter course name"
                {...getFieldProps('course_name')}
              />
              <Select
                label="Department"
                required
                options={departmentOptions}
                placeholder="Select a department"
                {...getFieldProps('department_id')}
              />
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/courses')}
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
              {isEdit ? 'Update Course' : 'Create Course'}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CourseForm;