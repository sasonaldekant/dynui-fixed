import React, { useState, useCallback, useMemo, useRef } from 'react'
import { cn } from '../utils/classNames'
import type { Size } from '../types/common.types'
import { DynCheckboxEnhanced } from './dyn-checkbox-enhanced'
import { DynIcon, ChevronDownIcon } from './dyn-icon'

// Table column definition
interface TableColumn<T = any> {
  /** Unique column identifier */
  key: string
  /** Column header label */
  title: string
  /** Data accessor function or property key */
  dataIndex?: keyof T | ((record: T) => any)
  /** Custom render function */
  render?: (value: any, record: T, index: number) => React.ReactNode
  /** Column width */
  width?: number | string
  /** Whether column is sortable */
  sortable?: boolean
  /** Whether column is filterable */
  filterable?: boolean
  /** Column alignment */
  align?: 'left' | 'center' | 'right'
  /** Whether column is fixed */
  fixed?: 'left' | 'right'
  /** Custom className for column */
  className?: string
}

// Sort configuration
interface SortConfig {
  key: string
  direction: 'asc' | 'desc'
}

// Filter configuration  
interface FilterConfig {
  [key: string]: string
}

// Selection configuration
interface SelectionConfig<T> {
  selectedRowKeys: string[]
  onSelect?: (selectedKeys: string[], selectedRows: T[]) => void
  getRowKey: (record: T) => string
}

// Enhanced DynTable props
interface DynTableEnhancedProps<T = any> {
  /** Table data */
  dataSource: T[]
  /** Column definitions */
  columns: TableColumn<T>[]
  /** Loading state */
  loading?: boolean
  /** Empty state message */
  emptyText?: string
  /** Size variant */
  size?: Size
  /** Whether table has borders */
  bordered?: boolean
  /** Whether rows are striped */
  striped?: boolean
  /** Whether table is hoverable */
  hoverable?: boolean
  /** Custom className */
  className?: string
  
  /** Row selection configuration */
  rowSelection?: SelectionConfig<T>
  /** Sorting configuration */
  sortConfig?: SortConfig
  /** Sort change handler */
  onSortChange?: (sortConfig: SortConfig | null) => void
  /** Filter configuration */
  filterConfig?: FilterConfig
  /** Filter change handler */
  onFilterChange?: (filters: FilterConfig) => void
  
  /** Pagination configuration */
  pagination?: {
    current: number
    pageSize: number
    total: number
    showSizeChanger?: boolean
    pageSizeOptions?: number[]
    onChange: (page: number, pageSize: number) => void
  }
  
  /** Row click handler */
  onRow?: {
    onClick?: (record: T, index: number) => void
    onDoubleClick?: (record: T, index: number) => void
  }
  
  /** Scroll configuration */
  scroll?: {
    x?: number | string
    y?: number | string
  }
  
  /** Test identifier */
  'data-testid'?: string
}

export function DynTableEnhanced<T = any>({
  dataSource,
  columns,
  loading = false,
  emptyText = 'No data available',
  size = 'md',
  bordered = false,
  striped = false,
  hoverable = true,
  className,
  
  rowSelection,
  sortConfig,
  onSortChange,
  filterConfig,
  onFilterChange,
  
  pagination,
  onRow,
  scroll,
  
  'data-testid': dataTestId,
}: DynTableEnhancedProps<T>) {
  const tableRef = useRef<HTMLTableElement>(null)
  const [internalSortConfig, setInternalSortConfig] = useState<SortConfig | null>(sortConfig || null)
  const [internalFilters, setInternalFilters] = useState<FilterConfig>(filterConfig || {})
  
  // Handle sorting
  const handleSort = useCallback((columnKey: string) => {
    const newSortConfig: SortConfig = {
      key: columnKey,
      direction: 
        internalSortConfig?.key === columnKey && internalSortConfig.direction === 'asc'
          ? 'desc'
          : 'asc'
    }
    
    setInternalSortConfig(newSortConfig)
    onSortChange?.(newSortConfig)
  }, [internalSortConfig, onSortChange])
  
  // Handle row selection
  const handleRowSelect = useCallback((rowKey: string, selected: boolean) => {
    if (!rowSelection) return
    
    const newSelectedKeys = selected
      ? [...rowSelection.selectedRowKeys, rowKey]
      : rowSelection.selectedRowKeys.filter(key => key !== rowKey)
    
    const selectedRows = dataSource.filter(record => 
      newSelectedKeys.includes(rowSelection.getRowKey(record))
    )
    
    rowSelection.onSelect?.(newSelectedKeys, selectedRows)
  }, [rowSelection, dataSource])
  
  // Handle select all
  const handleSelectAll = useCallback((selected: boolean) => {
    if (!rowSelection) return
    
    const allRowKeys = dataSource.map(rowSelection.getRowKey)
    const newSelectedKeys = selected ? allRowKeys : []
    const selectedRows = selected ? dataSource : []
    
    rowSelection.onSelect?.(newSelectedKeys, selectedRows)
  }, [rowSelection, dataSource])
  
  // Calculate selection state
  const selectionState = useMemo(() => {
    if (!rowSelection || dataSource.length === 0) {
      return { checked: false, indeterminate: false }
    }
    
    const selectedCount = rowSelection.selectedRowKeys.length
    const totalCount = dataSource.length
    
    return {
      checked: selectedCount === totalCount,
      indeterminate: selectedCount > 0 && selectedCount < totalCount
    }
  }, [rowSelection, dataSource])
  
  // Apply sorting and filtering
  const processedData = useMemo(() => {
    let result = [...dataSource]
    
    // Apply filters
    Object.entries(internalFilters).forEach(([key, filterValue]) => {
      if (!filterValue) return
      
      result = result.filter(record => {
        const column = columns.find(col => col.key === key)
        if (!column) return true
        
        const value = column.dataIndex
          ? typeof column.dataIndex === 'function'
            ? column.dataIndex(record)
            : record[column.dataIndex]
          : record[key as keyof T]
          
        return String(value).toLowerCase().includes(filterValue.toLowerCase())
      })
    })
    
    // Apply sorting
    if (internalSortConfig) {
      const { key, direction } = internalSortConfig
      const column = columns.find(col => col.key === key)
      
      if (column) {
        result.sort((a, b) => {
          const aValue = column.dataIndex
            ? typeof column.dataIndex === 'function'
              ? column.dataIndex(a)
              : a[column.dataIndex]
            : a[key as keyof T]
            
          const bValue = column.dataIndex
            ? typeof column.dataIndex === 'function'
              ? column.dataIndex(b)
              : b[column.dataIndex]
            : b[key as keyof T]
          
          if (aValue < bValue) return direction === 'asc' ? -1 : 1
          if (aValue > bValue) return direction === 'asc' ? 1 : -1
          return 0
        })
      }
    }
    
    return result
  }, [dataSource, internalFilters, internalSortConfig, columns])
  
  // Pagination slice
  const paginatedData = useMemo(() => {
    if (!pagination) return processedData
    
    const start = (pagination.current - 1) * pagination.pageSize
    const end = start + pagination.pageSize
    return processedData.slice(start, end)
  }, [processedData, pagination])
  
  const tableClasses = cn(
    'dyn-table',
    `dyn-table--${size}`,
    bordered && 'dyn-table--bordered',
    striped && 'dyn-table--striped',
    hoverable && 'dyn-table--hoverable',
    loading && 'dyn-table--loading',
    className
  )
  
  const hasSelection = Boolean(rowSelection)
  
  return (
    <div className="dyn-table-container" data-testid={dataTestId}>
      {loading && (
        <div className="dyn-table__loading-overlay">
          <div className="dyn-table__loading-content">
            <svg className="dyn-table__loading-spinner" viewBox="0 0 50 50">
              <circle
                className="dyn-table__loading-circle"
                cx="25"
                cy="25"
                r="20"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeDasharray="31.416"
                strokeDashoffset="31.416"
              />
            </svg>
            <span>Loading...</span>
          </div>
        </div>
      )}
      
      <div 
        className="dyn-table__scroll-container"
        style={{
          overflowX: scroll?.x ? 'auto' : undefined,
          overflowY: scroll?.y ? 'auto' : undefined,
          maxHeight: scroll?.y,
        }}
      >
        <table
          ref={tableRef}
          className={tableClasses}
          style={{
            minWidth: scroll?.x,
          }}
        >
          <thead className="dyn-table__header">
            <tr className="dyn-table__header-row">
              {hasSelection && (
                <th className="dyn-table__header-cell dyn-table__selection-cell">
                  <DynCheckboxEnhanced
                    checked={selectionState.checked}
                    indeterminate={selectionState.indeterminate}
                    onChange={handleSelectAll}
                    aria-label="Select all rows"
                  />
                </th>
              )}
              
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={cn(
                    'dyn-table__header-cell',
                    column.align && `dyn-table__header-cell--${column.align}`,
                    column.sortable && 'dyn-table__header-cell--sortable',
                    column.className
                  )}
                  style={{ width: column.width }}
                  onClick={column.sortable ? () => handleSort(column.key) : undefined}
                >
                  <div className="dyn-table__header-content">
                    <span className="dyn-table__header-title">
                      {column.title}
                    </span>
                    
                    {column.sortable && (
                      <span className="dyn-table__sort-indicator">
                        {internalSortConfig?.key === column.key ? (
                          <ChevronDownIcon
                            className={cn(
                              'dyn-table__sort-icon',
                              internalSortConfig.direction === 'asc' && 'dyn-table__sort-icon--asc'
                            )}
                          />
                        ) : (
                          <div className="dyn-table__sort-icon-placeholder" />
                        )}
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          
          <tbody className="dyn-table__body">
            {paginatedData.length === 0 ? (
              <tr className="dyn-table__empty-row">
                <td 
                  className="dyn-table__empty-cell"
                  colSpan={columns.length + (hasSelection ? 1 : 0)}
                >
                  <div className="dyn-table__empty-content">
                    <div className="dyn-table__empty-icon">
                      <svg viewBox="0 0 64 64" fill="none">
                        <rect x="16" y="16" width="32" height="32" rx="2" stroke="currentColor" strokeWidth="2" />
                        <path d="M24 24h16M24 32h16M24 40h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                      </svg>
                    </div>
                    <span className="dyn-table__empty-text">{emptyText}</span>
                  </div>
                </td>
              </tr>
            ) : (
              paginatedData.map((record, index) => {
                const rowKey = rowSelection ? rowSelection.getRowKey(record) : String(index)
                const isSelected = rowSelection ? rowSelection.selectedRowKeys.includes(rowKey) : false
                
                return (
                  <tr
                    key={rowKey}
                    className={cn(
                      'dyn-table__body-row',
                      isSelected && 'dyn-table__body-row--selected'
                    )}
                    onClick={() => onRow?.onClick?.(record, index)}
                    onDoubleClick={() => onRow?.onDoubleClick?.(record, index)}
                  >
                    {hasSelection && (
                      <td className="dyn-table__body-cell dyn-table__selection-cell">
                        <DynCheckboxEnhanced
                          checked={isSelected}
                          onChange={(checked) => handleRowSelect(rowKey, checked)}
                          aria-label={`Select row ${index + 1}`}
                        />
                      </td>
                    )}
                    
                    {columns.map((column) => {
                      const value = column.dataIndex
                        ? typeof column.dataIndex === 'function'
                          ? column.dataIndex(record)
                          : record[column.dataIndex]
                        : record[column.key as keyof T]
                      
                      const cellContent = column.render
                        ? column.render(value, record, index)
                        : String(value ?? '')
                      
                      return (
                        <td
                          key={column.key}
                          className={cn(
                            'dyn-table__body-cell',
                            column.align && `dyn-table__body-cell--${column.align}`,
                            column.className
                          )}
                        >
                          {cellContent}
                        </td>
                      )
                    })}
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
      
      {pagination && (
        <div className="dyn-table__pagination">
          <div className="dyn-table__pagination-info">
            Showing {Math.min((pagination.current - 1) * pagination.pageSize + 1, pagination.total)} to{' '}
            {Math.min(pagination.current * pagination.pageSize, pagination.total)} of{' '}
            {pagination.total} entries
          </div>
          
          <div className="dyn-table__pagination-controls">
            {pagination.showSizeChanger && (
              <div className="dyn-table__page-size">
                <label htmlFor="page-size-select">Show:</label>
                <select
                  id="page-size-select"
                  value={pagination.pageSize}
                  onChange={(e) => 
                    pagination.onChange(1, parseInt(e.target.value, 10))
                  }
                  className="dyn-table__page-size-select"
                >
                  {(pagination.pageSizeOptions || [10, 20, 50, 100]).map(size => (
                    <option key={size} value={size}>
                      {size}
                    </option>
                  ))}
                </select>
              </div>
            )}
            
            <div className="dyn-table__page-navigation">
              <button
                className="dyn-table__page-button"
                disabled={pagination.current === 1}
                onClick={() => pagination.onChange(pagination.current - 1, pagination.pageSize)}
                aria-label="Previous page"
              >
                ← Previous
              </button>
              
              <span className="dyn-table__page-info">
                Page {pagination.current} of {Math.ceil(pagination.total / pagination.pageSize)}
              </span>
              
              <button
                className="dyn-table__page-button"
                disabled={pagination.current >= Math.ceil(pagination.total / pagination.pageSize)}
                onClick={() => pagination.onChange(pagination.current + 1, pagination.pageSize)}
                aria-label="Next page"
              >
                Next →
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Export types
export type { DynTableEnhancedProps, TableColumn, SortConfig, FilterConfig, SelectionConfig }
export default DynTableEnhanced