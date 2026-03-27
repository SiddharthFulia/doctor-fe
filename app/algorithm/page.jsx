'use client';
import React, { useEffect, useState } from 'react';
import { Row, Col, Spin, Tag, Steps, Alert, Table, Tooltip } from 'antd';
import {
  BarChart, Bar, RadarChart, Radar, PolarGrid, PolarAngleAxis,
  XAxis, YAxis, CartesianGrid, ResponsiveContainer, Cell, Tooltip as RTooltip, Legend,
} from 'recharts';
import { BulbOutlined, ThunderboltOutlined, SortAscendingOutlined, CalendarOutlined } from '@ant-design/icons';
import AppLayout from '../../components/Layout/AppLayout';
import apiClient from '../../utils/axios';
import { apis } from '../../constants/apis';
import dayjs from 'dayjs';

const PRIORITY_COLORS = { urgent: '#ef4444', high: '#f97316', medium: '#eab308', low: '#22c55e' };
const PRIORITY_SCORE = { urgent: 4, high: 3, medium: 2, low: 1 };

const AlgorithmStep = ({ number, title, description, icon }) => (
  <div
    style={{
      display: 'flex',
      gap: 16,
      padding: '18px 20px',
      borderRadius: 12,
      background: '#f8fafc',
      border: '1px solid #e2e8f0',
      marginBottom: 12,
      alignItems: 'flex-start',
    }}
  >
    <div
      style={{
        width: 36,
        height: 36,
        borderRadius: '50%',
        background: 'linear-gradient(135deg, #4f46e5, #818cf8)',
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 800,
        fontSize: 15,
        flexShrink: 0,
      }}
    >
      {number}
    </div>
    <div>
      <div style={{ fontWeight: 700, fontSize: 15, color: '#1e293b', marginBottom: 4 }}>{title}</div>
      <div style={{ fontSize: 13, color: '#64748b', lineHeight: 1.6 }}>{description}</div>
    </div>
  </div>
);

const InfoCard = ({ title, value, sub, color }) => (
  <div
    style={{
      background: 'white',
      borderRadius: 12,
      padding: 16,
      border: '1px solid #e2e8f0',
      textAlign: 'center',
    }}
  >
    <div style={{ fontSize: 11, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1, fontWeight: 600 }}>{title}</div>
    <div style={{ fontSize: 32, fontWeight: 800, color: color || '#4f46e5', margin: '6px 0 2px' }}>{value}</div>
    {sub && <div style={{ fontSize: 12, color: '#64748b' }}>{sub}</div>}
  </div>
);

export default function AlgorithmPage() {
  const [demoData, setDemoData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchAlgorithmDemo = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get(apis.dashboard.algorithmDemo);
      setDemoData(response.data.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAlgorithmDemo(); }, []);

  if (loading || !demoData) {
    return (
      <AppLayout>
        <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 80 }}>
          <Spin size="large" />
        </div>
      </AppLayout>
    );
  }

  const { inputRequests, sortedByPriority, schedulingResults, doctorUtilization, availableSlots } = demoData;

  const scheduledCount = schedulingResults.filter((r) => r.status === 'scheduled').length;
  const unscheduledCount = schedulingResults.filter((r) => r.status === 'unscheduled').length;

  const urgencyChartData = sortedByPriority.map((request) => ({
    name: request.patientName?.split(' ')[0] || request.patientId.slice(-4),
    urgencyScore: request.urgencyScore,
    priority: request.priority,
  }));

  const utilizationChartData = doctorUtilization.map((utilData) => ({
    doctor: utilData.doctorName?.split(' ').slice(-1)[0] || utilData.doctorId.slice(-4),
    booked: utilData.bookedSlots,
    free: utilData.freeSlots,
    utilization: utilData.utilizationPercent,
  }));

  const slotTimelineData = (availableSlots || []).slice(0, 16).map((slot) => ({
    time: dayjs(slot).format('HH:mm'),
    slot,
  }));

  const scheduledSlots = new Set(schedulingResults.filter((r) => r.scheduledAt).map((r) => r.scheduledAt));

  const inputColumns = [
    { title: '#', key: 'index', render: (_, __, index) => index + 1, width: 40 },
    { title: 'Patient', dataIndex: 'patientName', key: 'patientName', render: (name) => <b>{name}</b> },
    {
      title: 'Priority',
      dataIndex: 'priority',
      key: 'priority',
      render: (priority) => (
        <span className={`priority-badge badge-${priority}`}>{priority}</span>
      ),
    },
    {
      title: 'Base Score',
      dataIndex: 'priority',
      key: 'baseScore',
      render: (priority) => (
        <span style={{ fontWeight: 700, color: PRIORITY_COLORS[priority] }}>{PRIORITY_SCORE[priority] * 10}</span>
      ),
    },
  ];

  const sortedColumns = [
    { title: 'Rank', key: 'rank', render: (_, __, index) => (
      <div style={{
        width: 24, height: 24, borderRadius: '50%',
        background: index === 0 ? '#fbbf24' : index === 1 ? '#94a3b8' : index === 2 ? '#cd7f32' : '#e2e8f0',
        color: index < 3 ? 'white' : '#64748b',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontWeight: 700, fontSize: 12, flexShrink: 0,
      }}>
        {index + 1}
      </div>
    ), width: 50 },
    { title: 'Patient', dataIndex: 'patientName', key: 'patientName', render: (name) => <b>{name}</b> },
    { title: 'Priority', dataIndex: 'priority', key: 'priority', render: (priority) => <span className={`priority-badge badge-${priority}`}>{priority}</span> },
    {
      title: 'Urgency Score',
      dataIndex: 'urgencyScore',
      key: 'urgencyScore',
      render: (score) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ fontWeight: 800, fontSize: 16, color: '#4f46e5' }}>{score}</div>
          <div style={{ flex: 1, height: 6, background: '#e2e8f0', borderRadius: 3, overflow: 'hidden', minWidth: 60 }}>
            <div style={{ height: '100%', background: '#4f46e5', borderRadius: 3, width: `${(score / 47) * 100}%` }} />
          </div>
        </div>
      ),
    },
  ];

  const resultColumns = [
    { title: 'Patient', dataIndex: 'patientId', key: 'patient', render: (patientId) => {
      const request = sortedByPriority.find((r) => r.patientId === patientId);
      return <b>{request?.patientName || patientId}</b>;
    }},
    { title: 'Priority', dataIndex: 'priority', key: 'priority', render: (priority) => <span className={`priority-badge badge-${priority}`}>{priority}</span> },
    { title: 'Score', dataIndex: 'urgencyScore', key: 'urgencyScore', render: (score) => <span style={{ fontWeight: 700, color: '#4f46e5' }}>{score}</span> },
    { title: 'Assigned Doctor', dataIndex: 'doctorName', key: 'doctorName', render: (name) => name || <span style={{ color: '#94a3b8' }}>Unassigned</span> },
    { title: 'Time Slot', dataIndex: 'scheduledAt', key: 'scheduledAt', render: (slot) => slot ? dayjs(slot).format('HH:mm') : '-' },
    { title: 'Result', dataIndex: 'status', key: 'status', render: (status) => (
      <Tag color={status === 'scheduled' ? 'green' : 'red'}>{status}</Tag>
    )},
  ];

  return (
    <AppLayout>
      <div className="page-header">
        <h1 className="page-title">Smart Scheduling Algorithm</h1>
        <p className="page-subtitle">Priority-Weighted Greedy Slot Allocation — Visual Explanation</p>
      </div>

      <Alert
        message={<span style={{ fontWeight: 600 }}>Priority-Weighted Greedy Slot Allocation</span>}
        description="This algorithm scores every appointment request by urgency and wait time, sorts them highest-first, then greedily assigns each request to the earliest available doctor slot. It maximises doctor utilisation while ensuring critical patients are always seen first."
        type="info"
        showIcon
        icon={<BulbOutlined />}
        style={{ marginBottom: 24, borderRadius: 12 }}
      />

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={12} sm={6}><InfoCard title="Requests In" value={inputRequests.length} sub="Patients queued" color="#4f46e5" /></Col>
        <Col xs={12} sm={6}><InfoCard title="Successfully Scheduled" value={scheduledCount} sub="Slots assigned" color="#22c55e" /></Col>
        <Col xs={12} sm={6}><InfoCard title="Unscheduled" value={unscheduledCount} sub="No slot found" color="#ef4444" /></Col>
        <Col xs={12} sm={6}><InfoCard title="Available Slots" value={availableSlots?.length || 0} sub="Per doctor / day" color="#f97316" /></Col>
      </Row>

      <div className="card" style={{ marginBottom: 24 }}>
        <div className="section-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <ThunderboltOutlined style={{ color: '#4f46e5' }} /> How It Works — Step by Step
        </div>
        <AlgorithmStep
          number="1"
          title="Compute Urgency Score"
          description={`Each request gets a composite score: (Priority Weight × 10) + Wait Bonus. Priority weights are Urgent=4, High=3, Medium=2, Low=1. Wait bonus adds up to +7 for requests older than 7 days. Formula: score = priority_weight × 10 + min(wait_days, 7).`}
        />
        <AlgorithmStep
          number="2"
          title="Sort Requests Descending by Score"
          description="All requests are sorted highest-score first. This guarantees that a critical patient (urgent + 7-day wait = score 47) always gets assigned before a low-priority same-day request (score 10). Time: O(R log R)."
        />
        <AlgorithmStep
          number="3"
          title="Generate Doctor Time Slots"
          description={`For the target date, generate 30-minute slots from 09:00 to 17:00 — ${availableSlots?.length || 16} slots per doctor. Slots already occupied by existing confirmed appointments are removed from the available pool.`}
        />
        <AlgorithmStep
          number="4"
          title="Greedy Slot Assignment"
          description="For each request (in priority order), iterate eligible doctors filtered by required specialization. Take the earliest free slot from the first eligible doctor. Mark that slot occupied so subsequent requests cannot reuse it. Complexity: O(R × D × S)."
        />
        <AlgorithmStep
          number="5"
          title="Return Scheduling Results"
          description="Each request receives either a confirmed slot + doctor assignment, or an 'unscheduled' result with a reason. The caller can then bulk-create appointments or surface conflicts to the operator."
        />
      </div>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} lg={12}>
          <div className="card">
            <div className="section-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <SortAscendingOutlined style={{ color: '#4f46e5' }} /> Step 1 — Raw Input Requests
            </div>
            <p style={{ fontSize: 13, color: '#64748b', marginBottom: 16 }}>
              Requests arrive in any order. Priority scores have not been applied yet.
            </p>
            <Table
              dataSource={inputRequests}
              columns={inputColumns}
              rowKey="id"
              pagination={false}
              size="small"
            />
          </div>
        </Col>
        <Col xs={24} lg={12}>
          <div className="card">
            <div className="section-title">Step 2 — Sorted by Urgency Score</div>
            <p style={{ fontSize: 13, color: '#64748b', marginBottom: 16 }}>
              After scoring, highest urgency patients bubble to the top. This table drives assignment order.
            </p>
            <Table
              dataSource={sortedByPriority}
              columns={sortedColumns}
              rowKey="id"
              pagination={false}
              size="small"
            />
          </div>
        </Col>
      </Row>

      <div className="card" style={{ marginBottom: 24 }}>
        <div className="section-title">Urgency Score Distribution</div>
        <p style={{ fontSize: 13, color: '#64748b', marginBottom: 16 }}>
          Visual representation of computed urgency scores. Taller bars = higher scheduling priority.
        </p>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={urgencyChartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#64748b' }} />
            <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} domain={[0, 50]} />
            <RTooltip
              contentStyle={{ borderRadius: 8, fontSize: 13 }}
              formatter={(value, name, props) => [`Score: ${value}`, props.payload.priority]}
            />
            <Bar dataKey="urgencyScore" radius={[6, 6, 0, 0]} name="Urgency Score">
              {urgencyChartData.map((entry) => (
                <Cell key={entry.name} fill={PRIORITY_COLORS[entry.priority]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap', marginTop: 8 }}>
          {Object.entries(PRIORITY_COLORS).map(([priority, color]) => (
            <div key={priority} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
              <div style={{ width: 10, height: 10, borderRadius: 2, background: color }} />
              <span style={{ color: '#64748b', textTransform: 'capitalize' }}>{priority}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="card" style={{ marginBottom: 24 }}>
        <div className="section-title">Step 3 — Available Time Slots (09:00 – 17:00)</div>
        <p style={{ fontSize: 13, color: '#64748b', marginBottom: 16 }}>
          30-minute slots generated for the scheduling target day. Green = assigned by algorithm, grey = still free.
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {slotTimelineData.map(({ time, slot }) => {
            const isAssigned = scheduledSlots.has(slot);
            return (
              <Tooltip key={slot} title={isAssigned ? 'Assigned by scheduler' : 'Available'}>
                <div
                  style={{
                    padding: '6px 14px',
                    borderRadius: 8,
                    fontSize: 13,
                    fontWeight: 600,
                    background: isAssigned ? '#4f46e5' : '#f1f5f9',
                    color: isAssigned ? 'white' : '#64748b',
                    border: `1px solid ${isAssigned ? '#4f46e5' : '#e2e8f0'}`,
                    cursor: 'default',
                    transition: 'all 0.2s',
                  }}
                >
                  {time}
                </div>
              </Tooltip>
            );
          })}
        </div>
        <div style={{ marginTop: 12, fontSize: 12, color: '#94a3b8', display: 'flex', gap: 16 }}>
          <span>
            <span style={{ display: 'inline-block', width: 10, height: 10, background: '#4f46e5', borderRadius: 2, marginRight: 4 }} />
            Assigned slots
          </span>
          <span>
            <span style={{ display: 'inline-block', width: 10, height: 10, background: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: 2, marginRight: 4 }} />
            Free slots
          </span>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 24 }}>
        <div className="section-title">Step 4 & 5 — Final Assignment Results</div>
        <p style={{ fontSize: 13, color: '#64748b', marginBottom: 16 }}>
          Each request assigned in priority order. Highest-scoring patients get the earliest available slots.
        </p>
        <Table
          dataSource={schedulingResults}
          columns={resultColumns}
          rowKey="requestId"
          pagination={false}
          size="middle"
          rowClassName={(record) => record.status === 'unscheduled' ? 'ant-table-row-danger' : ''}
        />
      </div>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} lg={14}>
          <div className="card">
            <div className="section-title">Doctor Slot Utilisation</div>
            <p style={{ fontSize: 13, color: '#64748b', marginBottom: 16 }}>
              Stacked view of booked vs free slots per doctor after algorithm runs.
            </p>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={utilizationChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="doctor" tick={{ fontSize: 12, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} />
                <RTooltip contentStyle={{ borderRadius: 8, fontSize: 13 }} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="booked" stackId="slots" fill="#4f46e5" name="Booked" radius={[0, 0, 0, 0]} />
                <Bar dataKey="free" stackId="slots" fill="#e0e7ff" name="Free" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Col>

        <Col xs={24} lg={10}>
          <div className="card" style={{ height: '100%' }}>
            <div className="section-title">Utilisation % per Doctor</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 8 }}>
              {utilizationChartData.map((utilData) => (
                <div key={utilData.doctor}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ fontSize: 13, fontWeight: 600 }}>Dr. {utilData.doctor}</span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: '#4f46e5' }}>{utilData.utilization}%</span>
                  </div>
                  <div style={{ height: 8, background: '#f1f5f9', borderRadius: 4, overflow: 'hidden' }}>
                    <div
                      style={{
                        height: '100%',
                        borderRadius: 4,
                        background: `linear-gradient(90deg, #4f46e5, #818cf8)`,
                        width: `${utilData.utilization}%`,
                        transition: 'width 0.6s ease',
                      }}
                    />
                  </div>
                  <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>
                    {utilData.booked} booked · {utilData.free} free
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Col>
      </Row>

      <div className="card">
        <div className="section-title">Complexity Analysis</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
          {[
            { label: 'Scoring', complexity: 'O(R)', desc: 'Linear scan of requests' },
            { label: 'Sorting', complexity: 'O(R log R)', desc: 'Compare-based sort' },
            { label: 'Slot Generation', complexity: 'O(D × S)', desc: 'Doctors × slots per day' },
            { label: 'Assignment Loop', complexity: 'O(R × D × S)', desc: 'Outer loop is the bound' },
          ].map((item) => (
            <div key={item.label} style={{ padding: 16, background: '#f8fafc', borderRadius: 10, border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: 12, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.5, fontWeight: 600 }}>{item.label}</div>
              <div style={{ fontFamily: 'monospace', fontSize: 16, fontWeight: 700, color: '#4f46e5', margin: '6px 0 2px' }}>{item.complexity}</div>
              <div style={{ fontSize: 12, color: '#64748b' }}>{item.desc}</div>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 16, padding: 16, background: '#eff6ff', borderRadius: 10, border: '1px solid #bfdbfe' }}>
          <div style={{ fontWeight: 700, color: '#1d4ed8', marginBottom: 4 }}>Overall: O(R log R + R × D × S)</div>
          <div style={{ fontSize: 13, color: '#2563eb' }}>
            With typical values — R=50 patients, D=10 doctors, S=16 slots — this is ≈8,050 operations per scheduling run.
            Well within sub-second range for any realistic clinic load.
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
