import { Link } from "react-router-dom"
import LandingNavbar from "../components/LandingNavbar"

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-indigo-100 selection:text-indigo-900">
      
      <LandingNavbar />

      {/* Hero Section */}
      <section className="relative flex items-center justify-center min-h-[calc(100vh-4rem)] overflow-hidden">
        
        {/* Background Decorative Gradients */}
        <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-indigo-400 rounded-full mix-blend-multiply filter blur-[128px] opacity-40 animate-blob"></div>
        <div className="absolute top-[20%] right-[-5%] w-96 h-96 bg-violet-300 rounded-full mix-blend-multiply filter blur-[128px] opacity-40 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-[-20%] left-[20%] w-96 h-96 bg-fuchsia-300 rounded-full mix-blend-multiply filter blur-[128px] opacity-40 animate-blob animation-delay-4000"></div>

        {/* Main Content */}
        <div className="relative z-10 text-center max-w-4xl px-6 mx-auto flex flex-col items-center">
          
          {/* Top Badge */}
          <div className="mb-8 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-slate-200 shadow-sm">
            <span className="flex h-2 w-2 rounded-full bg-indigo-600"></span>
            <span className="text-sm font-semibold text-slate-700 tracking-wide">Sync Your Contractual Workflow</span>
          </div>

          {/* Heading */}
          <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 tracking-tight mb-6 leading-tight">
            Manage Your Team <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">
              Tasks Easily
            </span>
          </h1>

          {/* Subheading */}
          <p className="text-lg md:text-xl text-slate-600 mb-10 max-w-2xl mx-auto leading-relaxed">
            A powerful, unified task management platform designed to seamlessly bridge the gap between Clients, Developers, and Admins.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto">
            
            <Link
              to="/login"
              className="w-full sm:w-auto px-8 py-3.5 bg-indigo-600 text-white font-semibold rounded-full shadow-md shadow-indigo-200 hover:bg-indigo-700 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
            >
              Get Started
            </Link>

            <a
              href="/register"
              className="w-full sm:w-auto px-8 py-3.5 bg-white text-slate-700 font-semibold rounded-full border border-slate-200 shadow-sm hover:bg-slate-50 hover:border-slate-300 hover:-translate-y-0.5 transition-all duration-200"
            >
              Create Account
            </a>

          </div>

          {/* Optional Trust/Stats text below buttons */}
          <p className="mt-8 text-sm font-medium text-slate-400">
            Trusted by modern contractual teams worldwide.
          </p>

        </div>
      </section>

    </div>
  )
}