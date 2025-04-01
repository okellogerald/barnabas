import React, { useState } from 'react';
import { Card, Typography, Divider, Space, Button, Row, Col, Steps, Alert, Skeleton } from 'antd';
import { SaveOutlined } from '@ant-design/icons';
import DependantForm from './form.edit.dependant';
import { useMemberEdit } from '@/interactors/member-edit/hook';
import { SchemaFormSection } from '@/components/form/schema_based';
import { MemberEditMaritalInfo } from '@/interactors/member-edit/schemas/schemas.marital';
import { MemberEditPersonalInfo } from '@/interactors/member-edit/schemas/schemas.personal';
import { MemberEditContactInfo } from '@/interactors/member-edit/schemas/schemas.contact';
import { MemberEditChurchInfo } from '@/interactors/member-edit/schemas/schemas.church';
import { MemberEditProfessionalInfo } from '@/interactors/member-edit/schemas/schemas.professional';
import { MemberEditInterestsInfo } from '@/interactors/member-edit/schemas/schemas.interests';

import "./member_edit_page.css";

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
                        <Typography.Title level={5}>Dependants</Typography.Title>
                        <Typography.Text type="secondary">
                            Manage dependants such as children, relatives, or others in the member's care
                        </Typography.Text>
                        <Divider />
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