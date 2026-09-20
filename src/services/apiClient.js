import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api/v1',
  timeout: 8000,
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response && err.response.status === 401) {
      // Optionally redirect to login or clear token
      localStorage.removeItem('token')
    }
    return Promise.reject(err)
  },
)

export const apiclient = {
  async getAll() {
    const { data } = await api.get('/blueprints')
    return data.data
  },
  async getByAuthor(author) {
    const { data } = await api.get(`/blueprints/${encodeURIComponent(author)}`)
    return data.data
  },
  async getByAuthorAndName(author, name) {
    const { data } = await api.get(
      `/blueprints/${encodeURIComponent(author)}/${encodeURIComponent(name)}`,
    )
    return data.data
  },
  async create(blueprint) {
    const { data } = await api.post('/blueprints', blueprint)
    return data.data
  },
}

export default api
