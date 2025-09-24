import React, { useState, useEffect } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { ArrowLeft, Save, X } from 'lucide-react'
import { useAppContext } from '../../context/AppContext'
import { admissionService } from '../../services/soapClient'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Select from '../../components/ui/Select'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import ErrorAlert from '../../components/ui/ErrorAlert'
import { validateRequired, validateDate } from '../../utils/validators'
import { STATUS_OPTIONS } from '../../utils/constants'

const AdmissionForm = () => {
  const navigate = useNavigate()
  const { id } = useParams()
  const isEdit = Boolean(id)
  const { state, dispatch } = useAppContext()
  const { students, loading, error } = state

  const [formData, setFormData] = useState({
    admission_id: '',
    student_id: '',
    admission_date: '',
    status: 'Applied'
  })

  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    loadStudents()
    if (isEdit) {
      loadAdmission()
    }
  }, [id])

  const loadStudents = async () => {
    try {
      const { studentService } = await import('../../services/soapClient')
      const data = await studentService.list()
      dispatch({ type: 'SET_STUDENTS', payload: data })
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to load students' })
    }
  }

  const loadAdmission = async () => {
    dispatch({ type: 'SET_LOADING', payload: true })
    try {
      const data = await admissionService.get(id)
      setFormData({
        admission_id: data.admission_id || '',
        student_id: data.student_id || '',
        admission_date: data.admission_date ? data.admission_date.split('T')[0] : '',
        status: data.status || 'Applied'
      })
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to load admission record' })
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false })
    }
  }

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const validateForm = () => {
    const newErrors = {}

    if (!validateRequired(formData.student_id)) {
      newErrors.student_id = 'Student is required'
    }

    if (!validateRequired(formData.admission_date)) {
      newErrors.admission_date = 'Admission date is required'
    } else if (!validateDate(formData.admission_date)) {
      newErrors.admission_date = 'Please enter a valid date'
    }

    if (!validateRequired(formData.status)) {
      newErrors.status = 'Status is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)
    try {
      const submitData = {
        ...formData,
        student_id: parseInt(formData.student_id),
        admission_date: new Date(formData.admission_date).toISOString()
      }

      if (isEdit) {
        await admissionService.update(id, submitData)
        dispatch({ type: 'UPDATE_ADMISSION', payload: { id, data: submitData } })
        dispatch({ 
          type: 'ADD_NOTIFICATION', 
          payload: { type: 'success', message: 'Admission record updated successfully' }
        })
      } else {
        const newAdmission = await admissionService.create(submitData)
        dispatch({ type: 'ADD_ADMISSION', payload: newAdmission })
        dispatch({ 
          type: 'ADD_NOTIFICATION', 
          payload: { type: 'success', message: 'Admission record created successfully' }
        })
      }
      
      navigate('/admissions')
    } catch (error) {
      dispatch({ 
        type: 'ADD_NOTIFICATION', 
        payload: { 
          type: 'error', 
          message: `Failed to ${isEdit ? 'update' : 'create'} admission record: ${error.message}` 
        }
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const getStudentOptions = () => {
    return students.map(student => ({
      value: student.student_id,
      label: `${student.first_name} ${student.last_name} (ID: ${student.student_id})`
    }))
  }

  const getStatusOptions = () => {
    return STATUS_OPTIONS.ADMISSION.map(status => ({
      value: status,
      label: status
    }))
  }

  if (loading) return <LoadingSpinner />

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link to="/admissions">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Admissions
            </Button>
          </Link>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {isEdit ? 'Edit Admission Record' : 'Add New Admission Record'}
            </h2>
            <p className="text-sm text-gray-500">
              {isEdit ? 'Update admission information' : 'Create a new admission record'}
            </p>
          </div>
        </div>
      </div>

      {/* Error Alert */}
      {error && <ErrorAlert message={error} />}

      {/* Form */}
      <div className="card">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Student <span className="text-red-500">*</span>
              </label>
              <Select
                value={formData.student_id}
                onChange={(value) => handleInputChange('student_id', value)}
                options={getStudentOptions()}
                placeholder="Select a student"
                error={errors.student_id}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status <span className="text-red-500">*</span>
              </label>
              <Select
                value={formData.status}
                onChange={(value) => handleInputChange('status', value)}
                options={getStatusOptions()}
                error={errors.status}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Admission Date <span className="text-red-500">*</span>
            </label>
            <Input
              type="date"
              value={formData.admission_date}
              onChange={(e) => handleInputChange('admission_date', e.target.value)}
              error={errors.admission_date}
            />
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
            <Link to="/admissions">
              <Button type="button" variant="secondary">
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
            </Link>
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="flex items-center"
            >
              {isSubmitting ? (
                <LoadingSpinner size="sm" className="mr-2" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              {isEdit ? 'Update Admission' : 'Create Admission'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AdmissionForm