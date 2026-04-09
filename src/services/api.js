import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8000/api",
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth
export const loginUser = (credentials) =>
  API.post("/token/", credentials);

// Events
export const getEvents = () => API.get("/events/");
export const createEvent = (data) => API.post("/events/", data);
export const updateEvent = (id, data) => API.put(`/events/${id}/`, data);
export const deleteEvent = (id) => API.delete(`/events/${id}/`);

// Participants
export const getParticipants = () => API.get("/participants/");
export const createParticipant = (data) => API.post("/participants/", data);
export const updateParticipant = (id, data) => API.put(`/participants/${id}/`, data);
export const deleteParticipant = (id) => API.delete(`/participants/${id}/`);

// Registrations
export const getRegistrations = () => API.get("/registrations/");
export const createRegistration = (data) => API.post("/registrations/", data);
export const deleteRegistration = (id) => API.delete(`/registrations/${id}/`);

export default API;