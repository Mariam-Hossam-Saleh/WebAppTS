import React, { useState, useEffect } from 'react';
import { Save, X } from 'lucide-react';
import axios from 'axios';

const AccountingForm = ({ record, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    expenseFrom: '',
    paidTo: '',
    description: '',
    price: '',
    employeeName: ''
  });

  const [accounts, setAccounts] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadDropdownData();
    if (record) {
      setFormData({
        date: record.date ? new Date(record.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        expenseFrom: record.expenseFrom || '',
        paidTo: record.paidTo || '',
        description: record.description || '',
        price: record.price || '',
        employeeName: record.employeeName || ''
      });
    }
  }, [record]);

  const loadDropdownData = async () => {
    try {
      const [accountsRes, employeesRes] = await Promise.all([
        axios.get('/api/accounts'),
        axios.get('/api/employees')
      ]);
      setAccounts(accountsRes.data);
      setEmployees(employeesRes.data);
    } catch (error) {
      console.error('Error loading dropdown data:', error);
      setError('فشل تحميل البيانات');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Validate required fields
      if (!formData.date || !formData.expenseFrom || !formData.paidTo || !formData.description || !formData.price || !formData.employeeName) {
        setError('يرجى ملء جميع الحقول المطلوبة');
        setLoading(false);
        return;
      }

      const submitData = {
        date: formData.date,
        expenseFrom: formData.expenseFrom,
        paidTo: formData.paidTo,
        description: formData.description,
        price: parseFloat(formData.price),
        employeeName: formData.employeeName
      };

      if (record) {
        await axios.patch(`/api/records/${record._id}`, submitData);
      } else {
        await axios.post('/api/records', submitData);
      }

      onSave();
    } catch (error) {
      console.error('Error saving record:', error);
      setError(error.response?.data?.message || 'فشل حفظ السجل');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="accounting-form">
      <div className="form-header">
        <h2>{record ? 'تعديل السجل' : 'إضافة سجل جديد'}</h2>
        <button className="close-btn" onClick={onCancel}>
          <X />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="form-body">
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <div className="form-grid">
          <div className="form-group">
            <label htmlFor="date">التاريخ *</label>
            <input
              type="date"
              id="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="expenseFrom">مصروف من *</label>
            <select
              id="expenseFrom"
              name="expenseFrom"
              value={formData.expenseFrom}
              onChange={handleChange}
              required
            >
              <option value="">اختر الحساب</option>
              {accounts.map(account => (
                <option key={account._id} value={account.accountName}>
                  {account.accountName}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="paidTo">مدفوع إلى *</label>
            <select
              id="paidTo"
              name="paidTo"
              value={formData.paidTo}
              onChange={handleChange}
              required
            >
              <option value="">اختر الحساب</option>
              {accounts.map(account => (
                <option key={account._id} value={account.accountName}>
                  {account.accountName}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group full-width">
            <label htmlFor="description">الوصف *</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              rows="3"
              placeholder="أدخل وصف المصروف..."
            />
          </div>

          <div className="form-group">
            <label htmlFor="price">المبلغ *</label>
            <input
              type="number"
              id="price"
              name="price"
              value={formData.price}
              onChange={handleChange}
              min="0"
              step="0.01"
              required
              placeholder="0.00"
            />
          </div>

          <div className="form-group">
            <label htmlFor="employeeName">اسم الموظف *</label>
            <select
              id="employeeName"
              name="employeeName"
              value={formData.employeeName}
              onChange={handleChange}
              required
            >
              <option value="">اختر الموظف</option>
              {employees.map(employee => (
                <option key={employee._id} value={employee.employee}>
                  {employee.employee} - {employee.title}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-actions">
          <button type="button" className="btn-secondary" onClick={onCancel}>
            إلغاء
          </button>
          <button type="submit" className="btn-primary" disabled={loading}>
            <Save />
            {loading ? 'جاري الحفظ...' : (record ? 'تحديث السجل' : 'حفظ السجل')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AccountingForm;