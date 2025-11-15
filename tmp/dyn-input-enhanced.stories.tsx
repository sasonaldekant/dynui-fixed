import type { Meta, StoryObj } from '@storybook/react'
import { useState } from 'react'
import { within, userEvent, expect } from '@storybook/test'
import { DynInputEnhanced } from './dyn-input-enhanced'

const meta: Meta<typeof DynInputEnhanced> = {
  title: 'Forms/DynInputEnhanced',
  component: DynInputEnhanced,
  parameters: {
    docs: {
      description: {
        component: 'Enhanced input component with validation, masking, clean button, and loading states. Supports real-time validation and accessibility features.'
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
type Story = StoryObj<typeof DynInputEnhanced>

// Basic examples
export const Default: Story = {
  args: {
    label: 'Default Input',
    placeholder: 'Enter text...',
    description: 'Basic input with label and description'
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
    startIcon: (
      <svg viewBox="0 0 16 16" fill="currentColor">
        <path fillRule="evenodd" d="M9.965 11.026a5 5 0 1 1 1.06-1.06l2.755 2.754a.75.75 0 1 1-1.06 1.06L9.965 11.026ZM10.5 7a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0Z" clipRule="evenodd" />
      </svg>
    )
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
        <DynInputEnhanced
          label="Error State"
          type="email"
          value={values.error}
          error="Please enter a valid email address"
          onChange={(value) => setValues(prev => ({ ...prev, error: value }))}
        />
        
        <DynInputEnhanced
          label="Warning State"
          type="email"
          value={values.warning}
          warning="This domain has been associated with spam"
          onChange={(value) => setValues(prev => ({ ...prev, warning: value }))}
        />
        
        <DynInputEnhanced
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

export const SizeVariants: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <DynInputEnhanced
        label="Small Input"
        size="sm"
        placeholder="Small size input"
      />
      
      <DynInputEnhanced
        label="Medium Input"
        size="md"
        placeholder="Medium size input"
      />
      
      <DynInputEnhanced
        label="Large Input"
        size="lg"
        placeholder="Large size input"
      />
    </div>
  )
}

export const WithIcons: Story = {
  args: {
    label: 'Input with Icons',
    placeholder: 'Username',
    startIcon: (
      <svg viewBox="0 0 16 16" fill="currentColor">
        <path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM12.735 14c.618 0 1.093-.561.872-1.139a6.002 6.002 0 0 0-11.215 0c-.22.578.254 1.139.872 1.139h9.47Z" />
      </svg>
    ),
    endIcon: (
      <svg viewBox="0 0 16 16" fill="currentColor">
        <path fillRule="evenodd" d="M15 8A7 7 0 1 1 1 8a7 7 0 0 1 14 0ZM6.75 4.75a.75.75 0 0 0-1.5 0v3.5a.75.75 0 0 0 1.5 0v-3.5ZM10.25 4.75a.75.75 0 0 0-1.5 0v3.5a.75.75 0 0 0 1.5 0v-3.5Z" clipRule="evenodd" />
      </svg>
    )
  }
}

export const MaskingExamples: Story = {
  render: () => {
    const [values, setValues] = useState({
      phone: '',
      ssn: '',
      creditCard: '',
      date: ''
    })
    
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        <DynInputEnhanced
          label="Phone Number"
          mask="(999) 999-9999"
          placeholder="(000) 000-0000"
          value={values.phone}
          onChange={(value) => setValues(prev => ({ ...prev, phone: value }))}
        />
        
        <DynInputEnhanced
          label="Social Security Number"
          mask="999-99-9999"
          placeholder="000-00-0000"
          value={values.ssn}
          onChange={(value) => setValues(prev => ({ ...prev, ssn: value }))}
        />
        
        <DynInputEnhanced
          label="Credit Card"
          mask="9999 9999 9999 9999"
          placeholder="0000 0000 0000 0000"
          value={values.creditCard}
          onChange={(value) => setValues(prev => ({ ...prev, creditCard: value }))}
        />
        
        <DynInputEnhanced
          label="Date"
          mask="99/99/9999"
          placeholder="MM/DD/YYYY"
          value={values.date}
          onChange={(value) => setValues(prev => ({ ...prev, date: value }))}
        />
      </div>
    )
  }
}

export const InteractiveValidation: Story = {
  render: () => {
    const [value, setValue] = useState('')
    const [showSuccess, setShowSuccess] = useState(false)
    
    const handleChange = (newValue: string) => {
      setValue(newValue)
      setShowSuccess(newValue === 'success')
    }
    
    return (
      <DynInputEnhanced
        label="Interactive Validation"
        description="Type 'error' to see error, 'success' to see success"
        value={value}
        onChange={handleChange}
        error={value === 'error' ? 'This triggers an error!' : undefined}
        success={showSuccess ? 'Perfect! This is valid.' : undefined}
        validation={[
          {
            type: 'custom',
            message: 'Cannot use forbidden words',
            customValidator: (val) => val !== 'forbidden'
          }
        ]}
        validateOnChange
        showCleanButton
      />
    )
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const input = canvas.getByRole('textbox')
    
    // Test error state
    await userEvent.type(input, 'error')
    expect(canvas.getByText('This triggers an error!')).toBeInTheDocument()
    
    // Clear and test success state
    await userEvent.clear(input)
    await userEvent.type(input, 'success')
    expect(canvas.getByText('Perfect! This is valid.')).toBeInTheDocument()
  }
}

export const Variants: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <DynInputEnhanced
        label="Outline Variant"
        variant="outline"
        placeholder="Outline style (default)"
      />
      
      <DynInputEnhanced
        label="Filled Variant"
        variant="filled"
        placeholder="Filled background style"
      />
      
      <DynInputEnhanced
        label="Underline Variant"
        variant="underline"
        placeholder="Underline only style"
      />
    </div>
  )
}

export const FormExample: Story = {
  render: () => {
    const [formData, setFormData] = useState({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      website: ''
    })
    
    return (
      <form style={{ maxWidth: '500px', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <DynInputEnhanced
            label="First Name"
            required
            value={formData.firstName}
            onChange={(value) => setFormData(prev => ({ ...prev, firstName: value }))}
            validation={[
              { type: 'required', message: 'First name is required' },
              { type: 'min', message: 'Minimum 2 characters', value: 2 }
            ]}
          />
          
          <DynInputEnhanced
            label="Last Name"
            required
            value={formData.lastName}
            onChange={(value) => setFormData(prev => ({ ...prev, lastName: value }))}
            validation={[
              { type: 'required', message: 'Last name is required' },
              { type: 'min', message: 'Minimum 2 characters', value: 2 }
            ]}
          />
        </div>
        
        <DynInputEnhanced
          label="Email Address"
          type="email"
          required
          value={formData.email}
          onChange={(value) => setFormData(prev => ({ ...prev, email: value }))}
          validation={[
            { type: 'required', message: 'Email is required' },
            { type: 'email', message: 'Please enter a valid email' }
          ]}
          showCleanButton
        />
        
        <DynInputEnhanced
          label="Phone Number"
          type="tel"
          mask="(999) 999-9999"
          placeholder="(000) 000-0000"
          value={formData.phone}
          onChange={(value) => setFormData(prev => ({ ...prev, phone: value }))}
        />
        
        <DynInputEnhanced
          label="Website"
          type="url"
          placeholder="https://example.com"
          value={formData.website}
          onChange={(value) => setFormData(prev => ({ ...prev, website: value }))}
          validation={[
            { type: 'url', message: 'Please enter a valid URL' }
          ]}
          prefix="https://"
        />
        
        <button 
          type="submit"
          style={{
            padding: '12px 24px',
            backgroundColor: '#2563eb',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '16px'
          }}
        >
          Submit Form
        </button>
      </form>
    )
  }
}