import { useEffect, useState, useCallback } from "react"
import api from "../services/Api"

// Icons
const FolderIcon = () => <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" /></svg>;
const PlusIcon = () => <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" /></svg>;
const TrashIcon = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>;

export default function DeveloperDashboard() {
  /* ================= LOGIC (UNCHANGED) ================= */
  const [profile, setProfile] = useState(null)
  const [projects, setProjects] = useState([])
  const [activeProject, setActiveProject] = useState(null)

  // Per-project task cache: { [projectId]: { tasks, completion } }
  const [projectData, setProjectData] = useState({})

  const [title, setTitle] = useState("")
  const [desc, setDesc] = useState("")
  const [adding, setAdding] = useState(false)

  const [loading, setLoading] = useState(true)
  const [taskLoading, setTaskLoading] = useState(false)
  const [ongoing, setOngoing] = useState(0)
  const [completed, setCompleted] = useState(0)

  /* ── initial load ── */
  useEffect(() => {
    async function loadData() {
      try {
        const profileRes = await api.get("/api/developer/profile")
        const projectRes = await api.get("/api/projects/developer")
        setProfile(profileRes.data)
        setProjects(projectRes.data)
        calculateStats(projectRes.data)
      } catch (err) { console.log("Load Error:", err) }
      setLoading(false)
    }
    loadData()
  }, [])

  /* ── fetch tasks + completion for a project ── */
  const fetchProjectData = useCallback(async (project) => {
    try {
      setTaskLoading(true)
      setActiveProject(project)
      const taskRes = await api.get(`/api/tasks/project/${project.id}`)
      setTasks(taskRes.data || [])
      calculateCompletion(taskRes.data || [])
    } catch (err) { console.log("Task Load Error:", err) }
    setTaskLoading(false)
  }

  function calculateCompletion(taskList) {
    if (taskList.length === 0) { setCompletion(0); return }
    const done = taskList.filter(t => t.completed).length
    const percent = Math.round((done / taskList.length) * 100)
    setCompletion(percent)
  }

  async function addTask(e) {
    e.preventDefault()
    if (!newTitle || !newDesc) return
    try {
      await api.post("/api/tasks", {
        title: newTitle,
        description: newDesc,
        projectId: activeProject.id,
        developerId: profile.id
      })
      setNewTitle(""); setNewDesc(""); openProject(activeProject)
    } catch (err) { console.log("Add Task Error:", err) }
  }

  /* ── toggle task (checkbox) ── */
  async function toggleTask(task) {
    try {
      await api.put(`/api/tasks/${task.id}`, { title: task.title, completed: !task.completed })
      openProject(activeProject)
    } catch (err) { console.log("Update Error:", err) }
  }

  /* ── delete task ── */
  async function deleteTask(id) {
    if (!window.confirm("Delete this task?")) return
    try {
      await api.delete(`/api/tasks/${id}`)
      openProject(activeProject)
    } catch (err) { console.log("Delete Error:", err) }
  }

  /* ================= UI RENDER ================= */

  /* ── derived data ── */
  const currentPD = activeProject ? projectData[activeProject.id] : null
  const tasks = currentPD?.tasks || []
  const completion = currentPD?.completion ?? 0

  /* ── render ── */
  if (loading) {
    return (
      <>
        <style>{STYLE}</style>
        <div className="loading-screen">
          <div className="spinner" />
          <p>Loading your workspace…</p>
        </div>
      </>
    )
  }

  return (
    <div className="flex min-h-screen bg-[#0F172A] text-slate-200 font-sans selection:bg-purple-500/30">
      
      {/* ========== SIDEBAR (DARK THEME) ========== */}
      <div className="w-80 bg-[#1E293B] border-r border-white/5 flex flex-col shadow-2xl">
        <div className="p-8">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-gradient-to-tr from-purple-600 to-indigo-500 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/20">
              <span className="text-white font-black text-xl">D</span>
            </div>
          </div>
          
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-4 ml-1">Projects Library</p>
          <ul className="space-y-2">
            {projects.map(p => (
              <li
                key={p.id}
                onClick={() => openProject(p)}
                className={`
                  flex items-center px-4 py-3.5 rounded-xl cursor-pointer transition-all duration-300 group
                  ${activeProject?.id === p.id
                    ? "bg-purple-600 text-white shadow-lg shadow-purple-900/40 translate-x-1"
                    : "text-slate-400 hover:bg-white/5 hover:text-slate-100"}
                `}
              >
                <FolderIcon />
                <span className="truncate font-semibold">{p.title}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* ========== MAIN CONTENT AREA ========== */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        
        {/* TOP NAVIGATION */}
        <header className="h-20 bg-[#0F172A]/80 backdrop-blur-xl border-b border-white/5 flex justify-between items-center px-10 sticky top-0 z-10">
          <div>
            <h1 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">System Console</h1>
            <p className="text-lg font-bold text-white">{activeProject ? activeProject.title : "Initialization Overlook"}</p>
          </div>

          {/* Stats */}
          {profile && (
            <div className="flex items-center gap-4 bg-white/5 p-1.5 rounded-full border border-white/10 ring-1 ring-white/5">
              <div className="w-9 h-9 bg-slate-800 border border-white/10 text-purple-400 rounded-full flex items-center justify-center font-black shadow-inner">
                {profile.name[0]}
              </div>
              <span className="text-sm font-bold text-slate-300 mr-4">{profile.name}</span>
            </div>
          )}
        </header>

        {/* MAIN SCROLLABLE BODY */}
        <main className="p-10 overflow-y-auto space-y-10 custom-scrollbar">
          
          {/* STATS STRIP */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCard label="Dev Auth" value={profile.email} theme="neutral" />
            <StatCard label="Active Sprint" value={ongoing} theme="purple" />
            <StatCard label="Finalized" value={completed} theme="green" />
          </div>

          {!activeProject ? (
            <div className="flex flex-col items-center justify-center py-32 border-2 border-dashed border-white/5 rounded-[2rem] bg-white/[0.02]">
              <div className="w-20 h-20 bg-purple-500/10 text-purple-500 rounded-3xl flex items-center justify-center mb-6 animate-pulse">
                 <FolderIcon />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">No Project Mounted</h3>
              <p className="text-slate-500 max-w-xs text-center">Select a repository from the left panel to begin managing tasks.</p>
            </div>
          )}

          {/* Project workspace */}
          {activeProject && (
            <>
              {/* Project header */}
              <div className="proj-card">
                <div>
                  <h3>{activeProject.title}</h3>
                  <p>{activeProject.description || "No description provided."}</p>
                </div>
                <span className={`status-badge ${activeProject.status}`}>
                  {activeProject.status}
                </span>
              </div>

              {/* Progress */}
              <div className="progress-card">
                <div className="progress-header">
                  <span>COMPLETION</span>
                  <strong>{completion}%</strong>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${completion}%` }} />
                </div>
              </div>

              {/* Workspace */}
              <div className="workspace">

                {/* Add Task */}
                <form className="form-card" onSubmit={addTask}>
                  <h4>
                    Add Task
                    <span className="badge">+ NEW</span>
                  </h4>

                  <div className="field-group">
                    <label>Title</label>
                    <input
                      className="f"
                      placeholder="e.g. Setup authentication"
                      value={title}
                      onChange={e => setTitle(e.target.value)}
                    />
                  </div>

                  <div className="field-group">
                    <label>Description</label>
                    <textarea
                      className="f"
                      rows={4}
                      placeholder="Describe what needs to be done…"
                      value={desc}
                      onChange={e => setDesc(e.target.value)}
                    />
                  </div>

                  <button className="btn-primary" type="submit" disabled={adding}>
                    {adding ? "Adding…" : "Add Task"}
                  </button>
                </form>

                {/* Task List */}
                <div className="task-list-card">
                  <div className="task-list-header">
                    <h4>Tasks</h4>
                    <span className="task-count">{tasks.length}</span>
                  </div>

                    <div className="p-4">
                      {taskLoading ? (
                        <div className="p-12 text-center text-slate-600 font-mono text-sm animate-pulse">RELOADING_TASK_ARRAY...</div>
                      ) : tasks.length === 0 ? (
                        <div className="p-16 text-center text-slate-500">
                          <p className="text-sm font-medium italic">Empty stack. No current objectives.</p>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {tasks.map(task => (
                            <div key={task.id} className="group flex items-center justify-between p-5 hover:bg-white/[0.03] transition-all rounded-2xl border border-transparent hover:border-white/5">
                              <div className="flex items-center gap-5">
                                <button 
                                  onClick={() => toggleTask(task)}
                                  className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${
                                    task.completed 
                                    ? "bg-purple-600 border-purple-600 shadow-[0_0_10px_rgba(168,85,247,0.4)]" 
                                    : "border-slate-700 hover:border-purple-500"
                                  }`}
                                >
                                  {task.completed && <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/></svg>}
                                </button>
                                <div>
                                  <p className={`font-bold tracking-tight transition-all ${task.completed ? "text-slate-600 line-through" : "text-slate-200"}`}>
                                    {task.title}
                                  </p>
                                  {task.description && !task.completed && (
                                    <p className="text-xs text-slate-500 mt-1 font-medium">{task.description}</p>
                                  )}
                                </div>
                              </div>
                              <button
                                onClick={() => deleteTask(task.id)}
                                className="p-2.5 text-slate-600 hover:text-red-500 hover:bg-red-500/10 rounded-xl opacity-0 group-hover:opacity-100 transition-all"
                              >
                                <TrashIcon />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

              </div>
            </>
          )}

        </main>
      </div>
    </div>
  )
}

/* ================= THEMED STAT CARD ================= */
function StatCard({ label, value, theme }) {
  const configs = {
    neutral: "text-slate-400 border-white/5 bg-[#1E293B]",
    purple: "text-purple-400 border-purple-500/20 bg-purple-500/5",
    green: "text-emerald-400 border-emerald-500/20 bg-emerald-500/5"
  }

  return (
    <div className={`p-6 rounded-[1.5rem] border shadow-xl transition-all hover:scale-[1.02] ${configs[theme]}`}>
      <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60 mb-2">{label}</p>
      <h3 className="text-xl font-black truncate text-white">
        {value}
      </h3>
    </div>
  )
}