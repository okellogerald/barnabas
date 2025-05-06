// import React from 'react';
// import { useParams } from 'react-router-dom';
// import { 
//   Card, 
//   Form, 
//   Button, 
//   Space, 
//   Select, 
//   Alert,
//   Typography,
//   Divider,
//   Descriptions,
// } from 'antd';
// import { MailOutlined, RollbackOutlined } from '@ant-design/icons';
// import { AsyncStateMatcher } from '@/lib/state';

// const { Title, Text } = Typography;
// const { Option } = Select;

// /**
//  * Page to assign an envelope to a specific member
//  */
// const MemberAssignEnvelopePage: React.FC = () => {
//   const { id } = useParams<{ id: string }>();
//   const [form] = Form.useForm();
  
//   // Use our custom hook
//   const state = useMemberAssignEnvelope(id || '');
  
//   // Handle form submission
//   const handleSubmit = async (values: { envelopeId: string }) => {
//     if (MemberAssignEnvelopeSuccessState.is(state)) {
//       await state.assign(values.envelopeId);
//     }
//   };

//   return (
//     <Card title={<Title level={4}>Assign Envelope to Member</Title>}>
//       <AsyncStateMatcher
//         state={state}
//         views={{
//           SuccessView: ({ state }) => {
//             if (!MemberAssignEnvelopeSuccessState.is(state)) {
//               return null;
//             }
            
//             const { member, availableEnvelopes, isAssigning } = state;
            
//             // If member already has an envelope, show warning
//             if (member.envelope) {
//               return (
//                 <Alert 
//                   type="warning" 
//                   message="This member already has an envelope assigned" 
//                   description={
//                     <>
//                       {/* <p>{member.getFullName()} already has envelope {member.getEnvelopeNumber()} assigned.</p> */}
//                       <p>Please release this envelope before assigning a new one.</p>
//                       <Space>
//                         <Button onClick={() => state.cancel()}>
//                           Back to Member Details
//                         </Button>
//                       </Space>
//                     </>
//                   }
//                   showIcon
//                 />
//               );
//             }

//             return (
//               <>
//                 <Descriptions bordered style={{ marginBottom: 24 }}>
//                   <Descriptions.Item label="Member Name" span={3}>
//                     <Text strong>{member.getFullName()}</Text>
//                   </Descriptions.Item>
//                   <Descriptions.Item label="Phone Number" span={3}>
//                     {member.phoneNumber || <Text type="secondary">Not provided</Text>}
//                   </Descriptions.Item>
//                   <Descriptions.Item label="Fellowship" span={3}>
//                     {member.fellowship ? member.fellowship.name : <Text type="secondary">Not assigned</Text>}
//                   </Descriptions.Item>
//                 </Descriptions>

//                 <Divider orientation="left">Select Envelope</Divider>

//                 {availableEnvelopes.length === 0 ? (
//                   <Alert 
//                     type="info" 
//                     message="No available envelopes" 
//                     description="There are no available envelopes in the system. Please create new envelope numbers before assigning." 
//                     showIcon 
//                   />
//                 ) : (
//                   <Form
//                     form={form}
//                     layout="vertical"
//                     onFinish={handleSubmit}
//                   >
//                     <Form.Item
//                       name="envelopeId"
//                       label="Envelope Number"
//                       rules={[{ required: true, message: 'Please select an envelope' }]}
//                     >
//                       <Select
//                         showSearch
//                         placeholder="Select an envelope"
//                         optionFilterProp="children"
//                         onChange={(value) => state.selectEnvelope(value)}
//                         style={{ width: '100%' }}
//                         filterOption={(input, option) =>
//                           (option?.children as unknown as string).toLowerCase().includes(input.toLowerCase())
//                         }
//                       >
//                         {availableEnvelopes.map(envelope => (
//                           <Option key={envelope.id} value={envelope.id}>
//                             Envelope #{envelope.envelopeNumber} - {envelope.getStatus()}
//                           </Option>
//                         ))}
//                       </Select>
//                     </Form.Item>

//                     <Form.Item>
//                       <Space>
//                         <Button 
//                           type="primary" 
//                           htmlType="submit"
//                           icon={<MailOutlined />}
//                           loading={isAssigning}
//                         >
//                           Assign Envelope
//                         </Button>
//                         <Button 
//                           onClick={() => state.cancel()}
//                           icon={<RollbackOutlined />}
//                         >
//                           Cancel
//                         </Button>
//                       </Space>
//                     </Form.Item>
//                   </Form>
//                 )}
//               </>
//             );
//           }
//         }}
//       />
//     </Card>
//   );
// };

// export default MemberAssignEnvelopePage;