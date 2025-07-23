import { useState, useEffect, useImperativeHandle, forwardRef } from 'react';
import { Upload, Button, Avatar, Space, Modal, Tooltip } from 'antd';
import { UploadOutlined, DeleteOutlined, EyeOutlined, UserOutlined, CloseOutlined } from '@ant-design/icons';
import { UploadFile, RcFile } from 'antd/es/upload/interface';
import { ImageQueries, ImageUtils } from '@/data/image';
import { notifyUtils } from '@/utilities';

interface ProfileImageUploadProps {
  value?: string; // Current image filename/URL
  onChange?: (filename: string | null) => void; // Callback when image changes
  disabled?: boolean;
  size?: 'small' | 'default' | 'large';
  className?: string;
  autoUpload?: boolean; // If false, shows manual save/cancel buttons
}

// Interface for imperative methods
export interface ProfileImageUploadRef {
  hasPendingChanges: () => boolean;
  getPendingMessage: () => string;
  uploadPendingImage: () => Promise<string | undefined>;
}

/**
 * Profile Image Upload Component
 * 
 * A reusable component for uploading and managing profile images.
 * Integrates with the image data layer and provides preview functionality.
 */
export const ProfileImageUpload = forwardRef<ProfileImageUploadRef, ProfileImageUploadProps>(({
  value,
  onChange,
  disabled = false,
  size = 'default',
  className,
  autoUpload = false, // Default to auto upload for backward compatibility
}, ref) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [pendingFile, setPendingFile] = useState<File | null>(null); // File waiting to be saved
  const [hasPendingChanges, setHasPendingChanges] = useState(false);

  // Upload mutation
  const uploadMutation = ImageQueries.useUpload({
    onSuccess: (result) => {
      notifyUtils.success('Image uploaded successfully');
      onChange?.(result.filename);
      setFileList([]);
      setPendingFile(null);
      setHasPendingChanges(false);

      // Clean up preview URL if it was a blob
      if (previewUrl && previewUrl.startsWith('blob:')) {
        ImageUtils.revokePreviewUrl(previewUrl);
        setPreviewUrl(null);
      }
    },
    onError: (error) => {
      notifyUtils.error(error.message || 'Failed to upload image');
      setFileList([]);
    },
  });

  // Avatar sizes based on size prop
  const avatarSize = {
    small: 48,
    default: 64,
    large: 80,
  }[size];

  // Get current image URL
  const currentImageUrl = value ? ImageUtils.getImageUrl(value) : null;

  // Handle file selection
  const handleChange = (info: any) => {
    setFileList(info.fileList.slice(-1)); // Keep only the latest file
  };

  // Custom upload handler
  const customUpload = async (options: any) => {
    const { file, onSuccess, onError } = options;

    if (autoUpload) {
      // Auto upload immediately
      try {
        await uploadMutation.mutateAsync(file);
        onSuccess('ok');
      } catch (error) {
        onError(error);
      }
    } else {
      // Manual upload - just store the file and mark as pending
      setPendingFile(file);
      setHasPendingChanges(true);
      onSuccess('ok'); // Tell Upload component it succeeded
    }
  };

  // Manual save handler
  const handleSave = async () => {
    if (!pendingFile) return;

    try {
      const result = await uploadMutation.mutateAsync(pendingFile);
      return result.filename
    } catch (error) {
      // Error is handled by mutation onError callback
    }
  };

  // Cancel pending changes
  const handleCancel = () => {
    if (previewUrl && previewUrl.startsWith('blob:')) {
      ImageUtils.revokePreviewUrl(previewUrl);
    }
    setPreviewUrl(null);
    setPendingFile(null);
    setHasPendingChanges(false);
    setFileList([]);
  };

  // Before upload validation
  const beforeUpload = (file: RcFile) => {
    // Create preview URL
    const preview = ImageUtils.createPreviewUrl(file);
    setPreviewUrl(preview);

    // Validate file
    const isValidType = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'].includes(file.type);
    if (!isValidType) {
      notifyUtils.error('Only JPEG, PNG, GIF, and WebP images are allowed');
      return false;
    }

    const isValidSize = file.size <= 5 * 1024 * 1024; // 5MB
    if (!isValidSize) {
      notifyUtils.error('File size must be less than 5MB');
      return false;
    }

    return true;
  };

  // Remove image
  const handleRemove = () => {
    onChange?.(null);
    setPreviewUrl(null);
    setFileList([]);
    setPendingFile(null);
    setHasPendingChanges(false);

    // Revoke any existing preview URLs
    if (previewUrl && previewUrl.startsWith('blob:')) {
      ImageUtils.revokePreviewUrl(previewUrl);
    }
  };

  // Show preview modal
  const handlePreview = () => {
    setPreviewVisible(true);
  };

  // Handle button actions
  const handleButtonAction = (action: string) => {
    switch (action) {
      case 'preview':
        handlePreview();
        break;
      case 'remove':
        handleRemove();
        break;
    }
  };

  // Cleanup preview URLs on unmount
  useEffect(() => {
    return () => {
      if (previewUrl && previewUrl.startsWith('blob:')) {
        ImageUtils.revokePreviewUrl(previewUrl);
      }
    };
  }, [previewUrl]);

  const displayImageUrl = previewUrl || currentImageUrl;

  // Expose methods to parent via ref
  useImperativeHandle(ref, () => ({
    hasPendingChanges: () => hasPendingChanges,
    getPendingMessage: () => 'Profile image is selected but not saved yet',
    uploadPendingImage: () => handleSave(),
  }), [hasPendingChanges]);

  return (
    <div className={className}>
      <Space direction="vertical" align="center" style={{ width: '100%' }}>
        {/* Avatar Display with pending state indication */}
        <div style={{ position: 'relative' }}>
          <Avatar
            size={avatarSize}
            src={displayImageUrl}
            icon={!displayImageUrl ? <UserOutlined /> : undefined}
            style={{
              backgroundColor: !displayImageUrl ? '#f56a00' : undefined,
              border: '2px solid #d9d9d9',
              // Add visual indication for pending changes
              opacity: (!autoUpload && hasPendingChanges) ? 0.6 : 1,
              filter: (!autoUpload && hasPendingChanges) ? 'grayscale(0.3)' : 'none',
              transition: 'all 0.3s ease',
            }}
          />

          {/* Pending changes indicator overlay */}
          {!autoUpload && hasPendingChanges && (
            <Tooltip title="Image will be uploaded when you save the form">
              <div
                style={{
                  position: 'absolute',
                  top: -2,
                  right: -2,
                  width: 16,
                  height: 16,
                  borderRadius: '50%',
                  backgroundColor: '#faad14',
                  border: '2px solid white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '8px',
                  fontWeight: 'bold',
                  color: 'white',
                  animation: 'pulse 1.5s infinite',
                }}
              >
                !
              </div>
            </Tooltip>
          )}
        </div>

        {/* Compact Button Group */}
        <Space.Compact size={size === 'small' ? 'small' : 'middle'}>
          <Upload
            fileList={fileList}
            onChange={handleChange}
            customRequest={customUpload}
            beforeUpload={beforeUpload}
            showUploadList={false}
            disabled={disabled || uploadMutation.isPending}
            accept="image/*"
            id="hidden-upload"
          >
            <Button
              icon={<UploadOutlined />}
              loading={uploadMutation.isPending}
              disabled={disabled}
              size={size === 'small' ? 'small' : 'middle'}
            >
              Upload
            </Button>
          </Upload>

          <Button
            icon={<EyeOutlined />}
            disabled={disabled || !displayImageUrl}
            onClick={() => handleButtonAction('preview')}
          >
            Preview
          </Button>

          <Button
            icon={<DeleteOutlined />}
            disabled={disabled || !displayImageUrl}
            onClick={() => handleButtonAction('remove')}
            danger
          >
            Remove
          </Button>
        </Space.Compact>

        {/* Cancel button for pending changes */}
        {!autoUpload && hasPendingChanges && (
          <Button
            icon={<CloseOutlined />}
            onClick={handleCancel}
            disabled={disabled || uploadMutation.isPending}
            size={size === 'small' ? 'small' : 'middle'}
            title="Cancel image selection"
            type="text"
          />
        )}
      </Space>

      {/* Preview Modal */}
      <Modal
        open={previewVisible}
        title="Profile Photo Preview"
        footer={null}
        onCancel={() => setPreviewVisible(false)}
        width={600}
        centered
      >
        <div style={{ textAlign: 'center', padding: '20px' }}>
          <img
            alt="Preview"
            style={{ maxWidth: '100%', maxHeight: '70vh' }}
            src={displayImageUrl || undefined}
          />
        </div>
      </Modal>

      {/* CSS for pulse animation */}
      <style>
        {`
          @keyframes pulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.1); }
            100% { transform: scale(1); }
          }
        `}
      </style>
    </div>
  );
});