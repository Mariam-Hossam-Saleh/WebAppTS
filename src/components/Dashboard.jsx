import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import AccountingForm from './AccountingForm';
import DataGrid from './DataGrid';
import UserSwitcher from './UserSwitcher';
import UserManager from './UserManager';
import { 
  LogOut, 
  Plus, 
  RefreshCw, 
  Users, 
  BarChart3,
  Settings,
  User
} from 'lucide-react';
import axios from 'axios';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [showUserSwitcher, setShowUserSwitcher] = useState(false);
  const [showUserManager, setShowUserManager] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    loadRecords();
  }, [refreshTrigger]);

  const loadRecords = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/records');
      setRecords(response.data);
    } catch (error) {
      console.error('Error loading records:', error);
      alert('Failed to load records. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRecordSaved = () => {
    setShowForm(false);
    setEditingRecord(null);
    setRefreshTrigger(prev => prev + 1);
  };

  const handleEdit = (record) => {
    setEditingRecord(record);
    setShowForm(true);
  };

  const handleDelete = async (recordId) => {
    if (!window.confirm('Are you sure you want to delete this record?')) {
      return;
    }

    try {
      await axios.delete(`/api/records/${recordId}`);
      setRefreshTrigger(prev => prev + 1);
    } catch (error) {
      console.error('Error deleting record:', error);
      alert('Failed to delete record. You may not have permission.');
    }
  };

  const handleRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const handleNewRecord = () => {
    setEditingRecord(null);
    setShowForm(true);
  };

  return (
    <div className="dashboard">
      {/* Header */}
      <header className="dashboard-header">
        <div className="header-left">
          <BarChart3 className="logo-icon" />
          <h1>Business Accounting Software</h1>
        </div>
        
        <div className="header-center">
          <span className="user-info">
            <User className="user-icon" />
            {user.username} ({user.role})
          </span>
        </div>

        <div className="header-right">
          <button 
            className="header-btn"
            onClick={() => setShowUserSwitcher(true)}
            title="Switch User"
          >
            <Users />
            Switch User
          </button>
          
          {user.role === 'Admin' && (
            <button 
              className="header-btn"
              onClick={() => setShowUserManager(true)}
              title="Manage Users"
            >
              <Settings />
              Manage Users
            </button>
          )}
          
          <button 
            className="header-btn logout-btn"
            onClick={logout}
            title="Logout"
          >
            <LogOut />
            Logout
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="dashboard-main">
        {/* Action Bar */}
        <div className="action-bar">
          <div className="action-left">
            <button 
              className="action-btn primary"
              onClick={handleNewRecord}
            >
              <Plus />
              Add New Record
            </button>
            
            <button 
              className="action-btn"
              onClick={handleRefresh}
              disabled={loading}
            >
              <RefreshCw className={loading ? 'spinning' : ''} />
              Refresh
            </button>
          </div>
          
          <div className="action-right">
            <span className="record-count">
              Total Records: {records.length}
            </span>
          </div>
        </div>

        {/* Form Modal */}
        {showForm && (
          <div className="modal-overlay">
            <div className="modal-content">
              <AccountingForm 
                record={editingRecord}
                onSave={handleRecordSaved}
                onCancel={() => {
                  setShowForm(false);
                  setEditingRecord(null);
                }}
              />
            </div>
          </div>
        )}

        {/* User Switcher Modal */}
        {showUserSwitcher && (
          <div className="modal-overlay">
            <div className="modal-content">
              <UserSwitcher 
                onClose={() => setShowUserSwitcher(false)}
              />
            </div>
          </div>
        )}

        {/* User Manager Modal */}
        {showUserManager && (
          <div className="modal-overlay">
            <div className="modal-content">
              <UserManager 
                onClose={() => setShowUserManager(false)}
              />
            </div>
          </div>
        )}

        {/* Data Grid */}
        <div className="data-grid-container">
          <DataGrid 
            records={records}
            loading={loading}
            onEdit={handleEdit}
            onDelete={handleDelete}
            userRole={user.role}
          />
        </div>
      </main>
    </div>
  );
};

export default Dashboard;