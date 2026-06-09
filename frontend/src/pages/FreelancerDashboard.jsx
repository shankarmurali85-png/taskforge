import { useEffect, useState } from "react";
import axios from "axios";

const API_BASE = "http://127.0.0.1:8000/api";

function FreelancerDashboard() {
  const [user, setUser] = useState(null);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [bidForms, setBidForms] = useState({});
  const [deliveryForms, setDeliveryForms] = useState({});

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
      setProjects(projectsRes.data);
    } catch (err) {
      setError("Failed to load dashboard data.");
    } finally {
      setLoading(false);
    }
  };

  const updateBidForm = (projectId, field, value) => {
    setBidForms((current) => ({
      ...current,
      [projectId]: {
        ...current[projectId],
        [field]: value,
      },
    }));
  };

  const updateDeliveryForm = (projectId, field, value) => {
    setDeliveryForms((current) => ({
      ...current,
      [projectId]: {
        ...current[projectId],
        [field]: value,
      },
    }));
  };

  const handleBidSubmit = async (event, projectId) => {
    event.preventDefault();
    setError("");

    try {
      const form = bidForms[projectId] || {};
      await axios.post(
        `${API_BASE}/bids/create/`,
        {
          project: projectId,
          amount: form.amount || "",
          proposal: form.proposal || "",
        },
        getAuthConfig()
      );

      setBidForms((current) => ({
        ...current,
        [projectId]: { amount: "", proposal: "" },
      }));
      await loadDashboard();
    } catch (err) {
      const apiError = err.response?.data;
      setError(
        apiError?.non_field_errors?.[0] ||
          apiError?.project?.[0] ||
          "Failed to place bid."
      );
    }
  };

  const handleBidUpdate = async (event, bidId, projectId) => {
    event.preventDefault();
    setError("");

    try {
      const form = bidForms[projectId] || {};
      await axios.patch(
        `${API_BASE}/bids/${bidId}/`,
        {
          amount: form.amount || "",
          proposal: form.proposal || "",
        },
        getAuthConfig()
      );

      await loadDashboard();
    } catch (err) {
      const apiError = err.response?.data;
      setError(
        apiError?.non_field_errors?.[0] ||
          apiError?.detail ||
          "Failed to update bid."
      );
    }
  };

  const handleDeliverySubmit = async (event, projectId) => {
    event.preventDefault();
    setError("");

    try {
      const form = deliveryForms[projectId] || {};
      await axios.post(
        `${API_BASE}/deliveries/create/`,
        {
          project: projectId,
          work_link: form.work_link || "",
          message: form.message || "",
        },
        getAuthConfig()
      );

      setDeliveryForms((current) => ({
        ...current,
        [projectId]: { work_link: "", message: "" },
      }));
      await loadDashboard();
    } catch (err) {
      const apiError = err.response?.data;
      console.log(err.response.data);
alert(JSON.stringify(err.response.data));
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    localStorage.removeItem("user");
    window.location.href = "/";
  };

  if (loading) {
    return <div>Loading freelancer dashboard...</div>;
  }

  const openProjects = projects.filter((project) => project.status === "open");
  const myBids = projects
    .flatMap((project) =>
      project.bids
        .filter((bid) => bid.freelancer === user?.id)
        .map((bid) => ({
          ...bid,
          projectTitle: project.title,
        }))
    );
  const assignedProjects = projects.filter((project) =>
    project.bids.some(
      (bid) => bid.freelancer === user?.id && bid.status === "accepted"
    )
  );

  return (
    <div style={{ padding: "24px" }}>
      <h1>Freelancer Dashboard</h1>
      <p>Welcome, {user?.username}</p>

      {error ? <p style={{ color: "red" }}>{error}</p> : null}

      <h2>Browse Projects</h2>
      {openProjects.length === 0 ? <p>No open projects available.</p> : null}

      {openProjects.map((project) => {
        const myBid = project.bids.find((bid) => bid.freelancer === user?.id);
        const bidForm = bidForms[project.id] || { amount: "", proposal: "" };

        return (
          <div
            key={project.id}
            style={{
              border: "1px solid black",
              padding: "12px",
              marginBottom: "16px",
            }}
          >
            <h3>{project.title}</h3>
            <p>Client: {project.client_username}</p>
            <p>{project.description}</p>
            <p>Budget: {project.budget}</p>

            {myBid ? (
              <form
                onSubmit={(event) => handleBidUpdate(event, myBid.id, project.id)}
              >
                <p>Current bid status: {myBid.status}</p>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="Bid amount"
                  value={bidForm.amount || myBid.amount}
                  onChange={(event) =>
                    updateBidForm(project.id, "amount", event.target.value)
                  }
                  disabled={myBid.status !== "pending"}
                />
                <br />
                <textarea
                  placeholder="Proposal"
                  value={bidForm.proposal || myBid.proposal}
                  onChange={(event) =>
                    updateBidForm(project.id, "proposal", event.target.value)
                  }
                  disabled={myBid.status !== "pending"}
                />
                <br />
                <button type="submit" disabled={myBid.status !== "pending"}>
                  Update Bid
                </button>
              </form>
            ) : (
              <form onSubmit={(event) => handleBidSubmit(event, project.id)}>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="Bid amount"
                  value={bidForm.amount}
                  onChange={(event) =>
                    updateBidForm(project.id, "amount", event.target.value)
                  }
                />
                <br />
                <textarea
                  placeholder="Proposal"
                  value={bidForm.proposal}
                  onChange={(event) =>
                    updateBidForm(project.id, "proposal", event.target.value)
                  }
                />
                <br />
                <button type="submit">Place Bid</button>
              </form>
            )}
          </div>
        );
      })}

      <h2>My Bids</h2>
      {myBids.length === 0 ? <p>No bids placed yet.</p> : null}
      {myBids.map((bid) => (
        <div key={bid.id} style={{ marginBottom: "8px" }}>
          <p>
            {bid.projectTitle}: {bid.amount} ({bid.status})
          </p>
        </div>
      ))}

      <h2>Assigned Projects</h2>
      {assignedProjects.length === 0 ? <p>No accepted assignments yet.</p> : null}
      {assignedProjects.map((project) => {
        const hasDelivery = project.delivery_set.some(
          (delivery) => delivery.freelancer === user?.id
        );
        const deliveryForm = deliveryForms[project.id] || {
          work_link: "",
          message: "",
        };

        return (
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
            <p>Status: {project.status}</p>

            {hasDelivery ? (
              <p>Delivery already submitted.</p>
            ) : (
              <form
                onSubmit={(event) => handleDeliverySubmit(event, project.id)}
              >
                <input
                  placeholder="Work link"
                  value={deliveryForm.work_link}
                  onChange={(event) =>
                    updateDeliveryForm(project.id, "work_link", event.target.value)
                  }
                />
                <br />
                <textarea
                  placeholder="Delivery message"
                  value={deliveryForm.message}
                  onChange={(event) =>
                    updateDeliveryForm(project.id, "message", event.target.value)
                  }
                />
                <br />
                <button type="submit">Submit Delivery</button>
              </form>
            )}
          </div>
        );
      })}

      <button onClick={handleLogout}>Logout</button>
    </div>
  );
}

export default FreelancerDashboard;
