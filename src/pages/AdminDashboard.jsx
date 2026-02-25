import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import api from "../services/Api"

// Added Bell Icon for Notifications
const BellIcon = () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>;
// Added Check Icon for Success Toast
const CheckIcon = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>;
// Added Search Icon
const SearchIcon = () => <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>;
// NEW: Mobile Sidebar Icons
const MenuIcon = () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" /></svg>;
const CloseIcon = () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>;

export default function AdminDashboard() {

  const [activeTab, setActiveTab] = useState("PROJECTS")
  const [projects, setProjects] = useState([])
  const [clients, setClients] = useState([])
  const [developers, setDevelopers] = useState([])
  const [showDevModal, setShowDevModal] = useState(false)
  const [editingDeveloper, setEditingDeveloper] = useState(null)
  const [showClientModal, setShowClientModal] = useState(false)
  const [editingClient, setEditingClient] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  const [showModal, setShowModal] = useState(false)
  const [editingProject, setEditingProject] = useState(null)

  const [showProfileModal, setShowProfileModal] = useState(false)
  const [showPasswordModal, setShowPasswordModal] = useState(false)

  // Notification States
  const [showNotifications, setShowNotifications] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)

  // Toast States
  const [successMessage, setSuccessMessage] = useState("")
  const [errorMessage, setErrorMessage] = useState("")

  // Search State
  const [searchQuery, setSearchQuery] = useState("")
  
  // NEW: Mobile Menu State
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const navigate = useNavigate()

  /* ================= LOADERS ================= */

  async function loadProfile() {
    const res = await api.get("/api/admin/profile")
    setProfile(res.data)
  }

  // --- Search Integration ---
  async function loadProjects(query = "") {
    const url = query ? `/api/admin/projects?search=${encodeURIComponent(query)}` : "/api/admin/projects"
    const res = await api.get(url)
    setProjects(res.data)
  }

  async function loadClients(query = "") {
    const url = query ? `/api/admin/clients?search=${encodeURIComponent(query)}` : "/api/admin/clients"
    const res = await api.get(url)
    setClients(res.data)
  }

  async function loadDevelopers(query = "") {
    const url = query ? `/api/admin/developers?search=${encodeURIComponent(query)}` : "/api/admin/developers"
    const res = await api.get(url)
    setDevelopers(res.data)
  }

  // Effect to handle dynamic search as the user types
  useEffect(() => {
    // We only load the data relevant to the active tab to save bandwidth
    if (activeTab === "PROJECTS" || activeTab === "ONGOING" || activeTab === "COMPLETED") {
      loadProjects(searchQuery)
    } else if (activeTab === "CLIENTS") {
      loadClients(searchQuery)
    } else if (activeTab === "DEVS") {
      loadDevelopers(searchQuery)
    }
  }, [searchQuery, activeTab])


  // --- Notification Fetcher ---
  async function fetchNotifications() {
    try {
      const notifRes = await api.get("/api/admin/notifications")
      const countRes = await api.get("/api/admin/notifications/unread-count")
      setNotifications(notifRes.data || [])
      setUnreadCount(countRes.data || 0)
    } catch (err) { console.log("Notification Fetch Error:", err) }
  }

  useEffect(() => {
    async function load() {
      setLoading(true)
      await Promise.all([
        loadProfile(),
        loadProjects(),
        loadClients(),
        loadDevelopers(),
        fetchNotifications() 
      ])
      setLoading(false)
    }
    load()

    // --- Background Notification Polling (Every 10 seconds) ---
    const notificationInterval = setInterval(() => {
      fetchNotifications()
    }, 100000); 

    // Cleanup interval on unmount
    return () => clearInterval(notificationInterval);
  }, [])

  /* ================= HANDLERS ================= */

  function showSuccessToast(msg) {
    setSuccessMessage(msg);
    setTimeout(() => {
      setSuccessMessage("");
    }, 3500);
  }

  function showErrorToast(msg) {
    setErrorMessage(msg);
    setTimeout(() => {
      setErrorMessage("");
    }, 3500);
  }

  async function handleNotificationClick() {
    const willShow = !showNotifications;
    setShowNotifications(willShow);

    if (willShow && unreadCount > 0) {
      setUnreadCount(0);
      setNotifications(prev => prev.map(notif => ({ ...notif, read: true })));

      const unreadNotifs = notifications.filter(n => !n.read);
      for (const notif of unreadNotifs) {
        try {
          await api.put(`/api/admin/notifications/${notif.id}/read`);
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

  function getFilteredProjects() {
    if (activeTab === "ONGOING") return projects.filter(p => p.status === "ONGOING")
    if (activeTab === "COMPLETED") return projects.filter(p => p.status === "COMPLETED")
    return projects
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="animate-spin rounded-full h-12 w-12 border-4 border-slate-200 border-t-indigo-600"></div>
    </div>
  )

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-slate-50 font-sans text-slate-800 selection:bg-indigo-100 selection:text-indigo-900 relative">

      {/* SUCCESS TOAST NOTIFICATION */}
      {successMessage && (
        <div className="fixed bottom-10 left-1/2 transform -translate-x-1/2 bg-white border border-emerald-100 px-5 py-3.5 rounded-2xl shadow-[0_10px_40px_rgba(16,185,129,0.15)] z-50 animate-in slide-in-from-bottom-5 fade-in duration-300 w-[90%] md:w-auto">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center shrink-0">
              <CheckIcon />
            </div>
            <p className="text-slate-700 font-bold text-sm tracking-wide pr-2">{successMessage}</p>
          </div>
        </div>
      )}

      {/* ERROR TOAST NOTIFICATION */}
      {errorMessage && (
        <div className="fixed bottom-10 left-1/2 transform -translate-x-1/2 bg-white border border-red-100 px-5 py-3.5 rounded-2xl shadow-[0_10px_40px_rgba(239,68,68,0.15)] z-50 animate-in slide-in-from-bottom-5 fade-in duration-300 w-[90%] md:w-auto">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 bg-red-100 text-red-600 rounded-full flex items-center justify-center font-bold shrink-0">
              !
            </div>
            <p className="text-slate-700 font-bold text-sm tracking-wide pr-2">{errorMessage}</p>
          </div>
        </div>
      )}

      {/* ========== MOBILE OVERLAY ========== */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 z-40 md:hidden transition-opacity"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* SIDEBAR - SLIDE OUT ON MOBILE */}
      <div className={`fixed inset-y-0 left-0 w-64 bg-slate-900 border-r border-slate-800 p-6 flex flex-col shadow-2xl md:shadow-[0_-8px_15px_-3px_rgba(0,0,0,0.1)] z-50 transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"}`}>
        
        <div className="flex items-center justify-between gap-3 mb-10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-indigo-500 rounded-lg shadow-lg flex items-center justify-center shrink-0">
              <span className="text-white font-bold text-xl">S</span>
            </div>
            <h2 className="text-xl font-black text-white tracking-tight">Sync<span className="text-indigo-400">Admin</span></h2>
          </div>
          {/* Mobile Close Button */}
          <button className="md:hidden text-slate-400 hover:text-white focus:outline-none" onClick={() => setIsMobileMenuOpen(false)}>
            <CloseIcon />
          </button>
        </div>

        <ul className="flex flex-col gap-2 flex-1 w-full m-0 items-stretch overflow-y-auto">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 px-2 mt-2 shrink-0">Projects</div>
          <MenuItem label="All Projects" active={activeTab === "PROJECTS"} onClick={() => {setActiveTab("PROJECTS"); setSearchQuery(""); setIsMobileMenuOpen(false);}} />
          <MenuItem label="Current Projects" active={activeTab === "ONGOING"} onClick={() => {setActiveTab("ONGOING"); setSearchQuery(""); setIsMobileMenuOpen(false);}} />
          <MenuItem label="Completed Projects" active={activeTab === "COMPLETED"} onClick={() => {setActiveTab("COMPLETED"); setSearchQuery(""); setIsMobileMenuOpen(false);}} />

          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 px-2 mt-8 shrink-0">People</div>
          <MenuItem label="All Clients" active={activeTab === "CLIENTS"} onClick={() => {setActiveTab("CLIENTS"); setSearchQuery(""); setIsMobileMenuOpen(false);}} />
          <MenuItem label="All Developers" active={activeTab === "DEVS"} onClick={() => {setActiveTab("DEVS"); setSearchQuery(""); setIsMobileMenuOpen(false);}} />

          {/* Account Actions moved from navbar dropdown */}
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 px-2 mt-auto pt-6 border-t border-slate-800 shrink-0">Account</div>
          <MenuItem label="Update Profile" active={false} onClick={() => {setShowProfileModal(true); setIsMobileMenuOpen(false);}} />
          <MenuItem label="Change Password" active={false} onClick={() => {setShowPasswordModal(true); setIsMobileMenuOpen(false);}} />
          <li onClick={handleLogout}
              className="flex-shrink-0 px-4 py-3 rounded-xl cursor-pointer text-sm font-semibold transition-all duration-200 whitespace-nowrap text-red-400 hover:bg-red-500/10 hover:text-red-300">
              Sign Out
          </li>
        </ul>
      </div>

      {/* MAIN CONTENT */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden w-full">

        {/* TOP NAVBAR */}
        <div className="h-16 sm:h-20 bg-white/80 backdrop-blur-md border-b border-slate-200 flex justify-between items-center px-4 sm:px-8 shadow-sm shrink-0 z-10 sticky top-0 gap-4">
          
          <div className="flex items-center gap-3 sm:gap-0 min-w-0 pr-4">
            {/* Hamburger Button for Mobile */}
            <button className="md:hidden text-slate-500 hover:text-slate-800 focus:outline-none shrink-0" onClick={() => setIsMobileMenuOpen(true)}>
              <MenuIcon />
            </button>
            <div className="flex flex-col justify-center min-w-0">
              <h1 className="font-bold text-lg sm:text-2xl text-slate-800 tracking-tight truncate">
                {activeTab === "PROJECTS" ? "Dashboard" :
                  activeTab === "ONGOING" ? "Active Projects" :
                    activeTab === "COMPLETED" ? "Completed Projects" :
                      activeTab === "CLIENTS" ? "Clients" : "Developers"}
              </h1>
              <p className="hidden sm:block text-sm text-slate-500 truncate">Welcome back, {profile?.name?.split(' ')[0] || 'Admin'}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 sm:gap-5 shrink-0 flex-1 justify-end">

            {/* SEARCH BAR */}
            <div className="relative max-w-[200px] sm:max-w-xs w-full hidden sm:block">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <SearchIcon />
              </div>
              <input
                type="text"
                placeholder={`Search ${activeTab.toLowerCase()}...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-slate-50 focus:bg-white transition-colors"
              />
            </div>

            {/* NOTIFICATION BELL */}
            <div className="relative border-r border-slate-200 pr-4 md:pr-6">
              <button
                onClick={handleNotificationClick}
                className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-all relative focus:outline-none"
              >
                <BellIcon />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-black text-white ring-2 ring-white">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* NOTIFICATION DROPDOWN */}
              {showNotifications && (
                <div className="absolute right-0 md:right-auto md:left-0 mt-3 w-80 sm:w-96 bg-white border border-slate-100 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                  <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                    <h3 className="font-bold text-slate-800 tracking-tight">System Alerts</h3>
                    <span className="text-[10px] bg-indigo-100 text-indigo-700 px-2.5 py-1 rounded-full font-bold">{unreadCount} Unread</span>
                  </div>
                  <div className="max-h-[22rem] overflow-y-auto custom-scrollbar p-3">
                    {notifications.length === 0 ? (
                      <div className="p-8 text-center text-slate-500 text-sm italic">No recent alerts.</div>
                    ) : (
                      notifications.map(notif => (
                        <div key={notif.id} className={`p-4 mb-2 rounded-xl border transition-all ${notif.read ? 'border-transparent opacity-70 bg-slate-50/50' : 'border-indigo-100 bg-indigo-50/50'}`}>
                          <p className="text-sm font-medium text-slate-700">{notif.message || notif.title}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* PROFILE DISPLAY (Static) */}
            <div className="relative flex items-center gap-2 sm:gap-3 p-1">
              <div className="hidden sm:flex flex-col items-end pr-1">
                <span className="font-semibold text-sm text-slate-700 leading-tight">{profile?.name}</span>
                <span className="text-xs text-slate-500 font-medium">Administrator</span>
              </div>
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-indigo-100 text-indigo-700 font-bold text-base sm:text-lg rounded-full flex items-center justify-center shadow-inner shrink-0">
                {profile?.name?.[0]?.toUpperCase()}
              </div>
            </div>

          </div>
        </div>

        {/* MOBILE SEARCH BAR (visible only on small screens) */}
        <div className="sm:hidden px-4 py-3 bg-white border-b border-slate-200 shrink-0">
          <div className="relative w-full">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <SearchIcon />
            </div>
            <input
              type="text"
              placeholder={`Search ${activeTab.toLowerCase()}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-slate-50 focus:bg-white transition-colors"
            />
          </div>
        </div>

        {/* SCROLLABLE CONTENT */}
        <div
          className="p-4 sm:p-8 flex-1 overflow-auto z-0"
          onClick={() => setShowNotifications(false)} // Closes menu when clicking outside
        >

    {/* STATS */}
<div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8 sm:mb-10">

  {/* ALL PROJECTS */}
  <Stat
    title="Projects"
    value={profile?.totalProjects || 0}
    color="bg-indigo-500"
    onClick={() => {
      setActiveTab("PROJECTS")
      setSearchQuery("")
    }}
  />

  {/* COMPLETED PROJECTS */}
  <Stat
    title="Completed"
    value={profile?.completedProjects || 0}
    color="bg-emerald-500"
    onClick={() => {
      setActiveTab("COMPLETED")
      setSearchQuery("")
    }}
  />

  {/* CLIENTS */}
  <Stat
    title="Clients"
    value={profile?.totalClients || 0}
    color="bg-amber-500"
    onClick={() => {
      setActiveTab("CLIENTS")
      setSearchQuery("")
    }}
  />

  {/* DEVELOPERS */}
  <Stat
    title="Developers"
    value={profile?.totalDevelopers || 0}
    color="bg-blue-500"
    onClick={() => {
      setActiveTab("DEVS")
      setSearchQuery("")
    }}
  />

</div>
          {/* HEADER & ADD BUTTON */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-6">
            <h2 className="text-lg font-bold text-slate-800 hidden sm:block">
              {["PROJECTS", "ONGOING", "COMPLETED"].includes(activeTab) ? "Recent Projects" : "Directory Listing"}
            </h2>

            {["PROJECTS", "ONGOING", "COMPLETED"].includes(activeTab) && (
              <button onClick={() => { setEditingProject(null); setShowModal(true); }}
                className="w-full sm:w-auto justify-center bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-5 py-3 sm:py-2.5 rounded-xl shadow-lg shadow-indigo-200 transition-all hover:-translate-y-0.5 flex items-center gap-2">
                <span>+ Create Project</span>
              </button>
            )}

            {activeTab === "CLIENTS" && (
              <button onClick={() => { setEditingClient(null); setShowClientModal(true); }}
                className="w-full sm:w-auto justify-center bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-5 py-3 sm:py-2.5 rounded-xl shadow-lg shadow-indigo-200 transition-all hover:-translate-y-0.5">
                + Add Client
              </button>
            )}

            {activeTab === "DEVS" && (
              <button onClick={() => { setEditingDeveloper(null); setShowDevModal(true); }}
                className="w-full sm:w-auto justify-center bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-5 py-3 sm:py-2.5 rounded-xl shadow-lg shadow-indigo-200 transition-all hover:-translate-y-0.5">
                + Add Developer
              </button>
            )}
          </div>

          {/* RENDER GRIDS */}
          {["PROJECTS", "ONGOING", "COMPLETED"].includes(activeTab) && (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-5 sm:gap-6 pb-8">
              {getFilteredProjects().map(p => (
                <ProjectCard key={p.id} project={p} reload={() => loadProjects(searchQuery)} onEdit={(proj) => { setEditingProject(proj); setShowModal(true); }} onSuccess={showSuccessToast} />
              ))}
              {getFilteredProjects().length === 0 && (
                <div className="col-span-full text-center py-12 sm:py-16 text-slate-500 bg-white rounded-2xl border-2 border-slate-200 border-dashed px-4">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                    <span className="text-2xl text-slate-400">📋</span>
                  </div>
                  <p className="font-medium text-base sm:text-lg text-slate-700">No projects found</p>
                  <p className="text-xs sm:text-sm mt-1">Get started by creating a new project.</p>
                </div>
              )}
            </div>
          )}

          {activeTab === "CLIENTS" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 sm:gap-6 pb-8">
              {clients.map(c => <ClientCard key={c.id} client={c} reload={() => loadClients(searchQuery)} onEdit={(client) => { setEditingClient(client); setShowClientModal(true); }} onSuccess={showSuccessToast} />)}
              {clients.length === 0 && (
                <div className="col-span-full text-center py-12 sm:py-16 text-slate-500 bg-white rounded-2xl border-2 border-slate-200 border-dashed px-4">
                  <p className="font-medium text-base sm:text-lg text-slate-700">No clients found</p>
                </div>
              )}
            </div>
          )}

          {activeTab === "DEVS" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 sm:gap-6 pb-8">
              {developers.map(d => <DeveloperCard key={d.id} developer={d} reload={() => loadDevelopers(searchQuery)} onEdit={(dev) => { setEditingDeveloper(dev); setShowDevModal(true); }} onSuccess={showSuccessToast} />)}
               {developers.length === 0 && (
                <div className="col-span-full text-center py-12 sm:py-16 text-slate-500 bg-white rounded-2xl border-2 border-slate-200 border-dashed px-4">
                  <p className="font-medium text-base sm:text-lg text-slate-700">No developers found</p>
                </div>
              )}
            </div>
          )}

        </div>
      </div>

      {/* MODALS */}
      <ProjectModal show={showModal} onClose={() => setShowModal(false)} reload={() => loadProjects(searchQuery)} clients={clients} developers={developers} editingProject={editingProject} onSuccess={showSuccessToast} />
      <DeveloperModal show={showDevModal} onClose={() => setShowDevModal(false)} reload={() => loadDevelopers(searchQuery)} editingDeveloper={editingDeveloper} onSuccess={showSuccessToast} />
      <ClientModal show={showClientModal} onClose={() => setShowClientModal(false)} reload={() => loadClients(searchQuery)} editingClient={editingClient} onSuccess={showSuccessToast} />

      <ProfileModal
        show={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        profile={profile}
        reload={loadProfile}
        onSuccess={showSuccessToast}
        onError={showErrorToast}
      />

      {/* CHANGE PASSWORD MODAL */}
      <ChangePasswordModal 
        show={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
        onSuccess={showSuccessToast}
        onError={showErrorToast}
      />

    </div>
  )
}

/* ================= MODALS ================= */

function ProfileModal({ show, onClose, profile, reload, onSuccess, onError }) {
  const [form, setForm] = useState({
    name: "",
    phone: ""
  })

  useEffect(() => {
    if (profile) {
      setForm({
        name: profile.name || "",
        phone: profile.ph || profile.phone || ""
      })
    }
  }, [profile])

  if (!show) return null

  function handleChange(e) {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    try {
      await api.put("/api/profile/update", {
        id: profile?.id,
        email: profile?.email,
        name: form.name,
        phone: form.phone,
        ph: form.phone
      })
      onSuccess("Profile updated successfully!")
      reload()
      onClose()
    } catch (err) {
      onClose()
      const msg = err.response?.data?.message || err.response?.data || "Failed to update profile."
      onError(typeof msg === 'string' ? msg : "An unexpected error occurred.")
    }
  }

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex justify-center items-center z-50 p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-[400px] p-6 sm:p-8 rounded-2xl shadow-2xl transform transition-all animate-in zoom-in-95 duration-200">
        <h2 className="text-xl sm:text-2xl font-bold mb-5 sm:mb-6 text-slate-800">Update Profile</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[10px] sm:text-xs font-bold text-slate-500 mb-1.5 sm:mb-2 uppercase tracking-wider">Full Name</label>
            <input
              name="name" value={form.name} onChange={handleChange} placeholder="Name"
              className="w-full bg-slate-50 border border-slate-200 text-slate-900 p-3 sm:p-3.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all text-sm sm:text-base"
              required
            />
          </div>
          <div>
            <label className="block text-[10px] sm:text-xs font-bold text-slate-500 mb-1.5 sm:mb-2 uppercase tracking-wider">Contact Number</label>
            <input
              name="phone" value={form.phone} onChange={handleChange} placeholder="Phone"
              className="w-full bg-slate-50 border border-slate-200 text-slate-900 p-3 sm:p-3.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all text-sm sm:text-base"
              required
            />
          </div>
          <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 mt-6 sm:mt-8 pt-2">
            <button type="button" onClick={onClose}
              className="w-full sm:w-auto px-5 py-3 sm:py-2.5 text-slate-600 font-medium rounded-xl hover:bg-slate-100 transition">
              Cancel
            </button>
            <button type="submit"
              className="w-full sm:w-auto px-5 py-3 sm:py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl shadow-lg shadow-indigo-200 transition">
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function ChangePasswordModal({ show, onClose, onSuccess, onError }) {
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
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex justify-center items-center z-50 p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-[400px] p-6 sm:p-8 rounded-2xl shadow-2xl transform transition-all animate-in zoom-in-95 duration-200">
        <h2 className="text-xl sm:text-2xl font-bold mb-5 sm:mb-6 text-slate-800">Change Password</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[10px] sm:text-xs font-bold text-slate-500 mb-1.5 sm:mb-2 uppercase tracking-wider">Current Password</label>
            <input
              type="password"
              value={oldPassword} onChange={e => setOldPassword(e.target.value)} placeholder="••••••••"
              className="w-full bg-slate-50 border border-slate-200 text-slate-900 p-3 sm:p-3.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all text-sm sm:text-base"
              required
            />
          </div>
          <div>
            <label className="block text-[10px] sm:text-xs font-bold text-slate-500 mb-1.5 sm:mb-2 uppercase tracking-wider">New Password</label>
            <input
              type="password"
              value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="••••••••"
              className="w-full bg-slate-50 border border-slate-200 text-slate-900 p-3 sm:p-3.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all text-sm sm:text-base"
              required
            />
          </div>
          <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 mt-6 sm:mt-8 pt-2">
            <button type="button" onClick={onClose}
              className="w-full sm:w-auto px-5 py-3 sm:py-2.5 text-slate-600 font-medium rounded-xl hover:bg-slate-100 transition">
              Cancel
            </button>
            <button type="submit"
              className="w-full sm:w-auto px-5 py-3 sm:py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl shadow-lg shadow-indigo-200 transition">
              Confirm
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function ProjectModal({ show, onClose, reload, clients, developers, editingProject, onSuccess }) {
  const [form, setForm] = useState({ title: "", description: "", status: "ONGOING", clientId: "", developerIds: [] })

  useEffect(() => {
    if (editingProject) {
      setForm({
        title: editingProject.title, description: editingProject.description, status: editingProject.status,
        clientId: editingProject.client?.id || "", developerIds: editingProject.developers?.map(d => d.id) || []
      })
    }
  }, [editingProject])

  if (!show) return null

  function handleChange(e) {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  function toggleDeveloper(id) {
    setForm(prev => ({
      ...prev,
      developerIds: prev.developerIds.includes(id) ? prev.developerIds.filter(d => d !== id) : [...prev.developerIds, id]
    }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    try {
      if (editingProject) {
        await api.put(`/api/projects/${editingProject.id}`, form)
        onSuccess("Project updated successfully!")
      } else {
        await api.post("/api/projects", form)
        onSuccess("Project created successfully!")
      }
      reload()
      onClose()
    } catch (err) { console.log(err) }
  }

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex justify-center items-center z-50 p-4">
      <div className="bg-white w-full max-w-lg p-6 sm:p-8 rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl sm:text-2xl font-bold mb-5 sm:mb-6 text-slate-800">
          {editingProject ? "Edit Project" : "Create Project"}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">

          <div>
            <label className="block text-[10px] sm:text-xs font-bold text-slate-500 mb-1.5 sm:mb-2 uppercase tracking-wider">Project Title</label>
            <input name="title" value={form.title} onChange={handleChange} placeholder="e.g. E-Commerce Redesign"
              className="w-full bg-slate-50 border border-slate-200 text-slate-900 p-3 sm:p-3.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all text-sm sm:text-base" required />
          </div>

          <div>
            <label className="block text-[10px] sm:text-xs font-bold text-slate-500 mb-1.5 sm:mb-2 uppercase tracking-wider">Description</label>
            <textarea name="description" value={form.description} onChange={handleChange} rows="3" placeholder="Brief details about the project..."
              className="w-full bg-slate-50 border border-slate-200 text-slate-900 p-3 sm:p-3.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all resize-none text-sm sm:text-base" required />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
            <div>
              <label className="block text-[10px] sm:text-xs font-bold text-slate-500 mb-1.5 sm:mb-2 uppercase tracking-wider">Status</label>
              <select name="status" value={form.status} onChange={handleChange}
                className="w-full bg-slate-50 border border-slate-200 text-slate-900 p-3 sm:p-3.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all appearance-none cursor-pointer text-sm sm:text-base">
                <option value="ONGOING">Ongoing</option>
                <option value="COMPLETED">Completed</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] sm:text-xs font-bold text-slate-500 mb-1.5 sm:mb-2 uppercase tracking-wider">Client</label>
              <select name="clientId" value={form.clientId} onChange={handleChange}
                className="w-full bg-slate-50 border border-slate-200 text-slate-900 p-3 sm:p-3.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all appearance-none cursor-pointer text-sm sm:text-base" required>
                <option value="">Select a Client</option>
                {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[10px] sm:text-xs font-bold text-slate-500 mb-1.5 sm:mb-2 uppercase tracking-wider">Assign Developers</label>
            <div className="max-h-40 overflow-y-auto border border-slate-200 rounded-xl p-2 bg-slate-50/50 space-y-1">
              {developers.length === 0 && <p className="text-sm text-slate-500 italic p-3">No developers available.</p>}
              {developers.map(d => (
                <label key={d.id} className="flex items-center text-sm cursor-pointer hover:bg-white p-3 rounded-lg border border-transparent hover:border-slate-200 hover:shadow-sm transition-all">
                  <input type="checkbox" checked={form.developerIds.includes(d.id)} onChange={() => toggleDeveloper(d.id)}
                    className="mr-3 h-4 w-4 sm:h-5 sm:w-5 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500" />
                  <span className="font-medium sm:font-semibold text-slate-700">{d.name}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 mt-6 sm:mt-8 pt-5 sm:pt-6 border-t border-slate-100">
            <button type="button" onClick={onClose}
              className="w-full sm:w-auto px-5 py-3 sm:py-2.5 text-slate-600 font-medium rounded-xl hover:bg-slate-100 transition">
              Cancel
            </button>
            <button type="submit"
              className="w-full sm:w-auto px-5 py-3 sm:py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl shadow-lg shadow-indigo-200 transition">
              {editingProject ? "Update Project" : "Create Project"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function DeveloperModal({ show, onClose, reload, editingDeveloper, onSuccess }) {
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "" })

  useEffect(() => {
    if (editingDeveloper) setForm({ name: editingDeveloper.name || "", email: editingDeveloper.email || "", ph: editingDeveloper.ph || "" })
    else setForm({ name: "", email: "", ph: "", password: "" })
  }, [editingDeveloper])

  if (!show) return null

  function handleChange(e) { const { name, value } = e.target; setForm(prev => ({ ...prev, [name]: value })) }

  async function handleSubmit(e) {
    e.preventDefault()
    try {
      if (editingDeveloper) {
        await api.put(`/api/admin/developers/${editingDeveloper.id}`, form)
        onSuccess("Developer updated successfully!")
      } else {
        await api.post("/api/admin/developers", form)
        onSuccess("Developer created successfully!")
      }
      reload()
      onClose()
    } catch (err) { console.log(err) }
  }

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex justify-center items-center z-50 p-4">
      <div className="bg-white w-full max-w-md p-6 sm:p-8 rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
        <h3 className="text-xl sm:text-2xl font-bold mb-5 sm:mb-6 text-slate-800">{editingDeveloper ? "Edit Developer" : "Add Developer"}</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[10px] sm:text-xs font-bold text-slate-500 mb-1.5 sm:mb-2 uppercase tracking-wider">Full Name</label>
            <input name="name" value={form.name} onChange={handleChange} placeholder="Full Name" className="w-full bg-slate-50 border border-slate-200 text-slate-900 p-3 sm:p-3.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all text-sm sm:text-base" required />
          </div>
          <div>
            <label className="block text-[10px] sm:text-xs font-bold text-slate-500 mb-1.5 sm:mb-2 uppercase tracking-wider">Email Address</label>
            <input name="email" value={form.email} onChange={handleChange} placeholder="Email Address" type="email" className="w-full bg-slate-50 border border-slate-200 text-slate-900 p-3 sm:p-3.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all text-sm sm:text-base" required />
          </div>
          <div>
            <label className="block text-[10px] sm:text-xs font-bold text-slate-500 mb-1.5 sm:mb-2 uppercase tracking-wider">Phone Number</label>
            <input name="ph" value={form.ph} onChange={handleChange} placeholder="Phone Number" className="w-full bg-slate-50 border border-slate-200 text-slate-900 p-3 sm:p-3.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all text-sm sm:text-base" required />
          </div>
          {!editingDeveloper && (
            <div>
              <label className="block text-[10px] sm:text-xs font-bold text-slate-500 mb-1.5 sm:mb-2 uppercase tracking-wider">Assign Password</label>
              <input name="password" value={form.password} onChange={handleChange} placeholder="Assign Password" type="password" className="w-full bg-slate-50 border border-slate-200 text-slate-900 p-3 sm:p-3.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all text-sm sm:text-base" required />
            </div>
          )}
          <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-4 sm:pt-6 border-t border-slate-100">
            <button type="button" onClick={onClose} className="w-full sm:w-auto px-5 py-3 sm:py-2.5 text-slate-600 font-medium rounded-xl hover:bg-slate-100 transition">Cancel</button>
            <button type="submit" className="w-full sm:w-auto px-5 py-3 sm:py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl shadow-lg shadow-indigo-200 transition">Save Developer</button>
          </div>
        </form>
      </div>
    </div>
  )
}

function ClientModal({ show, onClose, reload, editingClient, onSuccess }) {
  const [form, setForm] = useState({ name: "", email: "", ph: "", password: "" })

  useEffect(() => {
    if (editingClient) setForm({ name: editingClient.name || "", email: editingClient.email || "", ph: editingClient.ph || "" })
    else setForm({ name: "", email: "", ph: "", password: "" })
  }, [editingClient])

  if (!show) return null

  function handleChange(e) { const { name, value } = e.target; setForm(prev => ({ ...prev, [name]: value })) }

  async function handleSubmit(e) {
    e.preventDefault()
    try {
      if (editingClient) {
        await api.put(`/api/admin/clients/${editingClient.id}`, form)
        onSuccess("Client updated successfully!")
      } else {
        await api.post("/api/admin/clients", form)
        onSuccess("Client created successfully!")
      }
      reload()
      onClose()
    } catch (err) { console.log(err) }
  }

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex justify-center items-center z-50 p-4">
      <div className="bg-white w-full max-w-md p-6 sm:p-8 rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
        <h3 className="text-xl sm:text-2xl font-bold mb-5 sm:mb-6 text-slate-800">{editingClient ? "Edit Client" : "Add Client"}</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[10px] sm:text-xs font-bold text-slate-500 mb-1.5 sm:mb-2 uppercase tracking-wider">Client Name / Company</label>
            <input name="name" value={form.name} onChange={handleChange} placeholder="Client Name / Company" className="w-full bg-slate-50 border border-slate-200 text-slate-900 p-3 sm:p-3.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all text-sm sm:text-base" required />
          </div>
          <div>
            <label className="block text-[10px] sm:text-xs font-bold text-slate-500 mb-1.5 sm:mb-2 uppercase tracking-wider">Email Address</label>
            <input name="email" value={form.email} onChange={handleChange} placeholder="Email Address" type="email" className="w-full bg-slate-50 border border-slate-200 text-slate-900 p-3 sm:p-3.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all text-sm sm:text-base" required />
          </div>
          <div>
            <label className="block text-[10px] sm:text-xs font-bold text-slate-500 mb-1.5 sm:mb-2 uppercase tracking-wider">Phone Number</label>
            <input name="ph" value={form.ph} onChange={handleChange} placeholder="Phone Number" className="w-full bg-slate-50 border border-slate-200 text-slate-900 p-3 sm:p-3.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all text-sm sm:text-base" required />
          </div>
          {!editingClient && (
            <div>
              <label className="block text-[10px] sm:text-xs font-bold text-slate-500 mb-1.5 sm:mb-2 uppercase tracking-wider">Assign Password</label>
              <input name="password" value={form.password} onChange={handleChange} placeholder="Assign Password" type="password" className="w-full bg-slate-50 border border-slate-200 text-slate-900 p-3 sm:p-3.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all text-sm sm:text-base" required />
            </div>
          )}
          <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-4 sm:pt-6 border-t border-slate-100">
            <button type="button" onClick={onClose} className="w-full sm:w-auto px-5 py-3 sm:py-2.5 text-slate-600 font-medium rounded-xl hover:bg-slate-100 transition">Cancel</button>
            <button type="submit" className="w-full sm:w-auto px-5 py-3 sm:py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl shadow-lg shadow-indigo-200 transition">Save Client</button>
          </div>
        </form>
      </div>
    </div>
  )
}

/* ================= UI COMPONENTS ================= */

function MenuItem({ label, active, onClick }) {
  return (
    <li onClick={onClick}
      className={`flex-shrink-0 px-4 py-3 rounded-xl cursor-pointer text-sm font-semibold transition-all duration-200 whitespace-nowrap
      ${active
          ? "bg-indigo-600 text-white shadow-md shadow-indigo-900/20"
          : "text-slate-400 hover:bg-slate-800 hover:text-white"}`}>
      {label}
    </li>
  )
}

function Stat({ title, value, color, onClick }) {
  return (
    <div
      onClick={onClick}
      className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-slate-200 relative overflow-hidden group hover:shadow-md transition-all cursor-pointer hover:-translate-y-1"
    >
      <div className={`absolute top-0 left-0 w-1.5 h-full ${color}`}></div>

      <p className="text-slate-500 text-[10px] sm:text-xs font-bold uppercase tracking-widest mb-1.5 sm:mb-2 ml-2">
        {title}
      </p>

      <h3 className="text-2xl sm:text-4xl font-black text-slate-800 ml-2 tracking-tight">
        {value}
      </h3>
    </div>
  )
}

function ProjectCard({ project, reload, onEdit, onSuccess }) {
  const navigate = useNavigate()
  const [completion, setCompletion] = useState(0)

  useEffect(() => {
    async function loadCompletion() {
      try { const res = await api.get(`/api/tasks/project/${project.id}/completion`); setCompletion(res.data) }
      catch { setCompletion(0) }
    }
    loadCompletion()
  }, [project.id])

  async function handleDelete() {
    if (!window.confirm("Are you sure you want to delete this project?")) return
    try {
      await api.delete(`/api/projects/${project.id}`)
      onSuccess("Project deleted successfully!")
      reload()
    } catch (err) { console.log(err) }
  }

  return (
    <div onClick={() => navigate(`/admin/project/${project.id}`)} className="bg-white cursor-pointer p-5 sm:p-6 rounded-2xl shadow-sm border border-slate-200 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col h-full group">

      <div className="flex justify-between items-start gap-3 mb-3 sm:mb-4">
        <h3 onClick={() => navigate(`/admin/project/${project.id}`)}
          className="font-extrabold text-lg sm:text-xl text-slate-800 cursor-pointer group-hover:text-indigo-600 transition-colors leading-tight min-w-0">
          <span className="truncate block">{project.title}</span>
        </h3>
        <span className={`flex-shrink-0 px-2.5 py-1 text-[9px] sm:text-[10px] uppercase rounded-full font-extrabold tracking-wider border
            ${project.status === "ONGOING" ? "bg-amber-50 text-amber-600 border-amber-200" : "bg-emerald-50 text-emerald-600 border-emerald-200"}`}>
          {project.status}
        </span>
      </div>

      <p className="text-slate-500 text-xs sm:text-sm mb-4 sm:mb-6 line-clamp-2 leading-relaxed flex-1">
        {project.description}
      </p>

      <div className="bg-slate-50 rounded-xl p-3 sm:p-4 mb-4 sm:mb-6 border border-slate-100 space-y-2.5 sm:space-y-3">
        <div className="flex items-center text-xs sm:text-sm min-w-0">
          <span className="flex-shrink-0 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 mr-2 sm:mr-3 text-[10px] sm:text-xs font-bold">C</span>
          <span className="font-semibold text-slate-700 truncate">{project.client?.name || "No Client Assigned"}</span>
        </div>
        <div className="flex items-center text-xs sm:text-sm min-w-0">
          <span className="flex-shrink-0 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 mr-2 sm:mr-3 text-[10px] sm:text-xs font-bold">D</span>
          <span className="text-slate-600 truncate">
            {project.developers?.length > 0 ? project.developers.map(d => d.name).join(", ") : "No Developers Assigned"}
          </span>
        </div>
      </div>

      <div className="mb-5 sm:mb-6">
        <div className="flex justify-between text-xs sm:text-sm mb-1.5 sm:mb-2">
          <span className="text-slate-500 font-bold text-[10px] sm:text-xs uppercase tracking-wider">Progress</span>
          <span className="text-indigo-600 font-extrabold">{completion}%</span>
        </div>
        <div className="w-full bg-slate-100 rounded-full h-1.5 sm:h-2">
          <div className="bg-indigo-600 h-1.5 sm:h-2 rounded-full transition-all duration-700 ease-out" style={{ width: `${completion}%` }} />
        </div>
      </div>

      <div className="flex flex-row gap-2 pt-4 border-t border-slate-100 mt-auto">
        <button onClick={(e) => {e.stopPropagation(); onEdit(project);}} className="flex-1 sm:flex-none px-4 py-2.5 text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-xl sm:rounded-lg text-sm font-bold transition">Edit</button>
        <button onClick={(e) => {e.stopPropagation(); handleDelete();}} className="flex-1 sm:flex-none px-4 py-2.5 text-red-600 bg-red-50 hover:bg-red-100 rounded-xl sm:rounded-lg text-sm font-bold transition">Delete</button>
      </div>
    </div>
  )
}

function DeveloperCard({ developer, reload, onEdit, onSuccess }) {
  async function handleDelete() {
    if (!window.confirm("Delete developer?")) return
    try {
      await api.delete(`/api/admin/developers/${developer.id}`)
      onSuccess("Developer removed successfully!")
      reload()
    } catch (err) { console.log(err) }
  }

  return (
    <div className="bg-white p-5 sm:p-6 rounded-2xl shadow-sm border border-slate-200 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 text-center">
      <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 shadow-md text-white font-bold text-xl sm:text-2xl">
        {developer.name[0].toUpperCase()}
      </div>
      <h3 className="font-bold text-base sm:text-lg text-slate-800 mb-0.5 sm:mb-1 truncate">{developer.name}</h3>
      <p className="text-xs sm:text-sm text-slate-500 font-medium truncate">{developer.email}</p>
      <p className="text-xs sm:text-sm text-slate-400 mt-0.5 sm:mt-1">{developer.ph}</p>

      <div className="flex flex-row justify-center gap-2 mt-5 sm:mt-6 pt-4 border-t border-slate-100">
        <button onClick={() => onEdit(developer)} className="flex-1 sm:flex-none text-indigo-600 text-xs sm:text-sm font-bold transition px-3 py-2 sm:py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 sm:bg-transparent">Edit</button>
        <button onClick={handleDelete} className="flex-1 sm:flex-none text-red-500 text-xs sm:text-sm font-bold transition px-3 py-2 sm:py-1.5 rounded-lg bg-red-50 hover:bg-red-100 sm:bg-transparent">Remove</button>
      </div>
    </div>
  )
}

function ClientCard({ client, reload, onEdit, onSuccess }) {
  async function handleDelete() {
    if (!window.confirm("Delete client?")) return
    try {
      await api.delete(`/api/admin/clients/${client.id}`)
      onSuccess("Client removed successfully!")
      reload()
    } catch (err) { console.log(err) }
  }

  return (
    <div className="bg-white p-5 sm:p-6 rounded-2xl shadow-sm border border-slate-200 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 text-center">
      <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-tr from-amber-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 shadow-md text-white font-bold text-xl sm:text-2xl">
        {client.name[0].toUpperCase()}
      </div>
      <h3 className="font-bold text-base sm:text-lg text-slate-800 mb-0.5 sm:mb-1 truncate">{client.name}</h3>
      <p className="text-xs sm:text-sm text-slate-500 font-medium truncate">{client.email}</p>
      <p className="text-xs sm:text-sm text-slate-400 mt-0.5 sm:mt-1">{client.ph}</p>

      <div className="flex flex-row justify-center gap-2 mt-5 sm:mt-6 pt-4 border-t border-slate-100">
        <button onClick={() => onEdit(client)} className="flex-1 sm:flex-none text-indigo-600 text-xs sm:text-sm font-bold transition px-3 py-2 sm:py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 sm:bg-transparent">Edit</button>
        <button onClick={handleDelete} className="flex-1 sm:flex-none text-red-500 text-xs sm:text-sm font-bold transition px-3 py-2 sm:py-1.5 rounded-lg bg-red-50 hover:bg-red-100 sm:bg-transparent">Remove</button>
      </div>
    </div>
  )
}