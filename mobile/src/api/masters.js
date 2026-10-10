import client from './client';

// Helper creator for CRUD endpoints
const createCrudApi = (endpoint) => ({
  getAll: async () => {
    const res = await client.get(`/masters/${endpoint}`);
    return res.data;
  },
  create: async (data) => {
    const res = await client.post(`/masters/${endpoint}`, data);
    return res.data;
  },
  update: async (id, data) => {
    const res = await client.patch(`/masters/${endpoint}/${id}`, data);
    return res.data;
  },
  delete: async (id) => {
    const res = await client.delete(`/masters/${endpoint}/${id}`);
    return res.data;
  }
});

export const departmentApi = createCrudApi('departments');
export const programmeApi = createCrudApi('programmes');
export const blockApi = createCrudApi('blocks');
export const roomApi = createCrudApi('rooms');
export const roleApi = createCrudApi('roles');
export const userApi = createCrudApi('users');
