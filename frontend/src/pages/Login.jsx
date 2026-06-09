import { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async () => {
  try {
    const res = await axios.post(
      "http://127.0.0.1:8000/api/login/",
      {
        username,
        password,
      }
    );

    console.log(res.data);

    localStorage.setItem("access", res.data.access);
    localStorage.setItem("refresh", res.data.refresh);

    const userRes = await axios.get(
      "http://127.0.0.1:8000/api/me/",
      {
        headers: {
          Authorization: `Bearer ${res.data.access}`,
        },
      }
    );

    localStorage.setItem("user", JSON.stringify(userRes.data));

    alert("Login Successful");

    if (userRes.data.role === "client") {
      navigate("/client-dashboard");
      return;
    }

    if (userRes.data.role === "freelancer") {
      navigate("/freelancer-dashboard");
      return;
    }
  } catch (err) {
    alert(
      err.response?.data?.detail ||
        "Invalid Credentials"
    );
  }
};

  return (
    <div className="container">
      <div className="card">
        <h1>TaskForge Login</h1>

        <input
          placeholder="Username"
          onChange={(e) => setUsername(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          onChange={(e) => setPassword(e.target.value)}
        />

        <button onClick={handleLogin}>Login</button>

        <p>
          <Link to="/register">Create Account</Link>
        </p>

        <p>
          <Link to="/forgot-password">Forgot Password?</Link>
        </p>
      </div>
    </div>
  );
}
