import React from 'react';
import { Card, Form, Typography, Divider, Space, Button, Row, Col, Steps } from 'antd';
import { VolunteerOpportunitySelect } from '@/components/form';
import { SaveOutlined } from '@ant-design/icons';
import DependantForm from './form.dependant';
import { useMemberCreate } from '@/interactors/member-create/hook';
import { SchemaFormSection } from '@/components/form/schema_based';

/**
 * Component for creating a new member
 */
const MemberCreatePage: React.FC = () => {
    // Get all the state and actions from the interactor
    const {
        form,
        ui,
        layouts,
        fields,
        dependants,
        interests,
        actions
    } = useMemberCreate();

    /**
     * Renders the current step content based on the current step key
     */
    const renderStepContent = () => {
        const currentStepKey = ui.steps[ui.currentStep].key;

        switch (currentStepKey) {
            case 'personal':
                return (
                    <SchemaFormSection
                        form={form}
                        title="Personal Information"
                        description="Basic personal information about the member"
                        fields={fields.personal}
                        layout={layouts.personal}
                    />
                );
            case 'marital':
                return (
                    <SchemaFormSection
                        form={form}
                        title="Marital Information"
                        description="Information about the member's marital status"
                        fields={fields.marital}
                        layout={layouts.marital}
                    />
                );
            case 'contact':
                return (
                    <SchemaFormSection
                        form={form}
                        title="Contact Information"
                        description="Member's contact and residence details"
                        fields={fields.contact}
                        layout={layouts.contact}
                    />
                );
            case 'church':
                return (
                    <SchemaFormSection
                        form={form}
                        title="Church Information"
                        description="Information about the member's role and involvement in church"
                        fields={fields.church}
                        layout={layouts.church}
                    />
                );
            case 'professional':
                return (
                    <SchemaFormSection
                        form={form}
                        title="Professional Information"
                        description="Information about the member's occupation and education"
                        fields={fields.professional}
                        layout={layouts.professional}
                    />
                );
            case 'dependants':
                return (
                    <Card>
                        <Typography.Title level={5}>Dependants</Typography.Title>
                        <Typography.Text type="secondary">
                            Add dependants such as children, relatives, or others in the member's care
                        </Typography.Text>
                        <Divider />
                        <DependantForm
                            value={dependants.items}
                            onChange={dependants.set}
                        />
                    </Card>
                );
            case 'interests':
                return (
                    <Card>
                        <Typography.Title level={5}>Volunteer Interests</Typography.Title>
                        <Typography.Text type="secondary">
                            Select volunteer opportunities the member is interested in
                        </Typography.Text>
                        <Divider />
                        <Form form={form} layout="vertical">
                            <Form.Item
                                label="Volunteer Interests"
                                name="interests"
                            >
                                <VolunteerOpportunitySelect
                                    placeholder="Select volunteer interests"
                                    onChange={(value) => interests.set(value as string[])}
                                />
                            </Form.Item>
                        </Form>
                    </Card>
                );
            default:
                return null;
        }
    };

    return (
        <Card title="Create New Member" style={{ margin: '20px' }} loading={ui.loading}>
            <Form form={form} layout="vertical" onFinish={actions.submit}>
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

                {/* Current step content */}
                <div style={{ marginBottom: 32 }}>
                    {renderStepContent()}
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
                                >
                                    Save Member
                                </Button>
                            )}
                        </Space>
                    </Col>
                </Row>
            </Form>
        </Card>
    );
};

export default MemberCreatePage;