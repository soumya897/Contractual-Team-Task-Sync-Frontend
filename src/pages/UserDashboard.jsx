import { useState } from "react"

export default function UserDashboard() {

  // Menu state
  const [activeTab, setActiveTab] = useState("ALL")

  // Dummy projects (Later from backend)
  const projects = [
    {
      id: 1,
      name: "Frontend App",
      status: "ONGOING"
    },
    {
      id: 2,
      name: "Backend API",
      status: "ONGOING"
    },
    {
      id: 3,
      name: "Final Year Project",
      status: "DONE"
    },
    {
      id: 4,
      name: "Placement Prep",
      status: "DONE"
    },
    {
      id: 5,
      name: "Internship Task",
      status: "ONGOING"
    }
  ]

  // Filter projects
  function getProjects() {

    if (activeTab === "CURRENT") {
      return projects.filter(p => p.status === "ONGOING")
    }

    if (activeTab === "COMPLETED") {
      return projects.filter(p => p.status === "DONE")
    }

    return projects // ALL
  }

  const filteredProjects = getProjects()

  return (

    <div className="flex min-h-screen bg-gray-100">

      {/* Sidebar */}
      <div className="w-64 bg-white border-r p-4">

        <h2 className="text-xl font-bold mb-6">
          Dashboard
        </h2>

        <ul className="space-y-2">

          {/* All */}
          <li
            onClick={() => setActiveTab("ALL")}
            className={`
              p-2 rounded cursor-pointer select-none
              ${activeTab === "ALL"
                ? "bg-blue-100 text-blue-600 font-semibold"
                : "hover:bg-gray-200"}
            `}
          >
            All Projects
          </li>

          {/* Current */}
          <li
            onClick={() => setActiveTab("CURRENT")}
            className={`
              p-2 rounded cursor-pointer select-none
              ${activeTab === "CURRENT"
                ? "bg-blue-100 text-blue-600 font-semibold"
                : "hover:bg-gray-200"}
            `}
          >
            Current Projects
          </li>

          {/* Completed */}
          <li
            onClick={() => setActiveTab("COMPLETED")}
            className={`
              p-2 rounded cursor-pointer select-none
              ${activeTab === "COMPLETED"
                ? "bg-blue-100 text-blue-600 font-semibold"
                : "hover:bg-gray-200"}
            `}
          >
            Completed Projects
          </li>

        </ul>

      </div>

      {/* Main Content */}
      <div className="flex-1 p-6">

        {/* Header */}
        <div className="mb-6">

          <h1 className="text-3xl font-bold mb-1">
            User Dashboard
          </h1>

          <p className="text-gray-600">
            {activeTab === "ALL" && "All Your Projects"}
            {activeTab === "CURRENT" && "Ongoing Projects"}
            {activeTab === "COMPLETED" && "Completed Projects"}
          </p>

        </div>

        {/* Project Grid */}
        {filteredProjects.length === 0 ? (

          <p className="text-gray-500 text-center mt-10">
            No projects found.
          </p>

        ) : (

          <div className="grid grid-cols-3 gap-4">

            {filteredProjects.map(project => (

              <div
                key={project.id}
                className="bg-white p-4 rounded shadow hover:shadow-lg transition"
              >

                <h3 className="font-bold text-lg mb-2">
                  {project.name}
                </h3>

                <span
                  className={`
                    text-sm px-2 py-1 rounded

                    ${project.status === "ONGOING"
                      ? "bg-yellow-100 text-yellow-700"
                      : "bg-green-100 text-green-700"}
                  `}
                >
                  {project.status}
                </span>

              </div>

            ))}

          </div>

        )}

      </div>

    </div>
  )
}
