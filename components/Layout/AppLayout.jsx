'use client';
import React from 'react';
import { Layout } from 'antd';
import { Toaster } from 'react-hot-toast';
import SideMenu from '../SideMenu/SideMenu';

const { Content } = Layout;

const AppLayout = ({ children }) => {
  return (
    <Layout style={{ minHeight: '100vh', background: '#f8fafc' }}>
      <SideMenu />
      <Content
        style={{
          padding: 24,
          background: '#f8fafc',
          minHeight: '100vh',
          overflow: 'auto',
        }}
      >
        {children}
      </Content>
      <Toaster
        position="top-right"
        toastOptions={{
          style: { borderRadius: 8, fontFamily: 'inherit', fontSize: 14 },
          success: { iconTheme: { primary: '#4f46e5', secondary: 'white' } },
        }}
      />
    </Layout>
  );
};

export default AppLayout;
