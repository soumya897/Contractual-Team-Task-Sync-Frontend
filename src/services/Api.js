import axios from "axios"
import { useLoader } from "../context/LoaderContext"

const api = axios.create({
  baseURL: "https://contractual-team-task-sync-backend.onrender.com"
})

// Automatically attach token
api.interceptors.request.use((config) => {

  const token = localStorage.getItem("token")

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

export default api
