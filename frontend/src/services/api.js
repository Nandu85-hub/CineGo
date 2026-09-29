import axios from 'axios';

const API = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

API.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const responseData = error.response?.data;
    const message = responseData?.details?.length
      ? `${responseData.error}: ${responseData.details.join(', ')}`
      : responseData?.error || error.message || 'Something went wrong';
    return Promise.reject(new Error(message));
  }
);


export const registerUser = (userData) => API.post('/auth/register', userData);
export const loginUser = (credentials) => API.post('/auth/login', credentials);
export const getMe = () => API.get('/auth/me');


export const fetchMovies = (params) => API.get('/movies', { params });
export const fetchMovieById = (id) => API.get(`/movies/${id}`);
export const createMovie = (data) => API.post('/movies', data);
export const updateMovie = (id, data) => API.put(`/movies/${id}`, data);
export const deleteMovie = (id) => API.delete(`/movies/${id}`);
export const uploadImage = (file) => {
  const formData = new FormData();
  formData.append('image', file);
  return API.post('/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

export const fetchShowtimesByMovie = (movieId) => API.get(`/showtimes/${movieId}`);
export const fetchShowtimeById = (id) => API.get(`/showtimes/single/${id}`);
export const createShowtime = (data) => API.post('/showtimes', data);
export const updateShowtime = (id, data) => API.put(`/showtimes/${id}`, data);
export const deleteShowtime = (id) => API.delete(`/showtimes/${id}`);


export const fetchSeatsByShowtime = (showtimeId) => API.get(`/seats/${showtimeId}`);
export const reserveSeats = (payload) => API.post('/seats/reserve', payload);
export const releaseSeats = (payload) => API.post('/seats/release', payload);


export const fetchMyBookings = () => API.get('/bookings/me');
export const fetchBookingById = (id) => API.get(`/bookings/${id}`);
export const fetchAllBookingsAdmin = () => API.get('/bookings/admin/all');

export const createPaymentOrder = (payload) => API.post('/payments/create', payload);
export const verifyPaymentSignature = (payload) => API.post('/payments/verify', payload);

export default API;
