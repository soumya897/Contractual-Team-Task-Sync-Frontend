import { useState } from "react"
import { useNavigate } from "react-router-dom"
import api from "../services/Api"

export default function Register() {

  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [role, setRole] = useState("USER")
  const [error, setError] = useState("")

  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()

    try {

      await api.post("/api/auth/register", {
        name,
        email,
        password,
        role
      })

      alert("You are registered successfully!")

      // Redirect with email
      navigate("/login", {
        state: { email }
      })

    } catch (err) {
      setError("Registration failed")
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">

      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 w-96 rounded shadow"
      >

        <h2 className="text-2xl font-bold text-center mb-4">
          Register
        </h2>

        {error && (
          <p className="text-red-500 text-center mb-3">
            {error}
          </p>
        )}

        <input
          placeholder="Name"
          className="w-full border p-2 mb-3 rounded"
          onChange={e => setName(e.target.value)}
        />

        <input
          type="email"
          placeholder="Email"
          className="w-full border p-2 mb-3 rounded"
          onChange={e => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full border p-2 mb-3 rounded"
          onChange={e => setPassword(e.target.value)}
        />

        {/* Role Dropdown */}
        <select
          className="w-full border p-2 mb-3 rounded"
          value={role}
          onChange={e => setRole(e.target.value)}
        >
          <option value="CLIENT">Client</option>
          <option value="DEVELOPER">Developer</option>
          <option value="ADMIN">Admin</option>
        </select>

        <button
          className="w-full bg-green-600 text-white py-2 rounded"
        >
          Register
        </button>

      </form>

    </div>
  )
}
