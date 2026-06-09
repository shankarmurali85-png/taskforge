import { useState } from "react";
import axios from "axios";
import { useSearchParams, useNavigate } from "react-router-dom";

function ResetPassword() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [params] = useSearchParams();
  const navigate = useNavigate();

  const user_id = params.get("user_id");
  const token = params.get("token");

  const handleResetPassword = async () => {
    if (!password || !confirmPassword) {
      alert("Please fill all fields");
      return;
    }

    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    try {
      const response = await axios.post(
        "https://taskforge-698p.onrender.com/api/reset-password/",
        {
          user_id,
          token,
          new_password: password,
        }
      );

      alert(response.data.message || "Password Reset Successful");

      navigate("/");
    } catch (error) {
      alert(
        error.response?.data?.error ||
          "Password Reset Failed"
      );
    }
  };

  return (
    <div className="container">
      <div className="card">
        <h1>Reset Password</h1>

        <p>
          Resetting password for account ID:
          <strong> {user_id}</strong>
        </p>

        <input
          type="password"
          placeholder="New Password"
          value={password}
          onChange={(e) =>
            setPassword(e.target.value)
          }
        />

        <input
          type="password"
          placeholder="Confirm Password"
          value={confirmPassword}
          onChange={(e) =>
            setConfirmPassword(e.target.value)
          }
        />

        <button onClick={handleResetPassword}>
          Reset Password
        </button>
      </div>
    </div>
  );
}

export default ResetPassword;
