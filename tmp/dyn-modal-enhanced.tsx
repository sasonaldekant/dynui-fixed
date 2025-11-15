import React, { useEffect, useRef, useCallback, useState } from 'react'
import { createPortal } from 'react-dom'
import { cn } from '../utils/classNames'
import type { Size } from '../types/common.types'
import { DynIcon, CloseIcon } from './dyn-icon'

// Modal size configurations
const MODAL_SIZES = {
  sm: 'max-w-md',
  md: 'max-w-lg', 
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
  full: 'max-w-full'
} as const

// Enhanced DynModal props
interface DynModalEnhancedProps {
  /** Whether modal is open */
  open: boolean
  /** Close handler */
  onClose: () => void
  /** Modal title */
  title?: string
  /** Modal content */
  children: React.ReactNode
  /** Size variant */
  size?: Size | 'xl' | 'full'
  /** Whether to show close button */
  showCloseButton?: boolean
  /** Whether clicking backdrop closes modal */
  closeOnBackdrop?: boolean
  /** Whether ESC key closes modal */
  closeOnEscape?: boolean
  /** Custom className */
  className?: string
  /** Modal header content */
  header?: React.ReactNode
  /** Modal footer content */
  footer?: React.ReactNode
  /** Whether modal is centered */
  centered?: boolean
  /** Z-index for modal */
  zIndex?: number
  /** Animation duration */
  animationDuration?: number
  /** Custom backdrop className */
  backdropClassName?: string
  /** Test identifier */
  'data-testid'?: string
  
  /** Event handlers */
  onAfterOpen?: () => void
  onAfterClose?: () => void
  onBackdropClick?: () => void
}

// Focus trap utility
function useFocusTrap(isActive: boolean) {
  const containerRef = useRef<HTMLDivElement>(null)
  const previouslyFocusedElement = useRef<Element | null>(null)
  
  useEffect(() => {
    if (!isActive) return
    
    // Store previously focused element
    previouslyFocusedElement.current = document.activeElement
    
    const container = containerRef.current
    if (!container) return
    
    // Get all focusable elements
    const getFocusableElements = (): HTMLElement[] => {
      const focusableSelectors = [
        'a[href]',
        'button:not([disabled])',
        'textarea:not([disabled])',
        'input:not([disabled]):not([type="hidden"])',
        'select:not([disabled])',
        '[tabindex]:not([tabindex="-1"])',
      ]
      
      return Array.from(
        container.querySelectorAll(focusableSelectors.join(', '))
      ) as HTMLElement[]
    }
    
    const handleTabKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') return
      
      const focusableElements = getFocusableElements()
      if (focusableElements.length === 0) return
      
      const firstElement = focusableElements[0]
      const lastElement = focusableElements[focusableElements.length - 1]
      
      if (event.shiftKey) {
        // Shift + Tab (backwards)
        if (document.activeElement === firstElement) {
          event.preventDefault()
          lastElement.focus()
        }
      } else {
        // Tab (forwards)
        if (document.activeElement === lastElement) {
          event.preventDefault()
          firstElement.focus()
        }
      }
    }
    
    // Set initial focus to first focusable element or container
    const focusableElements = getFocusableElements()
    if (focusableElements.length > 0) {
      focusableElements[0].focus()
    } else {
      container.focus()
    }
    
    // Add event listener
    document.addEventListener('keydown', handleTabKeyDown)
    
    return () => {
      document.removeEventListener('keydown', handleTabKeyDown)
      
      // Restore focus to previously focused element
      if (previouslyFocusedElement.current) {
        ;(previouslyFocusedElement.current as HTMLElement).focus?.()
      }
    }
  }, [isActive])
  
  return containerRef
}

// Body scroll lock utility
function useBodyScrollLock(isLocked: boolean) {
  useEffect(() => {
    if (!isLocked) return
    
    const originalStyle = window.getComputedStyle(document.body).overflow
    document.body.style.overflow = 'hidden'
    
    return () => {
      document.body.style.overflow = originalStyle
    }
  }, [isLocked])
}

export function DynModalEnhanced({
  open,
  onClose,
  title,
  children,
  size = 'md',
  showCloseButton = true,
  closeOnBackdrop = true,
  closeOnEscape = true,
  className,
  header,
  footer,
  centered = true,
  zIndex = 1050,
  animationDuration = 200,
  backdropClassName,
  'data-testid': dataTestId,
  
  onAfterOpen,
  onAfterClose,
  onBackdropClick,
}: DynModalEnhancedProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)
  const focusTrapRef = useFocusTrap(open && isVisible)
  
  useBodyScrollLock(open)
  
  // Handle modal opening
  useEffect(() => {
    if (open) {
      setIsVisible(true)
      setIsAnimating(true)
      
      const timer = setTimeout(() => {
        setIsAnimating(false)
        onAfterOpen?.()
      }, animationDuration)
      
      return () => clearTimeout(timer)
    } else if (isVisible) {
      setIsAnimating(true)
      
      const timer = setTimeout(() => {
        setIsVisible(false)
        setIsAnimating(false)
        onAfterClose?.()
      }, animationDuration)
      
      return () => clearTimeout(timer)
    }
  }, [open, isVisible, animationDuration, onAfterOpen, onAfterClose])
  
  // Handle ESC key
  useEffect(() => {
    if (!closeOnEscape || !open) return
    
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }
    
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [open, closeOnEscape, onClose])
  
  // Handle backdrop click
  const handleBackdropClick = useCallback((event: React.MouseEvent) => {
    if (event.target === event.currentTarget && closeOnBackdrop) {
      onBackdropClick?.()
      onClose()
    }
  }, [closeOnBackdrop, onClose, onBackdropClick])
  
  if (!isVisible) return null
  
  const sizeClass = MODAL_SIZES[size as keyof typeof MODAL_SIZES] || MODAL_SIZES.md
  
  const modalContent = (
    <div
      className={cn(
        'dyn-modal-backdrop',
        isAnimating && (open ? 'dyn-modal-backdrop--entering' : 'dyn-modal-backdrop--exiting'),
        backdropClassName
      )}
      style={{
        zIndex,
        animationDuration: `${animationDuration}ms`,
      }}
      onClick={handleBackdropClick}
      data-testid={dataTestId}
    >
      <div
        ref={focusTrapRef}
        className={cn(
          'dyn-modal',
          `dyn-modal--${size}`,
          centered && 'dyn-modal--centered',
          isAnimating && (open ? 'dyn-modal--entering' : 'dyn-modal--exiting'),
          className
        )}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? `${dataTestId || 'modal'}-title` : undefined}
        tabIndex={-1}
      >
        {/* Modal Header */}
        {(title || header || showCloseButton) && (
          <div className="dyn-modal__header">
            {header || (
              <>
                {title && (
                  <h2 
                    id={`${dataTestId || 'modal'}-title`}
                    className="dyn-modal__title"
                  >
                    {title}
                  </h2>
                )}
                
                {showCloseButton && (
                  <button
                    type="button"
                    className="dyn-modal__close-button"
                    onClick={onClose}
                    aria-label="Close modal"
                  >
                    <CloseIcon />
                  </button>
                )}
              </>
            )}
          </div>
        )}
        
        {/* Modal Body */}
        <div className="dyn-modal__body">
          {children}
        </div>
        
        {/* Modal Footer */}
        {footer && (
          <div className="dyn-modal__footer">
            {footer}
          </div>
        )}
      </div>
    </div>
  )
  
  // Render modal in portal
  return createPortal(modalContent, document.body)
}

// Export types
export type { DynModalEnhancedProps }
export default DynModalEnhanced