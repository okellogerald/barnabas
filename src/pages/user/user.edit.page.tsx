// import React from 'react';
// import {
//   Card,
//   Form,
//   Input,
//   Button,
//   Typography,
//   Space,
//   Divider,
//   Row,
//   Col,
//   Select,
//   Switch,
//   Checkbox,
//   Spin,
//   Alert,
//   Skeleton
// } from 'antd';
// import {
//   UserOutlined,
//   MailOutlined,
//   LockOutlined,
//   PhoneOutlined,
//   SaveOutlined,
//   ArrowLeftOutlined,
//   ReloadOutlined
// } from '@ant-design/icons';
// import { useUserEdit } from '@/features/user/user-edit';

// const { Title, Text } = Typography;
// const { Option } = Select;

// /**
//  * User Edit Page
//  * 
//  * Page for editing an existing system user with form validation and role selection
//  */
// const UserEditPage: React.FC = () => {
//   // Get form instance, data, and handlers from hook
//   const {
//     form,
//     userData,
//     rolesData,
//     isSubmitting,
//     changePassword,
//     togglePasswordChange,
//     handleSubmit,
//     handleCancel,
//     handleReset
//   } = useUserEdit();
  
//   // Validation rules
//   const validationRules = {
//     name: [
//       { required: true, message: 'Please enter a name' },
//       { min: 3, message: 'Name must be at least 3 characters' }
//     ],
//     email: [
//       { required: true, message: 'Please enter an email address' },
//       { type: 'email', message: 'Please enter a valid email address' }
//     ],
//     password: [
//       { required: changePassword, message: 'Please enter a password' },
//       { min: 8, message: 'Password must be at least 8 characters' }
//     ],
//     confirmPassword: [
//       { required: changePassword, message: 'Please confirm your password' },
//       ({ getFieldValue }: any) => ({
//         validator(_: any, value: string) {
//           if (!changePassword || !value || getFieldValue('password') === value) {
//             return Promise.resolve();
//           }
//           return Promise.reject(new Error('Passwords do not match'));
//         }
//       })
//     ],
//     roleId: [
//       { required: true, message: 'Please select a role' }
//     ]
//   };
  
//   // Show appropriate UI based on loading/error state
//   if (userData.loading) {
//     return (
//       <Card>
//         <Skeleton active avatar paragraph={{ rows: 6 }} />
//       </Card>
//     );
//   }
  
//   if (userData.error || !userData.user) {
//     return (
//       <Card>
//         <Alert
//           message="Error Loading User"
//           description="Unable to load user details. The user may have been deleted or you may not have permission to view it."
//           type="error"
//           action={
//             <Button type="primary" onClick={() => handleCancel()}>
//               Return to User List
//             </Button>
//           }
//         />
//       </Card>
//     );
//   }
  
//   return (
//     <div className="user-edit-page">
//       <Card>
//         {/* Header */}
//         <Title level={3}>Edit User: {userData.user.name}</Title>
//         <Text type="secondary">
//           Update user information and access settings
//         </Text>
        
//         <Divider />
        
//         {/* Form */}
//         <Form
//           form={form}
//           layout="vertical"
//           onFinish={handleSubmit}
//           requiredMark="optional"
//         >
//           {/* User Information Section */}
//           <Title level={5}>User Information</Title>
          
//           <Row gutter={16}>
//             <Col xs={24} md={12}>
//               <Form.Item 
//                 name="name" 
//                 label="Full Name"
//                 rules={validationRules.name}
//               >
//                 <Input 
//                   prefix={<UserOutlined />} 
//                   placeholder="Full name"
//                 />
//               </Form.Item>
//             </Col>
            
//             <Col xs={24} md={12}>
//               <Form.Item 
//                 name="email" 
//                 label="Email Address"
//                 // rules={validationRules.email}
//               >
//                 <Input 
//                   prefix={<MailOutlined />} 
//                   placeholder="Email address"
//                   type="email"
//                 />
//               </Form.Item>
//             </Col>
//           </Row>
          
//           <Row gutter={16}>
//             <Col xs={24} md={12}>
//               <Form.Item 
//                 name="phoneNumber" 
//                 label="Phone Number (Optional)"
//               >
//                 <Input 
//                   prefix={<PhoneOutlined />} 
//                   placeholder="Phone number"
//                 />
//               </Form.Item>
//             </Col>
            
//             <Col xs={24} md={12}>
//               <Form.Item 
//                 name="isActive" 
//                 label="Status" 
//                 valuePropName="checked"
//               >
//                 <Switch 
//                   checkedChildren="Active" 
//                   unCheckedChildren="Inactive" 
//                 />
//               </Form.Item>
//             </Col>
//           </Row>
          
//           <Divider />
          
//           {/* Password Section */}
//           <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
//             <Title level={5}>Password</Title>
//             <Checkbox 
//               checked={changePassword} 
//               onChange={(e) => togglePasswordChange(e.target.checked)}
//             >
//               Change Password
//             </Checkbox>
//           </div>
          
//           {changePassword && (
//             <Row gutter={16}>
//               <Col xs={24} md={12}>
//                 <Form.Item 
//                   name="password" 
//                   label="New Password"
//                   rules={validationRules.password}
//                 >
//                   <Input.Password 
//                     prefix={<LockOutlined />} 
//                     placeholder="New password"
//                   />
//                 </Form.Item>
//               </Col>
              
//               <Col xs={24} md={12}>
//                 <Form.Item 
//                   name="confirmPassword" 
//                   label="Confirm New Password"
//                   rules={validationRules.confirmPassword}
//                 >
//                   <Input.Password 
//                     prefix={<LockOutlined />} 
//                     placeholder="Confirm new password"
//                   />
//                 </Form.Item>
//               </Col>
//             </Row>
//           )}
          
//           <Divider />
          
//           {/* System Role Section */}
//           <Title level={5}>System Role</Title>
          
//           {rolesData.loading ? (
//             <div style={{ textAlign: 'center', padding: '20px' }}>
//               <Spin />
//             </div>
//           ) : rolesData.roles.length === 0 ? (
//             <Alert
//               message="No roles available"
//               description="There are no roles defined in the system. Please create roles first."
//               type="warning"
//             />
//           ) : (
//             <Form.Item 
//               name="roleId" 
//               label="Role"
//               rules={validationRules.roleId}
//               extra="The role determines what permissions the user will have in the system"
//             >
//               <Select placeholder="Select a role">
//                 {rolesData.roles.map(role => (
//                   <Option key={role.id} value={role.id}>
//                     {role.name}
//                   </Option>
//                 ))}
//               </Select>
//             </Form.Item>
//           )}
          
//           <Divider />
          
//           {/* Form Actions */}
//           <Row justify="end">
//             <Space>
//               <Button 
//                 icon={<ArrowLeftOutlined />} 
//                 onClick={handleCancel}
//               >
//                 Cancel
//               </Button>
              
//               <Button 
//                 icon={<ReloadOutlined />} 
//                 onClick={handleReset}
//               >
//                 Reset
//               </Button>
              
//               <Button 
//                 type="primary" 
//                 icon={<SaveOutlined />} 
//                 loading={isSubmitting}
//                 htmlType="submit"
//                 disabled={rolesData.roles.length === 0}
//               >
//                 Save Changes
//               </Button>
//             </Space>
//           </Row>
//         </Form>
//       </Card>
//     </div>
//   );
// };

// export default UserEditPage;
import React from 'react';
import {
  Card,
  Form,
  Input,
  Button,
  Typography,
  Space,
  Divider,
  Row,
  Col,
  Select,
  Switch,
  Checkbox,
  Spin,
  Alert,
  Skeleton
} from 'antd';
import {
  UserOutlined,
  MailOutlined,
  LockOutlined,
  PhoneOutlined,
  SaveOutlined,
  ArrowLeftOutlined,
  ReloadOutlined
} from '@ant-design/icons';
import { useUserEdit } from '@/features/user/user-edit';

const { Title, Text } = Typography;
const { Option } = Select;

/**
 * User Edit Page
 * 
 * Page for editing an existing system user with form validation and role selection
 */
const UserEditPage: React.FC = () => {
  // Get form instance, data, and handlers from hook
  const {
    form,
    userData,
    rolesData,
    isSubmitting,
    changePassword,
    togglePasswordChange,
    handleSubmit,
    handleCancel,
    handleReset
  } = useUserEdit();
  
  // Validation rules
  const validationRules = {
    name: [
      { required: true, message: 'Please enter a name' },
      { min: 3, message: 'Name must be at least 3 characters' }
    ],
    email: [
      { required: true, message: 'Please enter an email address' },
      { type: 'email', message: 'Please enter a valid email address' }
    ],
    password: [
      { required: changePassword, message: 'Please enter a password' },
      { min: 8, message: 'Password must be at least 8 characters' }
    ],
    confirmPassword: [
      { required: changePassword, message: 'Please confirm your password' },
      ({ getFieldValue }: any) => ({
        validator(_: any, value: string) {
          if (!changePassword || !value || getFieldValue('password') === value) {
            return Promise.resolve();
          }
          return Promise.reject(new Error('Passwords do not match'));
        }
      })
    ],
    roleId: [
      { required: true, message: 'Please select a role' }
    ]
  };
  
  // Show appropriate UI based on loading/error state
  if (userData.loading) {
    return (
      <Card>
        <Skeleton active avatar paragraph={{ rows: 6 }} />
      </Card>
    );
  }
  
  if (userData.error || !userData.user) {
    return (
      <Card>
        <Alert
          message="Error Loading User"
          description="Unable to load user details. The user may have been deleted or you may not have permission to view it."
          type="error"
          action={
            <Button type="primary" onClick={() => handleCancel()}>
              Return to User List
            </Button>
          }
        />
      </Card>
    );
  }
  
  return (
    <div className="user-edit-page">
      <Card>
        {/* Header */}
        <Title level={3}>Edit User: {userData.user.name}</Title>
        <Text type="secondary">
          Update user information and access settings
        </Text>
        
        <Divider />
        
        {/* Form */}
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          requiredMark="optional"
        >
          {/* User Information Section */}
          <Title level={5}>User Information</Title>
          
          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item 
                name="name" 
                label="Full Name"
                rules={validationRules.name}
              >
                <Input 
                  prefix={<UserOutlined />} 
                  placeholder="Full name"
                />
              </Form.Item>
            </Col>
            
            <Col xs={24} md={12}>
              <Form.Item 
                name="email" 
                label="Email Address"
                // rules={validationRules.email}
              >
                <Input 
                  prefix={<MailOutlined />} 
                  placeholder="Email address"
                  type="email"
                  disabled // Email cannot be changed
                />
              </Form.Item>
            </Col>
          </Row>
          
          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item 
                name="phoneNumber" 
                label="Phone Number (Optional)"
              >
                <Input 
                  prefix={<PhoneOutlined />} 
                  placeholder="Phone number"
                />
              </Form.Item>
            </Col>
            
            <Col xs={24} md={12}>
              <Form.Item 
                name="isActive" 
                label="Status" 
                valuePropName="checked"
              >
                <Switch 
                  checkedChildren="Active" 
                  unCheckedChildren="Inactive" 
                />
              </Form.Item>
            </Col>
          </Row>
          
          <Divider />
          
          {/* Password Section */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <Title level={5}>Password</Title>
            <Checkbox 
              checked={changePassword} 
              onChange={(e) => togglePasswordChange(e.target.checked)}
            >
              Change Password
            </Checkbox>
          </div>
          
          {changePassword && (
            <Row gutter={16}>
              <Col xs={24} md={12}>
                <Form.Item 
                  name="password" 
                  label="New Password"
                  rules={validationRules.password}
                >
                  <Input.Password 
                    prefix={<LockOutlined />} 
                    placeholder="New password"
                  />
                </Form.Item>
              </Col>
              
              <Col xs={24} md={12}>
                <Form.Item 
                  name="confirmPassword" 
                  label="Confirm New Password"
                  rules={validationRules.confirmPassword}
                >
                  <Input.Password 
                    prefix={<LockOutlined />} 
                    placeholder="Confirm new password"
                  />
                </Form.Item>
              </Col>
            </Row>
          )}
          
          <Divider />
          
          {/* System Role Section */}
          <Title level={5}>System Role</Title>
          <Text type="secondary" style={{ display: 'block', marginBottom: 16 }}>
            Select a predefined role to determine the user's permissions in the system
          </Text>
          
          {rolesData.loading ? (
            <div style={{ textAlign: 'center', padding: '20px' }}>
              <Spin />
            </div>
          ) : rolesData.roles.length === 0 ? (
            <Alert
              message="No roles available"
              description="There are no predefined roles available in the system."
              type="warning"
            />
          ) : (
            <Form.Item 
              name="roleId" 
              label="Role"
              rules={validationRules.roleId}
              extra="The role determines what actions the user will be allowed to perform in the system"
            >
              <Select placeholder="Select a role">
                {rolesData.roles.map(role => (
                  <Option key={role.id} value={role.id}>
                    {role.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          )}
          
          <Divider />
          
          {/* Form Actions */}
          <Row justify="end">
            <Space>
              <Button 
                icon={<ArrowLeftOutlined />} 
                onClick={handleCancel}
              >
                Cancel
              </Button>
              
              <Button 
                icon={<ReloadOutlined />} 
                onClick={handleReset}
              >
                Reset
              </Button>
              
              <Button 
                type="primary" 
                icon={<SaveOutlined />} 
                loading={isSubmitting}
                htmlType="submit"
                disabled={rolesData.roles.length === 0}
              >
                Save Changes
              </Button>
            </Space>
          </Row>
        </Form>
      </Card>
    </div>
  );
};

export default UserEditPage;