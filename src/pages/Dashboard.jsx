import MainLayout from "../layouts/MainLayout"
import ProjectCard from "../components/ProjectCard"

export default function Dashboard() {

  const projects = [
    "Frontend App",
    "Backend API",
    "Placement Prep",
    "Final Year Project"
  ]

  return (

    <MainLayout>

      <h2 className="text-2xl font-bold mb-4">
        Projects
      </h2>

      <div className="grid grid-cols-3 gap-4">

        {projects.map((project, index) => (
          <ProjectCard
            key={index}
            name={project}
          />
        ))}

      </div>

    </MainLayout>

  )
}
