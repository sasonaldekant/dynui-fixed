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
