import React, { useState, useEffect } from 'react';
import { Save, X } from 'lucide-react';
import axios from 'axios';

const AccountingForm = ({ record, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    fs: '',
    accountType: '',
    subAccount: '',
    date: new Date().toISOString().split('T')[0],
    accountName: '',
    projectsUnderConstruction: '',
    previousProjects: '',
    item: '',
    quantity: '',
    price: '',
    brand: '',
    type: '',
    part: '',
    day: new Date().getDate(),
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    notes: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (record) {
      // Populate form with record data for editing
      const recordData = { ...record };
      if (recordData.date) {
        recordData.date = new Date(recordData.date).toISOString().split('T')[0];
      }
      setFormData(recordData);
    }
  }, [record]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Auto-populate day, month, year when date changes
    if (name === 'date' && value) {
      const dateObj = new Date(value);
      setFormData(prev => ({
        ...prev,
        day: dateObj.getDate(),
        month: dateObj.getMonth() + 1,
        year: dateObj.getFullYear()
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Validate required fields
      if (!formData.accountName || !formData.item || !formData.quantity || !formData.price) {
        setError('Please fill in all required fields');
        setLoading(false);
        return;
      }

      // Convert quantity and price to numbers
      const submitData = {
        ...formData,
        quantity: parseFloat(formData.quantity),
        price: parseFloat(formData.price),
        day: parseInt(formData.day),
        month: parseInt(formData.month),
        year: parseInt(formData.year)
      };

      if (record) {
        // Update existing record
        await axios.patch(`/api/records/${record._id}`, submitData);
      } else {
        // Create new record
        await axios.post('/api/records', submitData);
      }

      onSave();
    } catch (error) {
      console.error('Error saving record:', error);
      setError(error.response?.data?.message || 'Failed to save record');
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
          {/* Row 1 */}
          <div className="form-group">
            <label htmlFor="fs">القوائم المالية</label>
            <input
              type="text"
              id="fs"
              name="fs"
              value={formData.fs}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="accountType">نوع الحساب</label>
            <select
              id="accountType"
              name="accountType"
              value={formData.accountType}
              onChange={handleChange}
            >
              <option value="">اختر النوع</option>
              <option value="Asset">أصول</option>
              <option value="Liability">خصوم</option>
              <option value="Equity">حقوق الملكية</option>
              <option value="Revenue">إيرادات</option>
              <option value="Expense">مصروفات</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="subAccount">الحساب الفرعي</label>
            <input
              type="text"
              id="subAccount"
              name="subAccount"
              value={formData.subAccount}
              onChange={handleChange}
            />
          </div>

          {/* Row 2 */}
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
            <label htmlFor="accountName">اسم الحساب *</label>
            <input
              type="text"
              id="accountName"
              name="accountName"
              value={formData.accountName}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="projectsUnderConstruction">مشاريع تحت الإنشاء</label>
            <input
              type="text"
              id="projectsUnderConstruction"
              name="projectsUnderConstruction"
              value={formData.projectsUnderConstruction}
              onChange={handleChange}
            />
          </div>

          {/* Row 3 */}
          <div className="form-group">
            <label htmlFor="previousProjects">Previous Projects</label>
            <input
              type="text"
              id="previousProjects"
              name="previousProjects"
              value={formData.previousProjects}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="item">Item *</label>
            <input
              type="text"
              id="item"
              name="item"
              value={formData.item}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="quantity">Quantity *</label>
            <input
              type="number"
              id="quantity"
              name="quantity"
              value={formData.quantity}
              onChange={handleChange}
              min="0"
              step="0.01"
              required
            />
          </div>

          {/* Row 4 */}
          <div className="form-group">
            <label htmlFor="price">Price *</label>
            <input
              type="number"
              id="price"
              name="price"
              value={formData.price}
              onChange={handleChange}
              min="0"
              step="0.01"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="brand">Brand</label>
            <input
              type="text"
              id="brand"
              name="brand"
              value={formData.brand}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="type">Type</label>
            <input
              type="text"
              id="type"
              name="type"
              value={formData.type}
              onChange={handleChange}
            />
          </div>

          {/* Row 5 */}
          <div className="form-group">
            <label htmlFor="part">Part</label>
            <input
              type="text"
              id="part"
              name="part"
              value={formData.part}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="day">Day</label>
            <input
              type="number"
              id="day"
              name="day"
              value={formData.day}
              onChange={handleChange}
              min="1"
              max="31"
            />
          </div>

          <div className="form-group">
            <label htmlFor="month">Month</label>
            <input
              type="number"
              id="month"
              name="month"
              value={formData.month}
              onChange={handleChange}
              min="1"
              max="12"
            />
          </div>

          {/* Row 6 */}
          <div className="form-group">
            <label htmlFor="year">Year</label>
            <input
              type="number"
              id="year"
              name="year"
              value={formData.year}
              onChange={handleChange}
              min="2000"
              max="2100"
            />
          </div>

          <div className="form-group full-width">
            <label htmlFor="notes">Notes</label>
            <textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows="3"
              placeholder="Additional notes or comments..."
            />
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