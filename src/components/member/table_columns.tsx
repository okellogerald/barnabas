import { ColumnType } from "antd/es/table";
import { Badge, Space, Typography } from "antd";
import { Member } from "../../models";
import { NULL_DISPLAY, renderWithNull } from "../null_display";

const { Text } = Typography;

/**
 * Member Name Column
 */
const MemberNameColumn: ColumnType<Member> = {
    title: 'Name',
    dataIndex: 'firstName',
    key: 'name',
    width: 180,
    fixed: 'left',
    render: (_, record) => (
        <span>
            {record.firstName} {record.middleName ? record.middleName + ' ' : ''}{record.lastName}
        </span>
    )
};

/**
 * Contact Information Column
 */
const MemberContactColumn: ColumnType<Member> = {
    title: 'Contact',
    dataIndex: 'phoneNumber',
    key: 'contact',
    width: 170,
    render: (phone, record) => (
        <Space direction="vertical" size="small">
            {phone ? <Text>{phone}</Text> : <Text type="secondary">{NULL_DISPLAY}</Text>}
            {record.email ? <Text>{record.email}</Text> : null}
        </Space>
    )
};

/**
 * Gender Column
 */
const MemberGenderColumn: ColumnType<Member> = {
    title: 'Gender',
    dataIndex: 'gender',
    key: 'gender',
    width: 90,
    render: renderWithNull
};

/**
 * Marital Status Column
 */
const MemberMaritalStatusColumn: ColumnType<Member> = {
    title: 'Marital Status',
    dataIndex: 'maritalStatus',
    key: 'maritalStatus',
    width: 120,
    render: renderWithNull
};

/**
 * Fellowship Column
 */
const MemberFellowshipColumn: ColumnType<Member> = {
    title: 'Fellowship',
    dataIndex: ['fellowship', 'name'],
    key: 'fellowship',
    width: 130,
    render: (_, record) => {
        const fellowship = record.fellowship?.getDisplayName()
        if (!record.fellowship) return <Text type="secondary">{NULL_DISPLAY}</Text>;
        return <Text>{fellowship}</Text>;
    }
};

/**
 * Residence Area Column
 */
const MemberResidenceColumn: ColumnType<Member> = {
    title: 'Residence',
    dataIndex: 'residenceArea',
    key: 'residence',
    width: 130,
    render: renderWithNull
};

/**
 * Baptism Status Column
 */
const MemberBaptismColumn: ColumnType<Member> = {
    title: 'Baptized',
    dataIndex: 'isBaptized',
    key: 'baptism',
    width: 100,
    render: (value) => (
        value ?
            <Badge status="success" text="Yes" /> :
            <Badge status="default" text="No" />
    )
};

/**
 * Confirmation Status Column
 */
const MemberConfirmationColumn: ColumnType<Member> = {
    title: 'Confirmed',
    dataIndex: 'isConfirmed',
    key: 'confirmation',
    width: 100,
    render: (value) => (
        value ?
            <Badge status="success" text="Yes" /> :
            <Badge status="default" text="No" />
    )
};

/**
 * Member Role Column
 */
const MemberRoleColumn: ColumnType<Member> = {
    title: 'Role',
    dataIndex: 'memberRole',
    key: 'role',
    width: 100,
    render: renderWithNull
};

/**
 * Fellowship Attendance Column
 */
const MemberAttendanceColumn: ColumnType<Member> = {
    title: 'Attends Fellowship',
    dataIndex: 'attendsFellowship',
    key: 'attendance',
    width: 150,
    render: (value) => (
        value ?
            <Badge status="success" text="Yes" /> :
            <Badge status="error" text="No" />
    )
};

/**
 * Envelope Number Column
 */
const MemberEnvelopeColumn: ColumnType<Member> = {
    title: 'Envelope #',
    dataIndex: 'envelopeNumber',
    key: 'envelope',
    width: 110,
    render: renderWithNull
};

/**
 * Occupation Column
 */
const MemberOccupationColumn: ColumnType<Member> = {
    title: 'Occupation',
    dataIndex: 'occupation',
    key: 'occupation',
    width: 150,
    render: renderWithNull
};

/**
 * Date of Birth Column
 */
const MemberDOBColumn: ColumnType<Member> = {
    title: 'Date of Birth',
    dataIndex: 'dateOfBirth',
    key: 'dob',
    width: 120,
    render: (date) => date ? new Date(date).toLocaleDateString() : NULL_DISPLAY
};

/**
 * First Name Column
 */
const MemberFirstNameColumn: ColumnType<Member> = {
    title: 'First Name',
    dataIndex: 'firstName',
    key: 'firstName',
    width: 120,
    render: renderWithNull
};

/**
 * Last Name Column
 */
const MemberLastNameColumn: ColumnType<Member> = {
    title: 'Last Name',
    dataIndex: 'lastName',
    key: 'lastName',
    width: 120,
    render: renderWithNull
};

/**
 * Age Column - calculated from dateOfBirth
 */
const MemberAgeColumn: ColumnType<Member> = {
    title: 'Age',
    dataIndex: 'dateOfBirth',
    key: 'age',
    width: 80,
    render: (dateOfBirth) => {
        if (!dateOfBirth) return <Text type="secondary">{NULL_DISPLAY}</Text>;

        const birthDate = new Date(dateOfBirth);
        const today = new Date();

        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();

        // Adjust age if birthday hasn't occurred yet this year
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }

        return <Text>{age}</Text>;
    }
};

/**
 * Envelope Number Column
 */
const MemberEnvelopeNumberColumn: ColumnType<Member> = {
    title: 'Envelope #',
    dataIndex: 'envelopeNumber',
    key: 'envelopeNumber',
    width: 110,
    sorter: true,
    render: renderWithNull
};

/**
 * Registration Date Column - uses createdAt
 */
const MemberRegistrationDateColumn: ColumnType<Member> = {
    title: 'Registration Date',
    dataIndex: 'createdAt',
    key: 'registrationDate',
    width: 140,
    render: (date) => {
        if (!date) return <Text type="secondary">{NULL_DISPLAY}</Text>;

        const formattedDate = new Date(date).toLocaleDateString(undefined, {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });

        return <Text>{formattedDate}</Text>;
    }
};

type Column =
    | "name"
    | "contact"
    | "gender"
    | "maritalStatus"
    | "fellowship"
    | "residence"
    | "baptism"
    | "confirmation"
    | "role"
    | "attendance"
    | "envelope"
    | "occupation"
    | "dob"
    | "firstName"
    | "lastName"
    | "age"
    | "envelopeNumber"
    | "registrationDate"
    ;

export const MemberColumns: Record<Column, ColumnType<Member>> = {
    name: MemberNameColumn,
    contact: MemberContactColumn,
    gender: MemberGenderColumn,
    maritalStatus: MemberMaritalStatusColumn,
    fellowship: MemberFellowshipColumn,
    residence: MemberResidenceColumn,
    baptism: MemberBaptismColumn,
    confirmation: MemberConfirmationColumn,
    role: MemberRoleColumn,
    attendance: MemberAttendanceColumn,
    envelope: MemberEnvelopeColumn,
    occupation: MemberOccupationColumn,
    dob: MemberDOBColumn,
    firstName: MemberFirstNameColumn,
    lastName: MemberLastNameColumn,
    age: MemberAgeColumn,
    envelopeNumber: MemberEnvelopeNumberColumn,
    registrationDate: MemberRegistrationDateColumn
};