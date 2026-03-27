'use client';
import React, { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, Input, Select, Space, Popconfirm, DatePicker, Tag } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, CheckOutlined, CloseOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import toast from 'react-hot-toast';
import AppLayout from '../../components/Layout/AppLayout';
import apiClient from '../../utils/axios';
import { apis } from '../../constants/apis';

const { Option } = Select;

const PRIORITIES = ['urgent', 'high', 'medium', 'low'];
const STATUSES = ['scheduled', 'completed', 'cancelled', 'no_show'];

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [form] = Form.useForm();

  const fetchData = async () => {
    setLoading(true);
    try {
      const [appointmentsRes, patientsRes, doctorsRes] = await Promise.all([
        apiClient.get(apis.appointments.getAll),
        apiClient.get(apis.patients.getAll),
        apiClient.get(apis.doctors.getAll),
      ]);
      setAppointments(appointmentsRes.data.data);
      setPatients(patientsRes.data.data);
      setDoctors(doctorsRes.data.data.filter((doctor) => doctor.isActive));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const filteredAppointments = appointments.filter((appt) => {
    if (statusFilter === 'all') return true;
    return appt.status === statusFilter;
  });

  const openCreateModal = () => {
    setEditingAppointment(null);
    form.resetFields();
    setModalOpen(true);
  };

  const openEditModal = (appointment) => {
    setEditingAppointment(appointment);
    form.setFieldsValue({
      ...appointment,
      scheduledAt: dayjs(appointment.scheduledAt),
    });
    setModalOpen(true);
  };

  const handleSubmit = async (formValues) => {
    setSubmitting(true);
    try {
      const payload = {
        ...formValues,
        scheduledAt: formValues.scheduledAt.toISOString(),
      };

      if (editingAppointment) {
        await apiClient.put(apis.appointments.update(editingAppointment.id), payload);
        toast.success('Appointment updated');
      } else {
        await apiClient.post(apis.appointments.create, payload);
        toast.success('Appointment created');
      }
      setModalOpen(false);
      fetchData();
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusUpdate = async (appointmentId, newStatus) => {
    try {
      await apiClient.patch(apis.appointments.updateStatus(appointmentId), { status: newStatus });
      toast.success(`Marked as ${newStatus}`);
      fetchData();
    } catch {}
  };

  const handleDelete = async (appointmentId) => {
    try {
      await apiClient.delete(apis.appointments.delete(appointmentId));
      toast.success('Appointment deleted');
      fetchData();
    } catch {}
  };

  const patientMap = Object.fromEntries(patients.map((p) => [p.id, p]));
  const doctorMap = Object.fromEntries(doctors.map((d) => [d.id, d]));

  const enrichedAppointments = filteredAppointments.map((appt) => ({
    ...appt,
    patientName: patientMap[appt.patientId]?.name || 'Unknown',
    doctorName: doctorMap[appt.doctorId]?.name || 'Unknown',
  }));

  const columns = [
    {
      title: 'Patient',
      dataIndex: 'patientName',
      key: 'patientName',
      render: (name) => <span style={{ fontWeight: 600 }}>{name}</span>,
    },
    {
      title: 'Doctor',
      dataIndex: 'doctorName',
      key: 'doctorName',
      render: (name, record) => {
        const doctor = doctorMap[record.doctorId];
        return (
          <div>
            <div style={{ fontWeight: 500 }}>{name}</div>
            <div style={{ fontSize: 12, color: '#94a3b8' }}>{doctor?.specialization}</div>
          </div>
        );
      },
    },
    {
      title: 'Scheduled',
      dataIndex: 'scheduledAt',
      key: 'scheduledAt',
      sorter: (firstAppt, secondAppt) => new Date(firstAppt.scheduledAt) - new Date(secondAppt.scheduledAt),
      render: (date) => (
        <div>
          <div style={{ fontWeight: 500 }}>{dayjs(date).format('MMM DD, YYYY')}</div>
          <div style={{ fontSize: 12, color: '#94a3b8' }}>{dayjs(date).format('hh:mm A')}</div>
        </div>
      ),
    },
    {
      title: 'Reason',
      dataIndex: 'reason',
      key: 'reason',
      render: (reason) => <span style={{ color: '#475569', fontSize: 13 }}>{reason || '-'}</span>,
    },
    {
      title: 'Priority',
      dataIndex: 'priority',
      key: 'priority',
      render: (priority) => <span className={`priority-badge badge-${priority}`}>{priority}</span>,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => <span className={`status-badge badge-${status}`}>{status.replace('_', ' ')}</span>,
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space size="small">
          {record.status === 'scheduled' && (
            <Button
              size="small"
              type="text"
              icon={<CheckOutlined />}
              style={{ color: '#22c55e' }}
              onClick={() => handleStatusUpdate(record.id, 'completed')}
              title="Mark Completed"
            />
          )}
          {record.status === 'scheduled' && (
            <Button
              size="small"
              type="text"
              danger
              icon={<CloseOutlined />}
              onClick={() => handleStatusUpdate(record.id, 'cancelled')}
              title="Cancel"
            />
          )}
          <Button size="small" icon={<EditOutlined />} onClick={() => openEditModal(record)} />
          <Popconfirm title="Delete this appointment?" onConfirm={() => handleDelete(record.id)} okText="Delete" okButtonProps={{ danger: true }}>
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
            <h1 className="page-title">Appointments</h1>
            <p className="page-subtitle">{appointments.length} total appointments</p>
          </div>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={openCreateModal}
            style={{ background: '#4f46e5', borderColor: '#4f46e5' }}
          >
            New Appointment
          </Button>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 16, display: 'flex', gap: 8, alignItems: 'center' }}>
        <span style={{ fontSize: 13, color: '#64748b', fontWeight: 500 }}>Filter by status:</span>
        {['all', ...STATUSES].map((statusOption) => (
          <Button
            key={statusOption}
            size="small"
            type={statusFilter === statusOption ? 'primary' : 'default'}
            onClick={() => setStatusFilter(statusOption)}
            style={statusFilter === statusOption ? { background: '#4f46e5', borderColor: '#4f46e5' } : {}}
          >
            {statusOption === 'all' ? 'All' : statusOption.replace('_', ' ')}
          </Button>
        ))}
      </div>

      <div className="table-card">
        <Table
          dataSource={enrichedAppointments}
          columns={columns}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10 }}
          size="middle"
        />
      </div>

      <Modal
        title={editingAppointment ? 'Edit Appointment' : 'New Appointment'}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        footer={null}
        width={580}
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit} style={{ marginTop: 16 }}>
          <Form.Item name="patientId" label="Patient" rules={[{ required: true }]}>
            <Select showSearch placeholder="Select patient" optionFilterProp="children">
              {patients.map((patient) => (
                <Option key={patient.id} value={patient.id}>{patient.name}</Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="doctorId" label="Doctor" rules={[{ required: true }]}>
            <Select showSearch placeholder="Select doctor" optionFilterProp="children">
              {doctors.map((doctor) => (
                <Option key={doctor.id} value={doctor.id}>{doctor.name} — {doctor.specialization}</Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="scheduledAt" label="Date & Time" rules={[{ required: true }]}>
            <DatePicker showTime style={{ width: '100%' }} format="YYYY-MM-DD HH:mm" minuteStep={30} />
          </Form.Item>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <Form.Item name="priority" label="Priority" initialValue="medium">
              <Select>
                {PRIORITIES.map((p) => <Option key={p} value={p}>{p}</Option>)}
              </Select>
            </Form.Item>
            {editingAppointment && (
              <Form.Item name="status" label="Status">
                <Select>
                  {STATUSES.map((s) => <Option key={s} value={s}>{s.replace('_', ' ')}</Option>)}
                </Select>
              </Form.Item>
            )}
          </div>
          <Form.Item name="reason" label="Reason for Visit">
            <Input.TextArea rows={2} placeholder="Briefly describe the reason..." />
          </Form.Item>
          <Form.Item name="notes" label="Notes">
            <Input.TextArea rows={2} placeholder="Additional notes..." />
          </Form.Item>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <Button onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="primary" htmlType="submit" loading={submitting} style={{ background: '#4f46e5', borderColor: '#4f46e5' }}>
              {editingAppointment ? 'Update' : 'Create'}
            </Button>
          </div>
        </Form>
      </Modal>
    </AppLayout>
  );
}
