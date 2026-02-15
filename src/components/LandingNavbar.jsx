import { Link } from "react-router-dom"

export default function LandingNavbar() {

  return (
    <nav className="flex justify-between items-center p-5 bg-white shadow">

      <h1 className="text-2xl font-bold text-blue-600">
        TaskSync
      </h1>

      <div className="space-x-4">

        <Link
          to="/login"
          className="px-4 py-2 border border-blue-600 text-blue-600 rounded"
        >
          Login
        </Link>

        <Link
          to="/register"
          className="px-4 py-2 bg-blue-600 text-white rounded"
        >
          Register
        </Link>

      </div>

    </nav>
  )
}
