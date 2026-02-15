export default function ProjectCard({ name }) {

  return (
    <div
      className="bg-white p-4 rounded shadow hover:shadow-lg cursor-pointer"
    >

      <h3 className="font-bold text-lg">
        {name}
      </h3>

      <p className="text-gray-500 text-sm mt-1">
        Click to open board
      </p>

    </div>
  )
}
