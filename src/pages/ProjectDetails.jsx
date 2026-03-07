import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import api from "../services/Api"

export default function ProjectDetails() {
  const { id } = useParams()
  const navigate = useNavigate() // Added for a "Back" button

  const [project, setProject] = useState(null)
  const [tasks, setTasks] = useState([])
  const [completion, setCompletion] = useState(0)
  const [loading, setLoading] = useState(true)

  const [showModal, setShowModal] = useState(false)

  /* ================= LOAD DATA ================= */

  async function loadData() {
    try {
      setLoading(true)

      const projRes = await api.get("/api/project-manager/projects")
      const current = projRes.data.find(p => p.id === Number(id))
      setProject(current)

      const taskRes = await api.get(`/api/tasks/project/${id}`)
      setTasks(taskRes.data)

      const compRes = await api.get(`/api/tasks/project/${id}/completion`)
      setCompletion(compRes.data)

      setLoading(false)

    } catch (err) {
      console.error(err)
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [id])

  /* ================= TOGGLE ================ */

  async function toggleTask(task) {
    await api.put(`/api/tasks/${task.id}`, {
      title: task.title,
      completed: !task.completed
    })
    loadData()
  }

  /* ================= DELETE ================= */

  async function deleteTask(taskId) {
    if (!window.confirm("Are you sure you want to delete this task?")) return;
    await api.delete(`/api/tasks/${taskId}`)
    loadData()
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="animate-spin rounded-full h-12 w-12 border-4 border-slate-200 border-t-indigo-600"></div>
    </div>
  )

  if (!project) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="text-center p-6 sm:p-8 bg-white rounded-2xl shadow-sm border border-slate-200 w-full max-w-md">
        <h2 className="text-xl sm:text-2xl font-bold text-slate-800 mb-2">Project not found</h2>
        <button onClick={() => navigate(-1)} className="text-indigo-600 font-medium hover:underline">Go Back</button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 py-6 px-4 sm:py-10 sm:px-6 selection:bg-indigo-100 selection:text-indigo-900">
      <div className="max-w-4xl mx-auto">

        {/* ===== TOP NAVIGATION ===== */}
        <button 
          onClick={() => navigate(-1)}
          className="group flex items-center text-sm font-semibold text-slate-500 hover:text-indigo-600 transition-colors mb-6 sm:mb-8"
        >
          <span className="mr-2 transform group-hover:-translate-x-1 transition-transform">←</span> 
          Back to Dashboard
        </button>

        {/* ===== HEADER ===== */}
        <div className="bg-white p-5 sm:p-8 rounded-2xl sm:rounded-3xl shadow-sm border border-slate-200 mb-6 sm:mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-5 sm:gap-6">
          
          <div className="flex-1 w-full min-w-0">
            <div className="flex items-center gap-3 mb-2 sm:mb-3">
               <span className={`px-2.5 py-1 text-[10px] uppercase rounded-full font-extrabold tracking-wider border
                  ${project.status === "ONGOING" ? "bg-amber-50 text-amber-600 border-amber-200" : "bg-emerald-50 text-emerald-600 border-emerald-200"}`}>
                {project.status}
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mb-4 truncate">{project.title}</h2>
            
            {/* Beautiful Progress Bar */}
            <div className="flex items-center gap-3 sm:gap-4 max-w-md w-full">
              <span className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider w-16 sm:w-20 shrink-0">Progress</span>
              <div className="flex-1 bg-slate-100 rounded-full h-2 sm:h-2.5 overflow-hidden">
                <div 
                  className="bg-indigo-600 h-full rounded-full transition-all duration-1000 ease-out"
                  style={{ width: `${completion}%` }}
                />
              </div>
              <span className="text-xs sm:text-sm font-black text-indigo-600 w-8 sm:w-10 text-right shrink-0">{completion}%</span>
            </div>
          </div>

          <button
            onClick={() => setShowModal(true)}
            className="w-full md:w-auto justify-center bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-3.5 sm:py-3 rounded-xl shadow-lg shadow-indigo-200 transition-all hover:-translate-y-0.5 flex items-center gap-2 whitespace-nowrap mt-2 md:mt-0"
          >
            <span>+ Create Task</span>
          </button>

        </div>

        {/* ===== TASK LIST ===== */}
        <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <h3 className="text-lg font-bold text-slate-800">Project Tasks</h3>
          <span className="text-xs sm:text-sm font-medium text-slate-500 bg-slate-200/50 px-3 py-1 rounded-lg w-fit">{tasks.length} Total</span>
        </div>

        <div className="space-y-3 sm:space-y-4">

          {tasks.length === 0 && (
            <div className="text-center py-12 sm:py-16 bg-white rounded-2xl sm:rounded-3xl border-2 border-slate-200 border-dashed px-4">
              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <span className="text-xl sm:text-2xl">📝</span>
              </div>
              <p className="font-medium text-base sm:text-lg text-slate-700">No tasks created yet</p>
              <p className="text-xs sm:text-sm mt-1 text-slate-500">Break down your project by adding the first task.</p>
            </div>
          )}

          {tasks.map(task => (
            <div
              key={task.id}
              className={`group bg-white p-4 sm:p-5 rounded-xl sm:rounded-2xl border transition-all duration-300 flex justify-between items-start sm:items-center gap-3 sm:gap-4
                ${task.completed ? "border-slate-200 bg-slate-50/50 opacity-80" : "border-slate-200 shadow-sm hover:shadow-md hover:border-indigo-200"}`}
            >
              <div
                onClick={() => toggleTask(task)}
                className="cursor-pointer flex-1 flex items-start gap-3 sm:gap-4 min-w-0"
              >
                {/* Custom Checkbox */}
                <div className={`mt-0.5 sm:mt-1 flex-shrink-0 w-5 h-5 sm:w-6 sm:h-6 rounded-md sm:rounded-lg border-2 flex items-center justify-center transition-all duration-200
                  ${task.completed ? "bg-indigo-500 border-indigo-500" : "border-slate-300 group-hover:border-indigo-400 bg-white"}`}
                >
                  {task.completed && (
                    <svg className="w-3 h-3 sm:w-4 sm:h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <p className={`font-bold text-base sm:text-lg mb-1 truncate transition-all duration-200 
                    ${task.completed ? "line-through text-slate-400" : "text-slate-800"}`}>
                    {task.title}
                  </p>
                  
                  <p className={`text-xs sm:text-sm mb-3 line-clamp-2 transition-colors
                    ${task.completed ? "text-slate-400" : "text-slate-500"}`}>
                    {task.description}
                  </p>
                  
                  {/* Developer Badge */}
                  <div className={`inline-flex items-center gap-1.5 sm:gap-2 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg text-[10px] sm:text-xs font-bold transition-colors
                    ${task.completed ? "bg-slate-200 text-slate-500" : "bg-indigo-50 text-indigo-700"}`}>
                    <div className={`w-4 h-4 sm:w-5 sm:h-5 rounded-full flex items-center justify-center text-[8px] sm:text-[10px] 
                      ${task.completed ? "bg-slate-300 text-slate-600" : "bg-indigo-200 text-indigo-800"}`}>
                      {task.developer?.name?.[0]?.toUpperCase() || "?"}
                    </div>
                    <span className="truncate max-w-[100px] sm:max-w-none">
                      {task.developer?.name || "Unassigned"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Delete Button (Icon only with background on mobile, full text on hover for desktop) */}
              <button
                onClick={(e) => { e.stopPropagation(); deleteTask(task.id); }}
                className="flex-shrink-0 p-2 sm:p-2 bg-red-50 md:bg-transparent text-red-500 font-semibold hover:text-red-700 hover:bg-red-100 sm:hover:bg-red-50 rounded-lg sm:rounded-xl transition-all flex items-center gap-2 opacity-100 md:opacity-0 group-hover:opacity-100 mt-1 sm:mt-0"
                aria-label="Delete Task"
              >
                <span className="hidden sm:inline text-sm">Delete</span>
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>

            </div>
          ))}

        </div>

        {/* ===== MODAL ===== */}
        <AddTaskModal
          show={showModal}
          onClose={() => setShowModal(false)}
          project={project}
          reload={loadData}
        />

      </div>
    </div>
  )
}

/* ================= ADD TASK MODAL ================= */

function AddTaskModal({ show, onClose, project, reload }) {
  const { id } = useParams()

  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [developerId, setDeveloperId] = useState("")

  if (!show) return null

  async function handleSubmit(e) {
    e.preventDefault()

    if (!title || !description || !developerId) {
      alert("Please fill out all fields before submitting.")
      return
    }

    await api.post("/api/tasks", {
      title,
      description,
      projectId: Number(id),
      developerId: Number(developerId)
    })

    setTitle("")
    setDescription("")
    setDeveloperId("")
    reload()
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex justify-center items-center z-50 p-4">

      <div className="bg-white w-full max-w-lg p-6 sm:p-8 rounded-2xl shadow-2xl transform transition-all max-h-[90vh] overflow-y-auto">

        <h3 className="text-xl sm:text-2xl font-bold mb-5 sm:mb-6 text-slate-800">
          Add New Task
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">

          <div>
            <label className="block text-[10px] sm:text-xs font-bold text-slate-500 mb-1.5 sm:mb-2 uppercase tracking-wider">Task Title</label>
            <input
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g. Design Homepage UI"
              className="w-full bg-slate-50 border border-slate-200 text-slate-900 p-3 sm:p-3.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all text-sm sm:text-base"
            />
          </div>

          <div>
            <label className="block text-[10px] sm:text-xs font-bold text-slate-500 mb-1.5 sm:mb-2 uppercase tracking-wider">Description</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Provide details about what needs to be done..."
              rows="3"
              className="w-full bg-slate-50 border border-slate-200 text-slate-900 p-3 sm:p-3.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all resize-none text-sm sm:text-base"
            />
          </div>

          <div>
            <label className="block text-[10px] sm:text-xs font-bold text-slate-500 mb-1.5 sm:mb-2 uppercase tracking-wider">Assign To</label>
            <select
              value={developerId}
              onChange={e => setDeveloperId(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 text-slate-900 p-3 sm:p-3.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all appearance-none cursor-pointer text-sm sm:text-base"
            >
              <option value="">Select a Developer...</option>
              {project?.developers?.map(dev => (
                <option key={dev.id} value={dev.id}>
                  {dev.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 sm:gap-3 mt-6 sm:mt-8 pt-5 sm:pt-6 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto px-5 py-3 sm:py-2.5 text-slate-600 font-medium rounded-xl hover:bg-slate-100 transition"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="w-full sm:w-auto px-5 py-3 sm:py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl shadow-lg shadow-indigo-200 transition"
            >
              Create Task
            </button>
          </div>

        </form>

      </div>

    </div>
  )
}