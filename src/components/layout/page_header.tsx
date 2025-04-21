import React from 'react';
import { Breadcrumb, Typography, Divider } from 'antd';
import { Link } from 'react-router-dom';

const { Title, Text } = Typography;

interface BreadcrumbItem {
  title: React.ReactNode;
  path?: string;
}

interface PageHeaderProps {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  breadcrumb?: BreadcrumbItem[];
  actions?: React.ReactNode;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  breadcrumb,
  actions
}) => {
  return (
    <div className="page-header" style={{ marginBottom: 24 }}>
      {breadcrumb && breadcrumb.length > 0 && (
        <Breadcrumb 
          items={breadcrumb.map(item => ({
            title: item.path 
              ? <Link to={item.path}>{item.title}</Link> 
              : item.title
          }))}
          style={{ marginBottom: 16 }}
        />
      )}
      
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: subtitle ? 8 : 24
      }}>
        <Title level={2} style={{ margin: 0 }}>{title}</Title>
        
        {actions && (
          <div className="page-header-actions">
            {actions}
          </div>
        )}
      </div>
      
      {subtitle && (
        <div style={{ marginBottom: 24 }}>
          <Text type="secondary">{subtitle}</Text>
        </div>
      )}
      
      <Divider style={{ margin: '0 0 24px 0' }} />
    </div>
  );
};