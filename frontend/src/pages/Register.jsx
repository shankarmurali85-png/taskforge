import { useState } from "react";
import axios from "axios";

export default function Register() {
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    role: "client",
  });

  const register = async () => {
    try {
      await axios.post(
        "https://taskforge-698p.onrender.com/api/register/",
        form
      );

      alert("Registration Successful");
    } catch (err) {
      console.log(err.response?.data);
      alert(JSON.stringify(err.response?.data));
    }
  };

  return (
    <div className="container">
      <div className="card">
        <h1>Create Account</h1>

        <input
          placeholder="Username"
          onChange={(e) =>
            setForm({ ...form, username: e.target.value })
          }
        />

        <input
          placeholder="Email"
          onChange={(e) =>
            setForm({ ...form, email: e.target.value })
          }
        />

        <input
          type="password"
          placeholder="Password"
          onChange={(e) =>
            setForm({ ...form, password: e.target.value })
          }
        />

        <select
          onChange={(e) =>
            setForm({ ...form, role: e.target.value })
          }
        >
          <option value="client">Client</option>
          <option value="freelancer">Freelancer</option>
        </select>

        <button onClick={register}>Register</button>
      </div>
    </div>
  );
}
