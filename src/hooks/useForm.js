import { useState, useCallback } from 'react';
import { validateForm } from '../utils/validators';

// Custom hook for form management
export const useForm = (initialValues = {}, validationRules = {}) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handle input changes
  const handleChange = useCallback((name, value) => {
    setValues(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  }, [errors]);

  // Handle input blur (mark field as touched)
  const handleBlur = useCallback((name) => {
    setTouched(prev => ({
      ...prev,
      [name]: true
    }));

    // Validate this field on blur
    if (validationRules[name]) {
      const fieldRules = validationRules[name];
      const value = values[name];
      
      for (const rule of fieldRules) {
        const error = rule(value);
        if (error) {
          setErrors(prev => ({
            ...prev,
            [name]: error
          }));
          break;
        }
      }
    }
  }, [validationRules, values]);

  // Validate entire form
  const validate = useCallback(() => {
    const validation = validateForm(values, validationRules);
    setErrors(validation.errors);
    return validation.isValid;
  }, [values, validationRules]);

  // Handle form submission
  const handleSubmit = useCallback(async (onSubmit) => {
    setIsSubmitting(true);
    
    // Mark all fields as touched
    const allTouched = {};
    Object.keys(validationRules).forEach(field => {
      allTouched[field] = true;
    });
    setTouched(allTouched);

    // Validate form
    const isValid = validate();
    
    if (isValid) {
      try {
        await onSubmit(values);
      } catch (error) {
        console.error('Form submission error:', error);
      }
    }
    
    setIsSubmitting(false);
    return isValid;
  }, [values, validate, validationRules]);

  // Reset form
  const reset = useCallback((newValues = initialValues) => {
    setValues(newValues);
    setErrors({});
    setTouched({});
    setIsSubmitting(false);
  }, [initialValues]);

  // Set form values (useful for editing)
  const setFormValues = useCallback((newValues) => {
    setValues(prev => ({
      ...prev,
      ...newValues
    }));
  }, []);

  // Set specific field value
  const setFieldValue = useCallback((name, value) => {
    handleChange(name, value);
  }, [handleChange]);

  // Set field error
  const setFieldError = useCallback((name, error) => {
    setErrors(prev => ({
      ...prev,
      [name]: error
    }));
  }, []);

  // Get field props for input components
  const getFieldProps = useCallback((name) => ({
    name,
    value: values[name] || '',
    onChange: (e) => {
      const value = e.target ? e.target.value : e;
      handleChange(name, value);
    },
    onBlur: () => handleBlur(name),
    error: touched[name] ? errors[name] : null
  }), [values, errors, touched, handleChange, handleBlur]);

  // Check if form is valid
  const isValid = Object.keys(errors).length === 0;

  // Check if form has been modified
  const isDirty = JSON.stringify(values) !== JSON.stringify(initialValues);

  return {
    values,
    errors,
    touched,
    isSubmitting,
    isValid,
    isDirty,
    handleChange,
    handleBlur,
    handleSubmit,
    validate,
    reset,
    setFormValues,
    setFieldValue,
    setFieldError,
    getFieldProps
  };
};

export default useForm;