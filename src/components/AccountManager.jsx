import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, X, Save } from 'lucide-react';
import axios from 'axios';

const AccountManager = ({ onClose }) => {
  const [accounts, setAccounts] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingAccount, setEditingAccount] = useState(null);
  const [formData, setFormData] = useState({
    accountName: '',
    accountCode: '',
    accountType: '',
    accountTypeCode: '',
    subAccount: '',
    subAccountCode: '',
    financialStatement: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadAccounts();
  }, []);

  const loadAccounts = async () => {
    try {
      const response = await axios.get('/api/accounts');
      setAccounts(response.data);
    } catch (error) {
      console.error('Error loading accounts:', error);
      setError('فشل تحميل الحسابات');
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
      if (editingAccount) {
        await axios.patch(`/api/accounts/${editingAccount._id}`, formData);
      } else {
        await axios.post('/api/accounts', formData);
      }
      setFormData({
        accountName: '',
        accountCode: '',
        accountType: '',
        accountTypeCode: '',
        subAccount: '',
        subAccountCode: '',
        financialStatement: ''
      });
      setShowForm(false);
      setEditingAccount(null);
      loadAccounts();
    } catch (error) {
      console.error('Error saving account:', error);
      setError(error.response?.data?.message || 'فشل حفظ الحساب');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (account) => {
    setEditingAccount(account);
    setFormData({
      accountName: account.accountName,
      accountCode: account.accountCode,
      accountType: account.accountType,
      accountTypeCode: account.accountTypeCode,
      subAccount: account.subAccount || '',
      subAccountCode: account.subAccountCode || '',
      financialStatement: account.financialStatement || ''
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا الحساب؟')) return;

    try {
      await axios.delete(`/api/accounts/${id}`);
      loadAccounts();
    } catch (error) {
      console.error('Error deleting account:', error);
      setError('فشل حذف الحساب');
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingAccount(null);
    setFormData({
      accountName: '',
      accountCode: '',
      accountType: '',
      accountTypeCode: '',
      subAccount: '',
      subAccountCode: '',
      financialStatement: ''
    });
    setError('');
  };

  return (
    <div className="account-manager">
      <div className="modal-header">
        <h2>إدارة الحسابات</h2>
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
                إضافة حساب جديد
              </button>
            </div>

            <div className="accounts-table-container">
              <table className="accounts-table">
                <thead>
                  <tr>
                    <th>اسم الحساب</th>
                    <th>كود الحساب</th>
                    <th>نوع الحساب</th>
                    <th>كود النوع</th>
                    <th>حساب فرعي</th>
                    <th>كود الفرعي</th>
                    <th>القائمة المالية</th>
                    <th>الإجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {accounts.map(account => (
                    <tr key={account._id}>
                      <td>{account.accountName}</td>
                      <td>{account.accountCode}</td>
                      <td>{account.accountType}</td>
                      <td>{account.accountTypeCode}</td>
                      <td>{account.subAccount || '-'}</td>
                      <td>{account.subAccountCode || '-'}</td>
                      <td>{account.financialStatement || '-'}</td>
                      <td className="actions">
                        <button className="edit-btn" onClick={() => handleEdit(account)}>
                          <Edit />
                        </button>
                        <button className="delete-btn" onClick={() => handleDelete(account._id)}>
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
          <form onSubmit={handleSubmit} className="account-form">
            <h3>{editingAccount ? 'تعديل الحساب' : 'إضافة حساب جديد'}</h3>

            {error && <div className="error-message">{error}</div>}

            <div className="form-grid">
              <div className="form-group">
                <label>اسم الحساب *</label>
                <input
                  type="text"
                  name="accountName"
                  value={formData.accountName}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>كود الحساب *</label>
                <input
                  type="text"
                  name="accountCode"
                  value={formData.accountCode}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>نوع الحساب *</label>
                <input
                  type="text"
                  name="accountType"
                  value={formData.accountType}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>كود نوع الحساب *</label>
                <input
                  type="text"
                  name="accountTypeCode"
                  value={formData.accountTypeCode}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>الحساب الفرعي</label>
                <input
                  type="text"
                  name="subAccount"
                  value={formData.subAccount}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label>كود الحساب الفرعي</label>
                <input
                  type="text"
                  name="subAccountCode"
                  value={formData.subAccountCode}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group full-width">
                <label>القائمة المالية</label>
                <input
                  type="text"
                  name="financialStatement"
                  value={formData.financialStatement}
                  onChange={handleChange}
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

export default AccountManager;