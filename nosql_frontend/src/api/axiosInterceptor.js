/**
 * Applies request and response interceptors to an Axios instance.
 * 
 * @param {import('axios').AxiosInstance} axiosInstance - The Axios instance to apply interceptors to.
 * @returns {import('axios').AxiosInstance} The Axios instance with interceptors applied.
 */
const applyInterceptors = (axiosInstance) => {
  // Request interceptor: attach Authorization Bearer token
  axiosInstance.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem('access_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // Response interceptor: handle 401 unauthorized
  axiosInstance.interceptors.response.use(
    (response) => {
      return response;
    },
    (error) => {
      if (error.response && error.response.status === 401) {
        localStorage.removeItem('access_token');
        // Redirect to login using window.location as requested
        window.location.href = '/login';
      }
      return Promise.reject(error);
    }
  );

  return axiosInstance;
};

export default applyInterceptors;
