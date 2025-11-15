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
