import { Outlet, Link, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import ProfileModal from './ProfileModal';
import SettingsModal from './SettingsModal';

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const location = useLocation();

  const NavItem = ({ to, text, icon }) => {
    const isActive = location.pathname.startsWith(to);
    return (
      <Link
        to={to}
        className={`d-flex align-items-center px-3 py-2 text-decoration-none sidebar-link ${
          sidebarOpen ? 'justify-content-start' : 'justify-content-center'
        } ${isActive ? 'bg-light text-dark fw-semibold' : 'text-white'}`}
        style={{
          borderRadius: '0.375rem',
          transition: 'all 0.2s ease',
        }}
      >
        <i className={`me-2 ${icon}`}></i>
        {sidebarOpen && <span>{text}</span>}
      </Link>
    );
  };

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('isAdmin');
    window.location.href = '/';
  };

  return (
    <div className="d-flex flex-column flex-md-row vh-100">
      {/* Sidebar */}
      <nav
        className={` text-white d-md-flex flex-column p-2 position-fixed top-0 start-0 h-100 ${
          sidebarOpen ? 'sidebar-open' : 'sidebar-collapsed'
        }`}
        style={{
          width: sidebarOpen ? '240px' : '70px',
          transition: 'width 0.3s',
          zIndex: 1030,
          background: "linear-gradient(to right, #A66CFF, #9C9EFE, #A66CFF)"

        }}
      >
        <div className="d-flex align-items-center justify-content-between px-2 mb-3 border-bottom pb-2">
          {sidebarOpen && <h4 className="mb-0 fs-6">Admin Panel</h4>}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="btn btn-sm btn-outline-light ms-auto"
            title={sidebarOpen ? 'Collapse' : 'Expand'}
          >
            <i className={`fas ${sidebarOpen ? 'fa-angle-left' : 'fa-angle-right'}`}></i>
          </button>
        </div>

        <div className="flex-grow-1 mt-2 d-flex flex-column gap-2">
          <NavItem to="/dashboard" text="Dashboard" icon="fas fa-tachometer-alt" />
          <NavItem to="/users" text="Users" icon="fas fa-users" />
          <NavItem to="/products" text="Products" icon="fas fa-box-open" />
          <NavItem to="/orders" text="Orders" icon="fas fa-shopping-cart" />
          <NavItem to="/revenue" text="Revenue" icon="fas fa-chart-line" />
          <NavItem to="/banners" text="Banners" icon="fas fa-images" />
          <NavItem to="/" text="Logout" icon="fas fa-sign-out-alt" />

        </div>
      </nav>

      {/* Main Content */}
      <div
        className="flex-grow-1 d-flex flex-column overflow-hidden"
        style={{ marginLeft: sidebarOpen ? '240px' : '70px', transition: 'margin-left 0.3s' }}
      >
        {/* Header */}
        <header className="bg-white shadow-sm px-3 py-2 d-flex justify-content-between align-items-center border-bottom w-100">
          <div className="d-flex align-items-center gap-3">
            <button
              className="btn btn-outline-dark d-md-none"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <i className="fas fa-bars"></i>
            </button>
            <h5 className="mb-0">Admin Panel</h5>
          </div>

          <div className="d-flex align-items-center gap-3">
            <button className="btn btn-light position-relative" title="Notifications">
              <i className="fas fa-bell me-1"></i>
              <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                3
              </span>
            </button>

            <div className="dropdown">
              <button className="btn btn-light dropdown-toggle" type="button" data-bs-toggle="dropdown">
                Admin User
              </button>
              <ul className="dropdown-menu dropdown-menu-end shadow-sm">
                <li>
                  <button className="dropdown-item" onClick={() => setShowProfileModal(true)}>
                    Profile
                  </button>
                </li>
                <li>
                  <button className="dropdown-item" onClick={() => setShowSettingsModal(true)}>
                    Settings
                  </button>
                </li>
                <li><hr className="dropdown-divider" /></li>
                <li>
                  <button className="dropdown-item text-danger" onClick={handleLogout}>
                    Logout
                  </button>
                </li>
              </ul>
            </div>
          </div>
        </header>

        {/* Main Section */}
        <main className="p-3 overflow-auto flex-grow-1">
          <Outlet />
        </main>
      </div>

      {/* Modals */}
      {showProfileModal && <ProfileModal onClose={() => setShowProfileModal(false)} />}
      {showSettingsModal && <SettingsModal onClose={() => setShowSettingsModal(false)} />}
    </div>
  );
};

export default AdminLayout;
