import React, { useState } from 'react';
import { Edit, Trash2, Calendar, DollarSign, Package } from 'lucide-react';

const DataGrid = ({ records, loading, onEdit, onDelete, userRole }) => {
  const [sortField, setSortField] = useState('createdAt');
  const [sortDirection, setSortDirection] = useState('desc');
  const [filterText, setFilterText] = useState('');

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const filteredAndSortedRecords = records
    .filter(record => {
      if (!filterText) return true;
      const searchText = filterText.toLowerCase();
      return (
        record.expenseFrom?.toLowerCase().includes(searchText) ||
        record.paidTo?.toLowerCase().includes(searchText) ||
        record.description?.toLowerCase().includes(searchText) ||
        record.employeeName?.toLowerCase().includes(searchText)
      );
    })
    .sort((a, b) => {
      const aVal = a[sortField] || '';
      const bVal = b[sortField] || '';
      
      if (sortDirection === 'asc') {
        return aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
      } else {
        return aVal > bVal ? -1 : aVal < bVal ? 1 : 0;
      }
    });

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString();
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0);
  };

  const calculateTotal = (record) => {
    return (record.quantity || 0) * (record.price || 0);
  };

  if (loading) {
    return (
      <div className="data-grid-loading">
        <div className="loading-spinner"></div>
        <p>جاري تحميل السجلات...</p>
      </div>
    );
  }

  return (
    <div className="data-grid">
      <div className="data-grid-header">
        <div className="grid-controls">
          <h3>سجلات المحاسبة</h3>
          <div className="filter-section">
            <input
              type="text"
              placeholder="بحث في السجلات..."
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
              className="filter-input"
            />
          </div>
        </div>
        
        <div className="grid-stats">
          <div className="stat-item">
            <Package className="stat-icon" />
            <span>{filteredAndSortedRecords.length} سجل</span>
          </div>
          <div className="stat-item">
            <DollarSign className="stat-icon" />
            <span>
              إجمالي القيمة: {formatCurrency(
                filteredAndSortedRecords.reduce((sum, record) => sum + (record.price || 0), 0)
              )}
            </span>
          </div>
        </div>
      </div>

      <div className="data-grid-table-container">
        <table className="data-grid-table">
          <thead>
            <tr>
              <th onClick={() => handleSort('date')} className="sortable">
                <Calendar className="header-icon" />
                التاريخ {sortField === 'date' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th onClick={() => handleSort('expenseFrom')} className="sortable">
                مصروف من {sortField === 'expenseFrom' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th onClick={() => handleSort('paidTo')} className="sortable">
                مدفوع إلى {sortField === 'paidTo' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th onClick={() => handleSort('description')} className="sortable">
                الوصف {sortField === 'description' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th onClick={() => handleSort('price')} className="sortable">
                المبلغ {sortField === 'price' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th onClick={() => handleSort('employeeName')} className="sortable">
                الموظف {sortField === 'employeeName' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th>الإجراءات</th>
            </tr>
          </thead>
          <tbody>
            {filteredAndSortedRecords.length === 0 ? (
              <tr>
                <td colSpan="10" className="no-data">
                  {filterText ? 'لا توجد سجلات مطابقة لبحثك.' : 'لم يتم العثور على سجلات. انقر "إضافة سجل جديد" للبدء.'}
                </td>
              </tr>
            ) : (
              filteredAndSortedRecords.map(record => (
                <tr key={record._id} className="data-row">
                  <td>{formatDate(record.date)}</td>
                  <td className="account-name">{record.expenseFrom}</td>
                  <td className="account-name">{record.paidTo}</td>
                  <td>{record.description}</td>
                  <td className="number">{formatCurrency(record.price)}</td>
                  <td className="editor-name">{record.employeeName}</td>
                  <td className="actions">
                    <button
                      className="action-btn edit-btn"
                      onClick={() => onEdit(record)}
                      title="تعديل السجل"
                    >
                      <Edit />
                    </button>
                    {userRole === 'Admin' && (
                      <button
                        className="action-btn delete-btn"
                        onClick={() => onDelete(record._id)}
                        title="حذف السجل"
                      >
                        <Trash2 />
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Detailed View for Mobile */}
      <div className="data-grid-mobile">
        {filteredAndSortedRecords.map(record => (
          <div key={record._id} className="record-card">
            <div className="record-header">
              <h4>{record.accountName}</h4>
              <div className="record-actions">
                <button
                  className="action-btn edit-btn"
                  onClick={() => onEdit(record)}
                >
                  <Edit />
                </button>
                {userRole === 'Admin' && (
                  <button
                    className="action-btn delete-btn"
                    onClick={() => onDelete(record._id)}
                  >
                    <Trash2 />
                  </button>
                )}
              </div>
            </div>
            
            <div className="record-details">
              <div className="detail-row">
                <span className="label">Date:</span>
                <span>{formatDate(record.date)}</span>
              </div>
              <div className="detail-row">
                <span className="label">Item:</span>
                <span>{record.item}</span>
              </div>
              <div className="detail-row">
                <span className="label">Quantity:</span>
                <span>{record.quantity}</span>
              </div>
              <div className="detail-row">
                <span className="label">Price:</span>
                <span>{formatCurrency(record.price)}</span>
              </div>
              <div className="detail-row">
                <span className="label">Total:</span>
                <span className="total">{formatCurrency(calculateTotal(record))}</span>
              </div>
              {record.brand && (
                <div className="detail-row">
                  <span className="label">Brand:</span>
                  <span>{record.brand}</span>
                </div>
              )}
              {record.type && (
                <div className="detail-row">
                  <span className="label">Type:</span>
                  <span>{record.type}</span>
                </div>
              )}
              <div className="detail-row">
                <span className="label">Editor:</span>
                <span>{record.editorName}</span>
              </div>
              {record.notes && (
                <div className="detail-row">
                  <span className="label">Notes:</span>
                  <span>{record.notes}</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DataGrid;