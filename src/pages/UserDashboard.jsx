import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/Api";
import {
  LayoutDashboard,
  FolderKanban,
  Settings,
  Search,
  Bell,
  User,
  Key,
  LogOut,
  Menu, // New icon for mobile hamburger menu
  X     // New icon for mobile close button
} from "lucide-react";

export default function UserDashboard() {
  const [activeTab, setActiveTab] = useState("DASHBOARD"); // DASHBOARD, PROJECTS, SETTINGS
  const [loading, setLoading] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false); // New state for mobile sidebar

  // Data States
  const [profile, setProfile] = useState({ name: "", email: "", ph: "", role: "" });
  const [projects, setProjects] = useState([]);

  // Form States
  const [profileForm, setProfileForm] = useState({ name: "", phone: "" });
  const [passwordForm, setPasswordForm] = useState({ oldPassword: "", newPassword: "" });
  const [message, setMessage] = useState({ type: "", text: "" });

  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    navigate("/login");
  };

  /* ================= LOAD DATA ================= */
  useEffect(() => {
    async function loadDashboardData() {
      try {
        setLoading(true);

        // 1. Fetch Client Profile
        const profileRes = await api.get("/api/client/profile");
        setProfile(profileRes.data);
        setProfileForm({ name: profileRes.data.name, phone: profileRes.data.ph });

        // 2. Fetch Projects
        const projectsRes = await api.get("/api/projects");
        const projectsData = projectsRes.data;

        // 3. Fetch Completion %
        const projectsWithProgress = await Promise.all(
          projectsData.map(async (p) => {
            try {
              const compRes = await api.get(`/api/tasks/project/${p.id}/completion`);
              const progressVal = compRes.data?.completion ?? compRes.data ?? 0;
              return { ...p, progress: progressVal };
            } catch (err) {
              return { ...p, progress: 0 };
            }
          })
        );

        setProjects(projectsWithProgress);
      } catch (err) {
        console.error("Dashboard Load Error:", err);
      } finally {
        setLoading(false);
      }
    }

    loadDashboardData();
  }, []);

  /* ================= HANDLERS ================= */
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      await api.put("/api/profile/update", profileForm);
      setProfile({ ...profile, name: profileForm.name, ph: profileForm.phone });
      setMessage({ type: "success", text: "Profile updated successfully!" });
    } catch (err) {
      setMessage({ type: "error", text: "Failed to update profile." });
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    try {
      await api.put("/api/profile/change-password", passwordForm);
      setMessage({ type: "success", text: "Password changed successfully!" });
      setPasswordForm({ oldPassword: "", newPassword: "" });
    } catch (err) {
      setMessage({ type: "error", text: "Failed to change password." });
    }
  };

  /* ================= RENDER HELPERS ================= */
  const ongoingProjects = projects.filter((p) => p.status === "ONGOING");
  const completedProjects = projects.filter((p) => p.status === "COMPLETED");

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <p className="text-lg font-semibold text-gray-500 animate-pulse">Loading Workspace...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans">
      
      {/* ========== MOBILE OVERLAY ========== */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 z-20 md:hidden transition-opacity"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* ========== SIDEBAR ========== */}
      {/* Updated with mobile fixed positioning and sliding animation */}
      <div className={`fixed inset-y-0 left-0 z-30 w-64 bg-[#161b2a] text-slate-300 flex flex-col transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"}`}>
        
        {/* Logo Area */}
        <div className="flex items-center justify-between px-6 py-6 mb-4">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-500 text-white font-bold h-8 w-8 rounded flex items-center justify-center">
              C
            </div>
            <h2 className="text-xl font-bold text-white tracking-wide">SyncClient</h2>
          </div>
          {/* Mobile Close Button */}
          <button className="md:hidden text-slate-400 hover:text-white" onClick={() => setIsMobileMenuOpen(false)}>
            <X size={20} />
          </button>
        </div>

        {/* Menu Items */}
        <div className="text-xs font-semibold text-slate-500 px-6 mb-2 mt-4 tracking-wider">MENU</div>
        <ul className="space-y-1">
          <SidebarItem
            icon={<LayoutDashboard size={20} />}
            label="Dashboard"
            active={activeTab === "DASHBOARD"}
            onClick={() => { setActiveTab("DASHBOARD"); setIsMobileMenuOpen(false); }}
          />
          <SidebarItem
            icon={<FolderKanban size={20} />}
            label="My Projects"
            active={activeTab === "PROJECTS"}
            onClick={() => { setActiveTab("PROJECTS"); setIsMobileMenuOpen(false); }}
          />
        </ul>

        <div className="text-xs font-semibold text-slate-500 px-6 mb-2 mt-8 tracking-wider">ACCOUNT</div>
        <ul className="space-y-1">
          <SidebarItem
            icon={<Settings size={20} />}
            label="Settings"
            active={activeTab === "SETTINGS"}
            onClick={() => {
              setActiveTab("SETTINGS");
              setMessage({ type: "", text: "" });
              setIsMobileMenuOpen(false);
            }}
          />
        </ul>
        <div className="mt-auto mb-6 px-4">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors duration-200"
          >
            <LogOut size={20} />
            <span className="font-medium text-sm">Log out</span>
          </button>
        </div>

      </div>

      {/* ========== MAIN CONTENT ========== */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">

        {/* NAVBAR */}
        <div className="h-16 bg-white flex items-center justify-between px-4 md:px-8 shadow-sm z-10">
          
          <div className="flex items-center gap-3 md:gap-0">
            {/* Mobile Menu Button */}
            <button className="md:hidden text-slate-500 hover:text-slate-800" onClick={() => setIsMobileMenuOpen(true)}>
              <Menu size={24} />
            </button>
            
            <div className="flex flex-col">
              <h1 className="font-bold text-lg md:text-xl text-slate-800">
                {activeTab === "DASHBOARD" && "Dashboard"}
                {activeTab === "PROJECTS" && "My Projects"}
                {activeTab === "SETTINGS" && "Profile Settings"}
              </h1>
              <span className="text-xs md:text-sm text-slate-500 hidden sm:block">Welcome back, {profile.name}</span>
            </div>
          </div>

          <div className="flex items-center gap-4 md:gap-6">
            {/* Search hidden on small screens to save space */}
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                placeholder="Search..."
                className="pl-10 pr-4 py-2 bg-slate-100 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 w-64"
              />
            </div>
            <Bell className="text-slate-400 cursor-pointer hover:text-slate-600" size={20} />
            <div className="flex items-center gap-3 border-l border-slate-200 pl-4 md:pl-6">
              <div className="text-right hidden md:block">
                <p className="text-sm font-semibold text-slate-700">{profile.name}</p>
                <p className="text-xs text-slate-500">Client</p>
              </div>
              <div className="h-9 w-9 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center shrink-0">
                {profile.name.charAt(0)}
              </div>
            </div>
          </div>
        </div>

        {/* SCROLLABLE CONTENT AREA */}
        <div className="flex-1 overflow-auto p-4 md:p-8">
          {/* Background Decorative Gradients */}
          <div className="fixed top-[-10%] left-[-10%] w-96 h-96 bg-indigo-400 rounded-full mix-blend-multiply filter blur-[128px] opacity-40 animate-blob pointer-events-none z-0"></div>
          <div className="fixed top-[20%] right-[-5%] w-96 h-96 bg-violet-300 rounded-full mix-blend-multiply filter blur-[128px] opacity-40 animate-blob animation-delay-2000 pointer-events-none z-0"></div>
          <div className="fixed bottom-[-20%] left-[20%] w-96 h-96 bg-fuchsia-300 rounded-full mix-blend-multiply filter blur-[128px] opacity-40 animate-blob animation-delay-4000 pointer-events-none z-0"></div>

          {/* TAB: DASHBOARD */}
          {activeTab === "DASHBOARD" && (
            <div className="max-w-6xl mx-auto relative z-10">
              {/* Stat Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-8">
                <StatCard title="TOTAL PROJECTS" value={projects.length} color="border-indigo-600" />
                <StatCard title="ONGOING" value={ongoingProjects.length} color="border-amber-400" />
                <StatCard title="COMPLETED" value={completedProjects.length} color="border-emerald-500" />
              </div>

              <h2 className="text-lg font-bold text-slate-800 mb-4">Recent Projects</h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
                {projects.slice(0, 3).map(p => <ProjectCard key={p.id} project={p} />)}
              </div>
            </div>
          )}

          {/* TAB: PROJECTS */}
          {activeTab === "PROJECTS" && (
            <div className="max-w-6xl mx-auto relative z-10">
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
                {projects.length === 0 ? (
                  <p className="text-slate-500 mt-10">No projects found.</p>
                ) : (
                  projects.map(p => <ProjectCard key={p.id} project={p} />)
                )}
              </div>
            </div>
          )}

          {/* TAB: SETTINGS */}
          {activeTab === "SETTINGS" && (
            <div className="max-w-3xl mx-auto space-y-6 md:space-y-8 relative z-10">
              {message.text && (
                <div className={`p-4 rounded-lg font-medium ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  {message.text}
                </div>
              )}

              {/* Update Profile Form */}
              <div className="bg-white p-5 md:p-6 rounded-xl shadow-sm border border-slate-100">
                <div className="flex items-center gap-2 border-b pb-4 mb-4">
                  <User className="text-indigo-600" size={24} />
                  <h2 className="text-lg font-bold text-slate-800">Profile Details</h2>
                </div>
                <form onSubmit={handleUpdateProfile} className="space-y-4">
                  {/* Changed to grid-cols-1 on mobile, md:grid-cols-2 on desktop */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-600 mb-1">Full Name</label>
                      <input
                        type="text"
                        value={profileForm.name}
                        onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-600 mb-1">Phone Number</label>
                      <input
                        type="text"
                        value={profileForm.phone}
                        onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-1">Email Address (Read Only)</label>
                    <input type="email" value={profile.email} disabled className="w-full px-4 py-2 border rounded-lg bg-slate-50 text-slate-400" />
                  </div>
                  <button type="submit" className="w-full md:w-auto bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition">
                    Save Changes
                  </button>
                </form>
              </div>

              {/* Change Password Form */}
              <div className="bg-white p-5 md:p-6 rounded-xl shadow-sm border border-slate-100">
                <div className="flex items-center gap-2 border-b pb-4 mb-4">
                  <Key className="text-indigo-600" size={24} />
                  <h2 className="text-lg font-bold text-slate-800">Change Password</h2>
                </div>
                <form onSubmit={handleChangePassword} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-1">Current Password</label>
                    <input
                      type="password"
                      value={passwordForm.oldPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, oldPassword: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-1">New Password</label>
                    <input
                      type="password"
                      value={passwordForm.newPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                      required
                    />
                  </div>
                  <button type="submit" className="w-full md:w-auto bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition">
                    Update Password
                  </button>
                </form>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

/* ================= SUB-COMPONENTS ================= */

function SidebarItem({ icon, label, active, onClick }) {
  return (
    <li
      onClick={onClick}
      className={`
        px-6 py-3 cursor-pointer flex items-center gap-3 transition-colors duration-200 select-none
        ${active ? "bg-indigo-600 text-white border-l-4 border-indigo-400" : "text-slate-400 hover:text-slate-200 hover:bg-[#1f263c] border-l-4 border-transparent"}
      `}
    >
      {icon}
      <span className="font-medium text-sm">{label}</span>
    </li>
  );
}

function StatCard({ title, value, color }) {
  return (
    <div className={`bg-white p-6 rounded-xl shadow-sm border-l-4 ${color}`}>
      <h3 className="text-xs font-bold text-slate-400 tracking-wider mb-2">{title}</h3>
      <p className="text-3xl font-bold text-slate-800">{value}</p>
    </div>
  );
}

function ProjectCard({ project }) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex flex-col h-full hover:shadow-md transition">

      {/* Header */}
      <div className="flex justify-between items-start mb-2 gap-2">
        <h3 className="font-bold text-slate-800 text-lg leading-tight line-clamp-2">{project.title}</h3>
        <span className={`px-2 py-1 text-[10px] font-bold tracking-wider rounded-full shrink-0 ${project.status === "ONGOING" ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700"
          }`}>
          {project.status}
        </span>
      </div>

      {/* Description */}
      <p className="text-slate-500 text-sm mb-6 flex-1 line-clamp-2">{project.description}</p>

      {/* Avatars mimicking the Admin view */}
      <div className="flex flex-col gap-2 mb-6">
        <div className="flex items-center gap-3 text-sm text-slate-600">
          <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-500 text-xs shrink-0">C</div>
          <span className="truncate">Client User</span>
        </div>
        <div className="flex items-center gap-3 text-sm text-slate-600">
          <div className="h-8 w-8 rounded-full bg-indigo-50 flex items-center justify-center font-bold text-indigo-500 text-xs shrink-0">D</div>
          <span className="truncate">Dev Team</span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mt-auto">
        <div className="flex justify-between items-end mb-1">
          <span className="text-xs font-bold text-slate-500 tracking-wider">PROGRESS</span>
          <span className="text-sm font-bold text-indigo-600">{project.progress}%</span>
        </div>
        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-indigo-600 rounded-full transition-all duration-500"
            style={{ width: `${project.progress}%` }}
          />
        </div>
      </div>
    </div>
  );
}