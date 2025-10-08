import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Users, User, Lock, X } from 'lucide-react';

const UserSwitcher = ({ onClose }) => {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { switchUser } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await switchUser(formData.username, formData.password);
    
    if (result.success) {
      onClose();
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

  return (
    <div className="user-switcher">
      <div className="modal-header">
        <div className="modal-title">
          <Users className="title-icon" />
          <h2>تبديل المستخدم</h2>
        </div>
        <button className="close-btn" onClick={onClose}>
          <X />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="switcher-form">
        <p className="form-description">
          أدخل بيانات الاعتماد للتبديل إلى حساب مستخدم آخر.
        </p>

        <div className="form-group">
          <label htmlFor="switch-username">
            <User className="input-icon" />
            اسم المستخدم
          </label>
          <input
            type="text"
            id="switch-username"
            name="username"
            value={formData.username}
            onChange={handleChange}
            required
            placeholder="أدخل اسم المستخدم"
          />
        </div>

        <div className="form-group">
          <label htmlFor="switch-password">
            <Lock className="input-icon" />
            كلمة المرور
          </label>
          <input
            type="password"
            id="switch-password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            placeholder="أدخل كلمة المرور"
          />
        </div>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <div className="form-actions">
          <button type="button" className="btn-secondary" onClick={onClose}>
            إلغاء
          </button>
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'جاري التبديل...' : 'تبديل المستخدم'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default UserSwitcher;