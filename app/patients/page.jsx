'use client';
import React, { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, Input, Select, InputNumber, Tag, Spin, Popconfirm, Space } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import toast from 'react-hot-toast';
import AppLayout from '../../components/Layout/AppLayout';
import apiClient from '../../utils/axios';
import { apis } from '../../constants/apis';

const { Option } = Select;

const PRIORITIES = ['urgent', 'high', 'medium', 'low'];
const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export default function PatientsPage() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPatient, setEditingPatient] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [form] = Form.useForm();

  const fetchPatients = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get(apis.patients.getAll);
      setPatients(response.data.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPatients(); }, []);

  const filteredPatients = patients.filter((patient) => {
    const lowerSearch = searchText.toLowerCase();
    return (
      patient.name.toLowerCase().includes(lowerSearch) ||
      (patient.phone && patient.phone.includes(searchText)) ||
      (patient.email && patient.email.toLowerCase().includes(lowerSearch))
    );
  });

  const openCreateModal = () => {
    setEditingPatient(null);
    form.resetFields();
    setModalOpen(true);
  };

  const openEditModal = (patient) => {
    setEditingPatient(patient);
    form.setFieldsValue({
      ...patient,
      medicalHistory: patient.medicalHistory?.join(', ') || '',
    });
    setModalOpen(true);
  };

  const handleSubmit = async (formValues) => {
    setSubmitting(true);
    try {
      const payload = {
        ...formValues,
        medicalHistory: formValues.medicalHistory
          ? formValues.medicalHistory.split(',').map((item) => item.trim()).filter(Boolean)
          : [],
      };

      if (editingPatient) {
        await apiClient.put(apis.patients.update(editingPatient.id), payload);
        toast.success('Patient updated successfully');
      } else {
        await apiClient.post(apis.patients.create, payload);
        toast.success('Patient created successfully');
      }

      setModalOpen(false);
      fetchPatients();
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (patientId) => {
    try {
      await apiClient.delete(apis.patients.delete(patientId));
      toast.success('Patient deleted');
      fetchPatients();
    } catch {}
  };

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (name, record) => (
        <div>
          <div style={{ fontWeight: 600 }}>{name}</div>
          <div style={{ fontSize: 12, color: '#94a3b8' }}>{record.email}</div>
        </div>
      ),
    },
    {
      title: 'Age / Gender',
      key: 'ageGender',
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: 500 }}>{record.age} yrs</div>
          <div style={{ fontSize: 12, color: '#94a3b8' }}>{record.gender}</div>
        </div>
      ),
    },
    { title: 'Phone', dataIndex: 'phone', key: 'phone' },
    {
      title: 'Blood Group',
      dataIndex: 'bloodGroup',
      key: 'bloodGroup',
      render: (bg) => bg ? <Tag color="red">{bg}</Tag> : '-',
    },
    {
      title: 'Priority',
      dataIndex: 'priority',
      key: 'priority',
      render: (priority) => (
        <span className={`priority-badge badge-${priority}`}>{priority}</span>
      ),
    },
    {
      title: 'Medical History',
      dataIndex: 'medicalHistory',
      key: 'medicalHistory',
      render: (history) =>
        history?.length > 0
          ? history.slice(0, 2).map((item) => <Tag key={item} style={{ marginBottom: 2 }}>{item}</Tag>)
          : <span style={{ color: '#94a3b8' }}>None</span>,
    },
    {
      title: 'Registered',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => dayjs(date).format('MMM DD, YYYY'),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button size="small" icon={<EditOutlined />} onClick={() => openEditModal(record)} />
          <Popconfirm title="Delete this patient?" onConfirm={() => handleDelete(record.id)} okText="Delete" okButtonProps={{ danger: true }}>
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
            <h1 className="page-title">Patients</h1>
            <p className="page-subtitle">{patients.length} patients registered</p>
          </div>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={openCreateModal}
            style={{ background: '#4f46e5', borderColor: '#4f46e5' }}
          >
            Add Patient
          </Button>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 16 }}>
        <Input
          placeholder="Search patients by name, phone or email..."
          prefix={<SearchOutlined style={{ color: '#94a3b8' }} />}
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          style={{ maxWidth: 400 }}
          allowClear
        />
      </div>

      <div className="table-card">
        <Table
          dataSource={filteredPatients}
          columns={columns}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10 }}
          size="middle"
        />
      </div>

      <Modal
        title={editingPatient ? 'Edit Patient' : 'Add New Patient'}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        footer={null}
        width={600}
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit} style={{ marginTop: 16 }}>
          <Form.Item name="name" label="Full Name" rules={[{ required: true }]}>
            <Input placeholder="Enter full name" />
          </Form.Item>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <Form.Item name="age" label="Age" rules={[{ required: true }]}>
              <InputNumber min={0} max={150} style={{ width: '100%' }} placeholder="Age" />
            </Form.Item>
            <Form.Item name="gender" label="Gender" rules={[{ required: true }]}>
              <Select placeholder="Select gender">
                <Option value="Male">Male</Option>
                <Option value="Female">Female</Option>
                <Option value="Other">Other</Option>
              </Select>
            </Form.Item>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <Form.Item name="phone" label="Phone" rules={[{ required: true }]}>
              <Input placeholder="+1-555-0000" />
            </Form.Item>
            <Form.Item name="email" label="Email">
              <Input placeholder="email@example.com" />
            </Form.Item>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <Form.Item name="bloodGroup" label="Blood Group">
              <Select placeholder="Select blood group" allowClear>
                {BLOOD_GROUPS.map((bg) => <Option key={bg} value={bg}>{bg}</Option>)}
              </Select>
            </Form.Item>
            <Form.Item name="priority" label="Priority" initialValue="medium">
              <Select>
                {PRIORITIES.map((p) => <Option key={p} value={p}>{p}</Option>)}
              </Select>
            </Form.Item>
          </div>
          <Form.Item name="address" label="Address">
            <Input.TextArea rows={2} placeholder="Enter address" />
          </Form.Item>
          <Form.Item name="medicalHistory" label="Medical History" help="Comma separated conditions">
            <Input placeholder="e.g. Hypertension, Diabetes" />
          </Form.Item>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <Button onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="primary" htmlType="submit" loading={submitting} style={{ background: '#4f46e5', borderColor: '#4f46e5' }}>
              {editingPatient ? 'Update' : 'Create'}
            </Button>
          </div>
        </Form>
      </Modal>
    </AppLayout>
  );
}
