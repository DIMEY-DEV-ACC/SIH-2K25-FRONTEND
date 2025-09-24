import React, { useState, useEffect } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { ArrowLeft, Save, X } from 'lucide-react'
import { useAppContext } from '../../context/AppContext'
import { feesService } from '../../services/soapClient'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Select from '../../components/ui/Select'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import ErrorAlert from '../../components/ui/ErrorAlert'
import { validateRequired, validateNumber, validateDate } from '../../utils/validators'
import { STATUS_OPTIONS } from '../../utils/constants'

const FeesForm = () => {
  const navigate = useNavigate()
  const { id } = useParams()
  const isEdit = Boolean(id)
  const { state, dispatch } = useAppContext()
  const { students, loading, error } = state

  const [formData, setFormData] = useState({
    fees_id: '',
    student_id: '',
    amount: '',
    status: 'Pending',
    due_date: ''
  })

  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    loadStudents()
    if (isEdit) {
      loadFeesRecord()
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

  const loadFeesRecord = async () => {
    dispatch({ type: 'SET_LOADING', payload: true })
    try {
      const data = await feesService.get(id)
      setFormData({
        fees_id: data.fees_id || '',
        student_id: data.student_id || '',
        amount: data.amount || '',
        status: data.status || 'Pending',
        due_date: data.due_date ? data.due_date.split('T')[0] : ''
      })
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to load fees record' })
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

    // Validate student selection
    if (!validateRequired(formData.student_id)) {
      newErrors.student_id = 'Student is required'
    }

    // Validate amount
    if (!validateRequired(formData.amount)) {
      newErrors.amount = 'Amount is required'
    } else if (!validateNumber(formData.amount) || parseFloat(formData.amount) <= 0) {
      newErrors.amount = 'Amount must be a positive number'
    }

    // Validate status
    if (!validateRequired(formData.status)) {
      newErrors.status = 'Status is required'
    }

    // Validate due date
    if (!validateRequired(formData.due_date)) {
      newErrors.due_date = 'Due date is required'
    } else if (!validateDate(formData.due_date)) {
      newErrors.due_date = 'Please enter a valid date'
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
        amount: parseFloat(formData.amount),
        due_date: new Date(formData.due_date).toISOString()
      }

      if (isEdit) {
        await feesService.update(id, submitData)
        dispatch({ type: 'UPDATE_FEES', payload: { id, data: submitData } })
        dispatch({ 
          type: 'ADD_NOTIFICATION', 
          payload: { type: 'success', message: 'Fees record updated successfully' }
        })
      } else {
        const newFees = await feesService.create(submitData)
        dispatch({ type: 'ADD_FEES', payload: newFees })
        dispatch({ 
          type: 'ADD_NOTIFICATION', 
          payload: { type: 'success', message: 'Fees record created successfully' }
        })
      }
      
      navigate('/fees')
    } catch (error) {
      dispatch({ 
        type: 'ADD_NOTIFICATION', 
        payload: { 
          type: 'error', 
          message: `Failed to ${isEdit ? 'update' : 'create'} fees record: ${error.message}` 
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
    return STATUS_OPTIONS.FEES.map(status => ({
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
          <Link to="/fees">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Fees
            </Button>
          </Link>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {isEdit ? 'Edit Fees Record' : 'Add New Fees Record'}
            </h2>
            <p className="text-sm text-gray-500">
              {isEdit ? 'Update fees record information' : 'Create a new fees record for a student'}
            </p>
          </div>
        </div>
      </div>

      {/* Error Alert */}
      {error && <ErrorAlert message={error} />}

      {/* Form */}
      <div className="card">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Student Selection */}
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

          {/* Amount and Due Date */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Amount <span className="text-red-500">*</span>
              </label>
              <Input
                type="number"
                step="0.01"
                min="0"
                value={formData.amount}
                onChange={(e) => handleInputChange('amount', e.target.value)}
                placeholder="Enter amount"
                error={errors.amount}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Due Date <span className="text-red-500">*</span>
              </label>
              <Input
                type="date"
                value={formData.due_date}
                onChange={(e) => handleInputChange('due_date', e.target.value)}
                error={errors.due_date}
              />
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
            <Link to="/fees">
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
              {isEdit ? 'Update Fees Record' : 'Create Fees Record'}
            </Button>
          </div>
        </form>
      </div>

      {/* Additional Information */}
      <div className="card">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Additional Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Status Options:</h4>
            <ul className="space-y-1">
              <li><strong>Pending:</strong> Payment not yet received</li>
              <li><strong>Paid:</strong> Payment completed</li>
              <li><strong>Overdue:</strong> Payment past due date</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Tips:</h4>
            <ul className="space-y-1">
              <li>• Ensure the amount is accurate</li>
              <li>• Set appropriate due dates</li>
              <li>• Update status when payments are received</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

export default FeesForm