import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  FaThLarge, FaAd, FaShieldAlt, FaUserCheck, 
  FaComments, FaChartLine, FaFileAlt, FaCircle
} from 'react-icons/fa';
import './AdminDashboard.css';

const API = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState(window.location.hash.replace('#', '') || 'dashboard');
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [reports, setReports] = useState([]);
  const [pendingProperties, setPendingProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const handleHashChange = () => {
      setActiveTab(window.location.hash.replace('#', '') || 'dashboard');
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const changeTab = (tab) => {
    window.location.hash = tab;
  };

  useEffect(() => {
    const storedUser = localStorage.getItem('mp_user');
    if (!storedUser) {
      navigate('/login');
      return;
    }
    const user = JSON.parse(storedUser);
    if (user.role !== 'admin') {
      navigate('/');
      return;
    }

    fetchData(activeTab);
  }, [navigate, activeTab]);

  const fetchData = async (tab) => {
    setLoading(true);
    try {
      if (tab === 'dashboard') {
        const res = await axios.get(`${API}/api/admin/dashboard`);
        setStats(res.data.stats);
      } else if (tab === 'users') {
        const res = await axios.get(`${API}/api/admin/users`);
        setUsers(res.data.users);
      } else if (tab === 'reports') {
        const res = await axios.get(`${API}/api/admin/reports`);
        setReports(res.data.properties);
      } else if (tab === 'pending') {
        const res = await axios.get(`${API}/api/admin/pending-properties`);
        setPendingProperties(res.data.properties);
      }
    } catch (err) {
      console.error(`Failed to fetch admin ${tab}`, err);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyProperty = async (propertyId) => {
    try {
      await axios.put(`${API}/api/admin/properties/${propertyId}/verify`);
      setPendingProperties(prev => prev.filter(p => p._id !== propertyId));
      alert("Property verified successfully.");
    } catch (err) {
      console.error("Failed to verify property:", err);
      alert("Failed to verify property.");
    }
  };

  const handleDeleteProperty = async (propertyId) => {
    if (!window.confirm("Are you sure you want to delete this reported property? This action cannot be undone.")) return;
    try {
      await axios.delete(`${API}/api/admin/properties/${propertyId}`);
      setReports(prev => prev.filter(p => p._id !== propertyId));
      alert("Property deleted successfully.");
    } catch (err) {
      console.error("Failed to delete property:", err);
      alert("Failed to delete property.");
    }
  };

  // Dynamic formatters
  const formatCurrency = (amount) => {
    if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
    if (amount >= 1000) return `₹${(amount / 1000).toFixed(1)}K`;
    return `₹${amount || 0}`;
  };

  const chartDataArray = stats?.chartData?.data || [40, 60, 45, 80, 85, 95, 60];
  const chartLabelsArray = stats?.chartData?.labels || ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const maxChartVal = Math.max(...chartDataArray, 1);

  const handleExportData = () => {
    const format = window.prompt("Enter export format (pdf / word):", "pdf");
    if (!format) return;
    
    if (format.toLowerCase() === 'word') {
      const htmlContent = `
        <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
        <head><meta charset='utf-8'><title>ManyProp Admin Report</title></head>
        <body>
          <h1>ManyProp Project Data</h1>
          <p><strong>Total Users:</strong> ${stats?.users?.total || 0}</p>
          <p><strong>Pending KYC:</strong> ${stats?.users?.pending || 0}</p>
          <p><strong>Active Properties:</strong> ${stats?.properties?.active || 0}</p>
          <p><strong>Pending Verification:</strong> ${stats?.properties?.pendingVerification || 0}</p>
          <p><strong>Fake Reported Properties:</strong> ${stats?.properties?.reported || 0}</p>
          <p><strong>Total Enquiries:</strong> ${stats?.offers?.total || 0}</p>
          <p><strong>Enquiries Today:</strong> ${stats?.offers?.enquiriesToday || 0}</p>
          <p><strong>Revenue This Month:</strong> ${formatCurrency(stats?.revenue?.thisMonth || 0)}</p>
        </body>
        </html>
      `;
      const blob = new Blob(['\ufeff', htmlContent], { type: 'application/msword' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'ManyProp_Report.doc';
      link.click();
      URL.revokeObjectURL(url);
    } else {
      window.print();
    }
  };

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div className="admin-sidebar-header">
          <h2><span>ManyProp</span> Admin</h2>
        </div>
        
        <div className="admin-sidebar-menu">
          <div className="menu-group">
            <p className="menu-label">OVERVIEW</p>
            <button 
              className={`menu-item ${activeTab === 'dashboard' ? 'active' : ''}`}
              onClick={() => changeTab('dashboard')}
            >
              <FaThLarge className="menu-icon" /> Dashboard
            </button>
          </div>

          <div className="menu-group">
            <p className="menu-label">CONTENT</p>
            <button className="menu-item">
              <FaAd className="menu-icon" /> Banner & ads
            </button>
          </div>

          <div className="menu-group">
            <p className="menu-label">MODERATION</p>
            <button 
              className={`menu-item ${activeTab === 'pending' ? 'active' : ''}`}
              onClick={() => changeTab('pending')}
            >
              <FaShieldAlt className="menu-icon" /> Property verify
              <span className="menu-badge badge-orange">{stats?.properties?.pendingVerification || 0}</span>
            </button>
            <button 
              className={`menu-item ${activeTab === 'users' ? 'active' : ''}`}
              onClick={() => changeTab('users')}
            >
              <FaUserCheck className="menu-icon" /> User verify
            </button>
            <button className="menu-item">
              <FaComments className="menu-icon" /> Enquiries
            </button>
          </div>

          <div className="menu-group">
            <p className="menu-label">GROWTH</p>
            <button 
              className={`menu-item ${activeTab === 'analytics' ? 'active' : ''}`}
              onClick={() => changeTab('analytics')}
            >
              <FaChartLine className="menu-icon" /> Lead analytics
            </button>
            <button 
              className={`menu-item ${activeTab === 'reports' ? 'active' : ''}`}
              onClick={() => changeTab('reports')}
            >
              <FaFileAlt className="menu-icon" /> Reports
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="admin-main">
        {loading && activeTab === 'dashboard' ? (
          <div className="admin-loading">Loading Dashboard...</div>
        ) : activeTab === 'dashboard' ? (
          <div className="dashboard-content">
            <header className="dashboard-header">
              <h1>Dashboard</h1>
              <div className="header-actions">
                <div className="live-indicator">
                  <FaCircle className="live-icon" /> Live
                </div>
                <button className="export-btn" onClick={handleExportData}>Export data</button>
              </div>
            </header>

            {/* Top Cards */}
            <div className="metrics-grid">
              <div className="metric-card">
                <h2>{stats?.properties?.active || 0}</h2>
                <p>Active listings</p>
                <span className="trend positive">↑ 12% this week</span>
              </div>
              <div className="metric-card">
                <h2>{stats?.properties?.pendingVerification || 0}</h2>
                <p>Pending verification</p>
                <span className="trend negative">↓ 3 since yesterday</span>
              </div>
              <div className="metric-card">
                <h2>{stats?.offers?.enquiriesToday || 0}</h2>
                <p>Enquiries today</p>
                <span className="trend positive">↑ 24% vs avg</span>
              </div>
              <div className="metric-card">
                <h2>{formatCurrency(stats?.revenue?.thisMonth || 0)}</h2>
                <p>Revenue this month</p>
                <span className="trend positive">↑ 8% vs last month</span>
              </div>
            </div>

            <div className="dashboard-row">
              {/* Chart Section */}
              <div className="chart-section">
                <h3>Enquiry volume — last 7 days</h3>
                <div className="bar-chart">
                  <div className="bars">
                    {chartDataArray.map((count, i) => {
                      const height = Math.max((count / maxChartVal) * 100, 5); // min 5% height
                      return <div key={i} className="bar" style={{ height: `${height}%` }}></div>;
                    })}
                  </div>
                  <div className="x-axis">
                    {chartLabelsArray.map((label, i) => (
                      <span key={i}>{label}</span>
                    ))}
                  </div>
                </div>
                <div className="scroll-icon">
                  <span className="arrow-down">↓</span>
                </div>
              </div>

              {/* Action Queue Section */}
              <div className="action-queue-section">
                <h3>Action queue</h3>
                <div className="queue-list">
                  
                  <div className="queue-item">
                    <span className="queue-badge badge-urgent">Urgent</span>
                    <p>{stats?.properties?.pendingVerification || 0} properties pending verification</p>
                    <button className="queue-btn" onClick={() => changeTab('pending')}>Review</button>
                  </div>
                  
                  <div className="queue-item">
                    <span className="queue-badge badge-urgent">Urgent</span>
                    <p>{stats?.users?.pending || 0} Aadhaar KYC pending review</p>
                    <button className="queue-btn" onClick={() => changeTab('users')}>Review</button>
                  </div>
                  
                  <div className="queue-item">
                    <span className="queue-badge badge-flag">Flag</span>
                    <p>{stats?.properties?.reported || 0} listings reported as fake</p>
                    <button className="queue-btn" onClick={() => changeTab('reports')}>Review</button>
                  </div>

                </div>
              </div>
            </div>
          </div>
        ) : activeTab === 'users' ? (
          <div className="dashboard-content">
             <header className="dashboard-header">
              <h1>User Verification & List</h1>
            </header>
            <div className="admin-table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>User Type</th>
                    <th>Role</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {users.length > 0 ? users.map(u => (
                    <tr key={u._id}>
                      <td><strong>{u.name}</strong></td>
                      <td>{u.email}</td>
                      <td>{u.phone}</td>
                      <td><span className="badge">{u.userType}</span></td>
                      <td><span className={`badge role-${u.role}`}>{u.role}</span></td>
                      <td>{u.verified ? 'Verified' : 'Pending'}</td>
                    </tr>
                  )) : (
                    <tr><td colSpan="6" style={{textAlign: 'center', padding: '20px'}}>No users found.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ) : activeTab === 'pending' ? (
          <div className="dashboard-content">
            <header className="dashboard-header">
              <h1>Properties Pending Verification</h1>
            </header>
            {pendingProperties.length > 0 ? (
              <div className="reports-grid">
                {pendingProperties.map(prop => (
                  <div key={prop._id} className="report-card">
                    <div className="report-header">
                      <h3 
                        style={{ cursor: 'pointer', textDecoration: 'underline', color: '#fff' }} 
                        onClick={() => window.open(`/properties/${prop._id}`, '_blank')}
                        title="View Property in New Tab"
                      >
                        {prop.title}
                      </h3>
                      <button className="delete-btn" style={{backgroundColor: '#ea580c'}} onClick={() => handleVerifyProperty(prop._id)}>
                        Verify Property
                      </button>
                    </div>
                    <div className="report-meta">
                      <p><strong>ID:</strong> {prop._id}</p>
                      <p><strong>Type:</strong> <span style={{textTransform:'capitalize'}}>{prop.propertyType}</span> for {prop.priceType}</p>
                      <p><strong>Price:</strong> ₹{prop.price}</p>
                      <p><strong>Owner:</strong> {prop.owner ? `${prop.owner.name} (${prop.owner.email})` : 'Unknown'}</p>
                      <p><strong>Posted:</strong> {new Date(prop.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-reports" style={{color: '#fff', marginTop: '20px'}}>
                <p>No properties pending verification.</p>
              </div>
            )}
          </div>
        ) : activeTab === 'reports' ? (
          <div className="dashboard-content">
            <header className="dashboard-header">
              <h1>Reported Fake Properties</h1>
            </header>
            {reports.length > 0 ? (
              <div className="reports-grid">
                {reports.map(prop => (
                  <div key={prop._id} className="report-card">
                    <div className="report-header">
                      <h3 
                        style={{ cursor: 'pointer', textDecoration: 'underline', color: '#fff' }} 
                        onClick={() => window.open(`/properties/${prop._id}`, '_blank')}
                        title="View Property in New Tab"
                      >
                        {prop.title}
                      </h3>
                      <button className="delete-btn" onClick={() => handleDeleteProperty(prop._id)}>
                        Delete Property
                      </button>
                    </div>
                    <div className="report-meta">
                      <p><strong>ID:</strong> {prop._id}</p>
                      <p><strong>Owner:</strong> {prop.owner ? `${prop.owner.name} (${prop.owner.email})` : 'Unknown'}</p>
                      <p><strong>Total Reports:</strong> <span className="report-count">{prop.reports?.length || 0}</span></p>
                    </div>
                    <div className="report-reasons">
                      <ul>
                        {prop.reports?.slice().reverse().map((r, i) => (
                          <li key={i}>
                            <strong>{r.reportedBy ? r.reportedBy.name : 'Anonymous'}:</strong> "{r.reason}"
                            <span className="report-date">{new Date(r.date).toLocaleDateString()}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-reports" style={{color: '#fff', marginTop: '20px'}}>
                <p>No properties reported as fake.</p>
              </div>
            )}
          </div>
        ) : activeTab === 'analytics' ? (
          <div className="dashboard-content">
            <header className="dashboard-header">
              <h1>Lead Analytics</h1>
            </header>
            <div className="admin-section" style={{ background: '#323232', color: '#fff', textAlign: 'center', padding: '50px', borderRadius: '12px' }}>
              <FaChartLine style={{ fontSize: '3rem', color: '#ea580c', marginBottom: '20px' }} />
              <h2>Analytics Module Coming Soon</h2>
              <p style={{ color: '#a3a3a3' }}>Detailed lead tracking and conversion funnels will appear here.</p>
            </div>
          </div>
        ) : null}
      </main>
    </div>
  );
};

export default AdminDashboard;

