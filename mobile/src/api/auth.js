import client from './client';

export const loginApi = async (username, password) => {
  const response = await client.post('/auth/login', { username, password });
  return response.data;
};

export const registerSuperAdminApi = async (data) => {
  const response = await client.post('/auth/register-superadmin', data);
  return response.data;
};
