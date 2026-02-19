import { useEffect, useState } from "react"
import api from "../services/Api"

export default function DeveloperDashboard() {

  const [profile, setProfile] = useState(null)
  const [projects, setProjects] = useState([])
  const [activeProject, setActiveProject] = useState(null)

  const [tasks, setTasks] = useState([])
  const [completion, setCompletion] = useState(0)

  const [newTitle, setNewTitle] = useState("")
  const [newDesc, setNewDesc] = useState("")

  const [loading, setLoading] = useState(true)

  /* Load All Data */
  useEffect(() => {

    async function loadData() {

      setLoading(true)

      const profileRes =
        await api.get("/api/developer/profile")

      const projectRes =
        await api.get("/api/projects/developer")

      setProfile(profileRes.data)
      setProjects(projectRes.data)

      setLoading(false)
    }

    loadData()

  }, [])

  /* Load Tasks + Completion */
  async function openProject(project) {

    setActiveProject(project)

    // Load Tasks
    const taskRes =
      await api.get(`/api/tasks/project/${project.id}/completion`)

    setTasks(taskRes.data.tasks || [])

    setCompletion(taskRes.data.completion || 0)
  }

  /* Add Task */
  async function addTask(e) {

    e.preventDefault()

    if (!newTitle || !newDesc) return

    await api.post("/api/tasks", {
      title: newTitle,
      description: newDesc,
      projectId: activeProject.id,
      developerId: profile.id
    })

    setNewTitle("")
    setNewDesc("")

    openProject(activeProject)
  }

  /* Toggle Complete */
  async function toggleTask(task) {

    await api.put(`/api/tasks/${task.id}`, {
      title: task.title,
      completed: !task.completed
    })

    openProject(activeProject)
  }

  /* Delete Task */
  async function deleteTask(id) {

    if (!window.confirm("Delete task?")) return

    await api.delete(`/api/tasks/${id}`)

    openProject(activeProject)
  }

  if (loading) {
    return <p className="p-6">Loading...</p>
  }

  return (

    <div className="flex min-h-screen bg-gray-100">

      {/* Sidebar */}
      <div className="w-64 bg-white border-r p-4">

        <h2 className="text-xl font-bold mb-6">
          Developer Panel
        </h2>

        <h3 className="font-semibold mb-2">
          My Projects
        </h3>

        <ul className="space-y-2">

          {projects.map(p => (

            <li
              key={p.id}
              onClick={() => openProject(p)}
              className={`
                p-2 rounded cursor-pointer select-none

                ${activeProject?.id === p.id
                  ? "bg-blue-100 text-blue-600 font-semibold"
                  : "hover:bg-gray-200"}
              `}
            >
              {p.title}
            </li>

          ))}

        </ul>

      </div>

      {/* Main Area */}
      <div className="flex-1 flex flex-col">

        {/* Navbar */}
        <div className="h-14 bg-white border-b flex justify-between items-center px-6">

          <h1 className="font-bold text-lg">
            Developer Dashboard
          </h1>

          {profile && (

            <div className="flex items-center gap-3">

              <span>{profile.name}</span>

              <div
                className="w-9 h-9 bg-green-500 text-white
                           rounded-full flex items-center justify-center"
              >
                {profile.name[0]}
              </div>

            </div>

          )}

        </div>

        {/* Content */}
        <div className="p-6 flex-1 overflow-auto">

          {/* Profile */}
          {profile && (

            <div className="bg-white p-4 rounded shadow mb-6">

              <h3 className="font-bold mb-2">
                Profile
              </h3>

              <p>Email: {profile.email}</p>
              <p>Ongoing: {profile.ongoingProjects}</p>
              <p>Completed: {profile.completedProjects}</p>

            </div>

          )}

          {/* Project Area */}
          {!activeProject ? (

            <p className="text-gray-500 text-center mt-20">
              Select a project to view tasks
            </p>

          ) : (

            <>

              {/* Project Info */}
              <div className="mb-4">

                <h2 className="text-2xl font-bold">
                  {activeProject.title}
                </h2>

                <p className="text-gray-600">
                  {activeProject.description}
                </p>

              </div>

              {/* Completion */}
              <div className="mb-6">

                <p className="mb-1 font-semibold">
                  Completion: {completion}%
                </p>

                <div className="w-full bg-gray-200 rounded h-3">

                  <div
                    className="bg-green-500 h-3 rounded"
                    style={{ width: `${completion}%` }}
                  ></div>

                </div>

              </div>

              {/* Add Task */}
              <form
                onSubmit={addTask}
                className="bg-white p-4 rounded shadow mb-6"
              >

                <h3 className="font-bold mb-3">
                  Add New Task
                </h3>

                <input
                  placeholder="Task Title"
                  className="w-full border p-2 mb-2 rounded"
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                />

                <textarea
                  placeholder="Description"
                  className="w-full border p-2 mb-2 rounded"
                  value={newDesc}
                  onChange={e => setNewDesc(e.target.value)}
                ></textarea>

                <button
                  className="bg-blue-600 text-white px-4 py-2 rounded"
                >
                  Add Task
                </button>

              </form>

              {/* Task List */}
              <div className="bg-white p-4 rounded shadow">

                <h3 className="font-bold mb-3">
                  To-Do Checklist
                </h3>

                {tasks.length === 0 ? (

                  <p className="text-gray-500">
                    No tasks yet.
                  </p>

                ) : (

                  <ul className="space-y-2">

                    {tasks.map(task => (

                      <li
                        key={task.id}
                        className="flex justify-between items-center border p-2 rounded"
                      >

                        <div className="flex items-center gap-2">

                          <input
                            type="checkbox"
                            checked={task.completed}
                            onChange={() => toggleTask(task)}
                          />

                          <span
                            className={
                              task.completed
                                ? "line-through text-gray-500"
                                : ""
                            }
                          >
                            {task.title}
                          </span>

                        </div>

                        <button
                          onClick={() => deleteTask(task.id)}
                          className="text-red-500 text-sm"
                        >
                          Delete
                        </button>

                      </li>

                    ))}

                  </ul>

                )}

              </div>

            </>

          )}

        </div>

      </div>

    </div>
  )
}
