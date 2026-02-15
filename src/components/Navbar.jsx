import { useNavigate } from "react-router-dom"

export default function Navbar() {

  const navigate = useNavigate()

  function logout() {
    localStorage.removeItem("token")
    navigate("/")
  }

  return (
    <div className="h-14 bg-white border-b flex items-center justify-between px-4">

      <h1 className="font-bold text-lg">
        Task Manager
      </h1>

      <div className="flex items-center gap-3">

        <span className="text-gray-600">
          Deep
        </span>

        <button
          onClick={logout}
          className="bg-red-500 text-white px-3 py-1 rounded"
        >
          Logout
        </button>

      </div>

    </div>
  )
}
