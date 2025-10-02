import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Users, Plus, User, X, Shield, UserX } from 'lucide-react';
import axios from 'axios';

const UserManager = ({ onClose }) => {
  const [users, setUsers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    role: 'Accountant'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { registerUser } = useAuth();

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const response = await axios.get('/api/users');
      setUsers(response.data);
    } catch (error) {
      console.error('Error loading users:', error);
      setError('Failed to load users');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await registerUser(formData);
    
    if (result.success) {
      setFormData({ username: '', password: '', role: 'Accountant' });
      setShowForm(false);
      loadUsers();
    } else {
      setError(result.message);
    }
    
    setLoading(false);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const getRoleIcon = (role) => {
    return role === 'Admin' ? <Shield className="role-icon admin" /> : <User className="role-icon accountant" />;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="user-manager">
      <div className="modal-header">
        <div className="modal-title">
          <Users className="title-icon" />
          <h2>User Management</h2>
        </div>
        <button className="close-btn" onClick={onClose}>
          <X />
        </button>
      </div>

      <div className="manager-content">
        {/* Add User Section */}
        <div className="add-user-section">
          {!showForm ? (
            <button 
              className="btn-primary"
              onClick={() => setShowForm(true)}
            >
              <Plus />
              Add New User
            </button>
          ) : (
            <form onSubmit={handleSubmit} className="add-user-form">
              <h3>Create New User</h3>
              
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="new-username">Username</label>
                  <input
                    type="text"
                    id="new-username"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    required
                    placeholder="Enter username"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="new-password">Password</label>
                  <input
                    type="password"
                    id="new-password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    placeholder="Enter password"
                    minLength="6"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="new-role">Role</label>
                  <select
                    id="new-role"
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    required
                  >
                    <option value="Accountant">Accountant</option>
                    <option value="Admin">Admin</option>
                  </select>
                </div>
              </div>

              {error && (
                <div className="error-message">
                  {error}
                </div>
              )}

              <div className="form-actions">
                <button 
                  type="button" 
                  className="btn-secondary"
                  onClick={() => {
                    setShowForm(false);
                    setError('');
                    setFormData({ username: '', password: '', role: 'Accountant' });
                  }}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={loading}>
                  {loading ? 'Creating...' : 'Create User'}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Users List */}
        <div className="users-list">
          <h3>Existing Users</h3>
          
          {users.length === 0 ? (
            <div className="no-users">
              <UserX className="no-users-icon" />
              <p>No users found</p>
            </div>
          ) : (
            <div className="users-grid">
              {users.map(user => (
                <div key={user._id} className="user-card">
                  <div className="user-info">
                    <div className="user-header">
                      {getRoleIcon(user.role)}
                      <h4>{user.username}</h4>
                    </div>
                    <div className="user-details">
                      <div className="detail-item">
                        <span className="label">Role:</span>
                        <span className={`role-badge ${user.role.toLowerCase()}`}>
                          {user.role}
                        </span>
                      </div>
                      <div className="detail-item">
                        <span className="label">Created:</span>
                        <span>{formatDate(user.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserManager;