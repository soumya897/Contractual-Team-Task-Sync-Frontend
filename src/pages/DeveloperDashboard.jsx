import { useEffect, useState } from "react"
import api from "../services/Api"

// Icons
const FolderIcon = () => <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" /></svg>;
const PlusIcon = () => <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" /></svg>;
const TrashIcon = () => <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>;
const EditIcon = () => <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>;
const BellIcon = () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>;
const CheckIcon = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>;
const MenuIcon = () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" /></svg>;
const CloseIcon = () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>;

// NEW: Sidebar Account Icons
const UserIcon = () => <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>;
const KeyIcon = () => <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4v-3.252a1 1 0 01.293-.707l8.178-8.178A6 6 0 1121 9z" /></svg>;
const LogOutIcon = () => <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>;

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
  const [showPasswordModal, setShowPasswordModal] = useState(false) 
  const [showNotifications, setShowNotifications] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)

  // Mobile Sidebar State
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

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

    if (willShow) {
      try {
        const notifRes = await api.get("/api/developer/notifications");
        const freshNotifs = notifRes.data || [];
        
        const trulyUnread = freshNotifs.filter(n => {
          const local = notifications.find(localNotif => localNotif.id === n.id);
          return !n.read && (!local || !local.read);
        });
        
        setNotifications(prevNotifs => {
          const prevMap = new Map(prevNotifs.map(n => [n.id, n]));
          return freshNotifs.map(notif => {
            return {
              ...notif,
              read: true
            };
          });
        });

        if (trulyUnread.length > 0) {
          setUnreadCount(0);
          for (const notif of trulyUnread) {
            try {
              await api.put(`/api/developer/notifications/${notif.id}/read`);
            } catch (err) {
              console.log("Error marking notification as read:", err);
            }
          }
        }
      } catch (err) {
        console.log("Error refreshing notifications:", err);
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
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="flex flex-col items-center">
          <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-500 font-medium tracking-widest uppercase text-xs">Synchronizing...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-gray-50 text-gray-900 font-sans selection:bg-indigo-500/30 relative overflow-hidden md:overflow-auto">
      
      {/* SUCCESS TOAST NOTIFICATION */}
      {successMessage && (
        <div className="fixed bottom-10 left-1/2 transform -translate-x-1/2 bg-white border border-green-200 px-6 py-3 rounded-lg shadow-lg z-50 animate-in slide-in-from-bottom-5 fade-in duration-300 w-[90%] md:w-auto">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center font-bold shrink-0">
              <CheckIcon />
            </div>
            <p className="text-gray-800 font-bold text-sm tracking-wide">{successMessage}</p>
          </div>
        </div>
      )}

      {/* ERROR TOAST NOTIFICATION */}
      {errorMessage && (
        <div className="fixed bottom-10 left-1/2 transform -translate-x-1/2 bg-white border border-red-200 px-6 py-3 rounded-lg shadow-lg z-50 animate-in slide-in-from-bottom-5 fade-in duration-300 w-[90%] md:w-auto">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 bg-red-100 text-red-600 rounded-full flex items-center justify-center font-bold shrink-0">!</div>
            <p className="text-gray-800 font-bold text-sm tracking-wide">{errorMessage}</p>
          </div>
        </div>
      )}

      {/* ========== MOBILE OVERLAY ========== */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 z-30 md:hidden transition-opacity"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* ========== SIDEBAR ========== */}
      <div className={`fixed inset-y-0 left-0 w-64 bg-[#111827] flex flex-col shadow-xl z-40 transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"}`}>
        
        {/* Scrollable Projects Area */}
        <div className="p-6 flex-1 overflow-y-auto">
          <div className="flex items-center justify-between mb-10">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-indigo-500 rounded flex items-center justify-center shadow-lg shrink-0">
                <span className="text-white font-bold text-lg">S</span>
              </div>
              <h2 className="text-xl font-bold text-white tracking-wide">SyncDev</h2>
            </div>
            <button className="md:hidden text-gray-400 hover:text-white" onClick={() => setIsMobileMenuOpen(false)}>
              <CloseIcon />
            </button>
          </div>
          
          <p className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-4 ml-1">Projects</p>
          <ul className="space-y-2">
            {projects.map(p => (
              <li
                key={p.id}
                onClick={() => { openProject(p); setIsMobileMenuOpen(false); }}
                className={`
                  flex items-center px-4 py-2.5 rounded-lg cursor-pointer transition-all duration-200 group font-medium text-sm
                  ${activeProject?.id === p.id
                    ? "bg-indigo-600 text-white shadow-md"
                    : "text-gray-400 hover:bg-gray-800 hover:text-white"}
                `}
              >
                <FolderIcon />
                <span className="truncate">{p.title}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Account Settings Area */}
        <div className="p-6 border-t border-gray-800 shrink-0">
          <p className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-4 ml-1">Account</p>
          <ul className="space-y-1">
            <li 
              onClick={() => { setShowProfileModal(true); setIsMobileMenuOpen(false); }} 
              className="flex items-center px-4 py-2.5 rounded-lg cursor-pointer transition-all duration-200 group font-medium text-sm text-gray-400 hover:bg-gray-800 hover:text-white"
            >
              <UserIcon />
              <span>Update Profile</span>
            </li>
            <li 
              onClick={() => { setShowPasswordModal(true); setIsMobileMenuOpen(false); }} 
              className="flex items-center px-4 py-2.5 rounded-lg cursor-pointer transition-all duration-200 group font-medium text-sm text-gray-400 hover:bg-gray-800 hover:text-white"
            >
              <KeyIcon />
              <span>Change Password</span>
            </li>
            <li 
              onClick={handleLogout} 
              className="flex items-center px-4 py-2.5 mt-2 rounded-lg cursor-pointer transition-all duration-200 group font-medium text-sm text-gray-400 hover:bg-red-500/10 hover:text-red-400"
            >
              <LogOutIcon />
              <span>Sign Out</span>
            </li>
          </ul>
        </div>
      </div>

      {/* ========== MAIN CONTENT AREA ========== */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        
        {/* TOP NAVIGATION */}
        <header className="h-[88px] bg-white border-b border-gray-200 flex justify-between items-center px-4 md:px-8 flex-shrink-0 z-20">
          <div className="flex items-center gap-3 md:gap-0">
            <button className="md:hidden text-gray-500 hover:text-gray-900 focus:outline-none" onClick={() => setIsMobileMenuOpen(true)}>
              <MenuIcon />
            </button>

            <div className="min-w-0"> 
              <h1 className="text-xl md:text-2xl font-bold text-gray-900 truncate">Dashboard</h1>
              <p className="text-xs md:text-sm text-gray-500 mt-1 truncate">
                Welcome back, {profile?.name || "Developer"} 
                <span className="mx-2 text-gray-300 hidden sm:inline">|</span> 
                <span className="hidden sm:inline">{activeProject ? activeProject.title : "Overview"}</span>
              </p>
            </div>
          </div>
          
          {profile && (
            <div className="flex items-center gap-4 md:gap-6 shrink-0">
              
              <div className="hidden md:flex items-center bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 w-64">
                <svg className="w-4 h-4 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                <input type="text" placeholder="Search tasks..." className="bg-transparent border-none outline-none text-sm w-full text-gray-700" disabled />
              </div>

              {/* NOTIFICATION BELL */}
              <div className="relative">
                <button 
                  onClick={handleNotificationClick}
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors relative focus:outline-none"
                >
                  <BellIcon />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-indigo-600 text-[9px] font-bold text-white ring-2 ring-white">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {/* NOTIFICATION DROPDOWN */}
                {showNotifications && (
                  <div className="absolute right-[-60px] md:right-0 mt-3 w-80 sm:w-96 bg-white border border-gray-100 rounded-xl shadow-xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                    <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                      <h3 className="font-bold text-gray-900">Notifications</h3>
                    </div>
                    <div className="max-h-[22rem] overflow-y-auto p-3">
                      {notifications.length === 0 ? (
                        <div className="p-8 text-center text-gray-500 text-sm">No recent alerts.</div>
                      ) : (
                        notifications.map(notif => (
                          <div 
                            key={notif.id} 
                            className="p-4 mb-2 rounded-lg border bg-gray-50 border-gray-100 transition-all"
                          >
                            <div className="flex justify-between items-start gap-3">
                              <p className="text-sm text-gray-800">
                                {notif.message || notif.title}
                              </p> 
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* PROFILE DISPLAY (Static, moved from Dropdown) */}
              <div className="relative border-l border-gray-200 pl-4 md:pl-6 flex items-center gap-3">
                <div className="hidden sm:block text-right">
                  <p className="text-sm font-bold text-gray-900 leading-tight">{profile.name}</p>
                  <p className="text-xs text-gray-500 leading-tight">Developer</p>
                </div>
                <div className="w-9 h-9 md:w-10 md:h-10 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center font-bold text-lg shrink-0">
                  {profile.name[0]}
                </div>
              </div>

            </div>
          )}
        </header>

        {/* MAIN SCROLLABLE BODY */}
        <main className="flex-1 p-4 md:p-8 overflow-y-auto space-y-6 md:space-y-8 z-0" onClick={() => {setShowProfileMenu(false); setShowNotifications(false);}}>
          
          {/* STATS STRIP */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
            <StatCard label="YOUR EMAIL" value={profile?.email || "Loading..."} theme="blue" />
            <StatCard label="ONGOING SPRINT" value={ongoing} theme="green" />
            <StatCard label="COMPLETED PROJECTS" value={completed} theme="yellow" />
          </div>

          {!activeProject ? (
            <div className="flex flex-col items-center justify-center py-16 md:py-24 mt-4 md:mt-8 bg-white border border-gray-200 rounded-xl shadow-sm px-4 text-center">
              <div className="w-16 h-16 bg-indigo-50 text-indigo-500 rounded-full flex items-center justify-center mb-4">
                 <FolderIcon />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">No Project Selected</h3>
              <p className="text-gray-500 text-sm">Select a project from the left panel to manage your tasks.</p>
            </div>
          ) : (
            <div className="space-y-6 md:space-y-8 animate-in fade-in duration-300">
              
              {/* CONTENT HEADER AND PROGRESS BAR */}
              <div className="bg-white p-5 md:p-8 rounded-xl border border-gray-200 shadow-sm relative">
                <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4 mb-6">
                  <div>
                    <h2 className="text-xl md:text-2xl font-bold text-gray-900">{activeProject.title}</h2>
                    <p className="text-sm text-gray-500 mt-2">{activeProject.description}</p>
                  </div>
                  <span className="self-start md:self-auto bg-indigo-50 text-indigo-700 px-3 py-1 rounded text-xs font-bold uppercase tracking-wider shrink-0">
                    {completion === 100 ? "Completed" : "Ongoing"}
                  </span>
                </div>
                
                <div className="space-y-2">
                    <div className="flex justify-between text-xs font-bold text-gray-500 uppercase">
                        <span>Progress</span>
                        <span className="text-indigo-600">{completion}%</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                        <div 
                        className="bg-indigo-600 h-full rounded-full transition-all duration-1000"
                        style={{ width: `${completion}%` }}
                        />
                    </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8">
                
                {/* TASK CREATION FORM */}
                <div className="lg:col-span-4">
                  <form onSubmit={addTask} className="bg-white p-5 md:p-6 rounded-xl border border-gray-200 shadow-sm md:sticky md:top-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-5 md:mb-6 flex items-center">
                      Add New Task
                    </h3>
                    <div className="space-y-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-gray-500 uppercase">Task Title</label>
                        <input
                          placeholder="e.g. Build API endpoint"
                          className="w-full bg-gray-50 border border-gray-200 p-3 rounded-lg text-gray-900 text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                          value={newTitle}
                          onChange={e => setNewTitle(e.target.value)}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-gray-500 uppercase">Description</label>
                        <textarea
                          placeholder="Briefly describe the task..."
                          rows="4"
                          className="w-full bg-gray-50 border border-gray-200 p-3 rounded-lg text-gray-900 text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                          value={newDesc}
                          onChange={e => setNewDesc(e.target.value)}
                        />
                      </div>
                      <button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold py-3 rounded-lg shadow-sm transition-all mt-2 flex justify-center items-center">
                        <PlusIcon /> Create Task
                      </button>
                    </div>
                  </form>
                </div>

                {/* TASK LIST AREA */}
                <div className="lg:col-span-8">
                  <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="px-5 md:px-6 py-4 border-b border-gray-200 bg-gray-50/50 flex justify-between items-center">
                       <h3 className="font-bold text-gray-900">Task Overview</h3>
                       <span className="text-xs bg-gray-200 text-gray-700 px-2.5 py-1 rounded-full font-bold">{tasks.length}</span>
                    </div>

                    <div className="p-0">
                      {taskLoading ? (
                        <div className="p-10 md:p-12 text-center text-gray-500 text-sm">Loading tasks...</div>
                      ) : tasks.length === 0 ? (
                        <div className="p-10 md:p-12 text-center text-gray-500 text-sm">
                          No tasks found. Start by adding a new one.
                        </div>
                      ) : (
                        <div className="divide-y divide-gray-100">
                          {tasks.map(task => (
                            <div key={task.id} className="group flex flex-col sm:flex-row sm:items-center justify-between p-4 md:p-5 hover:bg-gray-50 transition-colors">
                              <div className="flex items-start sm:items-center gap-3 md:gap-4 mb-4 sm:mb-0">
                                <button 
                                  type="button"
                                  onClick={() => toggleTask(task)}
                                  className={`mt-1 sm:mt-0 w-5 h-5 rounded border flex-shrink-0 flex items-center justify-center transition-all ${
                                    task.completed 
                                    ? "bg-indigo-600 border-indigo-600" 
                                    : "border-gray-300 hover:border-indigo-500 bg-white"
                                  }`}
                                >
                                  {task.completed && <svg className="w-3.5 h-3.5 text-white" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/></svg>}
                                </button>
                                <div>
                                  <p className={`text-sm font-bold transition-all ${task.completed ? "text-gray-400 line-through" : "text-gray-900"}`}>
                                    {task.title}
                                  </p>
                                  {task.description && !task.completed && (
                                    <p className="text-xs text-gray-500 mt-1">{task.description}</p>
                                  )}
                                </div>
                              </div>

                              <div className="flex items-center gap-2 pl-8 sm:pl-0 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                  type="button"
                                  onClick={() => setEditingTask(task)}
                                  className="px-4 py-1.5 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-md text-xs font-bold transition-colors flex items-center"
                                >
                                  Edit
                                </button>
                                <button
                                  type="button"
                                  onClick={() => deleteTask(task.id)}
                                  className="px-4 py-1.5 bg-red-50 text-red-700 hover:bg-red-100 rounded-md text-xs font-bold transition-colors flex items-center"
                                >
                                  Delete
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
    blue: "border-l-indigo-600 text-gray-900",
    green: "border-l-emerald-500 text-gray-900",
    yellow: "border-l-amber-500 text-gray-900"
  }

  return (
    <div className={`p-5 md:p-6 bg-white rounded-xl shadow-sm border border-gray-100 border-l-4 ${configs[theme]}`}>
      <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">{label}</p>
      <h3 className="text-2xl md:text-3xl font-black truncate">
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
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex justify-center items-center z-50 p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md p-6 md:p-8 rounded-2xl shadow-xl animate-in zoom-in-95 duration-200">
        
        <h3 className="text-xl font-bold text-gray-900 mb-5 md:mb-6 flex items-center">
          Edit Task
        </h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-500 uppercase">Task Title</label>
            <input
              className="w-full bg-gray-50 border border-gray-200 p-3 rounded-lg text-gray-900 text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
              value={title}
              onChange={e => setTitle(e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-500 uppercase">Description</label>
            <textarea
              rows="4"
              className="w-full bg-gray-50 border border-gray-200 p-3 rounded-lg text-gray-900 text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
              value={description}
              onChange={e => setDescription(e.target.value)}
              required
            />
          </div>
          
          <div className="flex gap-3 pt-4">
            <button 
              type="button" 
              onClick={onClose}
              className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-bold py-3 rounded-lg transition-all"
            >
              Cancel
            </button>
            <button 
              type="submit"
              className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold py-3 rounded-lg shadow-sm transition-all"
            >
              Save Changes
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
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex justify-center items-center z-50 p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-sm p-6 md:p-8 rounded-2xl shadow-xl animate-in zoom-in-95 duration-200">
        
        <h3 className="text-xl font-bold text-gray-900 mb-5 md:mb-6">
          Update Profile
        </h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-500 uppercase">Developer Name</label>
            <input
              className="w-full bg-gray-50 border border-gray-200 p-3 rounded-lg text-gray-900 text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
              value={name}
              onChange={e => setName(e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-500 uppercase">Contact Number</label>
            <input
              type="tel"
              className="w-full bg-gray-50 border border-gray-200 p-3 rounded-lg text-gray-900 text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              required
            />
          </div>
          
          <div className="flex gap-3 pt-4">
            <button 
              type="button" 
              onClick={onClose}
              className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-bold py-3 rounded-lg transition-all"
            >
              Cancel
            </button>
            <button 
              type="submit"
              className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold py-3 rounded-lg shadow-sm transition-all"
            >
              Confirm
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
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex justify-center items-center z-50 p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-sm p-6 md:p-8 rounded-2xl shadow-xl animate-in zoom-in-95 duration-200">
        
        <h3 className="text-xl font-bold text-gray-900 mb-5 md:mb-6">
          Update Security
        </h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-500 uppercase">Current Password</label>
            <input
              type="password"
              className="w-full bg-gray-50 border border-gray-200 p-3 rounded-lg text-gray-900 text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
              value={oldPassword}
              onChange={e => setOldPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>
          
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-500 uppercase">New Password</label>
            <input
              type="password"
              className="w-full bg-gray-50 border border-gray-200 p-3 rounded-lg text-gray-900 text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>
          
          <div className="flex gap-3 pt-4">
            <button 
              type="button" 
              onClick={onClose}
              className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-bold py-3 rounded-lg transition-all"
            >
              Cancel
            </button>
            <button 
              type="submit"
              className="flex-1 bg-red-600 hover:bg-red-700 text-white text-sm font-bold py-3 rounded-lg shadow-sm transition-all"
            >
              Confirm
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}