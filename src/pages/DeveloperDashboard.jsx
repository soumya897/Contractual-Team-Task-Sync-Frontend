import { useEffect, useState } from "react"
import api from "../services/Api"

// Icons
const FolderIcon = () => <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" /></svg>;
const PlusIcon = () => <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" /></svg>;
const TrashIcon = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>;
const EditIcon = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>;
const BellIcon = () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>;
const CheckIcon = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>;

export default function DeveloperDashboard() {
  /* ================= LOGIC ================= */
  const [profile, setProfile] = useState(null)
  const [projects, setProjects] = useState([])
  const [activeProject, setActiveProject] = useState(null)
  const [tasks, setTasks] = useState([])
  const [completion, setCompletion] = useState(0)
  const [newTitle, setNewTitle] = useState("")
  const [newDesc, setNewDesc] = useState("")
  const [loading, setLoading] = useState(true)
  const [taskLoading, setTaskLoading] = useState(false)
  const [ongoing, setOngoing] = useState(0)
  const [completed, setCompleted] = useState(0)

  // Edit / Error / Success States
  const [editingTask, setEditingTask] = useState(null)
  const [errorMessage, setErrorMessage] = useState("")
  const [successMessage, setSuccessMessage] = useState("")

  // Profile & Notification States
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const [showProfileModal, setShowProfileModal] = useState(false)
  const [showPasswordModal, setShowPasswordModal] = useState(false) // NEW State
  const [showNotifications, setShowNotifications] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    try {
      setLoading(true)
      const profileRes = await api.get("/api/developer/profile")
      const projectRes = await api.get("/api/projects/developer")
      
      setProfile(profileRes.data)
      setProjects(projectRes.data)
      calculateStats(projectRes.data)

      await fetchNotifications()

    } catch (err) { console.log("Load Error:", err) }
    setLoading(false)
  }

  // --- Notification Logic ---
  async function fetchNotifications() {
    try {
      const notifRes = await api.get("/api/developer/notifications")
      const countRes = await api.get("/api/developer/notifications/unread-count")
      setNotifications(notifRes.data || [])
      setUnreadCount(countRes.data || 0)
    } catch (err) { console.log("Notification Fetch Error:", err) }
  }

  async function handleNotificationClick() {
    const willShow = !showNotifications;
    setShowNotifications(willShow);
    setShowProfileMenu(false);

    if (willShow && unreadCount > 0) {
      setUnreadCount(0);
      setNotifications(prev => prev.map(notif => ({ ...notif, read: true })));

      const unreadNotifs = notifications.filter(n => !n.read);
      for (const notif of unreadNotifs) {
        try {
          await api.put(`/api/developer/notifications/${notif.id}/read`);
        } catch (err) {
          console.log("Error marking notification as read:", err);
        }
      }
    }
  }

  function handleLogout() {
    localStorage.removeItem("token")
    window.location.href = "/"
  }

  function calculateStats(projectList) {
    let ongoingCount = 0; let completedCount = 0
    projectList.forEach(p => {
      if (p.status === "completed") completedCount++
      else ongoingCount++
    })
    setOngoing(ongoingCount); setCompleted(completedCount)
  }

  async function openProject(project) {
    try {
      setTaskLoading(true)
      setActiveProject(project)
      
      const taskRes = await api.get(`/api/tasks/project/${project.id}`)
      setTasks(taskRes.data || [])

      try {
        const compRes = await api.get(`/api/tasks/project/${project.id}/completion`)
        setCompletion(compRes.data || 0)
      } catch (compErr) {
        console.log("Completion Fetch Error:", compErr)
        setCompletion(0)
      }

    } catch (err) { console.log("Task Load Error:", err) }
    setTaskLoading(false)
  }

  /* ================= API LOGIC & ERROR HANDLING ================= */

  function getDeveloperId() {
    if (profile?.id) return profile.id;
    if (profile?.developerId) return profile.developerId;
    if (activeProject?.developers && profile?.email) {
      const matchedDev = activeProject.developers.find(d => d.email === profile.email);
      if (matchedDev?.id) return matchedDev.id;
    }
    return null;
  }

  function showErrorToast(msg) {
    setErrorMessage(msg);
    setTimeout(() => { setErrorMessage(""); }, 3500);
  }

  function showSuccessToast(msg) {
    setSuccessMessage(msg);
    setTimeout(() => { setSuccessMessage(""); }, 3500);
  }

  function handleTaskError(err) {
    if (err.response?.status === 403) {
      showErrorToast("You can only update and delete your own tasks.");
    } else {
      const msg = err.response?.data?.message || err.response?.data || "An error occurred.";
      showErrorToast(typeof msg === 'string' ? msg : "An error occurred.");
    }
  }

  async function addTask(e) {
    e.preventDefault()
    if (!newTitle || !newDesc || !activeProject) return
    const devId = getDeveloperId();
    if (!devId) return;

    try {
      await api.post("/api/tasks", {
        title: newTitle, description: newDesc,
        projectId: Number(activeProject.id), developerId: Number(devId)
      })
      setNewTitle(""); setNewDesc(""); openProject(activeProject)
      showSuccessToast("Task created successfully!");
    } catch (err) { handleTaskError(err) }
  }

  async function toggleTask(task) {
    const devId = getDeveloperId();
    try {
      await api.put(`/api/tasks/${task.id}`, { 
        title: task.title, description: task.description, completed: !task.completed,
        projectId: Number(activeProject.id), developerId: Number(devId)
      })
      openProject(activeProject)
      showSuccessToast("Task status updated!");
    } catch (err) { handleTaskError(err) }
  }

  async function updateTaskDetails(taskId, updatedTitle, updatedDesc, isCompleted) {
    const devId = getDeveloperId();
    try {
      await api.put(`/api/tasks/${taskId}`, { 
        title: updatedTitle, description: updatedDesc, completed: isCompleted,
        projectId: Number(activeProject.id), developerId: Number(devId)
      })
      setEditingTask(null)
      openProject(activeProject)
      showSuccessToast("Task updated successfully!");
    } catch (err) { 
      setEditingTask(null)
      handleTaskError(err) 
    }
  }

  async function deleteTask(id) {
    if (!window.confirm("Delete this task?")) return
    const devId = getDeveloperId();
    try {
      await api.delete(`/api/tasks/${id}`, {
        data: { projectId: Number(activeProject.id), developerId: Number(devId) }
      })
      openProject(activeProject)
      showSuccessToast("Task deleted successfully!");
    } catch (err) { handleTaskError(err) }
  }

  /* ================= UI RENDER ================= */

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0F172A]">
        <div className="flex flex-col items-center">
          <div className="w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-slate-400 font-medium tracking-widest uppercase text-xs">Synchronizing...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-[#0F172A] text-slate-200 font-sans selection:bg-purple-500/30 relative">
      
      {/* SUCCESS TOAST NOTIFICATION */}
      {successMessage && (
        <div className="fixed bottom-10 left-1/2 transform -translate-x-1/2 bg-emerald-500/10 border border-emerald-500/30 px-6 py-3 rounded-2xl shadow-[0_10px_40px_rgba(16,185,129,0.15)] backdrop-blur-md z-50 animate-in slide-in-from-bottom-5 fade-in duration-300">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center font-bold">
              <CheckIcon />
            </div>
            <p className="text-emerald-400 font-bold text-sm tracking-wide">{successMessage}</p>
          </div>
        </div>
      )}

      {/* ERROR TOAST NOTIFICATION */}
      {errorMessage && (
        <div className="fixed bottom-10 left-1/2 transform -translate-x-1/2 bg-red-500/10 border border-red-500/30 px-6 py-3 rounded-2xl shadow-[0_10px_40px_rgba(239,68,68,0.2)] backdrop-blur-md z-50 animate-in slide-in-from-bottom-5 fade-in duration-300">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 bg-red-500/20 text-red-400 rounded-full flex items-center justify-center font-bold">!</div>
            <p className="text-red-400 font-bold text-sm tracking-wide">{errorMessage}</p>
          </div>
        </div>
      )}

      {/* ========== SIDEBAR (DARK THEME) ========== */}
      <div className="w-80 bg-[#1E293B] border-r border-white/5 flex flex-col shadow-2xl z-20">
        <div className="p-8">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-gradient-to-tr from-purple-600 to-indigo-500 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/20">
              <span className="text-white font-black text-xl">D</span>
            </div>
            <h2 className="text-xl font-black text-white tracking-tighter italic">CORE_DEV</h2>
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
        <header className="h-20 bg-[#0F172A]/80 backdrop-blur-xl border-b border-white/5 flex justify-between items-center px-10 sticky top-0 z-30">
          <div>
            <h1 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">System Console</h1>
            <p className="text-lg font-bold text-white">{activeProject ? activeProject.title : "Initialization Overlook"}</p>
          </div>
          
          {profile && (
            <div className="flex items-center gap-6">
              
              {/* NOTIFICATION BELL */}
              <div className="relative">
                <button 
                  onClick={handleNotificationClick}
                  className="p-2 text-slate-400 hover:text-white transition-colors relative focus:outline-none"
                >
                  <BellIcon />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-black text-white ring-2 ring-[#0F172A]">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {/* NOTIFICATION DROPDOWN */}
                {showNotifications && (
                  <div className="absolute right-0 mt-4 w-80 sm:w-96 bg-[#1E293B] border border-white/5 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                    <div className="px-6 py-4 border-b border-white/5 bg-white/[0.02] flex justify-between items-center">
                      <h3 className="font-black text-slate-300 tracking-tight">SYSTEM_ALERTS</h3>
                      <span className="text-[10px] bg-purple-500/20 text-purple-400 px-2 py-1 rounded-full font-bold border border-purple-500/30">0 UNREAD</span>
                    </div>
                    <div className="max-h-[22rem] overflow-y-auto custom-scrollbar p-3">
                      {notifications.length === 0 ? (
                        <div className="p-8 text-center text-slate-500 text-sm italic">No recent alerts.</div>
                      ) : (
                        notifications.map(notif => (
                          <div key={notif.id} className="p-4 mb-2 rounded-xl border border-transparent opacity-70 bg-white/[0.02] transition-all">
                            <p className="text-sm font-medium text-slate-200">{notif.message || notif.title}</p> 
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* PROFILE DROPDOWN */}
              <div className="relative">
                <button 
                  onClick={() => { setShowProfileMenu(!showProfileMenu); setShowNotifications(false); }}
                  className="flex items-center gap-4 bg-white/5 p-1.5 rounded-full border border-white/10 ring-1 ring-white/5 hover:bg-white/10 transition-all focus:outline-none"
                >
                  <div className="w-9 h-9 bg-slate-800 border border-white/10 text-purple-400 rounded-full flex items-center justify-center font-black shadow-inner">
                    {profile.name[0]}
                  </div>
                  <span className="text-sm font-bold text-slate-300 mr-4">{profile.name}</span>
                </button>

                {showProfileMenu && (
                  <div className="absolute right-0 mt-4 w-56 bg-[#1E293B] border border-white/5 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                    <div className="px-5 py-4 border-b border-white/5 bg-white/[0.02]">
                      <p className="text-sm font-bold text-white truncate">{profile.name}</p>
                      <p className="text-xs text-slate-400 truncate mt-0.5">{profile.email}</p>
                    </div>
                    <div className="p-2 flex flex-col gap-1">
                      <button 
                        onClick={() => { setShowProfileMenu(false); setShowProfileModal(true); }} 
                        className="w-full text-left px-4 py-2.5 text-sm text-slate-300 hover:text-purple-400 hover:bg-white/5 rounded-xl font-bold transition-all"
                      >
                        Update Profile
                      </button>
                      <button 
                        onClick={() => { setShowProfileMenu(false); setShowPasswordModal(true); }} 
                        className="w-full text-left px-4 py-2.5 text-sm text-slate-300 hover:text-purple-400 hover:bg-white/5 rounded-xl font-bold transition-all"
                      >
                        Change Password
                      </button>
                      <div className="h-px bg-white/5 my-1"></div>
                      <button 
                        onClick={handleLogout} 
                        className="w-full text-left px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 rounded-xl font-bold transition-all"
                      >
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>

            </div>
          )}
        </header>

        {/* MAIN SCROLLABLE BODY */}
        <main className="p-10 overflow-y-auto space-y-10 custom-scrollbar z-0" onClick={() => {setShowProfileMenu(false); setShowNotifications(false);}}>
          
          {/* STATS STRIP */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCard label="Dev Auth" value={profile?.email || "Loading..."} theme="neutral" />
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
          ) : (
            <div className="space-y-8 animate-in fade-in zoom-in-95 duration-500">
              
              {/* PROGRESS ENGINE */}
              <div className="bg-[#1E293B] p-8 rounded-[2rem] border border-white/5 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                    <span className="text-8xl font-black">{completion}%</span>
                </div>
                <div className="relative z-10 max-w-2xl">
                    <h2 className="text-3xl font-black text-white mb-3">Deployment Status</h2>
                    <p className="text-slate-400 mb-8 leading-relaxed italic">"{activeProject.description}"</p>
                    
                    <div className="space-y-3">
                        <div className="flex justify-between text-xs font-black uppercase tracking-tighter">
                            <span className="text-purple-400">Completion Velocity</span>
                            <span className="text-slate-400">{completion}%</span>
                        </div>
                        <div className="w-full bg-slate-900 rounded-full h-4 p-1 ring-1 ring-white/10">
                            <div 
                            className="bg-gradient-to-r from-indigo-600 via-purple-500 to-fuchsia-400 h-full rounded-full transition-all duration-1000 shadow-[0_0_20px_rgba(168,85,247,0.4)]"
                            style={{ width: `${completion}%` }}
                            />
                        </div>
                    </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                {/* TASK CREATION MODAL-LIKE AREA */}
                <div className="lg:col-span-5">
                  <form onSubmit={addTask} className="bg-[#1E293B] p-8 rounded-[2rem] border border-white/5 sticky top-28 shadow-xl">
                    <h3 className="text-lg font-black text-white mb-6 flex items-center">
                      <PlusIcon /> NEW_TASK
                    </h3>
                    <div className="space-y-5">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">Task Identifier</label>
                        <input
                          placeholder="Refactor auth module..."
                          className="w-full bg-[#0F172A] border border-white/5 p-4 rounded-xl text-white placeholder:text-slate-600 focus:ring-2 focus:ring-purple-500 outline-none transition-all shadow-inner"
                          value={newTitle}
                          onChange={e => setNewTitle(e.target.value)}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">Technical Specs</label>
                        <textarea
                          placeholder="Detail the parameters..."
                          rows="4"
                          className="w-full bg-[#0F172A] border border-white/5 p-4 rounded-xl text-white placeholder:text-slate-600 focus:ring-2 focus:ring-purple-500 outline-none transition-all shadow-inner"
                          value={newDesc}
                          onChange={e => setNewDesc(e.target.value)}
                        />
                      </div>
                      <button className="w-full bg-purple-600 hover:bg-purple-500 text-white font-black py-4 rounded-xl shadow-lg shadow-purple-900/20 transition-all hover:-translate-y-1 active:scale-95">
                        PUSH TO STACK
                      </button>
                    </div>
                  </form>
                </div>

                {/* CHECKLIST TERMINAL */}
                <div className="lg:col-span-7">
                  <div className="bg-[#1E293B] rounded-[2rem] border border-white/5 shadow-xl overflow-hidden">
                    <div className="px-8 py-6 border-b border-white/5 bg-white/[0.02] flex justify-between items-center">
                       <h3 className="font-black text-slate-300 tracking-tight">OBJECTIVE_LIST</h3>
                       <span className="text-[10px] bg-purple-500/20 text-purple-400 px-3 py-1 rounded-full font-bold border border-purple-500/30">{tasks.length} ITEMS</span>
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
                                  type="button"
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

                              {/* Action Buttons: Edit & Delete */}
                              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all">
                                <button
                                  type="button"
                                  onClick={() => setEditingTask(task)}
                                  className="p-2.5 text-slate-600 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-xl transition-all"
                                >
                                  <EditIcon />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => deleteTask(task.id)}
                                  className="p-2.5 text-slate-600 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all"
                                >
                                  <TrashIcon />
                                </button>
                              </div>

                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* ========== EDIT TASK MODAL ========== */}
      <EditTaskModal 
        show={!!editingTask} 
        task={editingTask} 
        onClose={() => setEditingTask(null)} 
        onSave={updateTaskDetails} 
      />

      {/* ========== UPDATE PROFILE MODAL ========== */}
      <UpdateProfileModal 
        show={showProfileModal} 
        profile={profile} 
        onClose={() => setShowProfileModal(false)} 
        reload={loadData}
        onError={showErrorToast}
        onSuccess={showSuccessToast}
      />

      {/* ========== CHANGE PASSWORD MODAL ========== */}
      <ChangePasswordModal 
        show={showPasswordModal} 
        onClose={() => setShowPasswordModal(false)} 
        onError={showErrorToast}
        onSuccess={showSuccessToast}
      />

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

/* ================= EDIT TASK MODAL ================= */
function EditTaskModal({ show, task, onClose, onSave }) {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")

  useEffect(() => {
    if (task) {
      setTitle(task.title || "")
      setDescription(task.description || "")
    }
  }, [task])

  if (!show) return null

  function handleSubmit(e) {
    e.preventDefault()
    if (!title || !description) return;
    onSave(task.id, title, description, task.completed)
  }

  return (
    <div className="fixed inset-0 bg-[#0F172A]/80 backdrop-blur-sm flex justify-center items-center z-50 p-4 animate-in fade-in duration-200">
      <div className="bg-[#1E293B] w-full max-w-md p-8 rounded-[2rem] border border-white/5 shadow-2xl animate-in zoom-in-95 duration-200">
        
        <h3 className="text-xl font-black text-white mb-6 flex items-center">
          <EditIcon /> <span className="ml-2">EDIT_TASK</span>
        </h3>
        
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">Task Identifier</label>
            <input
              className="w-full bg-[#0F172A] border border-white/5 p-4 rounded-xl text-white placeholder:text-slate-600 focus:ring-2 focus:ring-indigo-500 outline-none transition-all shadow-inner"
              value={title}
              onChange={e => setTitle(e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">Technical Specs</label>
            <textarea
              rows="4"
              className="w-full bg-[#0F172A] border border-white/5 p-4 rounded-xl text-white placeholder:text-slate-600 focus:ring-2 focus:ring-indigo-500 outline-none transition-all shadow-inner"
              value={description}
              onChange={e => setDescription(e.target.value)}
              required
            />
          </div>
          
          <div className="flex gap-3 pt-2">
            <button 
              type="button" 
              onClick={onClose}
              className="flex-1 bg-white/5 hover:bg-white/10 text-white font-bold py-4 rounded-xl transition-all"
            >
              CANCEL
            </button>
            <button 
              type="submit"
              className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white font-black py-4 rounded-xl shadow-lg shadow-indigo-900/20 transition-all hover:-translate-y-1 active:scale-95"
            >
              SAVE_CHANGES
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

/* ================= UPDATE PROFILE MODAL ================= */
function UpdateProfileModal({ show, profile, onClose, reload, onError, onSuccess }) {
  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")

  useEffect(() => {
    if (profile) {
      setName(profile.name || "")
      setPhone(profile.ph || profile.phone || "") 
    }
  }, [profile])

  if (!show) return null

  async function handleSubmit(e) {
    e.preventDefault()
    try {
      await api.put("/api/profile/update", { 
        id: profile?.id,
        email: profile?.email,
        name: name, 
        phone: phone, 
        ph: phone 
      })
      onSuccess("Profile credentials updated.")
      reload()
      onClose()
    } catch (err) {
      onClose()
      const msg = err.response?.data?.message || err.response?.data || "Failed to update profile."
      onError(typeof msg === 'string' ? msg : "An unexpected error occurred.")
    }
  }

  return (
    <div className="fixed inset-0 bg-[#0F172A]/80 backdrop-blur-sm flex justify-center items-center z-50 p-4 animate-in fade-in duration-200">
      <div className="bg-[#1E293B] w-full max-w-sm p-8 rounded-[2rem] border border-white/5 shadow-2xl animate-in zoom-in-95 duration-200">
        
        <h3 className="text-xl font-black text-white mb-6">
          UPDATE_PROFILE
        </h3>
        
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">Developer Name</label>
            <input
              className="w-full bg-[#0F172A] border border-white/5 p-4 rounded-xl text-white placeholder:text-slate-600 focus:ring-2 focus:ring-purple-500 outline-none transition-all shadow-inner"
              value={name}
              onChange={e => setName(e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">Contact Number</label>
            <input
              type="tel"
              className="w-full bg-[#0F172A] border border-white/5 p-4 rounded-xl text-white placeholder:text-slate-600 focus:ring-2 focus:ring-purple-500 outline-none transition-all shadow-inner"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              required
            />
          </div>
          
          <div className="flex gap-3 pt-2">
            <button 
              type="button" 
              onClick={onClose}
              className="flex-1 bg-white/5 hover:bg-white/10 text-white font-bold py-4 rounded-xl transition-all"
            >
              CANCEL
            </button>
            <button 
              type="submit"
              className="flex-1 bg-purple-600 hover:bg-purple-500 text-white font-black py-4 rounded-xl shadow-lg shadow-purple-900/20 transition-all hover:-translate-y-1 active:scale-95"
            >
              CONFIRM
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

/* ================= CHANGE PASSWORD MODAL ================= */
function ChangePasswordModal({ show, onClose, onError, onSuccess }) {
  const [oldPassword, setOldPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")

  // Reset form when modal closes/opens
  useEffect(() => {
    if (show) {
      setOldPassword("")
      setNewPassword("")
    }
  }, [show])

  if (!show) return null

  async function handleSubmit(e) {
    e.preventDefault()
    try {
      const res = await api.put("/api/profile/change-password", { 
        oldPassword: oldPassword,
        newPassword: newPassword 
      })
      onSuccess(res.data || "Password changed successfully!")
      onClose()
    } catch (err) {
      onClose()
      const msg = err.response?.data?.message || err.response?.data || "Failed to update password."
      onError(typeof msg === 'string' ? msg : "Incorrect old password or system error.")
    }
  }

  return (
    <div className="fixed inset-0 bg-[#0F172A]/80 backdrop-blur-sm flex justify-center items-center z-50 p-4 animate-in fade-in duration-200">
      <div className="bg-[#1E293B] w-full max-w-sm p-8 rounded-[2rem] border border-white/5 shadow-2xl animate-in zoom-in-95 duration-200">
        
        <h3 className="text-xl font-black text-white mb-6">
          UPDATE_SECURITY
        </h3>
        
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">Current Password</label>
            <input
              type="password"
              className="w-full bg-[#0F172A] border border-white/5 p-4 rounded-xl text-white placeholder:text-slate-600 focus:ring-2 focus:ring-red-500 outline-none transition-all shadow-inner"
              value={oldPassword}
              onChange={e => setOldPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>
          
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">New Password</label>
            <input
              type="password"
              className="w-full bg-[#0F172A] border border-white/5 p-4 rounded-xl text-white placeholder:text-slate-600 focus:ring-2 focus:ring-red-500 outline-none transition-all shadow-inner"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>
          
          <div className="flex gap-3 pt-2">
            <button 
              type="button" 
              onClick={onClose}
              className="flex-1 bg-white/5 hover:bg-white/10 text-white font-bold py-4 rounded-xl transition-all"
            >
              CANCEL
            </button>
            <button 
              type="submit"
              className="flex-1 bg-red-600 hover:bg-red-500 text-white font-black py-4 rounded-xl shadow-lg shadow-red-900/20 transition-all hover:-translate-y-1 active:scale-95"
            >
              CONFIRM
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}