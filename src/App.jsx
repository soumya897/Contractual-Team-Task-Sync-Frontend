import { Routes, Route } from "react-router-dom"

import Home from "./pages/Home"
import Login from "./pages/login"
import Register from "./pages/Register"

import UserDashboard from "./pages/UserDashboard"
import DeveloperDashboard from "./pages/DeveloperDashboard"
import AdminDashboard from "./pages/AdminDashboard"

import ProtectedRoute from "./components/ProtectedRoute"

function App() {
  return (
    <Routes>

      {/* Landing Page */}
      <Route path="/" element={<Home />} />

      {/* Auth */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Role Dashboards */}
      <Route
        path="/user"
        element={
          <ProtectedRoute>
            <UserDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/developer"
        element={
          <ProtectedRoute>
            <DeveloperDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />

    </Routes>
  )
}

export default App
