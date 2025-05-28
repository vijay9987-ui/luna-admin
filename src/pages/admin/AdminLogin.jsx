import { useState } from "react";
import { useNavigate } from "react-router-dom";

const AdminLogin = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Dummy admin credentials
    const adminEmail = "admin@gmail.com";
    const adminPassword = "admin123";

    if (
      formData.email === adminEmail &&
      formData.password === adminPassword
    ) {
      // In real implementation, use token/session
      localStorage.setItem("isAdmin", "true");
      navigate("/dashboard");
    } else {
      setError("Invalid admin credentials");
    }
  };

  return (
    <div className="container-fluid min-vh-100 d-flex justify-content-center align-items-center bg-light">
      <div className="card p-4 shadow-sm border-0 w-100" style={{ maxWidth: "400px" }}>
        <h2 className="text-center mb-4 text-primary">Admin Login</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="email" className="form-label">Email address</label>
            <input
              type="email"
              id="email"
              name="email"
              className="form-control"
              placeholder="admin@luna.com"
              value={formData.email}
              onChange={handleChange}
              autoComplete="username"
              required
            />
          </div>
          <div className="mb-3">
            <label htmlFor="password" className="form-label">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              className="form-control"
              placeholder="Enter password"
              value={formData.password}
              onChange={handleChange}
              autoComplete="current-password"
              required
            />
          </div>
          {error && <div className="alert alert-danger py-1 text-center">{error}</div>}
          <div className="d-grid">
            <button type="submit" className="btn btn-primary">
              Login
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
