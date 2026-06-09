import { useEffect, useState } from "react";
import axios from "axios";

function Projects() {
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const token = localStorage.getItem("access");

      const res = await axios.get(
        "https://taskforge-698p.onrender.com/api/projects/",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setProjects(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div>
      <h1>Projects</h1>

      {projects.map((project) => (
        <div
          key={project.id}
          style={{
            border: "1px solid black",
            margin: "10px",
            padding: "10px",
          }}
        >
          <h3>{project.title}</h3>
          <p>{project.description}</p>
          <p>Budget: {project.budget}</p>
          <p>Status: {project.status}</p>
        </div>
      ))}
    </div>
  );
}

export default Projects;
