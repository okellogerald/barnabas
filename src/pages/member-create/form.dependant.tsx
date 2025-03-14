import React, { useState } from 'react';
import { Button, Card, DatePicker, Divider, Form, FormInstance, Input, Space, Table, Typography } from 'antd';
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { DependantRelationship } from '@/constants';
import { EnumSelect } from '@/components/form';
import { useMemberCreate } from '@/interactors/member-create/hook';
import dayjs, { Dayjs } from 'dayjs';

interface Dependant {
  id?: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  relationship: DependantRelationship;
}

interface DependantFormProps {
  form: FormInstance<any>;
}

// Helper function to generate temporary IDs
const generateTempId = (): string => {
  return `temp-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
};

// Helper function to format DatePicker value
const formatDate = (date: Dayjs): string => {
  return date.format('YYYY-MM-DD');
};

// Form fields component
const DependantFormFields: React.FC<{ form: FormInstance<any> }> = () => (
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
  </Space>
);

export const DependantForm: React.FC<DependantFormProps> = ({ form }) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const state = useMemberCreate();

  const resetFormFields = () => {
    form.resetFields([
      'firstName',
      'lastName',
      'dateOfBirth',
      'relationship',
    ]);
  };

  const handleAddDependant = () => {
    form.validateFields().then(values => {
      const newDependant: Dependant = {
        id: generateTempId(),
        firstName: values.firstName,
        lastName: values.lastName,
        dateOfBirth: formatDate(values.dateOfBirth),
        relationship: values.relationship,
      };
      state.dependants.add(newDependant);
      resetFormFields();
    });
  };

  const handleDeleteDependant = (id: string) => {
    state.dependants.remove(id);
  };

  const handleEditDependant = (record: Dependant) => {
    setEditingId(record.id || null);
    form.setFieldsValue({
      firstName: record.firstName,
      lastName: record.lastName,
      dateOfBirth: dayjs(record.dateOfBirth),
      relationship: record.relationship,
    });
  };

  const handleSaveEdit = () => {
    form.validateFields().then(values => {
      const updatedDependant: Dependant = {
        id: editingId!,
        firstName: values.firstName,
        lastName: values.lastName,
        dateOfBirth: formatDate(values.dateOfBirth),
        relationship: values.relationship,
      };
      state.dependants.update(updatedDependant);
      setEditingId(null);
      resetFormFields();
    });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    resetFormFields();
  };

  const columns = [
    { title: 'First Name', dataIndex: 'firstName', key: 'firstName' },
    { title: 'Last Name', dataIndex: 'lastName', key: 'lastName' },
    { title: 'Date of Birth', dataIndex: 'dateOfBirth', key: 'dateOfBirth' },
    { title: 'Relationship', dataIndex: 'relationship', key: 'relationship' },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: Dependant) => (
        <Space>
          <Button type="link" onClick={() => handleEditDependant(record)}>Edit</Button>
          <Button type="link" danger icon={<DeleteOutlined />} onClick={() => handleDeleteDependant(record.id || '')} />
        </Space>
      ),
    },
  ];

  return (
    <Card>
      <Typography.Title level={5}>Dependants</Typography.Title>
      <Divider />

      <Form form={form} layout="horizontal">
        <DependantFormFields form={form} />
        <Form.Item>
          {editingId ? (
            <Space>
              <Button type="primary" onClick={handleSaveEdit}>Save</Button>
              <Button onClick={handleCancelEdit}>Cancel</Button>
            </Space>
          ) : (
            <Button type="primary" icon={<PlusOutlined />} onClick={handleAddDependant}>Add Dependant</Button>
          )}
        </Form.Item>
      </Form>

      <Table dataSource={state.dependants.items} columns={columns} rowKey="id" pagination={false} />
    </Card>
  );
};

export default DependantForm;