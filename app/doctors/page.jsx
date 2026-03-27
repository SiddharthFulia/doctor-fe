'use client';
import React, { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, Input, Select, InputNumber, Switch, Tag, Space, Popconfirm, Badge } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import toast from 'react-hot-toast';
import dayjs from 'dayjs';
import AppLayout from '../../components/Layout/AppLayout';
import apiClient from '../../utils/axios';
import { apis } from '../../constants/apis';

const { Option } = Select;

const SPECIALIZATIONS = [
  'General Physician', 'Cardiologist', 'Neurologist', 'Orthopedist',
  'Pediatrician', 'Dermatologist', 'Psychiatrist', 'Ophthalmologist',
  'ENT Specialist', 'Oncologist',
];

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const SPEC_COLORS = {
  'Cardiologist': 'red', 'Neurologist': 'purple', 'General Physician': 'blue',
  'Orthopedist': 'orange', 'Pediatrician': 'cyan', 'Dermatologist': 'pink',
  'Psychiatrist': 'volcano', 'Ophthalmologist': 'geekblue', 'ENT Specialist': 'lime', 'Oncologist': 'magenta',
};

export default function DoctorsPage() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [form] = Form.useForm();

  const fetchDoctors = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get(apis.doctors.getAll);
      setDoctors(response.data.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDoctors(); }, []);

  const openCreateModal = () => {
    setEditingDoctor(null);
    form.resetFields();
    form.setFieldsValue({ workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'], isActive: true });
    setModalOpen(true);
  };

  const openEditModal = (doctor) => {
    setEditingDoctor(doctor);
    form.setFieldsValue({
      ...doctor,
      qualifications: doctor.qualifications?.join(', ') || '',
    });
    setModalOpen(true);
  };

  const handleSubmit = async (formValues) => {
    setSubmitting(true);
    try {
      const payload = {
        ...formValues,
        qualifications: formValues.qualifications
          ? formValues.qualifications.split(',').map((item) => item.trim()).filter(Boolean)
          : [],
      };

      if (editingDoctor) {
        await apiClient.put(apis.doctors.update(editingDoctor.id), payload);
        toast.success('Doctor updated successfully');
      } else {
        await apiClient.post(apis.doctors.create, payload);
        toast.success('Doctor created successfully');
      }
      setModalOpen(false);
      fetchDoctors();
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (doctorId) => {
    try {
      await apiClient.delete(apis.doctors.delete(doctorId));
      toast.success('Doctor deleted');
      fetchDoctors();
    } catch {}
  };

  const columns = [
    {
      title: 'Doctor',
      key: 'doctor',
      render: (_, record) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: 10,
              background: 'linear-gradient(135deg, #4f46e5, #818cf8)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontWeight: 700,
              fontSize: 15,
              flexShrink: 0,
            }}
          >
            {record.name.charAt(record.name.indexOf(' ') + 1)}
          </div>
          <div>
            <div style={{ fontWeight: 600 }}>{record.name}</div>
            <div style={{ fontSize: 12, color: '#94a3b8' }}>{record.licenseNumber}</div>
          </div>
        </div>
      ),
    },
    {
      title: 'Specialization',
      dataIndex: 'specialization',
      key: 'specialization',
      render: (spec) => <Tag color={SPEC_COLORS[spec] || 'blue'}>{spec}</Tag>,
    },
    {
      title: 'Experience',
      dataIndex: 'yearsOfExperience',
      key: 'yearsOfExperience',
      render: (years) => `${years} yrs`,
    },
    { title: 'Phone', dataIndex: 'phone', key: 'phone' },
    {
      title: 'Working Days',
      dataIndex: 'workingDays',
      key: 'workingDays',
      render: (days) => <span style={{ fontSize: 12, color: '#64748b' }}>{days?.join(', ')}</span>,
    },
    {
      title: 'Status',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (isActive) => (
        <Badge status={isActive ? 'success' : 'default'} text={isActive ? 'Active' : 'Inactive'} />
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button size="small" icon={<EditOutlined />} onClick={() => openEditModal(record)} />
          <Popconfirm title="Delete this doctor?" onConfirm={() => handleDelete(record.id)} okText="Delete" okButtonProps={{ danger: true }}>
            <Button size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <AppLayout>
      <div className="page-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1 className="page-title">Doctors</h1>
            <p className="page-subtitle">{doctors.filter((d) => d.isActive).length} active doctors</p>
          </div>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={openCreateModal}
            style={{ background: '#4f46e5', borderColor: '#4f46e5' }}
          >
            Add Doctor
          </Button>
        </div>
      </div>

      <div className="table-card">
        <Table
          dataSource={doctors}
          columns={columns}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10 }}
          size="middle"
        />
      </div>

      <Modal
        title={editingDoctor ? 'Edit Doctor' : 'Add New Doctor'}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        footer={null}
        width={620}
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit} style={{ marginTop: 16 }}>
          <Form.Item name="name" label="Full Name" rules={[{ required: true }]}>
            <Input placeholder="Dr. First Last" />
          </Form.Item>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <Form.Item name="specialization" label="Specialization" rules={[{ required: true }]}>
              <Select placeholder="Select specialization">
                {SPECIALIZATIONS.map((spec) => <Option key={spec} value={spec}>{spec}</Option>)}
              </Select>
            </Form.Item>
            <Form.Item name="yearsOfExperience" label="Years of Experience" initialValue={0}>
              <InputNumber min={0} max={60} style={{ width: '100%' }} />
            </Form.Item>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <Form.Item name="phone" label="Phone" rules={[{ required: true }]}>
              <Input placeholder="+1-555-0000" />
            </Form.Item>
            <Form.Item name="email" label="Email">
              <Input placeholder="doctor@clinic.com" />
            </Form.Item>
          </div>
          <Form.Item name="licenseNumber" label="License Number">
            <Input placeholder="MED-YYYY-XXXX" />
          </Form.Item>
          <Form.Item name="qualifications" label="Qualifications" help="Comma separated">
            <Input placeholder="MBBS, MD Cardiology, FACC" />
          </Form.Item>
          <Form.Item name="workingDays" label="Working Days">
            <Select mode="multiple" placeholder="Select working days">
              {DAYS.map((day) => <Option key={day} value={day}>{day}</Option>)}
            </Select>
          </Form.Item>
          <Form.Item name="bio" label="Bio">
            <Input.TextArea rows={2} placeholder="Short bio..." />
          </Form.Item>
          <Form.Item name="isActive" label="Active" valuePropName="checked">
            <Switch defaultChecked />
          </Form.Item>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <Button onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="primary" htmlType="submit" loading={submitting} style={{ background: '#4f46e5', borderColor: '#4f46e5' }}>
              {editingDoctor ? 'Update' : 'Create'}
            </Button>
          </div>
        </Form>
      </Modal>
    </AppLayout>
  );
}
