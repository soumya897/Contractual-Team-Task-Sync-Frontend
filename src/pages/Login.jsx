import { useState, useEffect } from "react"
import { useNavigate, Link, useLocation } from "react-router-dom"
import api from "../services/Api"

export default function Login() {

  const location = useLocation()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")

  const navigate = useNavigate()

  // Prefill email after register
  useEffect(() => {
    if (location.state?.email) {
      setEmail(location.state.email)
    }
  }, [location])

  async function handleSubmit(e) {
    e.preventDefault()

    try {

      const res = await api.post("/api/auth/login", {
        email,
        password
      })

      const { token, role } = res.data

      localStorage.setItem("token", token)
      localStorage.setItem("role", role)

      // Redirect by role
      if (role === "ADMIN") navigate("/admin")
      else if (role === "DEVELOPER") navigate("/developer")
      else  navigate("/user")

    } catch (err) {
      setError("Invalid email or password")
    }
  }  

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">

      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 w-96 rounded shadow"
      >

        <h2 className="text-2xl font-bold text-center mb-4">
          Login
        </h2>

        {error && (
          <p className="text-red-500 text-center mb-3">
            {error}
          </p>
        )}

        <input
          type="email"
          placeholder="Email"
          value={email}
          className="w-full border p-2 mb-3 rounded"
          onChange={e => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full border p-2 mb-3 rounded"
          onChange={e => setPassword(e.target.value)}
        />

        <button
          className="w-full bg-blue-600 text-white py-2 rounded"
        >
          Login
        </button>

        <p className="text-center mt-3 text-sm">
          No account?{" "}
          <Link to="/register" className="text-blue-600">
            Register
          </Link>
        </p>

      </form>

    </div>
  )
}
