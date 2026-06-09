import { useState } from "react";
import axios from "axios";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");

  const sendLink = async () => {
    try {
      await axios.post(
        "https://taskforge-698p.onrender.com/api/forgot-password/",
        { email }
      );

      alert("Reset link sent");
    } catch {
      alert("Something went wrong");
    }
  };

  return (
    <div className="container">
      <div className="card">
        <h1>Forgot Password</h1>

        <input
          placeholder="Email"
          onChange={(e) => setEmail(e.target.value)}
        />

        <button onClick={sendLink}>
          Send Reset Link
        </button>
      </div>
    </div>
  );
}
