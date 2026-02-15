import Sidebar from "../components/Sidebar"
import Navbar from "../components/Navbar"

export default function MainLayout({ children }) {

  return (
    <div className="flex h-screen bg-gray-100">

      {/* Sidebar */}
      <Sidebar />

      {/* Main Area */}
      <div className="flex-1 flex flex-col">

        <Navbar />

        {/* Content */}
        <main className="flex-1 overflow-auto p-4">
          {children}
        </main>

      </div>

    </div>
  )
}
