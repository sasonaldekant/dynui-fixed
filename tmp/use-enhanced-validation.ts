import { useState, useCallback, useEffect, useMemo } from 'react'

// Validation rule types
export interface ValidationRule {
  type: 'required' | 'email' | 'phone' | 'url' | 'min' | 'max' | 'pattern' | 'custom' | 'async'
  message: string
  value?: any // For min/max validation
  pattern?: RegExp // For pattern validation
  customValidator?: (value: any, formData?: any) => boolean
  asyncValidator?: (value: any, formData?: any) => Promise<boolean>
  dependencies?: string[] // For cross-field validation
}

// Validation options
export interface ValidationOptions {
  validateOnChange?: boolean
  validateOnBlur?: boolean
  validateOnMount?: boolean
  debounceMs?: number
  stopOnFirstError?: boolean
}

// Validation result
export interface ValidationResult {
  isValid: boolean
  isValidating: boolean
  errors: string[]
  hasError: boolean
  errorMessage?: string
  validate: () => Promise<boolean>
  reset: () => void
  setCustomError: (error?: string) => void
}

// Default options
const DEFAULT_OPTIONS: Required<ValidationOptions> = {
  validateOnChange: true,
  validateOnBlur: true,
  validateOnMount: false,
  debounceMs: 300,
  stopOnFirstError: false,
}

// Built-in validators
const VALIDATORS = {
  required: (value: any): boolean => {
    if (typeof value === 'string') return value.trim().length > 0
    if (Array.isArray(value)) return value.length > 0
    if (typeof value === 'boolean') return value
    return value != null && value !== undefined && value !== ''
  },
  
  email: (value: string): boolean => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
    return emailRegex.test(value)
  },
  
  phone: (value: string): boolean => {
    // International phone number validation
    const phoneRegex = /^[\+]?[(]?[\+]?\d{1,4}[)]?[-\s\.]?[(]?\d{1,3}[)]?[-\s\.]?\d{1,4}[-\s\.]?\d{1,9}$/
    return phoneRegex.test(value.replace(/\s/g, ''))
  },
  
  url: (value: string): boolean => {
    try {
      const url = new URL(value)
      return ['http:', 'https:', 'ftp:'].includes(url.protocol)
    } catch {
      return false
    }
  },
  
  min: (value: any, minValue: any): boolean => {
    if (typeof value === 'number' && typeof minValue === 'number') {
      return value >= minValue
    }
    if (typeof value === 'string' && typeof minValue === 'number') {
      return value.length >= minValue
    }
    return false
  },
  
  max: (value: any, maxValue: any): boolean => {
    if (typeof value === 'number' && typeof maxValue === 'number') {
      return value <= maxValue
    }
    if (typeof value === 'string' && typeof maxValue === 'number') {
      return value.length <= maxValue
    }
    return false
  },
  
  pattern: (value: string, pattern: RegExp): boolean => {
    return pattern.test(value)
  }
}

// Debounce utility
function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): T {
  let timeoutId: NodeJS.Timeout
  return ((...args: Parameters<T>) => {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => func.apply(null, args), delay)
  }) as T
}

/**
 * Enhanced validation hook with real-time validation, async support, and debouncing
 * 
 * @param value - Current field value
 * @param rules - Array of validation rules to apply
 * @param options - Validation behavior options
 * @param formData - Optional form data for cross-field validation
 * @returns Validation result with error state and validation functions
 */
export function useEnhancedValidation<T = any>(
  value: T,
  rules: ValidationRule[] = [],
  options: ValidationOptions = {},
  formData?: Record<string, any>
): ValidationResult {
  const opts = { ...DEFAULT_OPTIONS, ...options }
  
  const [errors, setErrors] = useState<string[]>([])
  const [customError, setCustomError] = useState<string | undefined>()
  const [isValidating, setIsValidating] = useState(false)
  const [hasValidated, setHasValidated] = useState(false)

  // Validate a single rule
  const validateRule = useCallback(async (rule: ValidationRule, currentValue: T): Promise<string | null> => {
    try {
      let isValid = false
      
      switch (rule.type) {
        case 'required':
          isValid = VALIDATORS.required(currentValue)
          break
        case 'email':
          isValid = !currentValue || VALIDATORS.email(currentValue as string)
          break
        case 'phone':
          isValid = !currentValue || VALIDATORS.phone(currentValue as string)
          break
        case 'url':
          isValid = !currentValue || VALIDATORS.url(currentValue as string)
          break
        case 'min':
          isValid = !currentValue || VALIDATORS.min(currentValue, rule.value)
          break
        case 'max':
          isValid = !currentValue || VALIDATORS.max(currentValue, rule.value)
          break
        case 'pattern':
          isValid = !currentValue || VALIDATORS.pattern(currentValue as string, rule.pattern!)
          break
        case 'custom':
          if (rule.customValidator) {
            isValid = rule.customValidator(currentValue, formData)
          }
          break
        case 'async':
          if (rule.asyncValidator) {
            isValid = await rule.asyncValidator(currentValue, formData)
          }
          break
        default:
          console.warn(`Unknown validation rule type: ${rule.type}`)
          return null
      }
      
      return isValid ? null : rule.message
    } catch (error) {
      console.error(`Validation error for rule ${rule.type}:`, error)
      return rule.message
    }
  }, [formData])

  // Main validation function
  const validate = useCallback(async (): Promise<boolean> => {
    if (rules.length === 0 && !customError) {
      setErrors([])
      return true
    }

    setIsValidating(true)
    const newErrors: string[] = []
    
    // Add custom error if present
    if (customError) {
      newErrors.push(customError)
    }

    // Validate all rules
    for (const rule of rules) {
      const error = await validateRule(rule, value)
      if (error) {
        newErrors.push(error)
        if (opts.stopOnFirstError) {
          break
        }
      }
    }

    setErrors(newErrors)
    setIsValidating(false)
    setHasValidated(true)
    
    return newErrors.length === 0
  }, [value, rules, customError, validateRule, opts.stopOnFirstError])

  // Debounced validation for onChange
  const debouncedValidate = useMemo(
    () => debounce(validate, opts.debounceMs),
    [validate, opts.debounceMs]
  )

  // Auto-validate on value change
  useEffect(() => {
    if (opts.validateOnChange && hasValidated) {
      debouncedValidate()
    }
  }, [value, debouncedValidate, opts.validateOnChange, hasValidated])

  // Validate on mount if requested
  useEffect(() => {
    if (opts.validateOnMount) {
      validate()
    }
  }, []) // Empty dependency array for mount-only effect

  // Reset validation state
  const reset = useCallback(() => {
    setErrors([])
    setCustomError(undefined)
    setIsValidating(false)
    setHasValidated(false)
  }, [])

  // Set custom error
  const setCustomErrorHandler = useCallback((error?: string) => {
    setCustomError(error)
    if (error) {
      setHasValidated(true)
    }
  }, [])

  // Computed validation state
  const allErrors = [...(customError ? [customError] : []), ...errors]
  const isValid = allErrors.length === 0 && !isValidating
  const hasError = allErrors.length > 0
  const errorMessage = allErrors[0]

  return {
    isValid,
    isValidating,
    errors: allErrors,
    hasError,
    errorMessage,
    validate,
    reset,
    setCustomError: setCustomErrorHandler,
  }
}

/**
 * Simple validation hook for basic use cases
 */
export function useSimpleValidation(
  value: any,
  required: boolean = false,
  customValidator?: (value: any) => string | undefined
): { error?: string; validate: () => boolean } {
  const [error, setError] = useState<string | undefined>()
  
  const validate = useCallback(() => {
    // Required validation
    if (required && !VALIDATORS.required(value)) {
      setError('This field is required')
      return false
    }
    
    // Custom validation
    if (customValidator) {
      const customError = customValidator(value)
      if (customError) {
        setError(customError)
        return false
      }
    }
    
    setError(undefined)
    return true
  }, [value, required, customValidator])
  
  return { error, validate }
}

// Re-export types
export type { ValidationRule, ValidationOptions, ValidationResult }