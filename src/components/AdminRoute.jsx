// src/components/AdminRoute.jsx
import { Navigate, Outlet } from 'react-router-dom';

const AdminRoute = () => {
  const isAdmin = localStorage.getItem("isAdmin") === "true";

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default AdminRoute;
