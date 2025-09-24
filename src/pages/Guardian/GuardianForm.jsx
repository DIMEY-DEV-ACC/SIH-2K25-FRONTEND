import React, { useState, useEffect } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { ArrowLeft, Save, X, User, Phone, Mail } from 'lucide-react'
import { useAppContext } from '../../context/AppContext'
import { guardianService } from '../../services/soapClient'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Select from '../../components/ui/Select'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import ErrorAlert from '../../components/ui/ErrorAlert'
import { validateRequired, validateEmail, validatePhone } from '../../utils/validators'

const GuardianForm = () => {
  const navigate = useNavigate()
  const { id } = useParams()
  const isEdit = Boolean(id)
  const { state, dispatch } = useAppContext()
  const { students, loading, error } = state

  const [formData, setFormData] = useState({
    guardian_id: '',
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    student_id: ''
  })

  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    loadStudents()
    if (isEdit) {
      loadGuardian()
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

  const loadGuardian = async () => {
    dispatch({ type: 'SET_LOADING', payload: true })
    try {
      const data = await guardianService.get(id)
      setFormData({
        guardian_id: data.guardian_id || '',
        first_name: data.first_name || '',
        last_name: data.last_name || '',
        email: data.email || '',
        phone: data.phone || '',
        student_id: data.student_id || ''
      })
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to load guardian' })
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false })
    }
  }

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const validateForm = () => {
    const newErrors = {}

    // Validate first name
    if (!validateRequired(formData.first_name)) {
      newErrors.first_name = 'First name is required'
    }

    // Validate last name
    if (!validateRequired(formData.last_name)) {
      newErrors.last_name = 'Last name is required'
    }

    // Validate email
    if (!validateRequired(formData.email)) {
      newErrors.email = 'Email is required'
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address'
    }

    // Validate phone
    if (!validateRequired(formData.phone)) {
      newErrors.phone = 'Phone number is required'
    } else if (!validatePhone(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number'
    }

    // Validate student selection
    if (!validateRequired(formData.student_id)) {
      newErrors.student_id = 'Student is required'
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
        student_id: parseInt(formData.student_id)
      }

      if (isEdit) {
        await guardianService.update(id, submitData)
        dispatch({ type: 'UPDATE_GUARDIAN', payload: { id, data: submitData } })
        dispatch({ 
          type: 'ADD_NOTIFICATION', 
          payload: { type: 'success', message: 'Guardian updated successfully' }
        })
      } else {
        const newGuardian = await guardianService.create(submitData)
        dispatch({ type: 'ADD_GUARDIAN', payload: newGuardian })
        dispatch({ 
          type: 'ADD_NOTIFICATION', 
          payload: { type: 'success', message: 'Guardian created successfully' }
        })
      }
      
      navigate('/guardians')
    } catch (error) {
      dispatch({ 
        type: 'ADD_NOTIFICATION', 
        payload: { 
          type: 'error', 
          message: `Failed to ${isEdit ? 'update' : 'create'} guardian: ${error.message}` 
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

  if (loading) return <LoadingSpinner />

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link to="/guardians">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Guardians
            </Button>
          </Link>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {isEdit ? 'Edit Guardian' : 'Add New Guardian'}
            </h2>
            <p className="text-sm text-gray-500">
              {isEdit ? 'Update guardian information' : 'Create a new guardian record'}
            </p>
          </div>
        </div>
      </div>

      {/* Error Alert */}
      {error && <ErrorAlert message={error} />}

      {/* Form */}
      <div className="card">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Information */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <User className="h-5 w-5 mr-2" />
              Personal Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  First Name <span className="text-red-500">*</span>
                </label>
                <Input
                  type="text"
                  value={formData.first_name}
                  onChange={(e) => handleInputChange('first_name', e.target.value)}
                  placeholder="Enter first name"
                  error={errors.first_name}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Last Name <span className="text-red-500">*</span>
                </label>
                <Input
                  type="text"
                  value={formData.last_name}
                  onChange={(e) => handleInputChange('last_name', e.target.value)}
                  placeholder="Enter last name"
                  error={errors.last_name}
                />
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <Phone className="h-5 w-5 mr-2" />
              Contact Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="Enter email address"
                  error={errors.email}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <Input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="Enter phone number"
                  error={errors.phone}
                />
              </div>
            </div>
          </div>

          {/* Student Association */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Student Association
            </h3>
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
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
            <Link to="/guardians">
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
              {isEdit ? 'Update Guardian' : 'Create Guardian'}
            </Button>
          </div>
        </form>
      </div>

      {/* Additional Information */}
      <div className="card">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Guardian Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Contact Guidelines:</h4>
            <ul className="space-y-1">
              <li>• Provide accurate contact information</li>
              <li>• Ensure phone number is reachable</li>
              <li>• Use primary email for communications</li>
              <li>• Update information when changed</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Privacy & Security:</h4>
            <ul className="space-y-1">
              <li>• Guardian information is confidential</li>
              <li>• Used only for emergency contacts</li>
              <li>• Academic progress communications</li>
              <li>• Administrative notifications</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

export default GuardianForm