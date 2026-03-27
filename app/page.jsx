'use client';
import React, { useEffect, useState } from 'react';
import { Row, Col, Spin, Tag, Table, Badge } from 'antd';
import {
  UserOutlined,
  MedicineBoxOutlined,
  CalendarOutlined,
  WarningOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import dayjs from 'dayjs';
import AppLayout from '../components/Layout/AppLayout';
import apiClient from '../utils/axios';
import { apis } from '../constants/apis';

const PRIORITY_COLORS = { urgent: '#ef4444', high: '#f97316', medium: '#eab308', low: '#22c55e' };
const STATUS_COLORS = { scheduled: '#3b82f6', completed: '#22c55e', cancelled: '#ef4444', no_show: '#a855f7' };
const CHART_COLORS = ['#4f46e5', '#06b6d4', '#f97316', '#22c55e', '#a855f7', '#ec4899'];

const StatCard = ({ title, value, icon, color, subtitle }) => (
  <div
    style={{
      background: 'white',
      borderRadius: 12,
      padding: '20px',
      border: '1px solid #e2e8f0',
      display: 'flex',
      flexDirection: 'column',
      gap: 8,
    }}
  >
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
      <div style={{ fontSize: 13, color: '#64748b', fontWeight: 500 }}>{title}</div>
      <div
        style={{
          width: 36,
          height: 36,
          borderRadius: 10,
          background: `${color}15`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: color,
          fontSize: 18,
        }}
      >
        {icon}
      </div>
    </div>
    <div style={{ fontSize: 28, fontWeight: 800, color: '#1e293b', lineHeight: 1 }}>{value ?? '-'}</div>
    {subtitle && <div style={{ fontSize: 12, color: '#94a3b8' }}>{subtitle}</div>}
  </div>
);

const appointmentColumns = [
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
    render: (name, record) => (
      <div>
        <div style={{ fontWeight: 500 }}>{name}</div>
        <div style={{ fontSize: 12, color: '#94a3b8' }}>{record.doctorSpecialization}</div>
      </div>
    ),
  },
  {
    title: 'Scheduled',
    dataIndex: 'scheduledAt',
    key: 'scheduledAt',
    render: (date) => (
      <div>
        <div style={{ fontWeight: 500 }}>{dayjs(date).format('MMM DD, YYYY')}</div>
        <div style={{ fontSize: 12, color: '#94a3b8' }}>{dayjs(date).format('hh:mm A')}</div>
      </div>
    ),
  },
  {
    title: 'Priority',
    dataIndex: 'priority',
    key: 'priority',
    render: (priority) => (
      <span
        className={`priority-badge badge-${priority}`}
        style={{ fontSize: 12, padding: '2px 10px', borderRadius: 999, fontWeight: 600 }}
      >
        {priority}
      </span>
    ),
  },
  {
    title: 'Status',
    dataIndex: 'status',
    key: 'status',
    render: (status) => (
      <span
        className={`status-badge badge-${status}`}
        style={{ fontSize: 12, padding: '2px 10px', borderRadius: 999, fontWeight: 600 }}
      >
        {status}
      </span>
    ),
  },
];

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [recentAppointments, setRecentAppointments] = useState([]);
  const [trends, setTrends] = useState([]);
  const [priorityData, setPriorityData] = useState([]);
  const [specializationData, setSpecializationData] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [statsRes, recentRes, trendsRes, priorityRes, specializationRes] = await Promise.all([
        apiClient.get(apis.dashboard.stats),
        apiClient.get(apis.dashboard.recentAppointments),
        apiClient.get(apis.dashboard.appointmentTrends),
        apiClient.get(apis.dashboard.priorityDistribution),
        apiClient.get(apis.dashboard.specializationDemand),
      ]);
      setStats(statsRes.data.data);
      setRecentAppointments(recentRes.data.data);
      setTrends(trendsRes.data.data.map((item) => ({ ...item, date: dayjs(item.date).format('MMM D') })));
      setPriorityData(priorityRes.data.data);
      setSpecializationData(specializationRes.data.data.slice(0, 6));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDashboardData(); }, []);

  return (
    <AppLayout>
      <div className="page-header">
        <h1 className="page-title">Dashboard</h1>
        <p className="page-subtitle">Overview of your clinic's activity today</p>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 80 }}>
          <Spin size="large" />
        </div>
      ) : (
        <>
          <div className="stats-grid" style={{ marginBottom: 24 }}>
            <StatCard title="Total Patients" value={stats?.totalPatients} icon={<UserOutlined />} color="#4f46e5" subtitle="Registered patients" />
            <StatCard title="Active Doctors" value={stats?.activeDoctors} icon={<MedicineBoxOutlined />} color="#06b6d4" subtitle={`of ${stats?.totalDoctors} total`} />
            <StatCard title="Today's Appointments" value={stats?.todayAppointments} icon={<CalendarOutlined />} color="#f97316" subtitle="Scheduled for today" />
            <StatCard title="Urgent Patients" value={stats?.urgentPatients} icon={<WarningOutlined />} color="#ef4444" subtitle="Need immediate attention" />
            <StatCard title="Completed" value={stats?.completedAppointments} icon={<CheckCircleOutlined />} color="#22c55e" subtitle="All time" />
            <StatCard title="Scheduled" value={stats?.scheduledAppointments} icon={<ClockCircleOutlined />} color="#8b5cf6" subtitle="Upcoming appointments" />
          </div>

          <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
            <Col xs={24} lg={14}>
              <div className="card">
                <div className="section-title">Appointment Trends (Last 7 Days)</div>
                <ResponsiveContainer width="100%" height={220}>
                  <AreaChart data={trends}>
                    <defs>
                      <linearGradient id="trendGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#94a3b8' }} />
                    <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} />
                    <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 13 }} />
                    <Area type="monotone" dataKey="count" stroke="#4f46e5" fill="url(#trendGrad)" strokeWidth={2} name="Appointments" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </Col>

            <Col xs={24} lg={10}>
              <div className="card" style={{ height: '100%' }}>
                <div className="section-title">Patient Priority Mix</div>
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie data={priorityData} dataKey="count" nameKey="priority" cx="50%" cy="50%" outerRadius={80} label={({ priority, percent }) => `${priority} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                      {priorityData.map((entry) => (
                        <Cell key={entry.priority} fill={PRIORITY_COLORS[entry.priority]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </Col>
          </Row>

          <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
            <Col xs={24} lg={12}>
              <div className="card">
                <div className="section-title">Specialization Demand</div>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={specializationData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis type="number" tick={{ fontSize: 12, fill: '#94a3b8' }} />
                    <YAxis dataKey="specialization" type="category" tick={{ fontSize: 11, fill: '#64748b' }} width={110} />
                    <Tooltip contentStyle={{ borderRadius: 8, fontSize: 13 }} />
                    <Bar dataKey="count" fill="#4f46e5" radius={[0, 4, 4, 0]} name="Appointments" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Col>

            <Col xs={24} lg={12}>
              <div className="card" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <div className="section-title">Quick Stats</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12, flex: 1 }}>
                  {[
                    { label: 'Scheduled', value: stats?.scheduledAppointments, color: '#3b82f6' },
                    { label: 'Completed', value: stats?.completedAppointments, color: '#22c55e' },
                    { label: 'Cancelled', value: stats?.cancelledAppointments, color: '#ef4444' },
                  ].map((item) => (
                    <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ width: 10, height: 10, borderRadius: '50%', background: item.color, flexShrink: 0 }} />
                      <div style={{ flex: 1, fontSize: 14, color: '#475569' }}>{item.label}</div>
                      <div style={{ fontWeight: 700, fontSize: 16, color: '#1e293b' }}>{item.value}</div>
                      <div style={{ width: 80 }}>
                        <div style={{ height: 6, borderRadius: 3, background: '#f1f5f9', overflow: 'hidden' }}>
                          <div style={{ height: '100%', borderRadius: 3, background: item.color, width: `${stats?.totalAppointments ? (item.value / stats.totalAppointments) * 100 : 0}%` }} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Col>
          </Row>

          <div className="table-card">
            <div style={{ padding: '16px 16px 0', fontSize: 18, fontWeight: 700, color: '#1e293b' }}>
              Recent Appointments
            </div>
            <Table
              dataSource={recentAppointments}
              columns={appointmentColumns}
              rowKey="id"
              pagination={{ pageSize: 5 }}
              style={{ borderRadius: 12 }}
              size="middle"
            />
          </div>
        </>
      )}
    </AppLayout>
  );
}
