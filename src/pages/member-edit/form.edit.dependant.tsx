import React, { useState } from 'react';
import { Button, DatePicker, Divider, Flex, Form, FormInstance, Input, Space, Table, Typography } from 'antd';
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { DependantRelationship } from '@/constants';
import { EnumSelect } from '@/components/form';
import { useMemberEdit } from '@/interactors/member-edit/hook';
import dayjs from 'dayjs';
import { DependantInfo } from '@/interactors/member-edit/schemas/schemas.dependants';
import { DateView } from '@/components';

interface DependantFormProps {
  form: FormInstance<any>;
  memberId: string
}

export const DependantForm: React.FC<DependantFormProps> = ({ form, memberId }) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const state = useMemberEdit(memberId);

  const handleAddDependant = async () => {
    const success = await state.dependant.dependants.add(form.getFieldsValue());
    if (success) form.resetFields();
  };

  const handleDeleteDependant = (id: string) => {
    state.dependant.dependants.remove(id);
  };

  const handleEditDependant = async (record: DependantInfo) => {
    setEditingId(record.id || null);
    form.setFieldsValue({
      firstName: record.firstName,
      lastName: record.lastName,
      dateOfBirth: record.dateOfBirth,
      relationship: record.relationship,
    });
  };

  const handleSaveEdit = async () => {
    if (!editingId) return;

    form.validateFields();
    const success = await state.dependant.dependants.update(editingId, form.getFieldsValue());
    if (success) {
      form.resetFields();
      setEditingId(null);
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    form.resetFields();
  };

  const columns = [
    { title: 'First Name', dataIndex: 'firstName', key: 'firstName' },
    { title: 'Last Name', dataIndex: 'lastName', key: 'lastName' },
    { title: 'Date of Birth', dataIndex: 'dateOfBirth', key: 'dateOfBirth', render: (value: any) => <DateView date={value} /> },
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
    <div>
      <Typography.Title level={5}>Dependants</Typography.Title>
      <Divider />

      <Form<DependantInfo> form={form} layout="horizontal">
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
            getValueProps={(value) => ({ value: value ? dayjs(value) : undefined })}
            getValueFromEvent={(date) => date}
          >
            <DatePicker
              placeholder="Date of Birth"
              style={{ width: "100%" }}
              format={"YYYY-MM-DD"}
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

      <Table dataSource={state.dependant.dependants.items} columns={columns} rowKey="id" pagination={false} />
    </div>
  );
};

export default DependantForm;