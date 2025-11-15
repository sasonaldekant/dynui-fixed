import React, { useState, useRef, useCallback, useEffect, forwardRef, useImperativeHandle } from 'react'
import { cn } from '../utils/classNames'
import type { Size } from '../types/common.types'
import { DynFieldContainer } from './dyn-field-container'

// Validation types
interface ValidationRule {
  type: 'required' | 'custom'
  message: string
  customValidator?: (checked: boolean) => boolean
}

// Enhanced DynCheckbox props
interface DynCheckboxEnhancedProps {
  /** Checkbox checked state */
  checked?: boolean
  /** Default checked state (uncontrolled) */
  defaultChecked?: boolean
  /** Indeterminate state (for tree selection) */
  indeterminate?: boolean
  /** Input name attribute */
  name?: string
  /** Input ID */
  id?: string
  /** Whether checkbox is disabled */
  disabled?: boolean
  /** Whether checkbox is required */
  required?: boolean
  /** Whether checkbox is readonly */
  readonly?: boolean
  /** Size variant */
  size?: Size
  /** Custom className */
  className?: string
  
  /** Label text */
  label?: string
  /** Description text */
  description?: string
  /** Error message */
  error?: string
  /** Warning message */
  warning?: string
  /** Success message */
  success?: string
  
  /** Validation rules */
  validation?: ValidationRule[]
  /** Loading state */
  loading?: boolean
  
  /** Change handler */
  onChange?: (checked: boolean, indeterminate?: boolean) => void
  /** Blur handler */
  onBlur?: (event: React.FocusEvent<HTMLInputElement>) => void
  /** Focus handler */
  onFocus?: (event: React.FocusEvent<HTMLInputElement>) => void
  
  /** ARIA attributes */
  'aria-label'?: string
  'aria-labelledby'?: string
  'aria-describedby'?: string
  /** Test identifier */
  'data-testid'?: string
}

// Checkbox reference methods
interface DynCheckboxEnhancedRef {
  focus: () => void
  blur: () => void
  toggle: () => void
  setChecked: (checked: boolean) => void
  setIndeterminate: (indeterminate: boolean) => void
  getChecked: () => boolean
  getIndeterminate: () => boolean
  validate: () => boolean
  getElement: () => HTMLInputElement | null
}

export const DynCheckboxEnhanced = forwardRef<DynCheckboxEnhancedRef, DynCheckboxEnhancedProps>(
  ({
    checked: checkedProp,
    defaultChecked = false,
    indeterminate = false,
    name,
    id,
    disabled = false,
    required = false,
    readonly = false,
    size = 'md',
    className,
    
    label,
    description,
    error,
    warning,
    success,
    
    validation = [],
    loading = false,
    
    onChange,
    onBlur,
    onFocus,
    
    'aria-label': ariaLabel,
    'aria-labelledby': ariaLabelledby,
    'aria-describedby': ariaDescribedby,
    'data-testid': dataTestId,
  }, ref) => {
    const inputRef = useRef<HTMLInputElement>(null)
    const [checked, setChecked] = useState(checkedProp ?? defaultChecked)
    const [isIndeterminate, setIsIndeterminate] = useState(indeterminate)
    const [validationErrors, setValidationErrors] = useState<string[]>([])
    const [hasInteracted, setHasInteracted] = useState(false)
    
    // Validation logic
    const validateCheckbox = useCallback((checked: boolean): string[] => {
      const errors: string[] = []
      
      for (const rule of validation) {
        let isValid = false
        
        switch (rule.type) {
          case 'required':
            isValid = checked
            break
          case 'custom':
            isValid = !rule.customValidator || rule.customValidator(checked)
            break
        }
        
        if (!isValid) {
          errors.push(rule.message)
        }
      }
      
      return errors
    }, [validation])
    
    // Handle checkbox change
    const handleChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
      if (readonly || disabled || loading) return
      
      const newChecked = event.target.checked
      setChecked(newChecked)
      setIsIndeterminate(false) // Clear indeterminate when user interacts
      setHasInteracted(true)
      
      // Validate on change
      const errors = validateCheckbox(newChecked)
      setValidationErrors(errors)
      
      onChange?.(newChecked, false)
    }, [readonly, disabled, loading, validateCheckbox, onChange])
    
    // Handle blur
    const handleBlur = useCallback((event: React.FocusEvent<HTMLInputElement>) => {
      setHasInteracted(true)
      
      // Validate on blur
      const errors = validateCheckbox(checked)
      setValidationErrors(errors)
      
      onBlur?.(event)
    }, [validateCheckbox, checked, onBlur])
    
    // Handle focus
    const handleFocus = useCallback((event: React.FocusEvent<HTMLInputElement>) => {
      onFocus?.(event)
    }, [onFocus])
    
    // Handle keyboard interactions
    const handleKeyDown = useCallback((event: React.KeyboardEvent<HTMLInputElement>) => {
      if (event.key === ' ' || event.key === 'Enter') {
        event.preventDefault()
        if (readonly || disabled || loading) return
        
        const newChecked = !checked
        setChecked(newChecked)
        setIsIndeterminate(false)
        setHasInteracted(true)
        
        const errors = validateCheckbox(newChecked)
        setValidationErrors(errors)
        
        onChange?.(newChecked, false)
      }
    }, [readonly, disabled, loading, checked, validateCheckbox, onChange])
    
    // Sync controlled props
    useEffect(() => {
      if (checkedProp !== undefined) {
        setChecked(checkedProp)
      }
    }, [checkedProp])
    
    useEffect(() => {
      setIsIndeterminate(indeterminate)
    }, [indeterminate])
    
    // Update input indeterminate property
    useEffect(() => {
      if (inputRef.current) {
        inputRef.current.indeterminate = isIndeterminate
      }
    }, [isIndeterminate])
    
    // Expose ref methods
    useImperativeHandle(ref, () => ({
      focus: () => inputRef.current?.focus(),
      blur: () => inputRef.current?.blur(),
      toggle: () => {
        if (readonly || disabled || loading) return
        const newChecked = !checked
        setChecked(newChecked)
        setIsIndeterminate(false)
        onChange?.(newChecked, false)
      },
      setChecked: (newChecked: boolean) => {
        setChecked(newChecked)
        setIsIndeterminate(false)
        onChange?.(newChecked, false)
      },
      setIndeterminate: (newIndeterminate: boolean) => {
        setIsIndeterminate(newIndeterminate)
        onChange?.(checked, newIndeterminate)
      },
      getChecked: () => checked,
      getIndeterminate: () => isIndeterminate,
      validate: () => {
        const errors = validateCheckbox(checked)
        setValidationErrors(errors)
        return errors.length === 0
      },
      getElement: () => inputRef.current,
    }), [checked, isIndeterminate, readonly, disabled, loading, validateCheckbox, onChange])
    
    // Determine validation state
    const hasError = Boolean(error || validationErrors.length > 0)
    const hasWarning = Boolean(warning && !hasError)
    const hasSuccess = Boolean(success && !hasError && !hasWarning)
    
    const currentError = error || validationErrors[0]
    
    // Visual state for styling
    const getVisualState = () => {
      if (loading) return 'loading'
      if (isIndeterminate) return 'indeterminate'
      if (checked) return 'checked'
      return 'unchecked'
    }
    
    return (
      <DynFieldContainer
        description={description}
        error={currentError}
        warning={warning}
        success={success}
        required={required}
        disabled={disabled}
        size={size}
        className={className}
      >
        <label
          className={cn(
            'dyn-checkbox',
            `dyn-checkbox--${size}`,
            `dyn-checkbox--${getVisualState()}`,
            hasError && 'dyn-checkbox--error',
            hasWarning && 'dyn-checkbox--warning',
            hasSuccess && 'dyn-checkbox--success',
            disabled && 'dyn-checkbox--disabled',
            readonly && 'dyn-checkbox--readonly',
            loading && 'dyn-checkbox--loading'
          )}
          htmlFor={id}
        >
          <div className="dyn-checkbox__input-container">
            <input
              ref={inputRef}
              type="checkbox"
              id={id}
              name={name}
              checked={checked}
              disabled={disabled || loading}
              readOnly={readonly}
              required={required}
              className="dyn-checkbox__input"
              onChange={handleChange}
              onBlur={handleBlur}
              onFocus={handleFocus}
              onKeyDown={handleKeyDown}
              aria-label={ariaLabel}
              aria-labelledby={ariaLabelledby}
              aria-describedby={ariaDescribedby}
              data-testid={dataTestId}
            />
            
            <div
              className={cn(
                'dyn-checkbox__box',
                `dyn-checkbox__box--${size}`,
                `dyn-checkbox__box--${getVisualState()}`
              )}
              aria-hidden="true"
            >
              {loading ? (
                <div className="dyn-checkbox__loading">
                  <svg
                    className="dyn-checkbox__loading-spinner"
                    viewBox="0 0 16 16"
                    fill="none"
                  >
                    <circle
                      cx="8"
                      cy="8"
                      r="7"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeDasharray="31.416"
                      strokeDashoffset="31.416"
                      className="dyn-checkbox__loading-circle"
                    />
                  </svg>
                </div>
              ) : isIndeterminate ? (
                <svg
                  className="dyn-checkbox__indeterminate-icon"
                  viewBox="0 0 16 16"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <rect x="4" y="7.5" width="8" height="1" rx="0.5" />
                </svg>
              ) : checked ? (
                <svg
                  className="dyn-checkbox__check-icon"
                  viewBox="0 0 16 16"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M13.78 4.22a.75.75 0 010 1.06l-7.25 7.25a.75.75 0 01-1.06 0L2.22 9.28a.75.75 0 011.06-1.06L6 10.94l6.72-6.72a.75.75 0 011.06 0z"
                    clipRule="evenodd"
                  />
                </svg>
              ) : null}
            </div>
          </div>
          
          {label && (
            <span className="dyn-checkbox__label">
              {label}
              {required && (
                <span 
                  className="dyn-checkbox__required-indicator"
                  aria-label="required"
                >
                  *
                </span>
              )}
            </span>
          )}
        </label>
      </DynFieldContainer>
    )
  }
)

DynCheckboxEnhanced.displayName = 'DynCheckboxEnhanced'

// Export types
export type { DynCheckboxEnhancedProps, DynCheckboxEnhancedRef, ValidationRule }
export default DynCheckboxEnhanced