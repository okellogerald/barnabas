import React, { useState } from 'react';
import { Button, Card, DatePicker, Divider, Flex, Form, FormInstance, Input, Space, Table, Typography } from 'antd';
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { DependantRelationship } from '@/constants';
import { EnumSelect } from '@/components/form';
import { useMemberCreate } from '@/interactors/member-create/hook';
import dayjs, { Dayjs } from 'dayjs';
import { DependantInfo } from '@/interactors/member-create/schemas/schemas.dependants';

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
      const newDependant: DependantInfo = {
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

  const handleEditDependant = (record: DependantInfo) => {
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
      const updatedDependant: DependantInfo = {
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
      render: (_: any, record: DependantInfo) => (
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
        <Flex gap={"large"}>
          <Form.Item
            name="firstName"
            style={{ width: "100%" }}
            rules={[{ required: true, message: 'First name is required' }]}
          >
            <Input placeholder="First Name" />
          </Form.Item>

          <Form.Item
            name="lastName"
            style={{ width: "100%" }}
            rules={[{ required: true, message: 'Last name is required' }]}
          >
            <Input placeholder="Last Name" />
          </Form.Item>

          <Form.Item
            name="dateOfBirth"
            style={{ width: "100%" }}
            rules={[{ required: true, message: 'Date of birth is required' }]}
          >
            <DatePicker
              placeholder="Date of Birth"
              style={{ width: "100%" }}
            />
          </Form.Item>

          <Form.Item
            name="relationship"
            style={{ width: "100%" }}
            rules={[{ required: true, message: 'Relationship is required' }]}
          >
            <EnumSelect
              enumType={DependantRelationship}
              placeholder="Relationship"
            />
          </Form.Item>
          <Form.Item style={{ width: 150 }}>
            {editingId ? (
              <Space>
                <Button type="primary" onClick={handleSaveEdit}>Save</Button>
                <Button onClick={handleCancelEdit}>Cancel</Button>
              </Space>
            ) : (
              <Button type="primary" icon={<PlusOutlined />} onClick={handleAddDependant}>Add Dependant</Button>
            )}
          </Form.Item>
        </Flex>
      </Form>

      <Table dataSource={state.dependants.items} columns={columns} rowKey="id" pagination={false} />
    </Card>
  );
};

export default DependantForm;
