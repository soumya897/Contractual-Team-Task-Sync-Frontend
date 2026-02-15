import LandingNavbar from "../components/LandingNavbar"

export default function Home() {

  return (
    <div>

      <LandingNavbar />

      {/* Hero Section */}
      <section className="min-h-screen flex items-center justify-center bg-gray-100">

        <div className="text-center max-w-xl">

          <h1 className="text-4xl font-bold mb-4">
            Manage Your Team Tasks Easily
          </h1>

          <p className="text-gray-600 mb-6">
            A powerful task management platform for
            Users, Developers, and Admins.
          </p>

          <div className="space-x-4">

            <a
              href="/login"
              className="bg-blue-600 text-white px-6 py-3 rounded"
            >
              Get Started
            </a>

            <a
              href="/register"
              className="border border-blue-600 text-blue-600 px-6 py-3 rounded"
            >
              Create Account
            </a>

          </div>

        </div>

      </section>

    </div>
  )
}
