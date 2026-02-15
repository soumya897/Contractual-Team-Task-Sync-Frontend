import { useState } from "react"

export default function Sidebar() {

  // Workspace List (Later will come from Backend)
  const [workspaces] = useState([
    { id: 1, name: "Personal" },
    { id: 2, name: "College Project" },
    { id: 3, name: "Internship" },
  ])

  // Track Active Workspace
  const [active, setActive] = useState(1)

  return (
    <div className="w-64 bg-white border-r p-4 flex flex-col">

      {/* Title */}
      <h2 className="text-xl font-bold mb-4">
        Workspaces
      </h2>

      {/* Workspace List */}
      <ul className="flex-1 space-y-1">

        {workspaces.map((ws) => (

          <li
            key={ws.id}
            onClick={() => setActive(ws.id)}
            className={`
              p-2 rounded cursor-pointer transition

              ${active === ws.id
                ? "bg-blue-100 text-blue-600 font-semibold"
                : "hover:bg-gray-200 text-gray-700"}
            `}
          >
            {ws.name}
          </li>

        ))}

      </ul>

      {/* Add Workspace Button */}
      <button
        className="mt-4 w-full bg-blue-600 text-white py-2 rounded
                   hover:bg-blue-700 transition"
      >
        + New Workspace
      </button>

    </div>
  )
}
