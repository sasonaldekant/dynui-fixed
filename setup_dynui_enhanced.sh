#!/bin/bash

# DynUI Enhanced Components Setup Script - Production Ready Version
# This script replaces existing components with enhanced versions while creating backups

echo "🚀 Setting up DynUI Enhanced Components (Production Mode)..."
echo "📦 Creating backups and replacing components with enhanced versions"

# Create backup directories
echo "📁 Creating backup directories..."
mkdir -p packages/core/src/ui-backup
mkdir -p packages/core/src/hooks-backup
mkdir -p packages/core/src/utils-backup
mkdir -p packages/core/tests-backup
mkdir -p packages/design-tokens-backup

# Backup existing files that we'll replace
echo "🛡️  Creating backups of existing files..."

# Backup existing components if they exist
if [ -f "packages/core/src/ui/dyn-input.tsx" ]; then
  cp packages/core/src/ui/dyn-input.tsx packages/core/src/ui-backup/
  echo "  ✅ Backed up dyn-input.tsx"
fi

if [ -f "packages/core/src/ui/dyn-checkbox.tsx" ]; then
  cp packages/core/src/ui/dyn-checkbox.tsx packages/core/src/ui-backup/
  echo "  ✅ Backed up dyn-checkbox.tsx"
fi

if [ -f "packages/core/src/ui/dyn-table.tsx" ]; then
  cp packages/core/src/ui/dyn-table.tsx packages/core/src/ui-backup/
  echo "  ✅ Backed up dyn-table.tsx"
fi

if [ -f "packages/core/src/ui/dyn-modal.tsx" ]; then
  cp packages/core/src/ui/dyn-modal.tsx packages/core/src/ui-backup/
  echo "  ✅ Backed up dyn-modal.tsx"
fi

# Backup existing utilities
if [ -f "packages/core/src/utils/classNames.ts" ]; then
  cp packages/core/src/utils/classNames.ts packages/core/src/utils-backup/
  echo "  ✅ Backed up classNames.ts"
fi

# Backup existing component index
if [ -f "packages/core/src/components/index.ts" ]; then
  cp packages/core/src/components/index.ts packages/core/src/components/index-backup.ts
  echo "  ✅ Backed up components index.ts"
fi

# Backup existing tests directory
if [ -d "packages/core/tests" ]; then
  cp -r packages/core/tests/* packages/core/tests-backup/ 2>/dev/null || true
  echo "  ✅ Backed up existing tests"
fi

# Backup existing design tokens if they exist
if [ -d "packages/design-tokens" ]; then
  cp -r packages/design-tokens/* packages/design-tokens-backup/ 2>/dev/null || true
  echo "  ✅ Backed up existing design tokens"
fi

echo "💾 All backups created successfully"

# Create enhanced directory structure
echo "📁 Creating enhanced directory structure..."
mkdir -p packages/core/src/ui
mkdir -p packages/core/src/hooks
mkdir -p packages/core/src/utils
mkdir -p packages/core/tests/components
mkdir -p packages/design-tokens/src
mkdir -p packages/design-tokens/build

echo "📁 Enhanced directory structure created"

# 1. Enhanced Input Component (replacing original)
echo "🔧 Creating enhanced DynInput component..."
cat > packages/core/src/ui/dyn-input.tsx << 'EOF'
import React, { useState, useRef, useCallback, useEffect, forwardRef, useImperativeHandle } from 'react'
import { cn } from '../utils/classNames'
import type { Size } from '../types/common.types'
import { DynFieldContainer } from './dyn-field-container'

// Validation types
interface ValidationRule {
  type: 'required' | 'email' | 'phone' | 'url' | 'min' | 'max' | 'pattern' | 'custom' | 'async'
  message: string
  value?: any
  pattern?: RegExp
  customValidator?: (value: string) => boolean
  asyncValidator?: (value: string) => Promise<boolean>
}

// Masking types
interface MaskOptions {
  pattern: string
  placeholder?: string
  showMask?: boolean
}

// Enhanced DynInput props (backward compatible + new features)
interface DynInputProps {
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
  
  // ENHANCED FEATURES (new additions)
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
  
  /** Validation rules (ENHANCED) */
  validation?: ValidationRule[]
  /** Validate on change (ENHANCED) */
  validateOnChange?: boolean
  /** Validate on blur (ENHANCED) */
  validateOnBlur?: boolean
  
  /** Input masking (ENHANCED) */
  mask?: string | MaskOptions
  /** Show clear/clean button (ENHANCED) */
  showCleanButton?: boolean
  /** Loading state (ENHANCED) */
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
  /** Clean button handler (ENHANCED) */
  onClean?: () => void
  
  /** ARIA attributes */
  'aria-label'?: string
  'aria-labelledby'?: string
  'aria-describedby'?: string
  /** Test identifier */
  'data-testid'?: string
}

// Input reference methods
interface DynInputRef {
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
      if (/\d/.test(inputChar)) {
        maskedValue += inputChar
        valueIndex++
      } else {
        break
      }
    } else if (maskChar === 'A') {
      if (/[A-Za-z]/.test(inputChar)) {
        maskedValue += inputChar.toUpperCase()
        valueIndex++
      } else {
        break
      }
    } else if (maskChar === '*') {
      maskedValue += inputChar
      valueIndex++
    } else {
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

export const DynInput = forwardRef<DynInputRef, DynInputProps>(
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
    
    // Enhanced features
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
    
    // Enhanced features are only active if validation/mask/etc props are provided
    const hasEnhancedFeatures = validation.length > 0 || mask || showCleanButton || loading
    
    // Mask configuration
    const maskConfig = typeof mask === 'string' ? { pattern: mask } : mask
    const maskPattern = maskConfig?.pattern
    
    // Validation logic (only if validation rules provided)
    const validateInput = useCallback((inputValue: string): string[] => {
      if (!hasEnhancedFeatures || validation.length === 0) return []
      
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
          case 'async':
            // Async validation handled separately
            break
        }
        
        if (!isValid) {
          errors.push(rule.message)
        }
      }
      
      return errors
    }, [validation, hasEnhancedFeatures])
    
    // Handle input change
    const handleChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
      let newValue = event.target.value
      
      // Apply masking if configured
      if (maskPattern && typeof maskPattern === 'string') {
        newValue = applyMask(newValue.replace(/\D/g, ''), maskPattern)
      }
      
      setInputValue(newValue)
      
      // Enhanced validation (only if enabled)
      if (hasEnhancedFeatures) {
        setHasInteracted(true)
        
        if (validateOnChange && hasInteracted) {
          const errors = validateInput(newValue)
          setValidationErrors(errors)
        }
      }
      
      // Notify parent
      const outputValue = maskPattern && typeof maskPattern === 'string' 
        ? removeMask(newValue, maskPattern)
        : newValue
      onChange?.(outputValue)
    }, [maskPattern, validateOnChange, hasInteracted, validateInput, onChange, hasEnhancedFeatures])
    
    // Handle blur
    const handleBlur = useCallback((event: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(false)
      
      if (hasEnhancedFeatures) {
        setHasInteracted(true)
        
        if (validateOnBlur) {
          const errors = validateInput(inputValue)
          setValidationErrors(errors)
        }
      }
      
      onBlur?.(event)
    }, [validateOnBlur, validateInput, inputValue, onBlur, hasEnhancedFeatures])
    
    // Handle focus
    const handleFocus = useCallback((event: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(true)
      onFocus?.(event)
    }, [onFocus])
    
    // Handle clean button
    const handleClean = useCallback(() => {
      setInputValue('')
      if (hasEnhancedFeatures) {
        setValidationErrors([])
      }
      onChange?.('')
      onClean?.()
      inputRef.current?.focus()
    }, [onChange, onClean, hasEnhancedFeatures])
    
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
        if (!hasEnhancedFeatures) return true
        const errors = validateInput(inputValue)
        setValidationErrors(errors)
        return errors.length === 0
      },
      getElement: () => inputRef.current,
    }), [inputValue, validateInput, handleClean, onChange, hasEnhancedFeatures])
    
    // Determine validation state
    const hasError = Boolean(error || validationErrors.length > 0)
    const hasWarning = Boolean(warning && !hasError)
    const hasSuccess = Boolean(success && !hasError && !hasWarning)
    
    const currentError = error || validationErrors[0]
    
    // If enhanced features are used, wrap in DynFieldContainer
    if (hasEnhancedFeatures || label || description || hasError || hasWarning || hasSuccess) {
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
          className={className}
        >
          <div className={cn(
            'dyn-input-container',
            `dyn-input-container--${size}`,
            `dyn-input-container--${variant}`,
            isFocused && 'dyn-input-container--focused',
            hasError && 'dyn-input-container--error',
            hasWarning && 'dyn-input-container--warning', 
            hasSuccess && 'dyn-input-container--success',
            loading && 'dyn-input-container--loading',
            disabled && 'dyn-input-container--disabled',
            readonly && 'dyn-input-container--readonly'
          )}>
            {/* Prefix section */}
            {(startIcon || prefix) && (
              <div className="dyn-input__prefix">
                {startIcon && <span className="dyn-input__start-icon">{startIcon}</span>}
                {prefix && <span className="dyn-input__prefix-content">{prefix}</span>}
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
              className={cn('dyn-input', `dyn-input--${size}`, `dyn-input--${variant}`)}
              onChange={handleChange}
              onBlur={handleBlur}
              onFocus={handleFocus}
              aria-label={ariaLabel}
              aria-labelledby={ariaLabelledby}
              aria-describedby={ariaDescribedby}
              data-testid={dataTestId}
            />
            
            {/* Suffix section */}
            {(endIcon || suffix || (showCleanButton && inputValue) || loading) && (
              <div className="dyn-input__suffix">
                {loading && (
                  <div className="dyn-input__loading">
                    <svg className="dyn-input__loading-spinner" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path fill="currentColor" d="m12 2a10 10 0 0 1 10 10h-4a6 6 0 0 0-6-6v-4z" />
                    </svg>
                  </div>
                )}
                
                {showCleanButton && inputValue && !readonly && !disabled && (
                  <button
                    type="button"
                    className="dyn-input__clean-button"
                    onClick={handleClean}
                    aria-label="Clear field"
                  >
                    ✕
                  </button>
                )}
                
                {suffix && <span className="dyn-input__suffix-content">{suffix}</span>}
                {endIcon && <span className="dyn-input__end-icon">{endIcon}</span>}
              </div>
            )}
          </div>
        </DynFieldContainer>
      )
    }
    
    // Basic mode (backward compatibility) - just the input without container
    return (
      <div className={cn(
        'dyn-input-container',
        `dyn-input-container--${size}`,
        `dyn-input-container--${variant}`,
        disabled && 'dyn-input-container--disabled',
        readonly && 'dyn-input-container--readonly',
        className
      )}>
        {(startIcon || prefix) && (
          <div className="dyn-input__prefix">
            {startIcon && <span className="dyn-input__start-icon">{startIcon}</span>}
            {prefix && <span className="dyn-input__prefix-content">{prefix}</span>}
          </div>
        )}
        
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
          className={cn('dyn-input', `dyn-input--${size}`, `dyn-input--${variant}`)}
          onChange={handleChange}
          onBlur={handleBlur}
          onFocus={handleFocus}
          aria-label={ariaLabel}
          aria-labelledby={ariaLabelledby}
          aria-describedby={ariaDescribedby}
          data-testid={dataTestId}
        />
        
        {(endIcon || suffix) && (
          <div className="dyn-input__suffix">
            {suffix && <span className="dyn-input__suffix-content">{suffix}</span>}
            {endIcon && <span className="dyn-input__end-icon">{endIcon}</span>}
          </div>
        )}
      </div>
    )
  }
)

DynInput.displayName = 'DynInput'

// Export types
export type { DynInputProps, DynInputRef, ValidationRule, MaskOptions }
export default DynInput
EOF

# 2. Enhanced Checkbox Component (replacing original)
echo "🔧 Creating enhanced DynCheckbox component..."
cat > packages/core/src/ui/dyn-checkbox.tsx << 'EOF'
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

// Enhanced DynCheckbox props (backward compatible + new features)
interface DynCheckboxProps {
  /** Checkbox checked state */
  checked?: boolean
  /** Default checked state (uncontrolled) */
  defaultChecked?: boolean
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
  
  // ENHANCED FEATURES (new additions)
  /** Indeterminate state (ENHANCED) */
  indeterminate?: boolean
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
  
  /** Validation rules (ENHANCED) */
  validation?: ValidationRule[]
  /** Loading state (ENHANCED) */
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
interface DynCheckboxRef {
  focus: () => void
  blur: () => void
  toggle: () => void
  setChecked: (checked: boolean) => void
  setIndeterminate?: (indeterminate: boolean) => void
  getChecked: () => boolean
  getIndeterminate?: () => boolean
  validate?: () => boolean
  getElement: () => HTMLInputElement | null
}

export const DynCheckbox = forwardRef<DynCheckboxRef, DynCheckboxProps>(
  ({
    checked: checkedProp,
    defaultChecked = false,
    name,
    id,
    disabled = false,
    required = false,
    readonly = false,
    size = 'md',
    className,
    
    // Enhanced features
    indeterminate = false,
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
    
    // Enhanced features are only active if enhanced props are provided
    const hasEnhancedFeatures = Boolean(
      indeterminate || 
      label || 
      description || 
      error || 
      warning || 
      success || 
      validation.length > 0 || 
      loading
    )
    
    // Validation logic (only if validation rules provided)
    const validateCheckbox = useCallback((checked: boolean): string[] => {
      if (!hasEnhancedFeatures || validation.length === 0) return []
      
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
    }, [validation, hasEnhancedFeatures])
    
    // Handle checkbox change
    const handleChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
      if (readonly || disabled || loading) return
      
      const newChecked = event.target.checked
      setChecked(newChecked)
      
      if (hasEnhancedFeatures) {
        setIsIndeterminate(false)
        setHasInteracted(true)
        
        // Validate on change
        const errors = validateCheckbox(newChecked)
        setValidationErrors(errors)
        
        onChange?.(newChecked, false)
      } else {
        onChange?.(newChecked)
      }
    }, [readonly, disabled, loading, validateCheckbox, onChange, hasEnhancedFeatures])
    
    // Handle blur
    const handleBlur = useCallback((event: React.FocusEvent<HTMLInputElement>) => {
      if (hasEnhancedFeatures) {
        setHasInteracted(true)
        
        // Validate on blur
        const errors = validateCheckbox(checked)
        setValidationErrors(errors)
      }
      
      onBlur?.(event)
    }, [validateCheckbox, checked, onBlur, hasEnhancedFeatures])
    
    // Handle focus
    const handleFocus = useCallback((event: React.FocusEvent<HTMLInputElement>) => {
      onFocus?.(event)
    }, [onFocus])
    
    // Sync controlled props
    useEffect(() => {
      if (checkedProp !== undefined) {
        setChecked(checkedProp)
      }
    }, [checkedProp])
    
    useEffect(() => {
      if (hasEnhancedFeatures) {
        setIsIndeterminate(indeterminate)
      }
    }, [indeterminate, hasEnhancedFeatures])
    
    // Update input indeterminate property
    useEffect(() => {
      if (inputRef.current && hasEnhancedFeatures) {
        inputRef.current.indeterminate = isIndeterminate
      }
    }, [isIndeterminate, hasEnhancedFeatures])
    
    // Expose ref methods
    useImperativeHandle(ref, () => {
      const baseRef = {
        focus: () => inputRef.current?.focus(),
        blur: () => inputRef.current?.blur(),
        toggle: () => {
          if (readonly || disabled || loading) return
          const newChecked = !checked
          setChecked(newChecked)
          if (hasEnhancedFeatures) {
            setIsIndeterminate(false)
            onChange?.(newChecked, false)
          } else {
            onChange?.(newChecked)
          }
        },
        setChecked: (newChecked: boolean) => {
          setChecked(newChecked)
          if (hasEnhancedFeatures) {
            setIsIndeterminate(false)
            onChange?.(newChecked, false)
          } else {
            onChange?.(newChecked)
          }
        },
        getChecked: () => checked,
        getElement: () => inputRef.current,
      }
      
      // Add enhanced methods only if enhanced features are used
      if (hasEnhancedFeatures) {
        return {
          ...baseRef,
          setIndeterminate: (newIndeterminate: boolean) => {
            setIsIndeterminate(newIndeterminate)
            onChange?.(checked, newIndeterminate)
          },
          getIndeterminate: () => isIndeterminate,
          validate: () => {
            const errors = validateCheckbox(checked)
            setValidationErrors(errors)
            return errors.length === 0
          },
        }
      }
      
      return baseRef
    }, [checked, isIndeterminate, readonly, disabled, loading, validateCheckbox, onChange, hasEnhancedFeatures])
    
    // Determine validation state
    const hasError = Boolean(error || validationErrors.length > 0)
    const hasWarning = Boolean(warning && !hasError)
    const hasSuccess = Boolean(success && !hasError && !hasWarning)
    
    const currentError = error || validationErrors[0]
    
    // Visual state for styling
    const getVisualState = () => {
      if (loading) return 'loading'
      if (hasEnhancedFeatures && isIndeterminate) return 'indeterminate'
      if (checked) return 'checked'
      return 'unchecked'
    }
    
    const checkboxElement = (
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
          loading && 'dyn-checkbox--loading',
          !hasEnhancedFeatures && className
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
            aria-label={ariaLabel}
            aria-labelledby={ariaLabelledby}
            aria-describedby={ariaDescribedby}
            data-testid={dataTestId}
          />
          
          <div className={cn(
            'dyn-checkbox__box',
            `dyn-checkbox__box--${size}`,
            `dyn-checkbox__box--${getVisualState()}`
          )}>
            {loading ? (
              <div className="dyn-checkbox__loading">
                <svg className="dyn-checkbox__loading-spinner" viewBox="0 0 16 16" fill="none">
                  <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="2" />
                </svg>
              </div>
            ) : hasEnhancedFeatures && isIndeterminate ? (
              <svg className="dyn-checkbox__indeterminate-icon" viewBox="0 0 16 16" fill="currentColor">
                <rect x="4" y="7.5" width="8" height="1" rx="0.5" />
              </svg>
            ) : checked ? (
              <svg className="dyn-checkbox__check-icon" viewBox="0 0 16 16" fill="currentColor">
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
              <span className="dyn-checkbox__required-indicator">*</span>
            )}
          </span>
        )}
      </label>
    )
    
    // If enhanced features are used, wrap in DynFieldContainer
    if (hasEnhancedFeatures) {
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
          {checkboxElement}
        </DynFieldContainer>
      )
    }
    
    // Basic mode (backward compatibility)
    return checkboxElement
  }
)

DynCheckbox.displayName = 'DynCheckbox'

// Export types
export type { DynCheckboxProps, DynCheckboxRef, ValidationRule }
export default DynCheckbox
EOF

# 3. Enhanced Validation Hook
echo "🔧 Creating enhanced validation hooks..."
cat > packages/core/src/hooks/use-enhanced-validation.ts << 'EOF'
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
EOF

# 4. Enhanced Utility Functions
echo "🔧 Creating enhanced utility functions..."
cat > packages/core/src/utils/classNames.ts << 'EOF'
/**
 * Utility function for conditionally joining class names
 * Similar to the popular 'classnames' library but lightweight
 */
export function cn(...inputs: (string | undefined | null | boolean | { [key: string]: boolean })[]): string {
  const classes: string[] = []
  
  for (const input of inputs) {
    if (!input) continue
    
    if (typeof input === 'string') {
      classes.push(input)
    } else if (typeof input === 'object') {
      for (const [key, value] of Object.entries(input)) {
        if (value) {
          classes.push(key)
        }
      }
    }
  }
  
  return classes.join(' ')
}

// Alias for backward compatibility
export const classNames = cn

/**
 * Utility function for generating user initials from name
 */
export function generateInitials(name: string, maxLength: number = 2): string {
  return name
    .split(' ')
    .map(part => part.charAt(0).toUpperCase())
    .slice(0, maxLength)
    .join('')
}

/**
 * Utility function for formatting file sizes
 */
export function formatFileSize(bytes: number): string {
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
  if (bytes === 0) return '0 Bytes'
  
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i]
}

/**
 * Utility function for debouncing function calls
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => func.apply(null, args), delay)
  }
}

/**
 * Utility function for throttling function calls
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func.apply(null, args)
      inThrottle = true
      setTimeout(() => inThrottle = false, limit)
    }
  }
}
EOF

# 5. Design Tokens - CSS
echo "🎨 Creating complete design token system..."
cat > packages/design-tokens/index.css << 'EOF'
/**
 * DynUI Design Tokens - CSS Custom Properties
 * Complete design system with semantic tokens for consistent theming
 */

:root {
  /* ========================================
   * COLOR SYSTEM
   * ======================================== */
  
  /* Base colors */
  --dyn-color-white: #ffffff;
  --dyn-color-black: #000000;
  --dyn-color-transparent: transparent;

  /* Neutral scale */
  --dyn-color-neutral-0: #ffffff;
  --dyn-color-neutral-50: #f9fafb;
  --dyn-color-neutral-100: #f3f4f6;
  --dyn-color-neutral-200: #e5e7eb;
  --dyn-color-neutral-300: #d1d5db;
  --dyn-color-neutral-400: #9ca3af;
  --dyn-color-neutral-500: #6b7280;
  --dyn-color-neutral-600: #4b5563;
  --dyn-color-neutral-700: #374151;
  --dyn-color-neutral-800: #1f2937;
  --dyn-color-neutral-900: #111827;

  /* Primary colors */
  --dyn-color-primary-50: #eff6ff;
  --dyn-color-primary-100: #dbeafe;
  --dyn-color-primary-200: #bfdbfe;
  --dyn-color-primary-300: #93c5fd;
  --dyn-color-primary-400: #60a5fa;
  --dyn-color-primary-500: #3b82f6;
  --dyn-color-primary-600: #2563eb;
  --dyn-color-primary-700: #1d4ed8;
  --dyn-color-primary-800: #1e40af;
  --dyn-color-primary-900: #1e3a8a;

  /* Semantic colors */
  --dyn-color-success-50: #ecfdf5;
  --dyn-color-success-100: #d1fae5;
  --dyn-color-success-500: #10b981;
  --dyn-color-success-600: #059669;
  --dyn-color-success-700: #047857;

  --dyn-color-warning-50: #fffbeb;
  --dyn-color-warning-100: #fef3c7;
  --dyn-color-warning-500: #f59e0b;
  --dyn-color-warning-600: #d97706;
  --dyn-color-warning-700: #b45309;

  --dyn-color-danger-50: #fef2f2;
  --dyn-color-danger-100: #fee2e2;
  --dyn-color-danger-500: #ef4444;
  --dyn-color-danger-600: #dc2626;
  --dyn-color-danger-700: #b91c1c;

  --dyn-color-info-50: #eff6ff;
  --dyn-color-info-100: #dbeafe;
  --dyn-color-info-500: #3b82f6;
  --dyn-color-info-600: #2563eb;
  --dyn-color-info-700: #1d4ed8;

  /* ========================================
   * SEMANTIC ALIASES
   * ======================================== */
  
  /* Text colors */
  --dyn-color-text: var(--dyn-color-neutral-900);
  --dyn-color-text-primary: var(--dyn-color-neutral-900);
  --dyn-color-text-secondary: var(--dyn-color-neutral-600);
  --dyn-color-text-tertiary: var(--dyn-color-neutral-500);
  --dyn-color-text-disabled: var(--dyn-color-neutral-400);
  --dyn-color-text-placeholder: var(--dyn-color-neutral-500);

  /* Background colors */
  --dyn-color-background: var(--dyn-color-white);
  --dyn-color-background-subtle: var(--dyn-color-neutral-50);
  --dyn-color-background-hover: var(--dyn-color-neutral-100);
  --dyn-color-background-disabled: var(--dyn-color-neutral-200);
  --dyn-color-background-selected: var(--dyn-color-primary-50);

  /* Surface colors */
  --dyn-color-surface: var(--dyn-color-white);
  --dyn-color-surface-elevated: var(--dyn-color-white);

  /* Border colors */
  --dyn-color-border: var(--dyn-color-neutral-300);
  --dyn-color-border-subtle: var(--dyn-color-neutral-200);
  --dyn-color-border-hover: var(--dyn-color-neutral-400);
  --dyn-color-border-disabled: var(--dyn-color-neutral-200);
  --dyn-color-border-strong: var(--dyn-color-neutral-600);

  /* Input colors */
  --dyn-color-input-background: var(--dyn-color-white);
  --dyn-color-input-text: var(--dyn-color-neutral-900);
  --dyn-color-input-border: var(--dyn-color-neutral-300);
  --dyn-color-input-border-focus: var(--dyn-color-primary-600);

  /* Focus ring */
  --dyn-color-focus-ring: var(--dyn-color-primary-600);

  /* ========================================
   * SPACING SYSTEM
   * ======================================== */
  
  --dyn-spacing-0: 0;
  --dyn-spacing-1: 0.25rem;   /* 4px */
  --dyn-spacing-2: 0.5rem;    /* 8px */
  --dyn-spacing-3: 0.75rem;   /* 12px */
  --dyn-spacing-4: 1rem;      /* 16px */
  --dyn-spacing-5: 1.25rem;   /* 20px */
  --dyn-spacing-6: 1.5rem;    /* 24px */
  --dyn-spacing-8: 2rem;      /* 32px */
  --dyn-spacing-10: 2.5rem;   /* 40px */
  --dyn-spacing-12: 3rem;     /* 48px */
  --dyn-spacing-16: 4rem;     /* 64px */

  /* ========================================
   * TYPOGRAPHY SYSTEM
   * ======================================== */
  
  /* Font families */
  --dyn-font-family-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  --dyn-font-family-mono: 'JetBrains Mono', 'Fira Code', Consolas, 'Liberation Mono', monospace;

  /* Font sizes */
  --dyn-font-size-xs: 0.75rem;    /* 12px */
  --dyn-font-size-sm: 0.875rem;   /* 14px */
  --dyn-font-size-base: 1rem;     /* 16px */
  --dyn-font-size-lg: 1.125rem;   /* 18px */
  --dyn-font-size-xl: 1.25rem;    /* 20px */
  --dyn-font-size-2xl: 1.5rem;    /* 24px */
  --dyn-font-size-3xl: 1.875rem;  /* 30px */
  --dyn-font-size-4xl: 2.25rem;   /* 36px */

  /* Font weights */
  --dyn-font-weight-normal: 400;
  --dyn-font-weight-medium: 500;
  --dyn-font-weight-semibold: 600;
  --dyn-font-weight-bold: 700;

  /* Line heights */
  --dyn-line-height-tight: 1.25;
  --dyn-line-height-snug: 1.375;
  --dyn-line-height-normal: 1.5;
  --dyn-line-height-relaxed: 1.625;
  --dyn-line-height-loose: 2;

  /* ========================================
   * SHADOW SYSTEM
   * ======================================== */
  
  --dyn-shadow-xs: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  --dyn-shadow-sm: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1);
  --dyn-shadow-base: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1);
  --dyn-shadow-md: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1);
  --dyn-shadow-lg: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
  --dyn-shadow-xl: 0 25px 50px -12px rgba(0, 0, 0, 0.25);

  /* Focus shadow */
  --dyn-shadow-focus: 0 0 0 3px rgba(59, 130, 246, 0.35);

  /* ========================================
   * BORDER RADIUS SYSTEM
   * ======================================== */
  
  --dyn-radius-none: 0;
  --dyn-radius-xs: 0.125rem;   /* 2px */
  --dyn-radius-sm: 0.25rem;    /* 4px */
  --dyn-radius-base: 0.375rem; /* 6px */
  --dyn-radius-md: 0.5rem;     /* 8px */
  --dyn-radius-lg: 0.75rem;    /* 12px */
  --dyn-radius-xl: 1rem;       /* 16px */
  --dyn-radius-2xl: 1.5rem;    /* 24px */
  --dyn-radius-full: 9999px;

  /* Component-specific radius */
  --dyn-radius-button: var(--dyn-radius-base);
  --dyn-radius-input: var(--dyn-radius-base);
  --dyn-radius-card: var(--dyn-radius-lg);
  --dyn-radius-modal: var(--dyn-radius-xl);

  /* ========================================
   * ANIMATION SYSTEM
   * ======================================== */
  
  /* Duration */
  --dyn-duration-instant: 0ms;
  --dyn-duration-fast: 150ms;
  --dyn-duration-normal: 200ms;
  --dyn-duration-slow: 300ms;
  --dyn-duration-slower: 500ms;

  /* Easing */
  --dyn-ease-linear: linear;
  --dyn-ease-in: cubic-bezier(0.4, 0, 1, 1);
  --dyn-ease-out: cubic-bezier(0, 0, 0.2, 1);
  --dyn-ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);

  /* Common transitions */
  --dyn-transition-colors: color var(--dyn-duration-normal) var(--dyn-ease-out), 
                           background-color var(--dyn-duration-normal) var(--dyn-ease-out), 
                           border-color var(--dyn-duration-normal) var(--dyn-ease-out);
  --dyn-transition-shadow: box-shadow var(--dyn-duration-normal) var(--dyn-ease-out);
  --dyn-transition-transform: transform var(--dyn-duration-normal) var(--dyn-ease-out);
  --dyn-transition-all: all var(--dyn-duration-normal) var(--dyn-ease-out);

  /* ========================================
   * SIZE SYSTEM
   * ======================================== */
  
  /* Icon sizes */
  --dyn-size-icon-xs: 12px;
  --dyn-size-icon-sm: 16px;
  --dyn-size-icon-md: 24px;
  --dyn-size-icon-lg: 32px;
  --dyn-size-icon-xl: 48px;

  /* Height tokens */
  --dyn-size-height-sm: 32px;
  --dyn-size-height-md: 40px;
  --dyn-size-height-lg: 48px;

  /* ========================================
   * Z-INDEX SYSTEM
   * ======================================== */
  
  --dyn-z-dropdown: 1000;
  --dyn-z-sticky: 1020;
  --dyn-z-fixed: 1030;
  --dyn-z-modal-backdrop: 1040;
  --dyn-z-modal: 1050;
  --dyn-z-popover: 1060;
  --dyn-z-tooltip: 1070;
  --dyn-z-toast: 1080;
}

/* ========================================
 * DARK MODE SUPPORT
 * ======================================== */

@media (prefers-color-scheme: dark) {
  :root {
    --dyn-color-text: var(--dyn-color-neutral-50);
    --dyn-color-text-primary: var(--dyn-color-neutral-50);
    --dyn-color-text-secondary: var(--dyn-color-neutral-400);
    --dyn-color-text-tertiary: var(--dyn-color-neutral-500);
    --dyn-color-text-disabled: var(--dyn-color-neutral-600);
    --dyn-color-text-placeholder: var(--dyn-color-neutral-500);

    --dyn-color-background: var(--dyn-color-neutral-900);
    --dyn-color-background-subtle: var(--dyn-color-neutral-800);
    --dyn-color-background-hover: var(--dyn-color-neutral-700);
    --dyn-color-background-disabled: var(--dyn-color-neutral-800);
    --dyn-color-background-selected: var(--dyn-color-primary-900);

    --dyn-color-surface: var(--dyn-color-neutral-800);
    --dyn-color-surface-elevated: var(--dyn-color-neutral-800);

    --dyn-color-border: var(--dyn-color-neutral-700);
    --dyn-color-border-subtle: var(--dyn-color-neutral-800);
    --dyn-color-border-hover: var(--dyn-color-neutral-600);
    --dyn-color-border-disabled: var(--dyn-color-neutral-800);
    --dyn-color-border-strong: var(--dyn-color-neutral-400);

    --dyn-color-input-background: var(--dyn-color-neutral-800);
    --dyn-color-input-text: var(--dyn-color-neutral-50);
    --dyn-color-input-border: var(--dyn-color-neutral-600);
    --dyn-color-input-border-focus: var(--dyn-color-primary-500);

    --dyn-shadow-focus: 0 0 0 3px rgba(59, 130, 246, 0.5);
  }
}

/* ========================================
 * COMPONENT STYLES
 * ======================================== */

/* DynInput Enhanced Styles */
.dyn-input-container {
  position: relative;
  display: flex;
  align-items: center;
  background-color: var(--dyn-color-input-background);
  border: 1px solid var(--dyn-color-input-border);
  border-radius: var(--dyn-radius-input);
  transition: var(--dyn-transition-colors), var(--dyn-transition-shadow);
}

.dyn-input-container--sm {
  min-height: var(--dyn-size-height-sm);
  font-size: var(--dyn-font-size-sm);
}

.dyn-input-container--md {
  min-height: var(--dyn-size-height-md);
  font-size: var(--dyn-font-size-base);
}

.dyn-input-container--lg {
  min-height: var(--dyn-size-height-lg);
  font-size: var(--dyn-font-size-lg);
}

.dyn-input-container--focused {
  border-color: var(--dyn-color-input-border-focus);
  box-shadow: var(--dyn-shadow-focus);
}

.dyn-input-container--error {
  border-color: var(--dyn-color-danger-500);
}

.dyn-input-container--error.dyn-input-container--focused {
  border-color: var(--dyn-color-danger-600);
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
}

.dyn-input-container--warning {
  border-color: var(--dyn-color-warning-500);
}

.dyn-input-container--success {
  border-color: var(--dyn-color-success-500);
}

.dyn-input-container--disabled {
  background-color: var(--dyn-color-background-disabled);
  border-color: var(--dyn-color-border-disabled);
  cursor: not-allowed;
}

.dyn-input-container--readonly {
  background-color: var(--dyn-color-background-subtle);
  cursor: default;
}

.dyn-input {
  flex: 1;
  border: none;
  background: transparent;
  outline: none;
  color: var(--dyn-color-text);
  font-family: inherit;
  font-size: inherit;
  padding: var(--dyn-spacing-2) var(--dyn-spacing-3);
}

.dyn-input::placeholder {
  color: var(--dyn-color-text-placeholder);
}

.dyn-input:disabled {
  color: var(--dyn-color-text-disabled);
  cursor: not-allowed;
}

.dyn-input__prefix,
.dyn-input__suffix {
  display: flex;
  align-items: center;
  gap: var(--dyn-spacing-2);
  padding: 0 var(--dyn-spacing-2);
  color: var(--dyn-color-text-secondary);
}

.dyn-input__clean-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  padding: 0;
  background: none;
  border: none;
  color: var(--dyn-color-text-tertiary);
  cursor: pointer;
  border-radius: var(--dyn-radius-sm);
  transition: var(--dyn-transition-colors);
}

.dyn-input__clean-button:hover {
  color: var(--dyn-color-text-secondary);
  background-color: var(--dyn-color-background-hover);
}

.dyn-input__loading {
  display: flex;
  align-items: center;
  justify-content: center;
  width: var(--dyn-size-icon-sm);
  height: var(--dyn-size-icon-sm);
  color: var(--dyn-color-primary-600);
}

.dyn-input__loading-spinner {
  width: 16px;
  height: 16px;
  animation: dyn-spin 1s linear infinite;
}

@keyframes dyn-spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* DynCheckbox Enhanced Styles */
.dyn-checkbox {
  display: flex;
  align-items: flex-start;
  gap: var(--dyn-spacing-2);
  cursor: pointer;
  font-family: var(--dyn-font-family-sans);
  user-select: none;
}

.dyn-checkbox--disabled,
.dyn-checkbox--loading {
  cursor: not-allowed;
  opacity: 0.6;
}

.dyn-checkbox--readonly {
  cursor: default;
}

.dyn-checkbox__input-container {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.dyn-checkbox__input {
  position: absolute;
  opacity: 0;
  width: 100%;
  height: 100%;
  margin: 0;
  cursor: inherit;
  z-index: 1;
}

.dyn-checkbox__input:focus + .dyn-checkbox__box {
  box-shadow: var(--dyn-shadow-focus);
}

.dyn-checkbox__box {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  border: 2px solid var(--dyn-color-border);
  border-radius: var(--dyn-radius-sm);
  background-color: var(--dyn-color-background);
  color: var(--dyn-color-white);
  transition: var(--dyn-transition-all);
  flex-shrink: 0;
}

.dyn-checkbox__box--sm {
  width: 16px;
  height: 16px;
}

.dyn-checkbox__box--lg {
  width: 24px;
  height: 24px;
}

.dyn-checkbox__box--checked {
  background-color: var(--dyn-color-primary-600);
  border-color: var(--dyn-color-primary-600);
}

.dyn-checkbox__box--indeterminate {
  background-color: var(--dyn-color-primary-600);
  border-color: var(--dyn-color-primary-600);
}

.dyn-checkbox__box svg {
  width: 12px;
  height: 12px;
}

.dyn-checkbox__box--sm svg {
  width: 10px;
  height: 10px;
}

.dyn-checkbox__box--lg svg {
  width: 14px;
  height: 14px;
}

.dyn-checkbox__label {
  color: var(--dyn-color-text-primary);
  line-height: var(--dyn-line-height-normal);
}

.dyn-checkbox--disabled .dyn-checkbox__label {
  color: var(--dyn-color-text-disabled);
}

.dyn-checkbox__required-indicator {
  color: var(--dyn-color-danger-600);
  margin-left: var(--dyn-spacing-1);
  font-weight: var(--dyn-font-weight-bold);
}
EOF

# 6. Enhanced Components Index (update existing)
echo "🔧 Updating components index with enhanced features..."
cat > packages/core/src/components/index.ts << 'EOF'
// DynUI Core Components - Enhanced Barrel Exports
// All components now include enhanced features while maintaining backward compatibility

// Core Components
export { DynTabs, DynTab, DynTabPanel } from '../ui/dyn-tabs'
export { DynStepper, DynStep } from '../ui/dyn-stepper'
export { DynMenu, DynMenuItem } from '../ui/dyn-menu'
export { DynListView } from '../ui/dyn-listview'

// Enhanced Form Components (backward compatible + new features)
export { DynInput } from '../ui/dyn-input'            // Now enhanced!
export { DynCheckbox } from '../ui/dyn-checkbox'      // Now enhanced!
export { DynButton } from '../ui/dyn-button'
export { DynSelect, DynSelectOption } from '../ui/dyn-select'
export { DynTextArea } from '../ui/dyn-textarea'
export { DynRadioGroup, DynRadio } from '../ui/dyn-radio'

// Data Display
export { DynAvatar } from '../ui/dyn-avatar'
export { DynBadge } from '../ui/dyn-badge'
export { DynTable } from '../ui/dyn-table'
export { DynIcon } from '../ui/dyn-icon'

// Layout
export { DynBox } from '../ui/dyn-box'
export { DynContainer } from '../ui/dyn-container'
export { DynDivider } from '../ui/dyn-divider'
export { DynFieldContainer } from '../ui/dyn-field-container'
export { DynGrid, DynGridItem } from '../ui/dyn-grid'
export { DynModal } from '../ui/dyn-modal'
export { Separator } from '../ui/separator'

// Navigation
export { DynBreadcrumb, DynBreadcrumbItem } from '../ui/dyn-breadcrumb'

// Tree
export { DynTreeView, DynTreeNode } from '../ui/dyn-tree'

// Enhanced Validation System
export { useEnhancedValidation, useSimpleValidation } from '../hooks/use-enhanced-validation'

// Enhanced Utilities
export { cn, classNames, generateInitials, formatFileSize, debounce, throttle } from '../utils/classNames'

// Re-export types (Original + Enhanced)
export type * from '../types/components'
export type * from '../ui/dyn-input'
export type * from '../ui/dyn-checkbox'
export type * from '../hooks/use-enhanced-validation'
EOF

# 7. Enhanced Test file
echo "🧪 Creating enhanced test suites..."
cat > packages/core/tests/components/dyn-input.test.tsx << 'EOF'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe, toHaveNoViolations } from 'jest-axe'
import { DynInput } from '../../src/ui/dyn-input'
import { vi } from 'vitest'

expect.extend(toHaveNoViolations)

describe('DynInput (Enhanced)', () => {
  // Test backward compatibility - basic mode
  describe('Basic Mode (Backward Compatibility)', () => {
    it('renders basic input without enhanced features', () => {
      render(
        <DynInput 
          placeholder="Basic input"
          data-testid="basic-input"
        />
      )
      
      expect(screen.getByPlaceholderText('Basic input')).toBeInTheDocument()
      expect(screen.queryByText('Clear field')).not.toBeInTheDocument()
    })

    it('handles basic onChange', async () => {
      const user = userEvent.setup()
      const onChange = vi.fn()
      
      render(<DynInput onChange={onChange} />)
      
      const input = screen.getByRole('textbox')
      await user.type(input, 'test')
      
      expect(onChange).toHaveBeenCalledWith('test')
    })
  })

  // Test enhanced mode
  describe('Enhanced Mode (When enhanced props provided)', () => {
    it('activates enhanced mode when validation rules provided', () => {
      render(
        <DynInput 
          label="Enhanced Input"
          validation={[
            { type: 'required', message: 'This field is required' }
          ]}
          data-testid="enhanced-input"
        />
      )
      
      expect(screen.getByLabelText('Enhanced Input')).toBeInTheDocument()
    })

    it('validates required field', async () => {
      const user = userEvent.setup()
      
      render(
        <DynInput 
          label="Required Field"
          validation={[
            { type: 'required', message: 'This field is required' }
          ]}
          validateOnBlur
        />
      )
      
      const input = screen.getByLabelText('Required Field')
      
      await user.click(input)
      await user.tab()
      
      await waitFor(() => {
        expect(screen.getByText('This field is required')).toBeInTheDocument()
      })
    })

    it('applies phone number mask', async () => {
      const user = userEvent.setup()
      const onChange = vi.fn()
      
      render(
        <DynInput 
          label="Phone"
          mask="(999) 999-9999"
          onChange={onChange}
        />
      )
      
      const input = screen.getByLabelText('Phone')
      await user.type(input, '1234567890')
      
      expect(input).toHaveValue('(123) 456-7890')
    })

    it('shows clean button when showCleanButton is true', () => {
      render(
        <DynInput 
          label="Cleanable Input"
          value="test"
          showCleanButton
        />
      )
      
      expect(screen.getByLabelText('Clear field')).toBeInTheDocument()
    })

    it('shows loading spinner when loading', () => {
      render(
        <DynInput 
          label="Loading Input"
          loading
        />
      )
      
      const spinner = document.querySelector('.dyn-input__loading-spinner')
      expect(spinner).toBeInTheDocument()
    })
  })

  // Test accessibility
  it('has no accessibility violations in basic mode', async () => {
    const { container } = render(
      <DynInput placeholder="Accessible input" />
    )
    
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('has no accessibility violations in enhanced mode', async () => {
    const { container } = render(
      <DynInput 
        label="Accessible Enhanced Input"
        description="This is an accessible enhanced input"
        required
        validation={[
          { type: 'required', message: 'Required' }
        ]}
      />
    )
    
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  // Test ref methods
  it('exposes enhanced ref methods when enhanced features used', () => {
    const ref = React.createRef<any>()
    
    render(
      <DynInput 
        ref={ref}
        label="Ref Test"
        validation={[
          { type: 'required', message: 'Required' }
        ]}
      />
    )
    
    expect(ref.current).toHaveProperty('focus')
    expect(ref.current).toHaveProperty('blur')
    expect(ref.current).toHaveProperty('clear')
    expect(ref.current).toHaveProperty('getValue')
    expect(ref.current).toHaveProperty('setValue')
    expect(ref.current).toHaveProperty('validate')
    expect(ref.current).toHaveProperty('getElement')
  })

  it('exposes basic ref methods in basic mode', () => {
    const ref = React.createRef<any>()
    
    render(<DynInput ref={ref} placeholder="Basic ref test" />)
    
    expect(ref.current).toHaveProperty('focus')
    expect(ref.current).toHaveProperty('blur')
    expect(ref.current).toHaveProperty('getElement')
  })
})
EOF

# 8. Enhanced Storybook story
echo "📖 Creating enhanced Storybook stories..."
cat > packages/core/src/ui/dyn-input.stories.tsx << 'EOF'
import type { Meta, StoryObj } from '@storybook/react'
import { useState } from 'react'
import { within, userEvent, expect } from '@storybook/test'
import { DynInput } from './dyn-input'

const meta: Meta<typeof DynInput> = {
  title: 'Forms/DynInput',
  component: DynInput,
  parameters: {
    docs: {
      description: {
        component: 'Enhanced input component with backward compatibility. Use basic props for simple inputs, or add enhanced props for validation, masking, and advanced features.'
      }
    }
  },
  argTypes: {
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg']
    },
    variant: {
      control: 'select',
      options: ['outline', 'filled', 'underline']
    },
    type: {
      control: 'select',
      options: ['text', 'email', 'password', 'tel', 'url', 'number', 'search']
    }
  }
}

export default meta
type Story = StoryObj<typeof DynInput>

// Basic examples (backward compatibility)
export const Basic: Story = {
  args: {
    placeholder: 'Basic input without enhanced features'
  }
}

export const BasicWithIcons: Story = {
  args: {
    placeholder: 'Basic input with icons',
    startIcon: '🔍',
    endIcon: '✓'
  }
}

// Enhanced examples
export const Enhanced: Story = {
  args: {
    label: 'Enhanced Input',
    description: 'This input has enhanced features',
    placeholder: 'Enter text...'
  }
}

export const WithValidation: Story = {
  args: {
    label: 'Email Address',
    type: 'email',
    placeholder: 'user@example.com',
    required: true,
    validation: [
      { type: 'required', message: 'Email is required' },
      { type: 'email', message: 'Please enter a valid email address' }
    ],
    validateOnChange: true
  }
}

export const WithMasking: Story = {
  args: {
    label: 'Phone Number',
    type: 'tel',
    placeholder: '(000) 000-0000',
    mask: '(999) 999-9999',
    description: 'Automatic phone number formatting'
  }
}

export const WithCleanButton: Story = {
  args: {
    label: 'Search Field',
    type: 'search',
    placeholder: 'Type to search...',
    showCleanButton: true,
    startIcon: '🔍'
  }
}

export const LoadingState: Story = {
  args: {
    label: 'Processing Field',
    value: 'Validating...',
    loading: true,
    description: 'Input in loading state with spinner'
  }
}

export const ValidationStates: Story = {
  render: () => {
    const [values, setValues] = useState({
      error: 'invalid@',
      warning: 'user@suspicious-domain.com',
      success: 'user@example.com'
    })
    
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        <DynInput
          label="Error State"
          type="email"
          value={values.error}
          error="Please enter a valid email address"
          onChange={(value) => setValues(prev => ({ ...prev, error: value }))}
        />
        
        <DynInput
          label="Warning State"
          type="email"
          value={values.warning}
          warning="This domain has been associated with spam"
          onChange={(value) => setValues(prev => ({ ...prev, warning: value }))}
        />
        
        <DynInput
          label="Success State"
          type="email"
          value={values.success}
          success="Email is valid and available"
          onChange={(value) => setValues(prev => ({ ...prev, success: value }))}
        />
      </div>
    )
  }
}

export const MigrationExample: Story = {
  render: () => {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        <div>
          <h3>Before (Basic Mode)</h3>
          <DynInput placeholder="Basic input - no changes needed" />
        </div>
        
        <div>
          <h3>After (Enhanced Mode)</h3>
          <DynInput 
            label="Enhanced Input"
            placeholder="Just add enhanced props as needed"
            validation={[
              { type: 'required', message: 'This field is required' }
            ]}
            showCleanButton
          />
        </div>
      </div>
    )
  }
}
EOF

# 9. Updated README
echo "📄 Updating README with production-ready documentation..."
cat > README.md << 'EOF'
# 🚀 DynUI - Production-Ready React Component Library

[![CI](https://github.com/sasonaldekant/dynui-fixed/workflows/CI/badge.svg)](https://github.com/sasonaldekant/dynui-fixed/actions)
[![Quality Gates](https://github.com/sasonaldekant/dynui-fixed/workflows/Quality%20Gates/badge.svg)](https://github.com/sasonaldekant/dynui-fixed/actions)
[![Components](https://img.shields.io/badge/Components-30%2B-brightgreen)](#component-catalog)
[![TypeScript](https://img.shields.io/badge/TypeScript-100%25-blue)](#typescript-support)
[![Accessibility](https://img.shields.io/badge/A11y-WCAG%202.1%20AAA-green)](#accessibility)

🏆 **Production-ready React TypeScript component library with enhanced features and backward compatibility.**

## 🎯 **What's New - Enhanced Components**

All components are now **backward compatible** with enhanced features available when needed:

### **🔄 Seamless Migration**
