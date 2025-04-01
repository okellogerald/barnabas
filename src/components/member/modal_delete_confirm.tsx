import React from 'react';
import { Modal, Typography, Space, Button } from 'antd';
import NiceModal, { useModal } from '@ebay/nice-modal-react';
import { ExclamationCircleOutlined } from '@ant-design/icons';

const { Text, Title } = Typography;

// Define modal props interface
interface DeleteMemberModalProps {
    memberName: string;
    onConfirm: () => Promise<void>;
}

// Create the modal component
const DeleteMemberModal = NiceModal.create(({ memberName, onConfirm }: DeleteMemberModalProps) => {
    const modal = useModal();
    const [isDeleting, setIsDeleting] = React.useState(false);

    const handleConfirm = async () => {
        try {
            setIsDeleting(true);
            await onConfirm();
            modal.resolve();
            modal.hide();
        } catch (error) {
            console.error('Error deleting member:', error);
            setIsDeleting(false);
        }
    };

    const handleCancel = () => {
        modal.reject(new Error('User cancelled deletion'));
        modal.hide();
    };

    return (
        <Modal
            title={
                <Space>
                    <ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />
                    <span>Confirm Deletion</span>
                </Space>
            }
            open={modal.visible}
            onCancel={handleCancel}
            afterClose={() => modal.remove()}
            footer={[
                <Button key="cancel" onClick={handleCancel}>
                    Cancel
                </Button>,
                <Button
                    key="delete"
                    danger
                    type="primary"
                    loading={isDeleting}
                    onClick={handleConfirm}
                >
                    Delete
                </Button>,
            ]}
            destroyOnClose
        >
            <Space direction="vertical" style={{ width: '100%' }}>
                <Text>
                    Are you sure you want to delete the following member?
                </Text>
                <Title level={5} style={{ margin: '12px 0' }}>
                    {memberName}
                </Title>
                <Text type="danger">
                    This action cannot be undone. All data associated with this member will be permanently removed.
                </Text>
            </Space>
        </Modal>
    );
});

export default DeleteMemberModal;