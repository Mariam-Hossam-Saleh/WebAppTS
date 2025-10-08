import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { LogIn, User, Lock } from 'lucide-react';

const Login = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login(formData.username, formData.password);
    
    if (!result.success) {
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
    <div className="login-container">
      <div className="login-box">
        <div className="login-header">
          <LogIn className="login-icon" />
          <h1>Traffic Solution Accounts</h1>
          <p>تسجيل الدخول إلى حسابك</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="username">
              <User className="input-icon" />
              اسم المستخدم
            </label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
              placeholder="أدخل اسم المستخدم"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">
              <Lock className="input-icon" />
              كلمة المرور
            </label>
            <input
              type="password"
              id="password"
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

          <button 
            type="submit" 
            className="login-button"
            disabled={loading}
          >
            {loading ? 'جاري تسجيل الدخول...' : 'تسجيل الدخول'}
          </button>
        </form>

        <div className="login-footer">
          <p>مشرف افتراضي: اسم المستخدم: <code>admin</code>، كلمة المرور: <code>admin123</code></p>
        </div>
      </div>
    </div>
  );
};

export default Login;