import client from './client';

export const getComplaintStatsApi = async (role, userId) => {
  const response = await client.get('/complaints/stats', {
    params: { role, userId }
  });
  return response.data;
};

export const getRecentComplaintsApi = async (role, userId) => {
  const response = await client.get('/complaints/recent', {
    params: { role, userId }
  });
  return response.data;
};

export const getComplaintsApi = async (role, userId) => {
  const response = await client.get('/complaints', {
    params: { role, userId }
  });
  return response.data;
};

export const getAllComplaintsApi = async () => {
  const response = await client.get('/complaints/all');
  return response.data;
};

export const getTechniciansApi = async () => {
  const response = await client.get('/complaints/technicians');
  return response.data;
};

export const raiseComplaintApi = async (formData) => {
  const response = await client.post('/complaints/raise', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
  return response.data;
};

export const assignComplaintApi = async (id, assignedTo) => {
  const response = await client.patch(`/complaints/${id}/assign`, { assignedTo });
  return response.data;
};

export const updateComplaintStatusApi = async (id, status) => {
  const response = await client.patch(`/complaints/${id}/status`, { status });
  return response.data;
};
