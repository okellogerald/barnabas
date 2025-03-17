import React, { useEffect } from 'react';
import { Card, Form, Typography, Divider, Space, Button, Row, Col, Steps } from 'antd';
import { VolunteerOpportunitySelect } from '@/components/form';
import { SaveOutlined } from '@ant-design/icons';
import DependantForm from './form.dependant';
import { useMemberCreate } from '@/interactors/member-create/hook';
import { SchemaFormSection } from '@/components/form/schema_based';
import { MaritalInfo } from '@/interactors/member-create/schemas/schemas.marital';
import { PersonalInfo } from '@/interactors/member-create/schemas/schemas.personal';
import { ContactInfo } from '@/interactors/member-create/schemas/schemas.contact';
import { ChurchInfo } from '@/interactors/member-create/schemas/schemas.church';
import { ProfessionalInfo } from '@/interactors/member-create/schemas/schemas.professional';

import "./member_create_page.css"

/**
 * Component for creating a new member
 */
const MemberCreatePage: React.FC = () => {
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
        actions
    } = useMemberCreate();

    // Debug log
    useEffect(() => {
        console.log("Forms initialized with values:", {
            personal: personal.form.getFieldsValue(),
            marital: marital.form.getFieldsValue(),
            contact: contact.form.getFieldsValue(),
            church: church.form.getFieldsValue(),
            professional: professional.form.getFieldsValue()
        });
    }, [personal.form, marital.form, contact.form, church.form, professional.form]);

    // Get current step key
    const currentStepKey = ui.steps[ui.currentStep].key;

    return (
        <Card title="Create New Member" style={{ margin: '20px' }} loading={ui.loading}>
            {/* Stepper navigation */}
            <Row>
                <Col span={24}>
                    <Steps
                        current={ui.currentStep}
                        onChange={actions.goToStep}
                        style={{ marginBottom: 32 }}
                        responsive={false}
                        size="small"
                        items={ui.steps.map((step, index) => {
                            // Show only the current step, one step before, one step after, 
                            // first and last steps, and represent others with ellipsis
                            if (
                                index === ui.currentStep ||
                                index === 0 ||
                                index === ui.steps.length - 1 ||
                                index === ui.currentStep - 1 ||
                                index === ui.currentStep + 1
                            ) {
                                return {
                                    title: step.title,
                                    icon: step.icon,
                                };
                            } else if (
                                (index === ui.currentStep - 2 && ui.currentStep > 1) ||
                                (index === ui.currentStep + 2 && ui.currentStep < ui.steps.length - 2)
                            ) {
                                // Return ellipsis for steps that should be hidden
                                return {
                                    title: '...',
                                    disabled: true,
                                };
                            }
                            return {};
                        }).filter(Boolean)}
                    />
                </Col>
            </Row>

            {/* All form sections - only show current step but render all forms */}
            <div style={{ marginBottom: 32 }}>
                {/* Personal Information Form */}
                <div className={`form-step ${currentStepKey === 'personal' ? 'form-step-active' : ''}`}>
                    <SchemaFormSection<PersonalInfo>
                        form={personal.form}
                        initialValues={personal.initialValues}
                        title="Personal Information"
                        description="Basic personal information about the member"
                        fields={personal.fields}
                        layout={personal.layout}
                    />
                </div>

                {/* Marital Information Form */}
                <div className={`form-step ${currentStepKey === 'marital' ? 'form-step-active' : ''}`}>
                    <SchemaFormSection<MaritalInfo>
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
                <div className={`form-step ${currentStepKey === 'contact' ? 'form-step-active' : ''}`}>
                    <SchemaFormSection<ContactInfo>
                        form={contact.form}
                        initialValues={contact.initialValues}
                        title="Contact Information"
                        description="Member's contact and residence details"
                        fields={contact.fields}
                        layout={contact.layout}
                    />
                </div>

                {/* Church Information Form */}
                <div className={`form-step ${currentStepKey === 'church' ? 'form-step-active' : ''}`}>
                    <SchemaFormSection<ChurchInfo>
                        form={church.form}
                        initialValues={church.initialValues}
                        title="Church Information"
                        description="Information about the member's role and involvement in church"
                        fields={church.fields}
                        layout={church.layout}
                    />
                </div>

                {/* Professional Information Form */}
                <div className={`form-step ${currentStepKey === 'professional' ? 'form-step-active' : ''}`}>
                    <SchemaFormSection<ProfessionalInfo>
                        form={professional.form}
                        initialValues={professional.initialValues}
                        title="Professional Information"
                        description="Information about the member's occupation and education"
                        fields={professional.fields}
                        layout={professional.layout}
                    />
                </div>

                {/* Dependants Form */}
                <div className={`form-step ${currentStepKey === 'dependants' ? 'form-step-active' : ''}`}>
                    <Card>
                        <Typography.Title level={5}>Dependants</Typography.Title>
                        <Typography.Text type="secondary">
                            Add dependants such as children, relatives, or others in the member's care
                        </Typography.Text>
                        <Divider />
                        <DependantForm form={dependant.form} />
                    </Card>
                </div>

                {/* Interests Form */}
                <div className={`form-step ${currentStepKey === 'interests' ? 'form-step-active' : ''}`}>
                    <Card>
                        <Typography.Title level={5}>Volunteer Interests</Typography.Title>
                        <Typography.Text type="secondary">
                            Select volunteer opportunities the member is interested in
                        </Typography.Text>
                        <Divider />
                        <Form form={interest.form} layout="vertical">
                            <Form.Item
                                label="Volunteer Interests"
                                name="interests"
                            >
                                <VolunteerOpportunitySelect
                                    placeholder="Select volunteer interests"
                                    onChange={(value) => interest.interests.set(value as string[])}
                                />
                            </Form.Item>
                        </Form>
                    </Card>
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
                        <Button
                            onClick={actions.reset}
                        >
                            Reset
                        </Button>
                        {ui.currentStep < ui.steps.length - 1 ? (
                            <Button
                                type="primary"
                                onClick={actions.nextStep}
                            >
                                Next
                            </Button>
                        ) : (
                            <Button
                                type="primary"
                                htmlType="submit"
                                icon={<SaveOutlined />}
                                loading={ui.loading}
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

export default MemberCreatePage;