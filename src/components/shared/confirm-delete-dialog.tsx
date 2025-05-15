import { Modal, Typography, Space } from 'antd';
import { ExclamationCircleOutlined, InfoCircleOutlined } from '@ant-design/icons';
import NiceModal, { useModal } from '@ebay/nice-modal-react';

const { Text, Paragraph } = Typography;

interface ConfirmDeleteModalProps {
    title: string;
    resourceName: string;
    message: string;
    isDeleting: boolean;
    onDelete: () => Promise<boolean>;
}

/**
 * Reusable confirmation modal for delete operations
 */
export const ConfirmDeleteModal = NiceModal.create(
    ({ title, resourceName, message, isDeleting, onDelete }: ConfirmDeleteModalProps) => {
        const modal = useModal();

        const handleDelete = async () => {
            const success = await onDelete();
            if (success) {
                modal.hide();
            }
        };

        return (
            <Modal
                title={
                    <Space>
                        <ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />
                        {title}
                    </Space>
                }
                open={modal.visible}
                onOk={handleDelete}
                onCancel={() => modal.hide()}
                okText="Delete"
                cancelText="Cancel"
                okButtonProps={{ danger: true, loading: isDeleting }}
                afterClose={() => modal.remove()}
            >
                <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                    <Paragraph>
                        Are you sure you want to delete <Text strong>{resourceName}</Text>?
                    </Paragraph>

                    <Paragraph type="warning">
                        <InfoCircleOutlined /> {message}
                    </Paragraph>
                </Space>
            </Modal>
        );
    }
);
