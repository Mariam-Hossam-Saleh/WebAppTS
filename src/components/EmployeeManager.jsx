import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, X, Save } from 'lucide-react';
import axios from 'axios';

const EmployeeManager = ({ onClose }) => {
  const [employees, setEmployees] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [formData, setFormData] = useState({
    employee: '',
    title: '',
    code: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadEmployees();
  }, []);

  const loadEmployees = async () => {
    try {
      const response = await axios.get('/api/employees');
      setEmployees(response.data);
    } catch (error) {
      console.error('Error loading employees:', error);
      setError('فشل تحميل الموظفين');
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (editingEmployee) {
        await axios.patch(`/api/employees/${editingEmployee._id}`, formData);
      } else {
        await axios.post('/api/employees', formData);
      }
      setFormData({ employee: '', title: '', code: '' });
      setShowForm(false);
      setEditingEmployee(null);
      loadEmployees();
    } catch (error) {
      console.error('Error saving employee:', error);
      setError(error.response?.data?.message || 'فشل حفظ الموظف');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (employee) => {
    setEditingEmployee(employee);
    setFormData({
      employee: employee.employee,
      title: employee.title,
      code: employee.code
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا الموظف؟')) return;

    try {
      await axios.delete(`/api/employees/${id}`);
      loadEmployees();
    } catch (error) {
      console.error('Error deleting employee:', error);
      setError('فشل حذف الموظف');
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingEmployee(null);
    setFormData({ employee: '', title: '', code: '' });
    setError('');
  };

  return (
    <div className="employee-manager">
      <div className="modal-header">
        <h2>إدارة الموظفين</h2>
        <button className="close-btn" onClick={onClose}>
          <X />
        </button>
      </div>

      <div className="manager-content">
        {!showForm ? (
          <>
            <div className="manager-header">
              <button className="btn-primary" onClick={() => setShowForm(true)}>
                <Plus />
                إضافة موظف جديد
              </button>
            </div>

            <div className="employees-table-container">
              <table className="employees-table">
                <thead>
                  <tr>
                    <th>اسم الموظف</th>
                    <th>المسمى الوظيفي</th>
                    <th>الكود</th>
                    <th>الإجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {employees.map(employee => (
                    <tr key={employee._id}>
                      <td>{employee.employee}</td>
                      <td>{employee.title}</td>
                      <td>{employee.code}</td>
                      <td className="actions">
                        <button className="edit-btn" onClick={() => handleEdit(employee)}>
                          <Edit />
                        </button>
                        <button className="delete-btn" onClick={() => handleDelete(employee._id)}>
                          <Trash2 />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          <form onSubmit={handleSubmit} className="employee-form">
            <h3>{editingEmployee ? 'تعديل الموظف' : 'إضافة موظف جديد'}</h3>

            {error && <div className="error-message">{error}</div>}

            <div className="form-grid">
              <div className="form-group">
                <label>اسم الموظف *</label>
                <input
                  type="text"
                  name="employee"
                  value={formData.employee}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>المسمى الوظيفي *</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>الكود *</label>
                <input
                  type="text"
                  name="code"
                  value={formData.code}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-actions">
              <button type="button" className="btn-secondary" onClick={handleCancel}>
                إلغاء
              </button>
              <button type="submit" className="btn-primary" disabled={loading}>
                <Save />
                {loading ? 'جاري الحفظ...' : 'حفظ'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default EmployeeManager;