import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Users, Plus, User, X, Shield, UserX, Edit, Trash2, Save, Eye, EyeOff } from 'lucide-react';
import axios from 'axios';

const UserManager = ({ onClose }) => {
  const [users, setUsers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    role: 'Accountant'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

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

    try {
      if (editingUser) {
        // Update existing user
        await axios.patch(`/api/users/${editingUser._id}`, formData);
      } else {
        // Create new user
        const result = await registerUser(formData);
        if (!result.success) {
          setError(result.message);
          setLoading(false);
          return;
        }
      }
      
      setFormData({ username: '', password: '', role: 'Accountant' });
      setShowForm(false);
      setEditingUser(null);
      loadUsers();
    } catch (error) {
      console.error('Error saving user:', error);
      setError(error.response?.data?.message || 'فشل حفظ المستخدم');
    } finally {
      setLoading(false);
    }
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

  const handleEdit = (user) => {
    setEditingUser(user);
    setFormData({
      username: user.username,
      password: '', // Don't pre-fill password for security
      role: user.role
    });
    setShowForm(true);
  };

  const handleDelete = async (userId, username) => {
    if (!window.confirm(`هل أنت متأكد من حذف المستخدم "${username}"؟`)) {
      return;
    }

    try {
      await axios.delete(`/api/users/${userId}`);
      loadUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
      setError('فشل حذف المستخدم');
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingUser(null);
    setFormData({ username: '', password: '', role: 'Accountant' });
    setError('');
    setShowPassword(false);
  };

  return (
    <div className="user-manager">
      <div className="modal-header">
        <div className="modal-title">
          <Users className="title-icon" />
          <h2>إدارة المستخدمين</h2>
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
              إضافة مستخدم جديد
            </button>
          ) : (
            <form onSubmit={handleSubmit} className="add-user-form">
              <h3>{editingUser ? 'تعديل المستخدم' : 'إضافة مستخدم جديد'}</h3>
              
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="new-username">اسم المستخدم</label>
                  <input
                    type="text"
                    id="new-username"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    required
                    placeholder="أدخل اسم المستخدم"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="new-password">
                    كلمة المرور {editingUser && '(اتركها فارغة للاحتفاظ بالحالية)'}
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff /> : <Eye />}
                    </button>
                  </label>
                  <input
                    type={showPassword ? "text" : "password"}
                    id="new-password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required={!editingUser}
                    placeholder={editingUser ? "أدخل كلمة مرور جديدة (اختياري)" : "أدخل كلمة المرور"}
                    minLength="6"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="new-role">الدور</label>
                  <select
                    id="new-role"
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    required
                  >
                    <option value="Accountant">محاسب</option>
                    <option value="Admin">مدير</option>
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
                  onClick={handleCancel}
                >
                  إلغاء
                </button>
                <button type="submit" className="btn-primary" disabled={loading}>
                  {loading ? (editingUser ? 'جاري التحديث...' : 'جاري الإنشاء...') : (editingUser ? 'تحديث المستخدم' : 'إنشاء مستخدم')}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Users List */}
        <div className="users-list">
          <h3>المستخدمون الحاليون</h3>
          
          {users.length === 0 ? (
            <div className="no-users">
              <UserX className="no-users-icon" />
              <p>لا يوجد مستخدمون</p>
            </div>
          ) : (
            <div className="users-table-container">
              <table className="users-table">
                <thead>
                  <tr>
                    <th>اسم المستخدم</th>
                    <th>الدور</th>
                    <th>تاريخ الإنشاء</th>
                    <th>الإجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(user => (
                    <tr key={user._id}>
                      <td>
                        <div className="user-name">
                          {getRoleIcon(user.role)}
                          {user.username}
                        </div>
                      </td>
                      <td>
                        <span className={`role-badge ${user.role.toLowerCase()}`}>
                          {user.role === 'Admin' ? 'مدير' : 'محاسب'}
                        </span>
                      </td>
                      <td>{formatDate(user.createdAt)}</td>
                      <td className="actions">
                        <button 
                          className="edit-btn" 
                          onClick={() => handleEdit(user)}
                          title="تعديل المستخدم"
                        >
                          <Edit />
                        </button>
                        <button 
                          className="delete-btn" 
                          onClick={() => handleDelete(user._id, user.username)}
                          title="حذف المستخدم"
                        >
                          <Trash2 />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserManager;