import React, { useState } from 'react';
import { Button, Card, DatePicker, Divider, Form, Input, Space, Table, Typography } from 'antd';
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { DependantRelationship } from '@/constants';
import { EnumSelect } from '@/components/form';

// Dependant interface based on API docs
interface Dependant {
  id?: string; // Optional for new dependants
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  relationship: DependantRelationship;
}

interface DependantFormProps {
  value?: Dependant[];
  onChange?: (dependants: Dependant[]) => void;
}

/**
 * A form component for managing member dependants
 */
export const DependantForm: React.FC<DependantFormProps> = ({ value = [], onChange }) => {
  const [form] = Form.useForm();
  const [dependants, setDependants] = useState<Dependant[]>(value);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Generate temporary ID for new dependants
  const generateTempId = (): string => {
    return `temp-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  };

  // Handle adding a new dependant
  const handleAddDependant = () => {
    form.validateFields().then(values => {
      const newDependant: Dependant = {
        id: generateTempId(),
        firstName: values.firstName,
        lastName: values.lastName,
        dateOfBirth: values.dateOfBirth.format('YYYY-MM-DD'),
        relationship: values.relationship,
      };

      const updatedDependants = [...dependants, newDependant];
      setDependants(updatedDependants);

      if (onChange) {
        onChange(updatedDependants);
      }

      form.resetFields();
    });
  };

  // Handle deleting a dependant
  const handleDeleteDependant = (id: string) => {
    const updatedDependants = dependants.filter(d => d.id !== id);
    setDependants(updatedDependants);

    if (onChange) {
      onChange(updatedDependants);
    }
  };

  // Handle editing a dependant
  const handleEditDependant = (record: Dependant) => {
    setEditingId(record.id || null);
    form.setFieldsValue({
      firstName: record.firstName,
      lastName: record.lastName,
      dateOfBirth: dayjs(record.dateOfBirth),
      relationship: record.relationship,
    });
  };

  // Handle saving edits
  const handleSaveEdit = () => {
    form.validateFields().then(values => {
      const updatedDependants = dependants.map(d => {
        if (d.id === editingId) {
          return {
            ...d,
            firstName: values.firstName,
            lastName: values.lastName,
            dateOfBirth: values.dateOfBirth.format('YYYY-MM-DD'),
            relationship: values.relationship,
          };
        }
        return d;
      });

      setDependants(updatedDependants);
      setEditingId(null);

      if (onChange) {
        onChange(updatedDependants);
      }

      form.resetFields();
    });
  };

  // Cancel editing
  const handleCancelEdit = () => {
    setEditingId(null);
    form.resetFields();
  };

  // Table columns definition
  const columns = [
    {
      title: 'First Name',
      dataIndex: 'firstName',
      key: 'firstName',
    },
    {
      title: 'Last Name',
      dataIndex: 'lastName',
      key: 'lastName',
    },
    {
      title: 'Date of Birth',
      dataIndex: 'dateOfBirth',
      key: 'dateOfBirth',
    },
    {
      title: 'Relationship',
      dataIndex: 'relationship',
      key: 'relationship',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: Dependant) => (
        <Space>
          <Button
            type="link"
            onClick={() => handleEditDependant(record)}
          >
            Edit
          </Button>
          <Button
            type="link"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDeleteDependant(record.id || '')}
          />
        </Space>
      ),
    },
  ];

  return (
    <Card>
      <Typography.Title level={5}>Dependants</Typography.Title>
      <Divider />

      {/* Dependant entry form */}
      <Form form={form} layout="horizontal">
        <Space style={{ display: 'flex', marginBottom: 16 }} align="baseline">
          <Form.Item
            name="firstName"
            rules={[{ required: true, message: 'First name is required' }]}
          >
            <Input placeholder="First Name" style={{ width: 150 }} />
          </Form.Item>

          <Form.Item
            name="lastName"
            rules={[{ required: true, message: 'Last name is required' }]}
          >
            <Input placeholder="Last Name" style={{ width: 150 }} />
          </Form.Item>

          <Form.Item
            name="dateOfBirth"
            rules={[{ required: true, message: 'Date of birth is required' }]}
          >
            <DatePicker placeholder="Date of Birth" style={{ width: 150 }} />
          </Form.Item>

          <Form.Item
            name="relationship"
            rules={[{ required: true, message: 'Relationship is required' }]}
          >
            <EnumSelect
              enumType={DependantRelationship}
              placeholder="Relationship"
              style={{ width: 150 }}
            />
          </Form.Item>

          <Form.Item>
            {editingId ? (
              <Space>
                <Button type="primary" onClick={handleSaveEdit}>
                  Save
                </Button>
                <Button onClick={handleCancelEdit}>
                  Cancel
                </Button>
              </Space>
            ) : (
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={handleAddDependant}
              >
                Add Dependant
              </Button>
            )}
          </Form.Item>
        </Space>
      </Form>

      {/* Dependants table */}
      <Table
        dataSource={dependants}
        columns={columns}
        rowKey="id"
        pagination={false}
      />
    </Card>
  );
};

export default DependantForm;