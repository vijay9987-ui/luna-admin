import { Routes, Route } from "react-router-dom";
import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/Dashboard";
import Users from "./pages/admin/Users";
import Products from "./pages/admin/Products";
import Orders from "./pages/admin/Orders";
import Revenue from "./pages/admin/Revenue";
import AdminLayout from "./Layouts/AdminLayout";
import AdminRoute from "./components/AdminRoute";
import AdminBannerManager from "./pages/admin/AdminBannerManager";

function App() {
  return (
    <Routes>
      <Route path="/" element={<AdminLogin />} />

      {/* Protected Admin Routes */}
      <Route element={<AdminRoute />}>
        <Route element={<AdminLayout />}>
          <Route path="/dashboard" element={<AdminDashboard />} />
          <Route path="/users" element={<Users />} />
          <Route path="/products" element={<Products />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/revenue" element={<Revenue />} />
          <Route path="/banners" element={<AdminBannerManager />} />
        </Route>
      </Route>
    </Routes>
  );
}

export default App;
