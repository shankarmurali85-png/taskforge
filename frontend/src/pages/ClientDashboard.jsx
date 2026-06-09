import { useEffect, useState } from "react";
import axios from "axios";

const API_BASE = "http://127.0.0.1:8000/api";

function ClientDashboard() {
  const [user, setUser] = useState(null);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    title: "",
    description: "",
    budget: "",
  });

  useEffect(() => {
    loadDashboard();
  }, []);

  const getAuthConfig = () => {
    const token = localStorage.getItem("access");
    return {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
  };

  const loadDashboard = async () => {
    setLoading(true);
    setError("");

    try {
      const authConfig = getAuthConfig();
      const [userRes, projectsRes] = await Promise.all([
        axios.get(`${API_BASE}/me/`, authConfig),
        axios.get(`${API_BASE}/projects/`, authConfig),
      ]);

      setUser(userRes.data);
      setProjects(
        projectsRes.data.filter((project) => project.client === userRes.data.id)
      );
    } catch (err) {
      setError("Failed to load dashboard data.");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async (event) => {
    event.preventDefault();
    setError("");

    try {
      await axios.post(`${API_BASE}/projects/create/`, form, getAuthConfig());
      setForm({
        title: "",
        description: "",
        budget: "",
      });
      await loadDashboard();
    } catch (err) {
      setError("Failed to create project.");
    }
  };

  const handleAcceptBid = async (bidId) => {
    setError("");

    try {
      await axios.post(`${API_BASE}/bids/${bidId}/accept/`, {}, getAuthConfig());
      await loadDashboard();
    } catch (err) {
      setError(err.response?.data?.error || "Failed to accept bid.");
    }
  };

  const handleCompleteProject = async (projectId) => {
    setError("");

    try {
      await axios.post(
        `${API_BASE}/projects/${projectId}/complete/`,
        {},
        getAuthConfig()
      );
      await loadDashboard();
    } catch (err) {
      setError(err.response?.data?.error || "Failed to complete project.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    localStorage.removeItem("user");
    window.location.href = "/";
  };

  if (loading) {
    return <div>Loading client dashboard...</div>;
  }

  return (
    <div style={{ padding: "24px" }}>
      <h1>Client Dashboard</h1>
      <p>Welcome, {user?.username}</p>

      {error ? <p style={{ color: "red" }}>{error}</p> : null}

      <form onSubmit={handleCreateProject} style={{ marginBottom: "24px" }}>
        <h2>Create Project</h2>
        <input
          placeholder="Title"
          value={form.title}
          onChange={(event) =>
            setForm({ ...form, title: event.target.value })
          }
        />
        <br />
        <textarea
          placeholder="Description"
          value={form.description}
          onChange={(event) =>
            setForm({ ...form, description: event.target.value })
          }
        />
        <br />
        <input
          placeholder="Budget"
          type="number"
          min="0"
          step="0.01"
          value={form.budget}
          onChange={(event) =>
            setForm({ ...form, budget: event.target.value })
          }
        />
        <br />
        <button type="submit">Create Project</button>
      </form>

      <h2>My Projects</h2>
      {projects.length === 0 ? <p>No projects yet.</p> : null}

      {projects.map((project) => (
        <div
          key={project.id}
          style={{
            border: "1px solid black",
            padding: "12px",
            marginBottom: "16px",
          }}
        >
          <h3>{project.title}</h3>
          <p>{project.description}</p>
          <p>Budget: {project.budget}</p>
          <p>Status: {project.status}</p>

          <h4>Bids</h4>
          {project.bids.length === 0 ? <p>No bids yet.</p> : null}
          {project.bids.map((bid) => (
            <div
              key={bid.id}
              style={{
                border: "1px solid #999",
                padding: "8px",
                marginBottom: "8px",
              }}
            >
              <p>Freelancer: {bid.freelancer_username}</p>
              <p>Amount: {bid.amount}</p>
              <p>Proposal: {bid.proposal}</p>
              <p>Status: {bid.status}</p>

              {project.status === "open" && bid.status === "pending" ? (
                <button onClick={() => handleAcceptBid(bid.id)}>
                  Accept Bid
                </button>
              ) : null}
            </div>
          ))}

          <h4>Deliveries</h4>
          {project.delivery_set.length === 0 ? <p>No delivery yet.</p> : null}
          {project.delivery_set.map((delivery) => (
            <div key={delivery.id}>
              <p>Freelancer: {delivery.freelancer_username}</p>
              <p>
                Work Link:{" "}
                <a href={delivery.work_link} target="_blank" rel="noreferrer">
                  {delivery.work_link}
                </a>
              </p>
              <p>Message: {delivery.message}</p>
            </div>
          ))}

          {project.status === "in_progress" && project.delivery_set.length > 0 ? (
            <button onClick={() => handleCompleteProject(project.id)}>
              Mark Complete
            </button>
          ) : null}
        </div>
      ))}

      <button onClick={handleLogout}>Logout</button>
    </div>
  );
}

export default ClientDashboard;
