import React, { useState, useEffect } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { ArrowLeft, Save, X, Calendar } from 'lucide-react'
import { useAppContext } from '../../context/AppContext'
import { examService } from '../../services/soapClient'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Select from '../../components/ui/Select'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import ErrorAlert from '../../components/ui/ErrorAlert'
import { validateRequired, validateNumber, validateDate } from '../../utils/validators'

const ExamForm = () => {
  const navigate = useNavigate()
  const { id } = useParams()
  const isEdit = Boolean(id)
  const { state, dispatch } = useAppContext()
  const { courses, loading, error } = state

  const [formData, setFormData] = useState({
    exam_id: '',
    course_id: '',
    exam_date: '',
    exam_time: '',
    max_marks: ''
  })

  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    loadCourses()
    if (isEdit) {
      loadExam()
    }
  }, [id])

  const loadCourses = async () => {
    try {
      const { courseService } = await import('../../services/soapClient')
      const data = await courseService.list()
      dispatch({ type: 'SET_COURSES', payload: data })
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to load courses' })
    }
  }

  const loadExam = async () => {
    dispatch({ type: 'SET_LOADING', payload: true })
    try {
      const data = await examService.get(id)
      const examDateTime = new Date(data.exam_date)
      setFormData({
        exam_id: data.exam_id || '',
        course_id: data.course_id || '',
        exam_date: examDateTime.toISOString().split('T')[0],
        exam_time: examDateTime.toTimeString().slice(0, 5),
        max_marks: data.max_marks || ''
      })
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to load exam' })
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

    // Validate course selection
    if (!validateRequired(formData.course_id)) {
      newErrors.course_id = 'Course is required'
    }

    // Validate exam date
    if (!validateRequired(formData.exam_date)) {
      newErrors.exam_date = 'Exam date is required'
    } else if (!validateDate(formData.exam_date)) {
      newErrors.exam_date = 'Please enter a valid date'
    } else {
      const examDate = new Date(formData.exam_date)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      if (examDate < today) {
        newErrors.exam_date = 'Exam date cannot be in the past'
      }
    }

    // Validate exam time
    if (!validateRequired(formData.exam_time)) {
      newErrors.exam_time = 'Exam time is required'
    }

    // Validate max marks
    if (!validateRequired(formData.max_marks)) {
      newErrors.max_marks = 'Maximum marks is required'
    } else if (!validateNumber(formData.max_marks) || parseInt(formData.max_marks) <= 0) {
      newErrors.max_marks = 'Maximum marks must be a positive number'
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
      // Combine date and time
      const examDateTime = new Date(`${formData.exam_date}T${formData.exam_time}:00`)
      
      const submitData = {
        ...formData,
        exam_date: examDateTime.toISOString(),
        max_marks: parseInt(formData.max_marks)
      }

      if (isEdit) {
        await examService.update(id, submitData)
        dispatch({ type: 'UPDATE_EXAM', payload: { id, data: submitData } })
        dispatch({ 
          type: 'ADD_NOTIFICATION', 
          payload: { type: 'success', message: 'Exam updated successfully' }
        })
      } else {
        const newExam = await examService.create(submitData)
        dispatch({ type: 'ADD_EXAM', payload: newExam })
        dispatch({ 
          type: 'ADD_NOTIFICATION', 
          payload: { type: 'success', message: 'Exam created successfully' }
        })
      }
      
      navigate('/exams')
    } catch (error) {
      dispatch({ 
        type: 'ADD_NOTIFICATION', 
        payload: { 
          type: 'error', 
          message: `Failed to ${isEdit ? 'update' : 'create'} exam: ${error.message}` 
        }
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const getCourseOptions = () => {
    return courses.map(course => ({
      value: course.course_id,
      label: `${course.course_name} (${course.course_id})`
    }))
  }

  if (loading) return <LoadingSpinner />

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link to="/exams">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Exams
            </Button>
          </Link>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {isEdit ? 'Edit Exam' : 'Add New Exam'}
            </h2>
            <p className="text-sm text-gray-500">
              {isEdit ? 'Update exam information' : 'Create a new exam for a course'}
            </p>
          </div>
        </div>
      </div>

      {/* Error Alert */}
      {error && <ErrorAlert message={error} />}

      {/* Form */}
      <div className="card">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Course Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Course <span className="text-red-500">*</span>
            </label>
            <Select
              value={formData.course_id}
              onChange={(value) => handleInputChange('course_id', value)}
              options={getCourseOptions()}
              placeholder="Select a course"
              error={errors.course_id}
            />
          </div>

          {/* Date and Time */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Exam Date <span className="text-red-500">*</span>
              </label>
              <Input
                type="date"
                value={formData.exam_date}
                onChange={(e) => handleInputChange('exam_date', e.target.value)}
                error={errors.exam_date}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Exam Time <span className="text-red-500">*</span>
              </label>
              <Input
                type="time"
                value={formData.exam_time}
                onChange={(e) => handleInputChange('exam_time', e.target.value)}
                error={errors.exam_time}
              />
            </div>
          </div>

          {/* Maximum Marks */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Maximum Marks <span className="text-red-500">*</span>
            </label>
            <Input
              type="number"
              min="1"
              value={formData.max_marks}
              onChange={(e) => handleInputChange('max_marks', e.target.value)}
              placeholder="Enter maximum marks"
              error={errors.max_marks}
            />
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
            <Link to="/exams">
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
              {isEdit ? 'Update Exam' : 'Create Exam'}
            </Button>
          </div>
        </form>
      </div>

      {/* Additional Information */}
      <div className="card">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Exam Guidelines</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Scheduling Tips:</h4>
            <ul className="space-y-1">
              <li>• Schedule exams at least 1 week in advance</li>
              <li>• Avoid scheduling multiple exams on the same day</li>
              <li>• Consider student workload and holidays</li>
              <li>• Allow sufficient time between exams</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Assessment Standards:</h4>
            <ul className="space-y-1">
              <li>• Set appropriate maximum marks</li>
              <li>• Ensure marks align with course credit</li>
              <li>• Consider exam duration when setting marks</li>
              <li>• Maintain consistency across similar courses</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ExamForm