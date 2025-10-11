import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, X, Save } from 'lucide-react';
import axios from 'axios';

const PreviousProjectManager = ({ onClose }) => {
  const [previousProjects, setPreviousProjects] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [formData, setFormData] = useState({
    projectName: '',
    code: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadPreviousProjects();
  }, []);

  const loadPreviousProjects = async () => {
    try {
      const response = await axios.get('/api/previous-projects');
      setPreviousProjects(response.data);
    } catch (error) {
      console.error('Error loading previous projects:', error);
      setError('فشل تحميل المشاريع السابقة');
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
      if (editingProject) {
        await axios.patch(`/api/previous-projects/${editingProject._id}`, formData);
      } else {
        await axios.post('/api/previous-projects', formData);
      }
      setFormData({ projectName: '', code: '' });
      setShowForm(false);
      setEditingProject(null);
      loadPreviousProjects();
    } catch (error) {
      console.error('Error saving previous project:', error);
      setError(error.response?.data?.message || 'فشل حفظ المشروع');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (project) => {
    setEditingProject(project);
    setFormData({
      projectName: project.projectName,
      code: project.code
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا المشروع؟')) return;

    try {
      await axios.delete(`/api/previous-projects/${id}`);
      loadPreviousProjects();
    } catch (error) {
      console.error('Error deleting previous project:', error);
      setError('فشل حذف المشروع');
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingProject(null);
    setFormData({ projectName: '', code: '' });
    setError('');
  };

  return (
    <div className="previous-project-manager">
      <div className="modal-header">
        <h2>إدارة المشاريع تم تنفيذها</h2>
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
                إضافة مشروع سابق
              </button>
            </div>

            <div className="previous-projects-table-container">
              <table className="previous-projects-table">
                <thead>
                  <tr>
                    <th>اسم المشروع</th>
                    <th>الكود</th>
                    <th>تاريخ الإنشاء</th>
                    <th>الإجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {previousProjects.map(project => (
                    <tr key={project._id}>
                      <td>{project.projectName}</td>
                      <td>{project.code}</td>
                      <td>{new Date(project.createdAt).toLocaleDateString('ar-EG')}</td>
                      <td className="actions">
                        <button className="edit-btn" onClick={() => handleEdit(project)}>
                          <Edit />
                        </button>
                        <button className="delete-btn" onClick={() => handleDelete(project._id)}>
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
          <form onSubmit={handleSubmit} className="previous-project-form">
            <h3>{editingProject ? 'تعديل المشروع' : 'إضافة مشروع سابق'}</h3>

            {error && <div className="error-message">{error}</div>}

            <div className="form-grid">
              <div className="form-group">
                <label>اسم المشروع *</label>
                <input
                  type="text"
                  name="projectName"
                  value={formData.projectName}
                  onChange={handleChange}
                  required
                  placeholder="أدخل اسم المشروع"
                />
              </div>

              <div className="form-group">
                <label>كود المشروع *</label>
                <input
                  type="text"
                  name="code"
                  value={formData.code}
                  onChange={handleChange}
                  required
                  placeholder="أدخل كود المشروع"
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

export default PreviousProjectManager;
