// DynUI Core Components - Barrel Exports
// Migration from src/components/ to packages/core/src/components/

// Core Components
export { DynTabs, DynTab, DynTabPanel } from '../ui/dyn-tabs'
export { DynStepper, DynStep } from '../ui/dyn-stepper'
export { DynMenu, DynMenuItem } from '../ui/dyn-menu'
export { DynListView } from '../ui/dyn-listview'

// Form Components (Original + Enhanced)
export { DynInput } from '../ui/dyn-input'
export { DynInputEnhanced } from '../ui/dyn-input-enhanced'
export { DynButton } from '../ui/dyn-button'
export { DynCheckbox } from '../ui/dyn-checkbox'
export { DynCheckboxEnhanced } from '../ui/dyn-checkbox-enhanced'
export { DynSelect, DynSelectOption } from '../ui/dyn-select'
export { DynTextArea } from '../ui/dyn-textarea'
export { DynRadioGroup, DynRadio } from '../ui/dyn-radio'

// Data Display (Original + Enhanced)
export { DynAvatar } from '../ui/dyn-avatar'
export { DynBadge } from '../ui/dyn-badge'
export { DynTable } from '../ui/dyn-table'
export { DynTableEnhanced } from '../ui/dyn-table-enhanced'
export { DynIcon } from '../ui/dyn-icon'

// Layout (Original + Enhanced)
export { DynBox } from '../ui/dyn-box'
export { DynContainer } from '../ui/dyn-container'
export { DynDivider } from '../ui/dyn-divider'
export { DynFieldContainer } from '../ui/dyn-field-container'
export { DynGrid, DynGridItem } from '../ui/dyn-grid'
export { DynModal } from '../ui/dyn-modal'
export { DynModalEnhanced } from '../ui/dyn-modal-enhanced'
export { Separator } from '../ui/separator'

// Navigation
export { DynBreadcrumb, DynBreadcrumbItem } from '../ui/dyn-breadcrumb'

// Tree
export { DynTreeView, DynTreeNode } from '../ui/dyn-tree'

// Enhanced System Hooks
export { useEnhancedValidation, useSimpleValidation } from '../hooks/use-enhanced-validation'

// Re-export types (Original + Enhanced)
export type * from '../types/components'
export type * from '../ui/dyn-input-enhanced'
export type * from '../ui/dyn-checkbox-enhanced'
export type * from '../ui/dyn-table-enhanced'
export type * from '../ui/dyn-modal-enhanced'
export type * from '../hooks/use-enhanced-validation'