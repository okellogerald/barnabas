import React, { useState } from 'react';
import { Card, Typography, Divider, Space, Button, Row, Col, Steps, Alert, Skeleton, Flex, Form, FormInstance, Input, DatePicker, Table } from 'antd';
import { SaveOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { useMemberEdit } from '@/interactors/member-edit/hook';
import { SchemaFormSection } from '@/components/form/schema_based';
import { MemberEditMaritalInfo } from '@/interactors/member-edit/schemas/schemas.marital';
import { MemberEditPersonalInfo } from '@/interactors/member-edit/schemas/schemas.personal';
import { MemberEditContactInfo } from '@/interactors/member-edit/schemas/schemas.contact';
import { MemberEditChurchInfo } from '@/interactors/member-edit/schemas/schemas.church';
import { MemberEditProfessionalInfo } from '@/interactors/member-edit/schemas/schemas.professional';
import { MemberEditInterestsInfo } from '@/interactors/member-edit/schemas/schemas.interests';
import { DependantRelationship } from '@/constants';
import { EnumSelect } from '@/components/form';
import { DependantInfo } from '@/interactors/member-edit/schemas/schemas.dependants';
import { DateView } from '@/components';
import dayjs from 'dayjs';

import "./styles.css";

/**
 * Dependant form component for editing
 */
interface DependantFormProps {
  form: FormInstance<any>;
}

const DependantForm: React.FC<DependantFormProps> = ({ form }) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const state = useMemberEdit();

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
    const success = await state.dependant.dependants.update({ id: editingId, ...form.getFieldsValue() });
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

/**
 * Component for editing an existing member
 */
const MemberEditPage: React.FC = () => {
    const [saving, setSaving] = useState(false);
    const [lastSaved, setLastSaved] = useState<Date | null>(null);

    // Get all the state and actions from the interactor
    const {
        ui,
        personal,
        marital,
        contact,
        church,
        professional,
        dependant,
        interest,
        actions,
        loading,
        error,
    } = useMemberEdit();

    // Get current step key
    const currentStepKey = ui.steps[ui.currentStep].key;

    // Handle section save
    const handleSaveAndContinueSection = async () => {
        setSaving(true);
        try {
            await actions.saveCurrentSection();
            setLastSaved(new Date());
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <Card title="Edit Member" style={{ margin: '20px' }}>
                <Skeleton active paragraph={{ rows: 10 }} />
            </Card>
        );
    }

    if (error) {
        return (
            <Card title="Edit Member" style={{ margin: '20px' }}>
                <Alert
                    message="Error"
                    description={`Failed to load member data: ${error}`}
                    type="error"
                    showIcon
                />
            </Card>
        );
    }

    return (
        <Card title="Edit Member" style={{ margin: '20px' }} loading={ui.loading}>
            {/* Last saved indicator */}
            {lastSaved && (
                <Row style={{ marginBottom: '16px' }}>
                    <Col span={24}>
                        <Alert
                            message={`Last saved: ${lastSaved.toLocaleTimeString()}`}
                            type="success"
                            showIcon
                            closable
                        />
                    </Col>
                </Row>
            )}

            {/* Stepper navigation */}
            <Row>
                <Col span={24}>
                    <Steps
                        current={ui.currentStep}
                        onChange={actions.goToStep}
                        style={{ marginBottom: 32 }}
                        responsive={false}
                        size="small"
                        items={ui.steps.map((step) => ({
                            title: step.title,
                            icon: step.icon,
                        }))}
                    />
                </Col>
            </Row>

            {/* All form sections - only show current step but render all forms */}
            <div style={{ marginBottom: 32 }}>
                {/* Personal Information Form */}
                <div id="personal" className={`form-step ${currentStepKey === 'personal' ? 'form-step-active' : ''}`}>
                    <SchemaFormSection<MemberEditPersonalInfo>
                        form={personal.form}
                        initialValues={personal.initialValues}
                        title="Personal Information"
                        description="Basic personal information about the member"
                        fields={personal.fields}
                        layout={personal.layout}
                    />
                </div>

                {/* Marital Information Form */}
                <div id="marital" className={`form-step ${currentStepKey === 'marital' ? 'form-step-active' : ''}`}>
                    <SchemaFormSection<MemberEditMaritalInfo>
                        form={marital.form}
                        initialValues={marital.initialValues}
                        onFieldsChange={marital.onFieldsChange}
                        title="Marital Information"
                        description="Information about the member's marital status"
                        fields={marital.fields}
                        layout={marital.layout}
                    />
                </div>

                {/* Contact Information Form */}
                <div id="contact" className={`form-step ${currentStepKey === 'contact' ? 'form-step-active' : ''}`}>
                    <SchemaFormSection<MemberEditContactInfo>
                        form={contact.form}
                        initialValues={contact.initialValues}
                        title="Contact Information"
                        description="Member's contact and residence details"
                        fields={contact.fields}
                        layout={contact.layout}
                    />
                </div>

                {/* Church Information Form */}
                <div id="church" className={`form-step ${currentStepKey === 'church' ? 'form-step-active' : ''}`}>
                    <SchemaFormSection<MemberEditChurchInfo>
                        form={church.form}
                        initialValues={church.initialValues}
                        onFieldsChange={church.onFieldsChange}
                        title="Church Information"
                        description="Information about the member's role and involvement in church"
                        fields={church.fields}
                        layout={church.layout}
                    />
                </div>

                {/* Professional Information Form */}
                <div id="professional" className={`form-step ${currentStepKey === 'professional' ? 'form-step-active' : ''}`}>
                    <SchemaFormSection<MemberEditProfessionalInfo>
                        form={professional.form}
                        initialValues={professional.initialValues}
                        title="Professional Information"
                        description="Information about the member's occupation and education"
                        fields={professional.fields}
                        layout={professional.layout}
                    />
                </div>

                {/* Dependants Form */}
                <div id="dependants" className={`form-step ${currentStepKey === 'dependants' ? 'form-step-active' : ''}`}>
                    <Card>
                        <DependantForm form={dependant.form} />
                    </Card>
                </div>

                {/* Interests Form */}
                <div id="interests" className={`form-step ${currentStepKey === 'interests' ? 'form-step-active' : ''}`}>
                    <SchemaFormSection<MemberEditInterestsInfo>
                        form={interest.form}
                        initialValues={interest.initialValues}
                        title="Volunteer Interests Information"
                        description="Information about the member's volunteer interests"
                        fields={interest.fields}
                        layout={interest.layout}
                    />
                </div>
            </div>

            <Divider />

            {/* Navigation and submission buttons */}
            <Row justify="space-between">
                <Col>
                    <Button
                        disabled={ui.currentStep === 0}
                        onClick={actions.previousStep}
                    >
                        Previous
                    </Button>
                </Col>
                <Col>
                    <Space>
                        {ui.currentStep < ui.steps.length - 1 ? (
                            <Button
                                type="primary"
                                onClick={async () => {
                                    await handleSaveAndContinueSection();
                                }}
                                loading={saving}
                            >
                                Save and Continue
                            </Button>
                        ) : (
                            <Button
                                type="primary"
                                htmlType="submit"
                                icon={<SaveOutlined />}
                                loading={ui.loading || saving}
                                onClick={actions.submit}
                            >
                                Save Member
                            </Button>
                        )}
                    </Space>
                </Col>
            </Row>
        </Card>
    );
};

export default MemberEditPage;