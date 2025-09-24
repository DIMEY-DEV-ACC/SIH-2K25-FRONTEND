import React, { useState, useEffect } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { ArrowLeft, Save, X } from 'lucide-react'
import { useAppContext } from '../../context/AppContext'
import { hostelService } from '../../services/soapClient'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import ErrorAlert from '../../components/ui/ErrorAlert'
import { validateRequired, validateNumber } from '../../utils/validators'

const HostelForm = () => {
  const navigate = useNavigate()
  const { id } = useParams()
  const isEdit = Boolean(id)
  const { state, dispatch } = useAppContext()
  const { loading, error } = state

  const [formData, setFormData] = useState({
    hostel_id: '',
    hostel_name: '',
    capacity: ''
  })

  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (isEdit) {
      loadHostel()
    }
  }, [id])

  const loadHostel = async () => {
    dispatch({ type: 'SET_LOADING', payload: true })
    try {
      const data = await hostelService.get(id)
      setFormData({
        hostel_id: data.hostel_id || '',
        hostel_name: data.hostel_name || '',
        capacity: data.capacity || ''
      })
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to load hostel' })
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

    if (!validateRequired(formData.hostel_name)) {
      newErrors.hostel_name = 'Hostel name is required'
    }

    if (!validateRequired(formData.capacity)) {
      newErrors.capacity = 'Capacity is required'
    } else if (!validateNumber(formData.capacity) || parseInt(formData.capacity) <= 0) {
      newErrors.capacity = 'Capacity must be a positive number'
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
        capacity: parseInt(formData.capacity)
      }

      if (isEdit) {
        await hostelService.update(id, submitData)
        dispatch({ type: 'UPDATE_HOSTEL', payload: { id, data: submitData } })
        dispatch({ 
          type: 'ADD_NOTIFICATION', 
          payload: { type: 'success', message: 'Hostel updated successfully' }
        })
      } else {
        const newHostel = await hostelService.create(submitData)
        dispatch({ type: 'ADD_HOSTEL', payload: newHostel })
        dispatch({ 
          type: 'ADD_NOTIFICATION', 
          payload: { type: 'success', message: 'Hostel created successfully' }
        })
      }
      
      navigate('/hostels')
    } catch (error) {
      dispatch({ 
        type: 'ADD_NOTIFICATION', 
        payload: { 
          type: 'error', 
          message: `Failed to ${isEdit ? 'update' : 'create'} hostel: ${error.message}` 
        }
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) return <LoadingSpinner />

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link to="/hostels">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Hostels
            </Button>
          </Link>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {isEdit ? 'Edit Hostel' : 'Add New Hostel'}
            </h2>
            <p className="text-sm text-gray-500">
              {isEdit ? 'Update hostel information' : 'Create a new hostel facility'}
            </p>
          </div>
        </div>
      </div>

      {/* Error Alert */}
      {error && <ErrorAlert message={error} />}

      {/* Form */}
      <div className="card">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Hostel Name <span className="text-red-500">*</span>
            </label>
            <Input
              type="text"
              value={formData.hostel_name}
              onChange={(e) => handleInputChange('hostel_name', e.target.value)}
              placeholder="Enter hostel name"
              error={errors.hostel_name}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Capacity <span className="text-red-500">*</span>
            </label>
            <Input
              type="number"
              min="1"
              value={formData.capacity}
              onChange={(e) => handleInputChange('capacity', e.target.value)}
              placeholder="Enter maximum capacity"
              error={errors.capacity}
            />
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
            <Link to="/hostels">
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
              {isEdit ? 'Update Hostel' : 'Create Hostel'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default HostelForm