import { useState, useEffect } from 'react';
import axios from 'axios';

const Users = () => {
  const [showModal, setShowModal] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    fullName: '',
    mobileNumber: '',
    profile: {
      firstName: '',
      lastName: '',
      gender: 'Male',
      email: ''
    },
    isAdmin: false,
    status: 'Active'
  });
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 10;

  // Fetch all users on component mount
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const response = await axios.get('https://luna-backend-1.onrender.com/api/users/users');
        setUsers(response.data);
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to fetch users');
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // Get current users for pagination
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = users.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(users.length / usersPerPage);

  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Go to next page
  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  // Go to previous page
  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name.includes('profile.')) {
      const profileField = name.split('.')[1];
      setFormData({
        ...formData,
        profile: {
          ...formData.profile,
          [profileField]: value
        }
      });
    } else {
      setFormData({
        ...formData,
        [name]: name === 'isAdmin' ? value === 'Admin' : value
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      let userId;

      if (currentUser) {
        // Update existing user
        userId = currentUser._id;
        
        // Update base user info
        await axios.put(`https://luna-backend-1.onrender.com/api/users/setuser/${userId}`, {
          fullName: formData.fullName,
          mobileNumber: formData.mobileNumber,
          isAdmin: formData.isAdmin,
          status: formData.status
        });

        // Update profile data
        await axios.put(`https://luna-backend-1.onrender.com/api/users/updateuser/${userId}`, {
          firstName: formData.profile.firstName,
          lastName: formData.profile.lastName,
          gender: formData.profile.gender,
          email: formData.profile.email,
          mobile: formData.mobileNumber
        });
      } else {
        // Register new user
        const registerRes = await axios.post('https://luna-backend-1.onrender.com/api/users/register', {
          fullName: `${formData.profile.firstName} ${formData.profile.lastName}`,
          email: formData.profile.email,
          mobileNumber: formData.mobileNumber,
          password: 'defaultPassword',
          confirmPassword: 'defaultPassword'
        });

        userId = registerRes.data.userId;

        // Create profile data
        await axios.post(`https://luna-backend-1.onrender.com/api/users/user/createprofiledata/${userId}`, {
          firstName: formData.profile.firstName,
          lastName: formData.profile.lastName,
          gender: formData.profile.gender,
          email: formData.profile.email,
          mobile: formData.mobileNumber
        });

        // Set admin status if needed
        if (formData.isAdmin) {
          await axios.put(`https://luna-backend-1.onrender.com/api/users/setuser/${userId}`, {
            isAdmin: true
          });
        }
      }

      // Refresh user list
      const { data } = await axios.get('https://luna-backend-1.onrender.com/api/users/users');
      setUsers(data);
      setShowModal(false);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || err.response?.data?.message || "Something went wrong");
    }
  };

  // Delete user
  const handleDelete = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await axios.delete(`https://luna-backend-1.onrender.com/api/users/delete/${userId}`);
        setUsers(users.filter(user => user._id !== userId));
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to delete user');
      }
    }
  };

  // Open modal for editing
  const openEditModal = async (user) => {
    try {
      const { data } = await axios.get(`https://luna-backend-1.onrender.com/api/users/getuser/${user._id}`);
      
      setCurrentUser(user);
      setFormData({
        fullName: user.fullName || '',
        mobileNumber: data.mobileNumber || user.mobileNumber || '',
        profile: {
          firstName: data.profile?.firstName || '',
          lastName: data.profile?.lastName || '',
          gender: data.profile?.gender || 'Male',
          email: data.email || data.profile?.email || ''
        },
        isAdmin: user.isAdmin || false,
        status: user.status || 'Active'
      });
      setShowModal(true);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch user details');
    }
  };

  // Reset form when opening for new user
  const openNewModal = () => {
    setCurrentUser(null);
    setFormData({
      fullName: '',
      mobileNumber: '',
      profile: {
        firstName: '',
        lastName: '',
        gender: 'Male',
        email: ''
      },
      isAdmin: false,
      status: 'Active'
    });
    setShowModal(true);
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '50vh' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger" role="alert">
        Error: {error}
      </div>
    );
  }

  return (
    <div className="container-fluid py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="h3 mb-0 text-primary">User Management</h1>
        <button
          onClick={openNewModal}
          className="btn btn-lg"
          style={{ background: "linear-gradient(to right, #A66CFF, #9C9EFE)", color: "white" }}
        >
          <i className="fas fa-plus me-2"></i>Add New User
        </button>
      </div>

      {error && (
        <div className="alert alert-danger alert-dismissible fade show mb-4" role="alert">
          {error}
          <button type="button" className="btn-close" onClick={() => setError(null)}></button>
        </div>
      )}

      <div className="card shadow-sm">
        <div className="card-header text-white" style={{ background: "linear-gradient(to right, #A66CFF, #9C9EFE)" }}>
          <h6 className="m-0 font-weight-bold">Users List</h6>
        </div>
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover mb-0">
              <thead className="table-light">
                <tr>
                  <th className="ps-4">fullName</th>
                  <th>Profile Name</th>
                  <th>Mobile</th>
                  <th>Email</th>
                  <th className="pe-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentUsers.length > 0 ? (
                  currentUsers.map((user) => (
                    <tr key={user._id}>
                      <td className="ps-4">{user.fullName || '-'}</td>
                      <td>{user.profile?.firstName || ''} {user.profile?.lastName || ''}</td>
                      <td>{user.mobileNumber || '-'}</td>
                      <td>{user.email || user.profile?.email || '-'}</td>
                      <td className="pe-4">
                        <div className="d-flex">
                          <button
                            onClick={() => openEditModal(user)}
                            className="btn btn-sm btn-outline-primary me-2"
                            title="Edit"
                          >
                            <i className="fas fa-edit"></i>
                          </button>
                          <button
                            onClick={() => handleDelete(user._id)}
                            className="btn btn-sm btn-outline-danger"
                            title="Delete"
                          >
                            <i className="fas fa-trash-alt"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="text-center py-4">
                      No users found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
        <div className="card-footer d-flex justify-content-between align-items-center">
          <div>
            Showing {indexOfFirstUser + 1} to {Math.min(indexOfLastUser, users.length)} of {users.length} users
          </div>
          <nav>
            <ul className="pagination mb-0">
              <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                <button className="page-link" onClick={prevPage} disabled={currentPage === 1}>
                  Previous
                </button>
              </li>
              {Array.from({ length: totalPages }).map((_, index) => (
                <li key={index} className={`page-item ${currentPage === index + 1 ? 'active' : ''}`}>
                  <button className="page-link" onClick={() => paginate(index + 1)}>
                    {index + 1}
                  </button>
                </li>
              ))}
              <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                <button className="page-link" onClick={nextPage} disabled={currentPage === totalPages}>
                  Next
                </button>
              </li>
            </ul>
          </nav>
        </div>
      </div>

      {/* User Modal */}
      {showModal && (
        <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header  text-white" style={{ background: "linear-gradient(to right, #A66CFF, #9C9EFE)" }}>
                <h5 className="modal-title">{currentUser ? 'Edit User' : 'Add New User'}</h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowModal(false)}></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label">fullName*</label>
                      <input
                        type="text"
                        className="form-control"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Mobile Number*</label>
                      <input
                        type="tel"
                        className="form-control"
                        name="mobileNumber"
                        value={formData.mobileNumber}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">First Name*</label>
                      <input
                        type="text"
                        className="form-control"
                        name="profile.firstName"
                        value={formData.profile.firstName}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Last Name</label>
                      <input
                        type="text"
                        className="form-control"
                        name="profile.lastName"
                        value={formData.profile.lastName}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Email</label>
                      <input
                        type="email"
                        className="form-control"
                        name="profile.email"
                        value={formData.profile.email}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Gender</label>
                      <select
                        className="form-select"
                        name="profile.gender"
                        value={formData.profile.gender}
                        onChange={handleInputChange}
                      >
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-outline-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary">
                    {currentUser ? 'Update User' : 'Create User'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;