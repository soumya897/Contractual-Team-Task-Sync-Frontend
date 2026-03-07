import { Routes, Route } from "react-router-dom"
import Login from "./pages/Login"
import Home from "./pages/Home"

import Register from "./pages/Register"

import UserDashboard from "./pages/UserDashboard"
import DeveloperDashboard from "./pages/DeveloperDashboard"
import ProjectManagerDashboard from "./pages/ProjectManagerDashboard"

import ProtectedRoute from "./components/ProtectedRoute"
import ProjectManagerProjectDetails from "./pages/ProjectDetails"

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
        path="/project-manager"
        element={
          <ProtectedRoute>
            <ProjectManagerDashboard />
          </ProtectedRoute> 
        }
      />

      {/* 🔥 Project Manager Project Details Page */}
      <Route
        path="/project-manager/project/:id"
        element={
          <ProtectedRoute role="PROJECT_MANAGER">
            <ProjectManagerProjectDetails />
          </ProtectedRoute>
        }
      />

    </Routes>
  )
}

export default App