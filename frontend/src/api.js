import axios from 'axios'

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL ||'http://localhost:8000'
})

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export const signup = (data) => API.post('/auth/signup', data)
export const login = (data) => API.post('/auth/login', data)
export const getMe = () => API.get('/auth/me')
export const getDocuments = () => API.get('/documents/')
export const uploadDocument = (formData) => API.post('/documents/upload', formData)
export const deleteDocument = (id) => API.delete(`/documents/${id}`)
export const askQuestion = (data) => API.post('/qa/ask', data)