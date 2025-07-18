import { useState, useEffect, useImperativeHandle, forwardRef } from 'react';
import { Upload, Button, Avatar, Space, Modal, Alert, Dropdown, MenuProps } from 'antd';
import { UploadOutlined, DeleteOutlined, EyeOutlined, UserOutlined, SaveOutlined, CloseOutlined, MoreOutlined } from '@ant-design/icons';
import { UploadFile, RcFile } from 'antd/es/upload/interface';
import { ImageQueries, ImageUtils } from '@/data/image';
import { notifyUtils } from '@/utilities';

interface ProfileImageUploadProps {
  value?: string; // Current image filename/URL
  onChange?: (filename: string | null) => void; // Callback when image changes
  disabled?: boolean;
  size?: 'small' | 'default' | 'large';
  placeholder?: string;
  className?: string;
  autoUpload?: boolean; // If false, shows manual save/cancel buttons
}

// Interface for imperative methods
export interface ProfileImageUploadRef {
  hasPendingChanges: () => boolean;
  getPendingMessage: () => string;
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
  placeholder = 'Upload Profile Photo',
  className,
  autoUpload = true, // Default to auto upload for backward compatibility
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
      await uploadMutation.mutateAsync(pendingFile);
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

  // Create dropdown menu items for image actions
  const createImageActionMenuItems = (): MenuProps['items'] => {
    const items: MenuProps['items'] = [];
    
    if (displayImageUrl) {
      items.push({
        key: 'preview',
        label: 'Preview',
        icon: <EyeOutlined />,
        onClick: handlePreview,
      });
      
      items.push({
        key: 'remove',
        label: 'Remove',
        icon: <DeleteOutlined />,
        onClick: handleRemove,
        danger: true,
      });
    }
    
    return items;
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
  }), [hasPendingChanges]);

  return (
    <div className={className}>
      <Space direction="vertical" align="center" style={{ width: '100%' }}>
        {/* Avatar Display */}
        <Avatar
          size={avatarSize}
          src={displayImageUrl}
          icon={!displayImageUrl ? <UserOutlined /> : undefined}
          style={{
            backgroundColor: !displayImageUrl ? '#f56a00' : undefined,
            border: '2px solid #d9d9d9',
          }}
        />

        {/* Pending Changes Alert */}
        {!autoUpload && hasPendingChanges && (
          <Alert
            message="Image selected but not saved yet"
            type="warning"
            showIcon
            style={{ marginBottom: 8 }}
          />
        )}

        {/* Upload Controls */}
        <Space direction="vertical" align="center">
          <Space>
            <Upload
              fileList={fileList}
              onChange={handleChange}
              customRequest={customUpload}
              beforeUpload={beforeUpload}
              showUploadList={false}
              disabled={disabled || uploadMutation.isPending}
              accept="image/*"
            >
              <Button
                icon={<UploadOutlined />}
                loading={uploadMutation.isPending}
                disabled={disabled}
                size={size === 'small' ? 'small' : 'middle'}
              >
                {placeholder}
              </Button>
            </Upload>

            {/* Compact actions dropdown for existing image */}
            {displayImageUrl && (
              <Dropdown
                menu={{ items: createImageActionMenuItems() }}
                placement="bottomRight"
                disabled={disabled}
                trigger={['click']}
              >
                <Button
                  icon={<MoreOutlined />}
                  size={size === 'small' ? 'small' : 'middle'}
                  disabled={disabled}
                >
                  Actions
                </Button>
              </Dropdown>
            )}
          </Space>

          {/* Manual Save/Cancel Controls */}
          {!autoUpload && hasPendingChanges && (
            <Space>
              <Button
                type="primary"
                icon={<SaveOutlined />}
                onClick={handleSave}
                loading={uploadMutation.isPending}
                disabled={disabled}
                size={size === 'small' ? 'small' : 'middle'}
              >
                Save Image
              </Button>
              <Button
                icon={<CloseOutlined />}
                onClick={handleCancel}
                disabled={disabled || uploadMutation.isPending}
                size={size === 'small' ? 'small' : 'middle'}
              >
                Cancel
              </Button>
            </Space>
          )}
        </Space>
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
    </div>
  );
});