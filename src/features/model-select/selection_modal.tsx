import React, { useState, useCallback, useEffect } from 'react';
import { Modal, Table, Input, Button, Space, Pagination } from 'antd';
import { TableProps } from 'antd/lib/table';
import { AsyncStateMatcher } from '@/lib/state';
import { ModelSelectionSuccessState } from './use_modal_selection';

// Base entity interface that all models must implement
export interface BaseEntity {
  id: string;
  [key: string]: any;
}

export interface SelectionModalProps<T extends BaseEntity> {
  // Modal visibility
  visible: boolean;
  onCancel: () => void;
  
  // Selection configuration
  title: string;
  multiSelect?: boolean;
  selectedItems?: T[];
  
  // Selection handlers
  onSelect: (selectedItems: T[]) => void;
  
  // The state returned from our useModelSelection hook
  selectionState: any; // Will be checked internally with ModelSelectionSuccessState.is()
  
  // Custom rendering
  renderItem?: (item: T) => React.ReactNode;
  filterFields?: React.ReactNode;
}

export function SelectionModal<T extends BaseEntity>({
  visible,
  onCancel,
  title,
  multiSelect = false,
  selectedItems = [],
  onSelect,
  selectionState,
  renderItem,
  filterFields,
}: SelectionModalProps<T>) {
  // Local state for selected items
  const [selected, setSelected] = useState<T[]>(selectedItems);
  
  // Reset selected items when modal visibility changes
  useEffect(() => {
    if (visible) {
      setSelected(selectedItems);
    }
  }, [visible, selectedItems]);
  
  // Handle row selection
  const handleSelect = useCallback((record: T) => {
    if (multiSelect) {
      // For multi-select, toggle selection
      const isSelected = selected.some(item => item.id === record.id);
      if (isSelected) {
        setSelected(selected.filter(item => item.id !== record.id));
      } else {
        setSelected([...selected, record]);
      }
    } else {
      // For single-select, replace selection
      setSelected([record]);
    }
  }, [multiSelect, selected]);
  
  // Handle confirmation
  const handleConfirm = useCallback(() => {
    onSelect(selected);
    onCancel();
  }, [onSelect, selected, onCancel]);
  
  return (
    <Modal
      title={title}
      open={visible}
      width={800}
      onCancel={onCancel}
      footer={[
        <Button key="cancel" onClick={onCancel}>
          Cancel
        </Button>,
        <Button 
          key="confirm" 
          type="primary" 
          onClick={handleConfirm}
          disabled={selected.length === 0}
        >
          {multiSelect 
            ? `Select ${selected.length} item${selected.length !== 1 ? 's' : ''}` 
            : 'Select'
          }
        </Button>
      ]}
    >
      <AsyncStateMatcher
        state={selectionState}
        views={{
          SuccessView: ({ state }) => {
            // Type check to ensure we're working with the correct state type
            if (!ModelSelectionSuccessState.is(state)) {
              return <div>Invalid selection state</div>;
            }
            
            const items = state.data?.items as T[] || [];
            const tableProps = state.tableProps as TableProps<T>;
            
            if (items.length === 0) {
              return <div>No items available</div>;
            }
            
            return (
              <div>
                {/* Search and filter section */}
                <Space direction="vertical" size="middle" style={{ width: '100%', marginBottom: 16 }}>
                  <Input.Search
                    placeholder="Search..."
                    allowClear
                    onSearch={(term) => state.search(term)}
                    style={{ width: '100%' }}
                  />
                  
                  {filterFields && (
                    <div className="filter-section">
                      {filterFields}
                    </div>
                  )}
                </Space>
                
                {/* Table of items */}
                <Table
                  {...tableProps}
                  dataSource={items}
                  pagination={false}
                  rowClassName={(record) => 
                    selected.some(item => item.id === record.id) ? 'ant-table-row-selected' : ''
                  }
                  onRow={(record) => ({
                    onClick: () => handleSelect(record),
                    style: { cursor: 'pointer' }
                  })}
                />
                
                {/* Pagination */}
                <div style={{ marginTop: 16, textAlign: 'right' }}>
                  <Pagination
                    current={state.pagination.current}
                    pageSize={state.pagination.pageSize}
                    total={state.pagination.total}
                    onChange={(page, pageSize) => 
                      state.pagination.onChange(page, pageSize || state.pagination.pageSize)
                    }
                    showSizeChanger
                    showTotal={(total, range) => `${range[0]}-${range[1]} of ${total} items`}
                  />
                </div>
                
                {/* Selected items summary */}
                {multiSelect && selected.length > 0 && (
                  <div style={{ marginTop: 16 }}>
                    <div>Selected ({selected.length}):</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
                      {selected.map(item => (
                        <div key={item.id} className="selected-item-tag">
                          {renderItem ? renderItem(item) : item.id}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          }
        }}
      />
    </Modal>
  );
}