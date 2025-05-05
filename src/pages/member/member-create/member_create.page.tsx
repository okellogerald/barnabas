import React from 'react';
import { Card, Typography, Divider, Space, Button, Row, Col, Steps, Alert } from 'antd';
import { SaveOutlined } from '@ant-design/icons';
import DependantForm from './form.dependant';
import { useMemberCreate } from '@/interactors/member-create/hook';
import { SchemaFormSection } from '@/components/form/schema_based';
import { MemberCreateMaritalInfo } from '@/interactors/member-create/schemas/schemas.marital';
import { MemberCreatePersonalInfo } from '@/interactors/member-create/schemas/schemas.personal';
import { MemberCreateContactInfo } from '@/interactors/member-create/schemas/schemas.contact';
import { MemberCreateChurchInfo } from '@/interactors/member-create/schemas/schemas.church';
import { MemberCreateProfessionalInfo } from '@/interactors/member-create/schemas/schemas.professional';
import { MemberCreateInterestsInfo } from '@/interactors/member-create/schemas/schemas.interests';

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

    // Get current step key
    const currentStepKey = ui.currentStepKey;

    // Check if there's a fellowship context
    const hasFellowshipContext = !!ui.context?.fellowshipId;
    const fellowshipName = ui.context?.fellowshipName || 'selected fellowship';

    return (
        <div>
            {/* Main Card - contains the form steps */}
            <Card title="Create New Member" style={{ margin: '20px' }} loading={ui.isSubmittingForm}>
                {/* Stepper navigation */}
                <Row>
                    <Col span={24}>
                        <Steps
                            current={ui.currentStepIndex}
                            onChange={actions.goToStep}
                            style={{ marginBottom: 32 }}
                            responsive={false}
                            size="small"
                            items={ui.steps.map((step, index) => {
                                // Show only the current step, one step before, one step after, 
                                // first and last steps, and represent others with ellipsis
                                if (
                                    index === ui.currentStepIndex ||
                                    index === 0 ||
                                    index === ui.steps.length - 1 ||
                                    index === ui.currentStepIndex - 1 ||
                                    index === ui.currentStepIndex + 1
                                ) {
                                    return {
                                        title: step.title,
                                        icon: step.icon,
                                    };
                                } else if (
                                    (index === ui.currentStepIndex - 2 && ui.currentStepIndex > 1) ||
                                    (index === ui.currentStepIndex + 2 && ui.currentStepIndex < ui.steps.length - 2)
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
                        <SchemaFormSection<MemberCreatePersonalInfo>
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
                        <SchemaFormSection<MemberCreateMaritalInfo>
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
                        <SchemaFormSection<MemberCreateContactInfo>
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
                        <SchemaFormSection<MemberCreateChurchInfo>
                            form={church.form}
                            initialValues={church.initialValues}
                            onFieldsChange={church.onFieldsChange}
                            title={hasFellowshipContext ? "Fellowship & Church Information" : "Church Information"}
                            description={
                                hasFellowshipContext
                                    ? `Confirm fellowship assignment and provide other church information`
                                    : "Information about the member's role and involvement in church"
                            }
                            extra={
                                hasFellowshipContext && (
                                    <Alert
                                        type="success"
                                        message={`This member will be assigned to ${fellowshipName} fellowship`}
                                        showIcon
                                    />
                                )
                            }
                            fields={church.fields}
                            layout={church.layout}
                        />
                    </div>

                    {/* Professional Information Form */}
                    <div className={`form-step ${currentStepKey === 'professional' ? 'form-step-active' : ''}`}>
                        <SchemaFormSection<MemberCreateProfessionalInfo>
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
                        <SchemaFormSection<MemberCreateInterestsInfo>
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
                            disabled={ui.currentStepIndex === 0}
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
                            {ui.currentStepIndex < ui.steps.length - 1 ? (
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
                                    loading={ui.isSubmittingForm}
                                    onClick={actions.submit}
                                >
                                    Save Member
                                </Button>
                            )}
                        </Space>
                    </Col>
                </Row>
            </Card>
        </div>
    );
};

export default MemberCreatePage;