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
import { formatters } from '../../utils/formatters';

const StudentForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);
  const { actions } = useAppContext();

  // Fetch student data if editing
  const { data: student, loading: studentLoading, error: studentError } = useFetch('student', id);
  
  // Fetch related data for dropdowns
  const { data: departments } = useFetch('department');
  const { data: courses } = useFetch('course');
  const { data: guardians } = useFetch('guardian');

  // CRUD operations
  const { create, update, loading: saveLoading, error: saveError } = useCrud('student');

  // Form validation rules
  const validationRules = {
    first_name: [validators.required, validators.maxLength(50)],
    last_name: [validators.required, validators.maxLength(50)],
    email: [validators.required, validators.email],
    dob: [validators.required, validators.date, validators.pastDate],
    department_id: [validators.required],
    course_id: [validators.required],
    guardian_id: [validators.required]
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
    first_name: '',
    last_name: '',
    email: '',
    dob: '',
    department_id: '',
    course_id: '',
    guardian_id: ''
  }, validationRules);

  // Load student data into form when editing
  useEffect(() => {
    if (isEdit && student) {
      setFormValues({
        first_name: student.first_name || '',
        last_name: student.last_name || '',
        email: student.email || '',
        dob: formatters.formatDateForInput(student.dob) || '',
        department_id: student.department_id || '',
        course_id: student.course_id || '',
        guardian_id: student.guardian_id || ''
      });
    }
  }, [isEdit, student, setFormValues]);

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
          isEdit ? 'Student updated successfully' : 'Student created successfully'
        );
        navigate('/students');
      } else {
        actions.showError(result.error || 'Failed to save student');
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

  const courseOptions = courses?.map(course => ({
    value: course.course_id,
    label: course.course_name
  })) || [];

  const guardianOptions = guardians?.map(guardian => ({
    value: guardian.guardian_id,
    label: formatters.formatName(guardian.first_name, guardian.last_name)
  })) || [];

  if (studentLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" text="Loading student..." />
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
              onClick={() => navigate('/students')}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
                {isEdit ? 'Edit Student' : 'Add New Student'}
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                {isEdit ? 'Update student information' : 'Create a new student record'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Error Alerts */}
      {studentError && (
        <ErrorAlert message={studentError} />
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
          {/* Personal Information */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Personal Information
            </h3>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <Input
                label="First Name"
                required
                {...getFieldProps('first_name')}
              />
              <Input
                label="Last Name"
                required
                {...getFieldProps('last_name')}
              />
              <Input
                label="Email"
                type="email"
                required
                {...getFieldProps('email')}
              />
              <Input
                label="Date of Birth"
                type="date"
                required
                {...getFieldProps('dob')}
              />
            </div>
          </div>

          {/* Academic Information */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Academic Information
            </h3>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <Select
                label="Department"
                required
                options={departmentOptions}
                placeholder="Select a department"
                {...getFieldProps('department_id')}
              />
              <Select
                label="Course"
                required
                options={courseOptions}
                placeholder="Select a course"
                {...getFieldProps('course_id')}
              />
            </div>
          </div>

          {/* Guardian Information */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Guardian Information
            </h3>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <Select
                label="Guardian"
                required
                options={guardianOptions}
                placeholder="Select a guardian"
                {...getFieldProps('guardian_id')}
              />
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/students')}
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
              {isEdit ? 'Update Student' : 'Create Student'}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default StudentForm;