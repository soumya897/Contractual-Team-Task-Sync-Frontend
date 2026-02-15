import axios from "axios"

const api = axios.create({
  baseURL: "https://contractual-team-task-sync-backend.onrender.com"
})

export default api
