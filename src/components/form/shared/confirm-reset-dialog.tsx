import { Modal, Typography, Space, Alert } from 'antd';
import { ExclamationCircleOutlined, InfoCircleOutlined } from '@ant-design/icons';
import NiceModal, { useModal } from '@ebay/nice-modal-react';

const { Paragraph } = Typography;

interface ConfirmResetModalProps {
  title?: string;
  formName?: string;
  message?: string;
  isResetting?: boolean;
  onReset: () => Promise<boolean> | boolean;
  hasUnsavedChanges?: boolean;
}

/**
 * Reusable confirmation modal for form reset operations
 */
export const ConfirmResetModal = NiceModal.create(
  ({ 
    title = "Reset Form", 
    formName = "form",
    message,
    isResetting = false, 
    onReset,
    hasUnsavedChanges = true
  }: ConfirmResetModalProps) => {
    const modal = useModal();

    const handleReset = async () => {
      try {
        const result = await onReset();
        if (result !== false) {
          modal.hide();
        }
      } catch (error) {
        console.error('Reset operation failed:', error);
        // Keep modal open on error
      }
    };

    const defaultMessage = hasUnsavedChanges 
      ? `This will clear all unsaved changes and reset the ${formName} to its initial state.`
      : `This will reset the ${formName} to its initial state.`;

    return (
      <Modal
        title={
          <Space>
            <ExclamationCircleOutlined style={{ color: '#faad14' }} />
            {title}
          </Space>
        }
        open={modal.visible}
        onOk={handleReset}
        onCancel={() => modal.hide()}
        okText="Reset"
        cancelText="Cancel"
        okButtonProps={{ 
          loading: isResetting,
          danger: hasUnsavedChanges 
        }}
        cancelButtonProps={{
          disabled: isResetting
        }}
        afterClose={() => modal.remove()}
        maskClosable={!isResetting}
        closable={!isResetting}
      >
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          <Paragraph>
            Are you sure you want to reset this {formName}?
          </Paragraph>

          {hasUnsavedChanges && (
            <Alert
              type="warning"
              showIcon
              icon={<InfoCircleOutlined />}
              message="Warning"
              description={message || defaultMessage}
            />
          )}

          {!hasUnsavedChanges && (
            <Paragraph type="secondary">
              <InfoCircleOutlined /> {message || defaultMessage}
            </Paragraph>
          )}
        </Space>
      </Modal>
    );
  }
);

export default ConfirmResetModal;