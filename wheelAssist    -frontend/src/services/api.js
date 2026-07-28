const API_BASE_URL = '/api';

// Helper to get stored auth data
export const getStoredAuth = () => {
  try {
    const authData = localStorage.getItem('wheel_assist_auth');
    return authData ? JSON.parse(authData) : null;
  } catch (err) {
    return null;
  }
};

export const setStoredAuth = (authData) => {
  if (authData) {
    localStorage.setItem('wheel_assist_auth', JSON.stringify(authData));
  } else {
    localStorage.removeItem('wheel_assist_auth');
  }
};

// Generic fetch wrapper with auth header & error handling
async function request(endpoint, options = {}) {
  const auth = getStoredAuth();
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  if (auth && auth.token) {
    headers['Authorization'] = `Bearer ${auth.token}`;
  }

  const config = {
    ...options,
    headers,
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    
    if (response.status === 204) {
      return null;
    }

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      const errorMessage = data?.message || data?.error || `Request failed with status ${response.status}`;
      throw new Error(errorMessage);
    }

    return data;
  } catch (error) {
    console.error(`API Error on [${options.method || 'GET'}] ${endpoint}:`, error.message);
    throw error;
  }
}

// Authentication APIs
export const authApi = {
  login: (credentials) => request('/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  }),
  
  register: (userData) => request('/users/register', {
    method: 'POST',
    body: JSON.stringify(userData),
  }),
};

// Vehicles APIs
export const vehicleApi = {
  getByUser: (userId) => request(`/vehicles/user/${userId}`),
  
  add: (vehicleData) => request('/vehicles/add', {
    method: 'POST',
    body: JSON.stringify(vehicleData),
  }),

  update: (vehicleId, vehicleData) => request(`/vehicles/${vehicleId}`, {
    method: 'PUT',
    body: JSON.stringify(vehicleData),
  }),

  delete: (vehicleId) => request(`/vehicles/delete/${vehicleId}`, {
    method: 'DELETE',
  }),
};

// Work Orders APIs
export const workorderApi = {
  create: (workorderData) => request('/workorders/add', {
    method: 'POST',
    body: JSON.stringify(workorderData),
  }),

  getByUser: (userId) => request(`/workorders/user/${userId}`),

  getUnassigned: () => request('/workorders/unassigned'),

  getByMechanic: (mechanicId) => request(`/workorders/mechanic/${mechanicId}`),

  assignToSelf: (workorderId) => request(`/workorders/${workorderId}/assign`, {
    method: 'PUT',
  }),

  updateStatus: (workorderId, status) => request(`/workorders/${workorderId}/status`, {
    method: 'PUT',
    body: JSON.stringify({ status }),
  }),
};

// Job Cards APIs
export const jobCardApi = {
  create: (workorderId) => request('/jobcards/add', {
    method: 'POST',
    body: JSON.stringify({ workorderId }),
  }),

  getByWorkorder: (workorderId) => request(`/jobcards/workorder/${workorderId}`),

  update: (jobId, updateData) => request(`/jobcards/${jobId}`, {
    method: 'PUT',
    body: JSON.stringify(updateData),
  }),
};

// Parts APIs
export const partApi = {
  add: (jobId, partData) => request(`/parts/jobcard/${jobId}/add`, {
    method: 'POST',
    body: JSON.stringify(partData),
  }),

  getByJobCard: (jobId) => request(`/parts/jobcard/${jobId}`),

  delete: (partId) => request(`/parts/${partId}`, {
    method: 'DELETE',
  }),
};
