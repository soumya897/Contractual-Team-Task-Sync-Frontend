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
    <div className="min-h-screen flex items-center justify-center bg-slate-50 font-sans px-4 selection:bg-indigo-100 selection:text-indigo-900">
      
      {/* Background Decorative Gradients */}
        <div className="fixed top-[-10%] left-[-10%] w-96 h-96 bg-indigo-400 rounded-full mix-blend-multiply filter blur-[128px] opacity-40 animate-blob"></div>
        <div className="fixed top-[20%] right-[-5%] w-96 h-96 bg-violet-300 rounded-full mix-blend-multiply filter blur-[128px] opacity-40 animate-blob animation-delay-2000"></div>
        <div className="fixed bottom-[-20%] left-[20%] w-96 h-96 bg-fuchsia-300 rounded-full mix-blend-multiply filter blur-[128px] opacity-40 animate-blob animation-delay-4000"></div>
        
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100">
        
        {/* Branding / Logo Element */}
        <div className="flex justify-center mb-6">
          <div className="bg-indigo-600 text-white font-bold h-12 w-12 rounded-xl flex items-center justify-center text-xl shadow-md shadow-indigo-200">
            S
          </div>
        </div>

        <h2 className="text-2xl font-bold text-center text-slate-900 mb-2">
          Welcome back
        </h2>
        <p className="text-center text-slate-500 mb-8 text-sm">
          Please enter your details to sign in to your workspace.
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm text-center font-medium border border-red-100">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Email Address
            </label>
            <input
              type="email"
              placeholder="name@company.com"
              value={email}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all text-slate-900 placeholder-slate-400"
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Password
            </label>
            <input
              type="password"
              placeholder="••••••••"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all text-slate-900 placeholder-slate-400"
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-indigo-600 text-white font-semibold py-3 rounded-lg hover:bg-indigo-700 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 mt-2"
          >
            Sign in
          </button>

          <p className="text-center mt-6 text-sm text-slate-600">
            Don't have an account?{" "}
            <Link to="/register" className="text-indigo-600 font-semibold hover:text-indigo-700 hover:underline">
              Create one
            </Link>
          </p>

        </form>

      </div>

    </div>
  )
}