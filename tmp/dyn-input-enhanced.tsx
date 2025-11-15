import React, { useState, useRef, useCallback, useEffect, forwardRef, useImperativeHandle } from 'react'
import { cn } from '../utils/classNames'
import type { Size, Color } from '../types/common.types'
import { DynFieldContainer } from './dyn-field-container'
import { DynIcon, CloseIcon } from './dyn-icon'

// Validation types
interface ValidationRule {
  type: 'required' | 'email' | 'phone' | 'url' | 'min' | 'max' | 'pattern' | 'custom'
  message: string
  value?: any
  pattern?: RegExp
  customValidator?: (value: string) => boolean
}

// Masking types
type MaskPattern = string | ((value: string) => string)

interface MaskOptions {
  pattern: MaskPattern
  placeholder?: string
  showMask?: boolean
}

// Enhanced DynInput props
interface DynInputEnhancedProps {
  /** Input type */
  type?: 'text' | 'email' | 'password' | 'tel' | 'url' | 'number' | 'search'
  /** Input value (controlled) */
  value?: string
  /** Default value (uncontrolled) */
  defaultValue?: string
  /** Input name attribute */
  name?: string
  /** Input ID */
  id?: string
  /** Placeholder text */
  placeholder?: string
  /** Whether input is disabled */
  disabled?: boolean
  /** Whether input is required */
  required?: boolean
  /** Whether input is readonly */
  readonly?: boolean
  /** Size variant */
  size?: Size
  /** Visual variant */
  variant?: 'outline' | 'filled' | 'underline'
  /** Custom className */
  className?: string
  
  /** Label for field container */
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
  /** Validate on change */
  validateOnChange?: boolean
  /** Validate on blur */
  validateOnBlur?: boolean
  
  /** Input masking */
  mask?: string | MaskOptions
  /** Show clear/clean button */
  showCleanButton?: boolean
  /** Loading state */
  loading?: boolean
  
  /** Start icon */
  startIcon?: React.ReactNode
  /** End icon */
  endIcon?: React.ReactNode
  /** Prefix content */
  prefix?: React.ReactNode
  /** Suffix content */
  suffix?: React.ReactNode
  
  /** Change handler */
  onChange?: (value: string) => void
  /** Blur handler */
  onBlur?: (event: React.FocusEvent<HTMLInputElement>) => void
  /** Focus handler */
  onFocus?: (event: React.FocusEvent<HTMLInputElement>) => void
  /** Clean button handler */
  onClean?: () => void
  
  /** ARIA attributes */
  'aria-label'?: string
  'aria-labelledby'?: string
  'aria-describedby'?: string
  /** Test identifier */
  'data-testid'?: string
}

// Input reference methods
interface DynInputEnhancedRef {
  focus: () => void
  blur: () => void
  clear: () => void
  getValue: () => string
  setValue: (value: string) => void
  validate: () => boolean
  getElement: () => HTMLInputElement | null
}

// Built-in validators
const VALIDATORS = {
  required: (value: string): boolean => value.trim().length > 0,
  email: (value: string): boolean => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
  phone: (value: string): boolean => /^[\+]?[1-9]?\d{9,15}$/.test(value.replace(/[\s\-\(\)]/g, '')),
  url: (value: string): boolean => {
    try {
      new URL(value)
      return true
    } catch {
      return false
    }
  },
}

// Masking utility
function applyMask(value: string, mask: string): string {
  let maskedValue = ''
  let valueIndex = 0
  
  for (let i = 0; i < mask.length && valueIndex < value.length; i++) {
    const maskChar = mask[i]
    const inputChar = value[valueIndex]
    
    if (maskChar === '9') {
      // Digit placeholder
      if (/\d/.test(inputChar)) {
        maskedValue += inputChar
        valueIndex++
      } else {
        break
      }
    } else if (maskChar === 'A') {
      // Letter placeholder
      if (/[A-Za-z]/.test(inputChar)) {
        maskedValue += inputChar.toUpperCase()
        valueIndex++
      } else {
        break
      }
    } else if (maskChar === '*') {
      // Any character placeholder
      maskedValue += inputChar
      valueIndex++
    } else {
      // Literal character
      maskedValue += maskChar
    }
  }
  
  return maskedValue
}

// Remove mask characters
function removeMask(value: string, mask: string): string {
  const maskChars = new Set([...mask].filter(char => !/[9A*]/.test(char)))
  return value.split('').filter(char => !maskChars.has(char)).join('')
}

export const DynInputEnhanced = forwardRef<DynInputEnhancedRef, DynInputEnhancedProps>(
  ({
    type = 'text',
    value,
    defaultValue,
    name,
    id,
    placeholder,
    disabled = false,
    required = false,
    readonly = false,
    size = 'md',
    variant = 'outline',
    className,
    
    label,
    description,
    error,
    warning,
    success,
    
    validation = [],
    validateOnChange = true,
    validateOnBlur = true,
    
    mask,
    showCleanButton = false,
    loading = false,
    
    startIcon,
    endIcon,
    prefix,
    suffix,
    
    onChange,
    onBlur,
    onFocus,
    onClean,
    
    'aria-label': ariaLabel,
    'aria-labelledby': ariaLabelledby,
    'aria-describedby': ariaDescribedby,
    'data-testid': dataTestId,
  }, ref) => {
    const inputRef = useRef<HTMLInputElement>(null)
    const [inputValue, setInputValue] = useState(value || defaultValue || '')
    const [validationErrors, setValidationErrors] = useState<string[]>([])
    const [isFocused, setIsFocused] = useState(false)
    const [hasInteracted, setHasInteracted] = useState(false)
    
    // Mask configuration
    const maskConfig = typeof mask === 'string' ? { pattern: mask } : mask
    const maskPattern = maskConfig?.pattern
    
    // Validation logic
    const validateInput = useCallback((inputValue: string): string[] => {
      const errors: string[] = []
      
      for (const rule of validation) {
        let isValid = false
        
        switch (rule.type) {
          case 'required':
            isValid = VALIDATORS.required(inputValue)
            break
          case 'email':
            isValid = !inputValue || VALIDATORS.email(inputValue)
            break
          case 'phone':
            isValid = !inputValue || VALIDATORS.phone(inputValue)
            break
          case 'url':
            isValid = !inputValue || VALIDATORS.url(inputValue)
            break
          case 'min':
            isValid = !inputValue || inputValue.length >= (rule.value || 0)
            break
          case 'max':
            isValid = !inputValue || inputValue.length <= (rule.value || Infinity)
            break
          case 'pattern':
            isValid = !inputValue || !rule.pattern || rule.pattern.test(inputValue)
            break
          case 'custom':
            isValid = !inputValue || !rule.customValidator || rule.customValidator(inputValue)
            break
        }
        
        if (!isValid) {
          errors.push(rule.message)
        }
      }
      
      return errors
    }, [validation])
    
    // Handle input change
    const handleChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
      let newValue = event.target.value
      
      // Apply masking if configured
      if (maskPattern && typeof maskPattern === 'string') {
        newValue = applyMask(newValue.replace(/\D/g, ''), maskPattern)
      }
      
      setInputValue(newValue)
      setHasInteracted(true)
      
      // Real-time validation
      if (validateOnChange && hasInteracted) {
        const errors = validateInput(newValue)
        setValidationErrors(errors)
      }
      
      // Notify parent with unmasked value if needed
      const outputValue = maskPattern && typeof maskPattern === 'string' 
        ? removeMask(newValue, maskPattern)
        : newValue
      onChange?.(outputValue)
    }, [maskPattern, validateOnChange, hasInteracted, validateInput, onChange])
    
    // Handle blur
    const handleBlur = useCallback((event: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(false)
      setHasInteracted(true)
      
      if (validateOnBlur) {
        const errors = validateInput(inputValue)
        setValidationErrors(errors)
      }
      
      onBlur?.(event)
    }, [validateOnBlur, validateInput, inputValue, onBlur])
    
    // Handle focus
    const handleFocus = useCallback((event: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(true)
      onFocus?.(event)
    }, [onFocus])
    
    // Handle clean button
    const handleClean = useCallback(() => {
      setInputValue('')
      setValidationErrors([])
      onChange?.('')
      onClean?.()
      inputRef.current?.focus()
    }, [onChange, onClean])
    
    // Sync controlled value
    useEffect(() => {
      if (value !== undefined) {
        setInputValue(value)
      }
    }, [value])
    
    // Expose ref methods
    useImperativeHandle(ref, () => ({
      focus: () => inputRef.current?.focus(),
      blur: () => inputRef.current?.blur(),
      clear: handleClean,
      getValue: () => inputValue,
      setValue: (newValue: string) => {
        setInputValue(newValue)
        onChange?.(newValue)
      },
      validate: () => {
        const errors = validateInput(inputValue)
        setValidationErrors(errors)
        return errors.length === 0
      },
      getElement: () => inputRef.current,
    }), [inputValue, validateInput, handleClean, onChange])
    
    // Determine validation state
    const hasError = Boolean(error || validationErrors.length > 0)
    const hasWarning = Boolean(warning && !hasError)
    const hasSuccess = Boolean(success && !hasError && !hasWarning)
    
    const currentError = error || validationErrors[0]
    
    // Build input container classes
    const containerClasses = cn(
      'dyn-input-container',
      `dyn-input-container--${size}`,
      `dyn-input-container--${variant}`,
      isFocused && 'dyn-input-container--focused',
      hasError && 'dyn-input-container--error',
      hasWarning && 'dyn-input-container--warning', 
      hasSuccess && 'dyn-input-container--success',
      loading && 'dyn-input-container--loading',
      disabled && 'dyn-input-container--disabled',
      readonly && 'dyn-input-container--readonly',
      (startIcon || prefix) && 'dyn-input-container--has-prefix',
      (endIcon || suffix || showCleanButton || loading) && 'dyn-input-container--has-suffix',
      className
    )
    
    // Build input classes
    const inputClasses = cn(
      'dyn-input',
      `dyn-input--${size}`,
      `dyn-input--${variant}`
    )
    
    const showCleanAction = showCleanButton && inputValue && !readonly && !disabled
    
    return (
      <DynFieldContainer
        label={label}
        description={description}
        error={currentError}
        warning={warning}
        success={success}
        required={required}
        disabled={disabled}
        size={size}
      >
        <div className={containerClasses}>
          {/* Prefix section */}
          {(startIcon || prefix) && (
            <div className="dyn-input__prefix">
              {startIcon && (
                <span className="dyn-input__start-icon" aria-hidden="true">
                  {startIcon}
                </span>
              )}
              {prefix && (
                <span className="dyn-input__prefix-content">
                  {prefix}
                </span>
              )}
            </div>
          )}
          
          {/* Input element */}
          <input
            ref={inputRef}
            type={type}
            id={id}
            name={name}
            value={inputValue}
            placeholder={placeholder}
            disabled={disabled}
            required={required}
            readOnly={readonly}
            className={inputClasses}
            onChange={handleChange}
            onBlur={handleBlur}
            onFocus={handleFocus}
            aria-label={ariaLabel}
            aria-labelledby={ariaLabelledby}
            aria-describedby={ariaDescribedby}
            data-testid={dataTestId}
          />
          
          {/* Suffix section */}
          {(endIcon || suffix || showCleanAction || loading) && (
            <div className="dyn-input__suffix">
              {loading && (
                <div className="dyn-input__loading" aria-hidden="true">
                  <svg
                    className="dyn-input__loading-spinner"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <circle
                      className="dyn-input__loading-circle"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="dyn-input__loading-path"
                      fill="currentColor"
                      d="m12 2a10 10 0 0 1 10 10h-4a6 6 0 0 0-6-6v-4z"
                    />
                  </svg>
                </div>
              )}
              
              {showCleanAction && (
                <button
                  type="button"
                  className="dyn-input__clean-button"
                  onClick={handleClean}
                  aria-label="Clear field"
                  tabIndex={-1}
                >
                  <CloseIcon />
                </button>
              )}
              
              {suffix && (
                <span className="dyn-input__suffix-content">
                  {suffix}
                </span>
              )}
              
              {endIcon && (
                <span className="dyn-input__end-icon" aria-hidden="true">
                  {endIcon}
                </span>
              )}
            </div>
          )}
        </div>
      </DynFieldContainer>
    )
  }
)

DynInputEnhanced.displayName = 'DynInputEnhanced'

// Export types
export type { DynInputEnhancedProps, DynInputEnhancedRef, ValidationRule, MaskOptions }
export default DynInputEnhanced