import React, { useState } from 'react';
import { Card, Form, message, Tabs, Typography, Divider, Switch, Space, Button, Row, Col, Steps } from 'antd';
import { FormFieldBuilder, EnumSelect, FellowshipSelect, VolunteerOpportunitySelect } from '@/components/form';
import { Gender, MaritalStatus, MarriageType, MemberRole, EducationLevel, DependantRelationship } from '@/constants';
import { BankOutlined, HeartOutlined, HomeOutlined, PhoneOutlined, SaveOutlined, StarOutlined, TeamOutlined, UserOutlined } from '@ant-design/icons';
import DependantForm from './form.dependant';
import DMPFormSection from '@/components/form/section';

// Define the member form values interface
interface MemberFormValues {
    // Personal Information
    envelopeNumber: string;
    firstName: string;
    middleName: string;
    lastName: string;
    gender: Gender;
    dateOfBirth: Date;
    placeOfBirth: string;
    profilePhoto: string;

    // Marital Information
    maritalStatus: MaritalStatus;
    marriageType: MarriageType;
    dateOfMarriage: Date;
    spouseName: string;
    placeOfMarriage: string;

    // Contact Information
    phoneNumber: string;
    email: string;
    spousePhoneNumber: string;
    residenceNumber: string;
    residenceBlock: string;
    postalBox: string;
    residenceArea: string;

    // Church Information
    formerChurch: string;
    memberRole: MemberRole;
    isBaptized: boolean;
    isConfirmed: boolean;
    partakesLordSupper: boolean;
    fellowshipId: string;
    nearestMemberName: string;
    nearestMemberPhone: string;
    attendsFellowship: boolean;
    fellowshipAbsenceReason: string;

    // Professional Information
    occupation: string;
    placeOfWork: string;
    educationLevel: EducationLevel;
    profession: string;

    // Dependants (handled separately)
    dependants: Array<{
        id?: string;
        firstName: string;
        lastName: string;
        dateOfBirth: string;
        relationship: DependantRelationship;
    }>;

    // Interests/Volunteer Opportunities (handled separately)
    interests: string[];
}

// Define keys for each form section to ensure type safety
type PersonalInfoKeys = 'envelopeNumber' | 'firstName' | 'middleName' | 'lastName' | 'gender' | 'dateOfBirth' | 'placeOfBirth' | 'profilePhoto';
type MaritalInfoKeys = 'maritalStatus' | 'marriageType' | 'dateOfMarriage' | 'spouseName' | 'placeOfMarriage';
type ContactInfoKeys = 'phoneNumber' | 'email' | 'spousePhoneNumber' | 'residenceNumber' | 'residenceBlock' | 'postalBox' | 'residenceArea';
type ChurchInfoKeys = 'formerChurch' | 'memberRole' | 'isBaptized' | 'isConfirmed' | 'partakesLordSupper' | 'fellowshipId' | 'nearestMemberName' | 'nearestMemberPhone' | 'attendsFellowship' | 'fellowshipAbsenceReason';
type ProfessionalInfoKeys = 'occupation' | 'placeOfWork' | 'educationLevel' | 'profession';

// Define step data for navigation
const steps = [
    {
        title: 'Personal',
        description: 'Basic details',
        icon: <UserOutlined />,
        key: 'personal',
    },
    {
        title: 'Marital',
        description: 'Marital status',
        icon: <HeartOutlined />,
        key: 'marital',
    },
    {
        title: 'Contact',
        description: 'Contact details',
        icon: <PhoneOutlined />,
        key: 'contact',
    },
    {
        title: 'Church',
        description: 'Church information',
        icon: <HomeOutlined />,
        key: 'church',
    },
    {
        title: 'Professional',
        description: 'Work & education',
        icon: <BankOutlined />,
        key: 'professional',
    },
    {
        title: 'Dependants',
        description: 'Family members',
        icon: <TeamOutlined />,
        key: 'dependants',
    },
    {
        title: 'Interests',
        description: 'Volunteer roles',
        icon: <StarOutlined />,
        key: 'interests',
    },
];

const MemberCreatePage: React.FC = () => {
    const [form] = Form.useForm<MemberFormValues>();
    const builder = new FormFieldBuilder<MemberFormValues>();
    const [currentStep, setCurrentStep] = useState(0);
    const [dependants, setDependants] = useState<any[]>([]);
    const [interests, setInterests] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);

    // Get current step key
    const currentStepKey = steps[currentStep].key;

    // Form submission handler
    const handleFormSubmit = async (values: MemberFormValues) => {
        try {
            setLoading(true);

            // Add the dependants and interests to the form values
            const completeValues = {
                ...values,
                dependants,
                interests,
            };

            // In a real application, you would call your API here
            console.log('Form values:', completeValues);

            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));

            message.success('Member created successfully!');

            // Optional: Reset form and state
            form.resetFields();
            setDependants([]);
            setInterests([]);
            setCurrentStep(0);
        } catch (error) {
            console.error('Error creating member:', error);
            message.error('Failed to create member. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // Handle next step
    const handleNext = async () => {
        try {
            // Get the fields for the current step
            const fieldsToValidate = getFieldsForStep(currentStepKey);

            // Validate only the fields for the current step
            await form.validateFields(fieldsToValidate);

            // Proceed to next step if validation succeeds
            if (currentStep < steps.length - 1) {
                setCurrentStep(currentStep + 1);
            }
        } catch (error) {
            console.error('Validation failed:', error);
        }
    };

    // Handle previous step
    const handlePrevious = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
        }
    };

    // Get form fields to validate for each step
    const getFieldsForStep = (step: string): string[] => {
        switch (step) {
            case 'personal':
                return ['firstName', 'lastName', 'gender', 'dateOfBirth'];
            case 'marital':
                return ['maritalStatus'];
            case 'contact':
                return ['phoneNumber'];
            case 'church':
                return ['memberRole', 'fellowshipId'];
            case 'professional':
                return [];
            case 'dependants':
                return [];
            case 'interests':
                return [];
            default:
                return [];
        }
    };

    // Create form fields for the personal section
    const personalFields = {
        envelopeNumber: builder.createTextField({
            label: 'Envelope Number',
            name: 'envelopeNumber',
            placeholder: 'Enter envelope number',
        }),
        firstName: builder.createTextField({
            label: 'First Name',
            name: 'firstName',
            placeholder: 'Enter first name',
            required: true,
        }),
        middleName: builder.createTextField({
            label: 'Middle Name',
            name: 'middleName',
            placeholder: 'Enter middle name',
        }),
        lastName: builder.createTextField({
            label: 'Last Name',
            name: 'lastName',
            placeholder: 'Enter last name',
            required: true,
        }),
        gender: {
            label: 'Gender',
            name: 'gender',
            rules: [{ required: true, message: 'Please select gender' }],
            render: () => (
                <EnumSelect
                    enumType={Gender}
                    placeholder="Select gender"
                    data-testid="gender-select"
                />
            ),
        },
        dateOfBirth: builder.createDateField({
            label: 'Date of Birth',
            name: 'dateOfBirth',
            required: true,
        }),
        placeOfBirth: builder.createTextField({
            label: 'Place of Birth',
            name: 'placeOfBirth',
            placeholder: 'Enter place of birth',
        }),
        profilePhoto: builder.createURLField({
            label: 'Profile Photo URL',
            name: 'profilePhoto',
            placeholder: 'Enter profile photo URL',
        }),
    };

    // Create form fields for the marital section
    const maritalFields = {
        maritalStatus: {
            label: 'Marital Status',
            name: 'maritalStatus',
            rules: [{ required: true, message: 'Please select marital status' }],
            render: () => (
                <EnumSelect
                    enumType={MaritalStatus}
                    placeholder="Select marital status"
                    data-testid="marital-status-select"
                />
            ),
        },
        marriageType: {
            label: 'Marriage Type',
            name: 'marriageType',
            render: () => (
                <EnumSelect
                    enumType={MarriageType}
                    placeholder="Select marriage type"
                    data-testid="marriage-type-select"
                />
            ),
        },
        dateOfMarriage: builder.createDateField({
            label: 'Date of Marriage',
            name: 'dateOfMarriage',
        }),
        spouseName: builder.createTextField({
            label: 'Spouse Name',
            name: 'spouseName',
            placeholder: 'Enter spouse name',
        }),
        placeOfMarriage: builder.createTextField({
            label: 'Place of Marriage',
            name: 'placeOfMarriage',
            placeholder: 'Enter place of marriage',
        }),
    };

    // Create form fields for the contact section
    const contactFields = {
        phoneNumber: builder.createPhoneField({
            label: 'Phone Number',
            name: 'phoneNumber',
            required: true,
        }),
        email: builder.createEmailField({
            label: 'Email',
            name: 'email',
        }),
        spousePhoneNumber: builder.createPhoneField({
            label: 'Spouse Phone Number',
            name: 'spousePhoneNumber',
        }),
        residenceNumber: builder.createTextField({
            label: 'Residence Number',
            name: 'residenceNumber',
            placeholder: 'E.g., Block 5, House 23',
        }),
        residenceBlock: builder.createTextField({
            label: 'Residence Block',
            name: 'residenceBlock',
            placeholder: 'E.g., Mikocheni B',
        }),
        postalBox: builder.createTextField({
            label: 'Postal Box',
            name: 'postalBox',
            placeholder: 'E.g., P.O. Box 12345',
        }),
        residenceArea: builder.createTextField({
            label: 'Residence Area',
            name: 'residenceArea',
            placeholder: 'E.g., Mikocheni',
        }),
    };

    // Create form fields for the church section
    const churchFields = {
        formerChurch: builder.createTextField({
            label: 'Former Church',
            name: 'formerChurch',
            placeholder: 'Enter former church name',
        }),
        memberRole: {
            label: 'Member Role',
            name: 'memberRole',
            rules: [{ required: true, message: 'Please select member role' }],
            render: () => (
                <EnumSelect
                    enumType={MemberRole}
                    placeholder="Select member role"
                    data-testid="member-role-select"
                />
            ),
        },
        isBaptized: {
            label: 'Is Baptized',
            name: 'isBaptized',
            valuePropName: 'checked',
            render: () => <Switch />,
        },
        isConfirmed: {
            label: 'Is Confirmed',
            name: 'isConfirmed',
            valuePropName: 'checked',
            render: () => <Switch />,
        },
        partakesLordSupper: {
            label: 'Partakes Lord\'s Supper',
            name: 'partakesLordSupper',
            valuePropName: 'checked',
            render: () => <Switch />,
        },
        fellowshipId: {
            label: 'Fellowship',
            name: 'fellowshipId',
            rules: [{ required: true, message: 'Please select a fellowship' }],
            render: () => <FellowshipSelect placeholder="Select fellowship" />,
        },
        nearestMemberName: builder.createTextField({
            label: 'Nearest Member Name',
            name: 'nearestMemberName',
            placeholder: 'Enter nearest member name',
        }),
        nearestMemberPhone: builder.createPhoneField({
            label: 'Nearest Member Phone',
            name: 'nearestMemberPhone',
        }),
        attendsFellowship: {
            label: 'Attends Fellowship',
            name: 'attendsFellowship',
            valuePropName: 'checked',
            render: () => <Switch />,
        },
        fellowshipAbsenceReason: builder.createTextAreaField({
            label: 'Fellowship Absence Reason',
            name: 'fellowshipAbsenceReason',
            placeholder: 'Explain reason for not attending fellowship',
            rows: 3,
        }),
    };

    // Create form fields for the professional section
    const professionalFields = {
        occupation: builder.createTextField({
            label: 'Occupation',
            name: 'occupation',
            placeholder: 'Enter occupation',
        }),
        placeOfWork: builder.createTextField({
            label: 'Place of Work',
            name: 'placeOfWork',
            placeholder: 'Enter place of work',
        }),
        educationLevel: {
            label: 'Education Level',
            name: 'educationLevel',
            render: () => (
                <EnumSelect
                    enumType={EducationLevel}
                    placeholder="Select education level"
                    data-testid="education-level-select"
                />
            ),
        },
        profession: builder.createTextField({
            label: 'Profession',
            name: 'profession',
            placeholder: 'Enter profession',
        }),
    };

    // Define layouts for each section
    const personalLayout = {
        rows: {
            row1: ['firstName', 'middleName', 'lastName'] as PersonalInfoKeys[],
            row2: ['gender', 'dateOfBirth', 'placeOfBirth'] as PersonalInfoKeys[],
            row3: ['envelopeNumber', 'profilePhoto'] as PersonalInfoKeys[],
        },
        span: 8, // 3 fields per row (24/3=8)
    };

    const maritalLayout = {
        rows: {
            row1: ['maritalStatus', 'marriageType'] as MaritalInfoKeys[],
            row2: ['dateOfMarriage', 'spouseName', 'placeOfMarriage'] as MaritalInfoKeys[],
        },
        span: 8,
    };

    const contactLayout = {
        rows: {
            row1: ['phoneNumber', 'email'] as ContactInfoKeys[],
            row2: ['spousePhoneNumber'] as ContactInfoKeys[],
            row3: ['residenceNumber', 'residenceBlock'] as ContactInfoKeys[],
            row4: ['postalBox', 'residenceArea'] as ContactInfoKeys[],
        },
        span: 8,
    };

    const churchLayout = {
        rows: {
            row1: ['formerChurch', 'memberRole'] as ChurchInfoKeys[],
            row2: ['isBaptized', 'isConfirmed', 'partakesLordSupper'] as ChurchInfoKeys[],
            row3: ['fellowshipId', 'attendsFellowship'] as ChurchInfoKeys[],
            row4: ['nearestMemberName', 'nearestMemberPhone'] as ChurchInfoKeys[],
            row5: ['fellowshipAbsenceReason'] as ChurchInfoKeys[],
        },
        span: 8,
    };

    const professionalLayout = {
        rows: {
            row1: ['occupation', 'placeOfWork'] as ProfessionalInfoKeys[],
            row2: ['educationLevel', 'profession'] as ProfessionalInfoKeys[],
        },
        span: 8,
    };

    // Render current step content
    const renderStepContent = () => {
        switch (currentStepKey) {
            case 'personal':
                return (
                    <DMPFormSection<MemberFormValues, PersonalInfoKeys>
                        form={form}
                        formFields={personalFields}
                        formStructure={personalLayout}
                        title="Personal Information"
                        description="Basic personal information about the member"
                        footer={null}
                    />
                );
            case 'marital':
                return (
                    <DMPFormSection<MemberFormValues, MaritalInfoKeys>
                        form={form}
                        formFields={maritalFields}
                        formStructure={maritalLayout}
                        title="Marital Information"
                        description="Information about the member's marital status"
                        footer={null}
                    />
                );
            case 'contact':
                return (
                    <DMPFormSection<MemberFormValues, ContactInfoKeys>
                        form={form}
                        formFields={contactFields}
                        formStructure={contactLayout}
                        title="Contact Information"
                        description="Member's contact and residence details"
                        footer={null}
                    />
                );
            case 'church':
                return (
                    <DMPFormSection<MemberFormValues, ChurchInfoKeys>
                        form={form}
                        formFields={churchFields}
                        formStructure={churchLayout}
                        title="Church Information"
                        description="Information about the member's role and involvement in church"
                        footer={null}
                    />
                );
            case 'professional':
                return (
                    <DMPFormSection<MemberFormValues, ProfessionalInfoKeys>
                        form={form}
                        formFields={professionalFields}
                        formStructure={professionalLayout}
                        title="Professional Information"
                        description="Information about the member's occupation and education"
                        footer={null}
                    />
                );
            case 'dependants':
                return (
                    <>
                        <Typography.Title level={4}>Dependants</Typography.Title>
                        <Typography.Text type="secondary">
                            Add dependants such as children, relatives, or others in the member's care
                        </Typography.Text>
                        <Divider />
                        <DependantForm
                            value={dependants}
                            onChange={setDependants}
                        />
                    </>
                );
            case 'interests':
                return (
                    <>
                        <Typography.Title level={4}>Volunteer Interests</Typography.Title>
                        <Typography.Text type="secondary">
                            Select volunteer opportunities the member is interested in
                        </Typography.Text>
                        <Divider />
                        <Form.Item
                            label="Volunteer Interests"
                            name="interests"
                            rules={[{ required: false }]}
                        >
                            <VolunteerOpportunitySelect
                                placeholder="Select volunteer interests"
                                onChange={(value) => setInterests(value as string[])}
                            />
                        </Form.Item>
                    </>
                );
            default:
                return null;
        }
    };

    return (
        <Card title="Create New Member" style={{ margin: '20px' }} loading={loading}>
            <Form form={form} layout="vertical" onFinish={handleFormSubmit}>
                {/* Stepper navigation */}
                <Row>
                    <Col span={24}>
                        <Steps
                            current={currentStep}
                            onChange={(step) => setCurrentStep(step)}
                            style={{ marginBottom: 32 }}
                            responsive={false}
                            size="small"
                            items={steps.map((step, index) => {
                                // Show only the current step, one step before, one step after, 
                                // first and last steps, and represent others with ellipsis
                                if (
                                    index === currentStep ||
                                    index === 0 ||
                                    index === steps.length - 1 ||
                                    index === currentStep - 1 ||
                                    index === currentStep + 1
                                ) {
                                    return {
                                        title: step.title,
                                        icon: step.icon,
                                    };
                                } else if (
                                    (index === currentStep - 2 && currentStep > 1) ||
                                    (index === currentStep + 2 && currentStep < steps.length - 2)
                                ) {
                                    // Return ellipsis for steps that should be hidden
                                    return {
                                        title: '...',
                                        disabled: true,
                                    };
                                }
                                return null;
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
                            disabled={currentStep === 0}
                            onClick={handlePrevious}
                        >
                            Previous
                        </Button>
                    </Col>
                    <Col>
                        <Space>
                            <Button
                                onClick={() => {
                                    form.resetFields();
                                    setDependants([]);
                                    setInterests([]);
                                    setCurrentStep(0);
                                }}
                            >
                                Reset
                            </Button>
                            {currentStep < steps.length - 1 ? (
                                <Button
                                    type="primary"
                                    onClick={handleNext}
                                >
                                    Next
                                </Button>
                            ) : (
                                <Button
                                    type="primary"
                                    htmlType="submit"
                                    icon={<SaveOutlined />}
                                    loading={loading}
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