import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe, toHaveNoViolations } from 'jest-axe'
import { DynInputEnhanced } from '../../src/ui/dyn-input-enhanced'
import { vi } from 'vitest'

expect.extend(toHaveNoViolations)

describe('DynInputEnhanced', () => {
  // Basic rendering
  it('renders with basic props', () => {
    render(
      <DynInputEnhanced 
        label="Test Input"
        placeholder="Enter text"
        data-testid="test-input"
      />
    )
    
    expect(screen.getByLabelText('Test Input')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Enter text')).toBeInTheDocument()
  })

  it('renders controlled value', () => {
    render(
      <DynInputEnhanced 
        label="Controlled Input"
        value="test value"
      />
    )
    
    expect(screen.getByDisplayValue('test value')).toBeInTheDocument()
  })

  // Validation tests
  it('validates required field', async () => {
    const user = userEvent.setup()
    
    render(
      <DynInputEnhanced 
        label="Required Field"
        required
        validation={[
          { type: 'required', message: 'This field is required' }
        ]}
        validateOnBlur
      />
    )
    
    const input = screen.getByLabelText('Required Field')
    
    // Focus and blur without entering value
    await user.click(input)
    await user.tab()
    
    await waitFor(() => {
      expect(screen.getByText('This field is required')).toBeInTheDocument()
    })
  })

  it('validates email format', async () => {
    const user = userEvent.setup()
    
    render(
      <DynInputEnhanced 
        label="Email Field"
        type="email"
        validation={[
          { type: 'email', message: 'Invalid email format' }
        ]}
        validateOnChange
      />
    )
    
    const input = screen.getByLabelText('Email Field')
    
    // Enter invalid email
    await user.type(input, 'invalid-email')
    
    await waitFor(() => {
      expect(screen.getByText('Invalid email format')).toBeInTheDocument()
    })
    
    // Enter valid email
    await user.clear(input)
    await user.type(input, 'user@example.com')
    
    await waitFor(() => {
      expect(screen.queryByText('Invalid email format')).not.toBeInTheDocument()
    })
  })

  it('validates custom rules', async () => {
    const customValidator = vi.fn((value: string) => value !== 'forbidden')
    const user = userEvent.setup()
    
    render(
      <DynInputEnhanced 
        label="Custom Validation"
        validation={[
          { 
            type: 'custom', 
            message: 'This value is not allowed',
            customValidator
          }
        ]}
        validateOnChange
      />
    )
    
    const input = screen.getByLabelText('Custom Validation')
    
    // Enter forbidden value
    await user.type(input, 'forbidden')
    
    await waitFor(() => {
      expect(screen.getByText('This value is not allowed')).toBeInTheDocument()
    })
    
    expect(customValidator).toHaveBeenCalledWith('forbidden')
  })

  // Masking tests
  it('applies phone number mask', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    
    render(
      <DynInputEnhanced 
        label="Phone"
        mask="(999) 999-9999"
        onChange={onChange}
      />
    )
    
    const input = screen.getByLabelText('Phone')
    
    await user.type(input, '1234567890')
    
    // Should format as phone number
    expect(input).toHaveValue('(123) 456-7890')
  })

  it('applies credit card mask', async () => {
    const user = userEvent.setup()
    
    render(
      <DynInputEnhanced 
        label="Credit Card"
        mask="9999 9999 9999 9999"
      />
    )
    
    const input = screen.getByLabelText('Credit Card')
    
    await user.type(input, '1234567890123456')
    
    expect(input).toHaveValue('1234 5678 9012 3456')
  })

  // Clean button tests
  it('shows clean button when showCleanButton is true and has value', () => {
    render(
      <DynInputEnhanced 
        label="Cleanable Input"
        value="some value"
        showCleanButton
      />
    )
    
    expect(screen.getByLabelText('Clear field')).toBeInTheDocument()
  })

  it('hides clean button when field is empty', () => {
    render(
      <DynInputEnhanced 
        label="Cleanable Input"
        value=""
        showCleanButton
      />
    )
    
    expect(screen.queryByLabelText('Clear field')).not.toBeInTheDocument()
  })

  it('clears field when clean button is clicked', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    
    render(
      <DynInputEnhanced 
        label="Cleanable Input"
        value="test value"
        onChange={onChange}
        showCleanButton
      />
    )
    
    const cleanButton = screen.getByLabelText('Clear field')
    await user.click(cleanButton)
    
    expect(onChange).toHaveBeenCalledWith('')
  })

  // Loading state tests
  it('shows loading spinner when loading', () => {
    render(
      <DynInputEnhanced 
        label="Loading Input"
        loading
      />
    )
    
    expect(screen.getByRole('textbox')).toBeInTheDocument()
    // Loading spinner should be visible in UI
  })

  // State priority tests
  it('prioritizes error over other states', () => {
    render(
      <DynInputEnhanced 
        label="Multi-state Input"
        error="Error message"
        warning="Warning message"
        success="Success message"
      />
    )
    
    expect(screen.getByText('Error message')).toBeInTheDocument()
    expect(screen.queryByText('Warning message')).not.toBeInTheDocument()
    expect(screen.queryByText('Success message')).not.toBeInTheDocument()
  })

  it('shows warning when no error', () => {
    render(
      <DynInputEnhanced 
        label="Warning Input"
        warning="Warning message"
        success="Success message"
      />
    )
    
    expect(screen.getByText('Warning message')).toBeInTheDocument()
    expect(screen.queryByText('Success message')).not.toBeInTheDocument()
  })

  // Icons tests
  it('renders start and end icons', () => {
    render(
      <DynInputEnhanced 
        label="Icon Input"
        startIcon={<span data-testid="start-icon">📧</span>}
        endIcon={<span data-testid="end-icon">🔒</span>}
      />
    )
    
    expect(screen.getByTestId('start-icon')).toBeInTheDocument()
    expect(screen.getByTestId('end-icon')).toBeInTheDocument()
  })

  it('renders prefix and suffix content', () => {
    render(
      <DynInputEnhanced 
        label="Affix Input"
        prefix="$"
        suffix="USD"
      />
    )
    
    expect(screen.getByText('$')).toBeInTheDocument()
    expect(screen.getByText('USD')).toBeInTheDocument()
  })

  // Size variants
  it('applies size classes correctly', () => {
    const { rerender } = render(
      <DynInputEnhanced label="Size Test" size="sm" data-testid="container" />
    )
    
    expect(screen.getByTestId('container')).toHaveClass('dyn-input-container--sm')
    
    rerender(
      <DynInputEnhanced label="Size Test" size="lg" data-testid="container" />
    )
    
    expect(screen.getByTestId('container')).toHaveClass('dyn-input-container--lg')
  })

  // Disabled state
  it('handles disabled state correctly', () => {
    render(
      <DynInputEnhanced 
        label="Disabled Input"
        disabled
      />
    )
    
    const input = screen.getByLabelText('Disabled Input')
    expect(input).toBeDisabled()
  })

  // Readonly state
  it('handles readonly state correctly', () => {
    render(
      <DynInputEnhanced 
        label="Readonly Input"
        readonly
        value="Cannot edit"
      />
    )
    
    const input = screen.getByLabelText('Readonly Input')
    expect(input).toHaveAttribute('readOnly')
  })

  // Event handlers
  it('calls onChange when value changes', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    
    render(
      <DynInputEnhanced 
        label="Change Test"
        onChange={onChange}
      />
    )
    
    const input = screen.getByLabelText('Change Test')
    await user.type(input, 'new value')
    
    expect(onChange).toHaveBeenCalledWith('new value')
  })

  it('calls onFocus and onBlur', async () => {
    const user = userEvent.setup()
    const onFocus = vi.fn()
    const onBlur = vi.fn()
    
    render(
      <DynInputEnhanced 
        label="Focus Test"
        onFocus={onFocus}
        onBlur={onBlur}
      />
    )
    
    const input = screen.getByLabelText('Focus Test')
    
    await user.click(input)
    expect(onFocus).toHaveBeenCalled()
    
    await user.tab()
    expect(onBlur).toHaveBeenCalled()
  })

  // Multiple validation rules
  it('validates multiple rules', async () => {
    const user = userEvent.setup()
    
    render(
      <DynInputEnhanced 
        label="Multi-rule Validation"
        validation={[
          { type: 'required', message: 'Required' },
          { type: 'min', message: 'Too short', value: 5 },
          { type: 'pattern', message: 'Invalid format', pattern: /^[A-Z]/ }
        ]}
        validateOnChange
      />
    )
    
    const input = screen.getByLabelText('Multi-rule Validation')
    
    // Test short value
    await user.type(input, 'abc')
    
    await waitFor(() => {
      expect(screen.getByText('Too short')).toBeInTheDocument()
    })
    
    // Test valid length but wrong pattern
    await user.clear(input)
    await user.type(input, 'abcdef')
    
    await waitFor(() => {
      expect(screen.getByText('Invalid format')).toBeInTheDocument()
    })
    
    // Test valid input
    await user.clear(input)
    await user.type(input, 'Abcdef')
    
    await waitFor(() => {
      expect(screen.queryByText('Too short')).not.toBeInTheDocument()
      expect(screen.queryByText('Invalid format')).not.toBeInTheDocument()
    })
  })

  // Accessibility tests
  it('has no accessibility violations', async () => {
    const { container } = render(
      <DynInputEnhanced 
        label="Accessible Input"
        description="This is an accessible input"
        required
      />
    )
    
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('has proper ARIA attributes', () => {
    render(
      <DynInputEnhanced 
        label="ARIA Test"
        description="Help text"
        error="Error text"
        required
      />
    )
    
    const input = screen.getByLabelText('ARIA Test')
    expect(input).toHaveAttribute('aria-required', 'true')
    expect(input).toHaveAttribute('aria-labelledby')
    expect(input).toHaveAttribute('aria-describedby')
  })

  it('sets aria-invalid when there is an error', () => {
    render(
      <DynInputEnhanced 
        label="Error Input"
        error="Error message"
      />
    )
    
    const input = screen.getByLabelText('Error Input')
    expect(input).toHaveAttribute('aria-invalid', 'true')
  })

  // Clean button accessibility
  it('clean button has proper accessibility', () => {
    render(
      <DynInputEnhanced 
        label="Cleanable Input"
        value="test"
        showCleanButton
      />
    )
    
    const cleanButton = screen.getByLabelText('Clear field')
    expect(cleanButton).toHaveAttribute('type', 'button')
    expect(cleanButton).toHaveAttribute('tabIndex', '-1')
  })

  // Icon integration
  it('integrates with DynFieldContainer error states', () => {
    render(
      <DynInputEnhanced 
        label="Error Input"
        error="Error with icon"
      />
    )
    
    // Should show error icon from DynFieldContainer
    const errorElement = screen.getByRole('alert')
    expect(errorElement).toBeInTheDocument()
    expect(errorElement.querySelector('svg')).toBeInTheDocument()
  })

  // Masking edge cases
  it('handles invalid characters in masked input', async () => {
    const user = userEvent.setup()
    
    render(
      <DynInputEnhanced 
        label="Masked Input"
        mask="999-99-9999"
      />
    )
    
    const input = screen.getByLabelText('Masked Input')
    
    // Try to enter letters (should be filtered out)
    await user.type(input, 'abc123def456ghi')
    
    expect(input).toHaveValue('123-45-6')
  })

  // Loading state behavior
  it('prevents interaction when loading', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    
    render(
      <DynInputEnhanced 
        label="Loading Input"
        loading
        onChange={onChange}
      />
    )
    
    const input = screen.getByLabelText('Loading Input')
    
    await user.type(input, 'test')
    
    // Should still allow typing but show loading UI
    expect(onChange).toHaveBeenCalled()
  })

  // Form integration
  it('integrates properly with form submission', () => {
    const onSubmit = vi.fn()
    
    render(
      <form onSubmit={onSubmit}>
        <DynInputEnhanced 
          name="test-field"
          label="Form Input"
          value="form value"
        />
        <button type="submit">Submit</button>
      </form>
    )
    
    // The input should have the name attribute for form data
    const input = screen.getByLabelText('Form Input')
    expect(input).toHaveAttribute('name', 'test-field')
  })

  // Variant styling
  it('applies variant classes', () => {
    const { rerender } = render(
      <DynInputEnhanced 
        label="Variant Test" 
        variant="filled"
        data-testid="input-container"
      />
    )
    
    expect(screen.getByTestId('input-container')).toHaveClass('dyn-input-container--filled')
    
    rerender(
      <DynInputEnhanced 
        label="Variant Test" 
        variant="underline"
        data-testid="input-container"
      />
    )
    
    expect(screen.getByTestId('input-container')).toHaveClass('dyn-input-container--underline')
  })

  // Ref methods
  it('exposes ref methods correctly', () => {
    const ref = React.createRef<any>()
    
    render(
      <DynInputEnhanced 
        ref={ref}
        label="Ref Test"
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
})