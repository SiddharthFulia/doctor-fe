'use client';
import React, { useState } from 'react';
import { Layout, Menu, Tooltip } from 'antd';
import { useRouter, usePathname } from 'next/navigation';
import {
  DashboardOutlined,
  UserOutlined,
  MedicineBoxOutlined,
  CalendarOutlined,
  ExperimentOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  HeartOutlined,
} from '@ant-design/icons';

const { Sider } = Layout;

const NAV_ITEMS = [
  { key: '/', icon: <DashboardOutlined />, label: 'Dashboard' },
  { key: '/patients', icon: <UserOutlined />, label: 'Patients' },
  { key: '/doctors', icon: <MedicineBoxOutlined />, label: 'Doctors' },
  { key: '/appointments', icon: <CalendarOutlined />, label: 'Appointments' },
  { key: '/algorithm', icon: <ExperimentOutlined />, label: 'Algorithm' },
];

const SideMenu = () => {
  const router = useRouter();
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  const handleNavigation = (navKey) => {
    router.push(navKey);
  };

  const selectedKeys = NAV_ITEMS.filter((item) => {
    if (item.key === '/') return pathname === '/';
    return pathname.startsWith(item.key);
  }).map((item) => item.key);

  return (
    <Sider
      collapsible
      collapsed={collapsed}
      trigger={null}
      width={230}
      collapsedWidth={64}
      style={{
        background: '#0f172a',
        height: '100vh',
        position: 'sticky',
        top: 0,
        overflowY: 'auto',
        overflowX: 'hidden',
        flexShrink: 0,
      }}
    >
      <div
        style={{
          padding: collapsed ? '20px 0' : '20px 16px',
          borderBottom: '1px solid #1e293b',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          justifyContent: collapsed ? 'center' : 'flex-start',
          cursor: 'pointer',
        }}
        onClick={() => router.push('/')}
      >
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            background: 'linear-gradient(135deg, #4f46e5, #818cf8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <HeartOutlined style={{ color: 'white', fontSize: 18 }} />
        </div>
        {!collapsed && (
          <div>
            <div style={{ color: 'white', fontWeight: 700, fontSize: 15, lineHeight: 1.2 }}>DoctorApp</div>
            <div style={{ color: '#64748b', fontSize: 11 }}>Smart Scheduling</div>
          </div>
        )}
      </div>

      <Menu
        mode="inline"
        selectedKeys={selectedKeys}
        theme="dark"
        style={{ background: '#0f172a', border: 'none', marginTop: 8 }}
        items={NAV_ITEMS.map((item) => ({
          key: item.key,
          icon: item.icon,
          label: item.label,
          onClick: () => handleNavigation(item.key),
          style: {
            borderRadius: 8,
            margin: '2px 8px',
            width: 'calc(100% - 16px)',
          },
        }))}
      />

      <div
        style={{
          position: 'absolute',
          bottom: 20,
          left: 0,
          right: 0,
          display: 'flex',
          justifyContent: 'center',
          padding: '0 8px',
        }}
      >
        <Tooltip title={collapsed ? 'Expand' : 'Collapse'} placement="right">
          <button
            onClick={() => setCollapsed(!collapsed)}
            style={{
              width: '100%',
              background: '#1e293b',
              border: 'none',
              borderRadius: 8,
              color: '#94a3b8',
              cursor: 'pointer',
              padding: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              fontSize: 13,
            }}
          >
            {collapsed ? <MenuUnfoldOutlined /> : <><MenuFoldOutlined /><span>Collapse</span></>}
          </button>
        </Tooltip>
      </div>
    </Sider>
  );
};

export default SideMenu;
