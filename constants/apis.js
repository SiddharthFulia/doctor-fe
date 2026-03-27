const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4001';

export const apis = {
  base: API_BASE,
  dashboard: {
    stats: `${API_BASE}/api/v1/dashboard/stats`,
    recentAppointments: `${API_BASE}/api/v1/dashboard/recent-appointments`,
    appointmentTrends: `${API_BASE}/api/v1/dashboard/appointment-trends`,
    priorityDistribution: `${API_BASE}/api/v1/dashboard/priority-distribution`,
    specializationDemand: `${API_BASE}/api/v1/dashboard/specialization-demand`,
    algorithmDemo: `${API_BASE}/api/v1/dashboard/algorithm-demo`,
  },
  patients: {
    getAll: `${API_BASE}/api/v1/patients`,
    getById: (id) => `${API_BASE}/api/v1/patients/${id}`,
    create: `${API_BASE}/api/v1/patients`,
    update: (id) => `${API_BASE}/api/v1/patients/${id}`,
    delete: (id) => `${API_BASE}/api/v1/patients/${id}`,
    search: `${API_BASE}/api/v1/patients/search`,
  },
  doctors: {
    getAll: `${API_BASE}/api/v1/doctors`,
    getById: (id) => `${API_BASE}/api/v1/doctors/${id}`,
    create: `${API_BASE}/api/v1/doctors`,
    update: (id) => `${API_BASE}/api/v1/doctors/${id}`,
    delete: (id) => `${API_BASE}/api/v1/doctors/${id}`,
  },
  appointments: {
    getAll: `${API_BASE}/api/v1/appointments`,
    getById: (id) => `${API_BASE}/api/v1/appointments/${id}`,
    create: `${API_BASE}/api/v1/appointments`,
    update: (id) => `${API_BASE}/api/v1/appointments/${id}`,
    updateStatus: (id) => `${API_BASE}/api/v1/appointments/${id}/status`,
    delete: (id) => `${API_BASE}/api/v1/appointments/${id}`,
    byDate: `${API_BASE}/api/v1/appointments/by-date`,
    schedulingStats: `${API_BASE}/api/v1/appointments/scheduling-stats`,
    runScheduler: `${API_BASE}/api/v1/appointments/run-scheduler`,
  },
};
