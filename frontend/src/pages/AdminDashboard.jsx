import React, { useState, useEffect } from 'react';
import axiosInstance from '../api/axiosInstance';
import Navbar from '../components/Navbar';
import Modal from '../components/Modal';
import StarRating from '../components/StarRating';
import {
  Users,
  Store,
  Star,
  Plus,
  Search,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Eye,
  Check,
  X,
  AlertCircle,
  Filter,
  UserCheck,
  Building
} from 'lucide-react';

const AdminDashboard = () => {
  const [stats, setStats] = useState({ totalUsers: 0, totalStores: 0, totalRatings: 0 });
  const [activeTab, setActiveTab] = useState('users'); // 'users' | 'stores'

  // Users data state
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [userSearch, setUserSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [userSortBy, setUserSortBy] = useState('id');
  const [userSortOrder, setUserSortOrder] = useState('ASC');

  // Stores data state
  const [stores, setStores] = useState([]);
  const [storesLoading, setStoresLoading] = useState(false);
  const [storeSearch, setStoreSearch] = useState('');
  const [storeSortBy, setStoreSortBy] = useState('id');
  const [storeSortOrder, setStoreSortOrder] = useState('ASC');

  // Modals state
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [isAddStoreOpen, setIsAddStoreOpen] = useState(false);
  const [selectedUserDetail, setSelectedUserDetail] = useState(null);

  // Add User Form State
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    password: '',
    address: '',
    role: 'NORMAL_USER'
  });
  const [addUserError, setAddUserError] = useState('');
  const [addUserSuccess, setAddUserSuccess] = useState('');
  const [addUserLoading, setAddUserLoading] = useState(false);

  // Add Store Form State
  const [newStore, setNewStore] = useState({
    name: '',
    email: '',
    address: '',
    ownerId: ''
  });
  const [addStoreError, setAddStoreError] = useState('');
  const [addStoreSuccess, setAddStoreSuccess] = useState('');
  const [addStoreLoading, setAddStoreLoading] = useState(false);

  // List of available store owners for store creation
  const [storeOwners, setStoreOwners] = useState([]);

  useEffect(() => {
    fetchStats();
    fetchUsers();
    fetchStores();
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [userSearch, roleFilter, userSortBy, userSortOrder]);

  useEffect(() => {
    fetchStores();
  }, [storeSearch, storeSortBy, storeSortOrder]);

  const fetchStats = async () => {
    try {
      const res = await axiosInstance.get('/admin/stats');
      setStats(res.data);
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  };

  const fetchUsers = async () => {
    setUsersLoading(true);
    try {
      const params = {
        search: userSearch,
        role: roleFilter,
        sortBy: userSortBy,
        order: userSortOrder
      };
      const res = await axiosInstance.get('/admin/users', { params });
      setUsers(res.data);

      // Extract store owners for store creation dropdown
      const owners = res.data.filter((u) => u.role === 'STORE_OWNER');
      setStoreOwners(owners);
    } catch (err) {
      console.error('Error fetching users:', err);
    } finally {
      setUsersLoading(false);
    }
  };

  const fetchStores = async () => {
    setStoresLoading(true);
    try {
      const params = {
        search: storeSearch,
        sortBy: storeSortBy,
        order: storeSortOrder
      };
      const res = await axiosInstance.get('/admin/stores', { params });
      setStores(res.data);
    } catch (err) {
      console.error('Error fetching stores:', err);
    } finally {
      setStoresLoading(false);
    }
  };

  // Sorting handlers
  const handleUserSort = (field) => {
    if (userSortBy === field) {
      setUserSortOrder(userSortOrder === 'ASC' ? 'DESC' : 'ASC');
    } else {
      setUserSortBy(field);
      setUserSortOrder('ASC');
    }
  };

  const handleStoreSort = (field) => {
    if (storeSortBy === field) {
      setStoreSortOrder(storeSortOrder === 'ASC' ? 'DESC' : 'ASC');
    } else {
      setStoreSortBy(field);
      setStoreSortOrder('ASC');
    }
  };

  const renderSortIcon = (currentField, field, order) => {
    if (currentField !== field) return <ArrowUpDown size={14} className="sort-icon inactive" />;
    return order === 'ASC' ? <ArrowUp size={14} className="sort-icon active" /> : <ArrowDown size={14} className="sort-icon active" />;
  };

  // Add User Validation Checks
  const nuNameLen = newUser.name.trim().length;
  const nuNameValid = nuNameLen >= 20 && nuNameLen <= 60;

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const nuEmailValid = emailRegex.test(newUser.email.trim());

  const nuAddressLen = newUser.address.trim().length;
  const nuAddressValid = nuAddressLen > 0 && nuAddressLen <= 400;

  const nuPassLenValid = newUser.password.length >= 8 && newUser.password.length <= 16;
  const nuPassUpperValid = /[A-Z]/.test(newUser.password);
  const nuPassSpecialValid = /[!@#$%^&*(),.?":{}|<>_\-\+\=]/.test(newUser.password);
  const nuPassValid = nuPassLenValid && nuPassUpperValid && nuPassSpecialValid;

  const isAddUserValid = nuNameValid && nuEmailValid && nuAddressValid && nuPassValid;

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setAddUserError('');
    setAddUserSuccess('');

    if (!isAddUserValid) {
      setAddUserError('Please resolve all validation errors.');
      return;
    }

    setAddUserLoading(true);
    try {
      await axiosInstance.post('/admin/users', newUser);
      setAddUserSuccess('User created successfully!');
      setNewUser({ name: '', email: '', password: '', address: '', role: 'NORMAL_USER' });
      fetchUsers();
      fetchStats();
      setTimeout(() => {
        setAddUserSuccess('');
        setIsAddUserOpen(false);
      }, 1200);
    } catch (err) {
      setAddUserError(err.response?.data?.error || 'Failed to create user.');
    } finally {
      setAddUserLoading(false);
    }
  };

  // Add Store Validation Checks
  const nsNameLen = newStore.name.trim().length;
  const nsNameValid = nsNameLen >= 20 && nsNameLen <= 60;
  const nsEmailValid = emailRegex.test(newStore.email.trim());
  const nsAddressLen = newStore.address.trim().length;
  const nsAddressValid = nsAddressLen > 0 && nsAddressLen <= 400;
  const isAddStoreValid = nsNameValid && nsEmailValid && nsAddressValid;

  const handleCreateStore = async (e) => {
    e.preventDefault();
    setAddStoreError('');
    setAddStoreSuccess('');

    if (!isAddStoreValid) {
      setAddStoreError('Please resolve all store validation rules.');
      return;
    }

    setAddStoreLoading(true);
    try {
      await axiosInstance.post('/admin/stores', newStore);
      setAddStoreSuccess('Store created successfully!');
      setNewStore({ name: '', email: '', address: '', ownerId: '' });
      fetchStores();
      fetchStats();
      setTimeout(() => {
        setAddStoreSuccess('');
        setIsAddStoreOpen(false);
      }, 1200);
    } catch (err) {
      setAddStoreError(err.response?.data?.error || 'Failed to create store.');
    } finally {
      setAddStoreLoading(false);
    }
  };

  return (
    <div className="app-layout">
      <Navbar />

      <main className="main-content">
        <div className="content-container">
          <div className="page-header">
            <div>
              <h1 className="page-title">Admin Dashboard</h1>
            </div>
            <div className="header-actions">
              <button className="btn btn-primary" onClick={() => setIsAddUserOpen(true)}>
                <UserCheck size={18} />
                <span>Add New User</span>
              </button>
              <button className="btn btn-secondary" onClick={() => setIsAddStoreOpen(true)}>
                <Building size={18} />
                <span>Add New Store</span>
              </button>
            </div>
          </div>

          {/* Stats Cards Row */}
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-info">
                <div className="stat-label-group">
                  <div className="stat-icon-wrapper icon-users">
                    <Users size={22} />
                  </div>
                  <span className="stat-label">Total Users</span>
                </div>
                <span className="stat-value">{stats.totalUsers}</span>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-info">
                <div className="stat-label-group">
                  <div className="stat-icon-wrapper icon-stores">
                    <Store size={22} />
                  </div>
                  <span className="stat-label">Total Stores</span>
                </div>
                <span className="stat-value">{stats.totalStores}</span>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-info">
                <div className="stat-label-group">
                  <div className="stat-icon-wrapper icon-ratings">
                    <Star size={22} />
                  </div>
                  <span className="stat-label">Total Ratings</span>
                </div>
                <span className="stat-value">{stats.totalRatings}</span>
              </div>
            </div>
          </div>

          {/* Directory Tabs */}
          <div className="directory-card">
            <div className="tab-header-row">
              <div className="tab-buttons">
                <button
                  className={`tab-btn ${activeTab === 'users' ? 'active' : ''}`}
                  onClick={() => setActiveTab('users')}
                >
                  <Users size={18} />
                  <span>Users Directory</span>
                  <span className="tab-badge">{users.length}</span>
                </button>
                <button
                  className={`tab-btn ${activeTab === 'stores' ? 'active' : ''}`}
                  onClick={() => setActiveTab('stores')}
                >
                  <Store size={18} />
                  <span>Stores Directory</span>
                  <span className="tab-badge">{stores.length}</span>
                </button>
              </div>
            </div>

            {/* TAB 1: USERS DIRECTORY */}
            {activeTab === 'users' && (
              <div className="tab-content-wrapper">
                {/* Search and Filters Bar */}
                <div className="filters-bar">
                  <div className="search-input-box">
                    <Search size={18} className="search-icon" />
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Filter users by Name, Email, Address, or Role..."
                      value={userSearch}
                      onChange={(e) => setUserSearch(e.target.value)}
                    />
                  </div>
                  <div className="filter-select-box">
                    <Filter size={18} className="select-icon" />
                    <select
                      className="form-control"
                      value={roleFilter}
                      onChange={(e) => setRoleFilter(e.target.value)}
                    >
                      <option value="">All User Roles</option>
                      <option value="ADMIN">System Administrator</option>
                      <option value="NORMAL_USER">Normal User</option>
                      <option value="STORE_OWNER">Store Owner</option>
                    </select>
                  </div>
                </div>

                {/* Users Table */}
                <div className="table-responsive">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th onClick={() => handleUserSort('name')} className="sortable-th">
                          <span>Name</span> {renderSortIcon(userSortBy, 'name', userSortOrder)}
                        </th>
                        <th onClick={() => handleUserSort('email')} className="sortable-th">
                          <span>Email</span> {renderSortIcon(userSortBy, 'email', userSortOrder)}
                        </th>
                        <th onClick={() => handleUserSort('address')} className="sortable-th">
                          <span>Address</span> {renderSortIcon(userSortBy, 'address', userSortOrder)}
                        </th>
                        <th onClick={() => handleUserSort('role')} className="sortable-th">
                          <span>Role</span> {renderSortIcon(userSortBy, 'role', userSortOrder)}
                        </th>
                        <th onClick={() => handleUserSort('rating')} className="sortable-th">
                          <span>Rating</span> {renderSortIcon(userSortBy, 'rating', userSortOrder)}
                        </th>
                        <th style={{ textAlign: 'center' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {usersLoading ? (
                        <tr>
                          <td colSpan="6" className="text-center py-4">Loading users list...</td>
                        </tr>
                      ) : users.length === 0 ? (
                        <tr>
                          <td colSpan="6" className="text-center py-4 text-muted">No users found matching filter criteria.</td>
                        </tr>
                      ) : (
                        users.map((u) => (
                          <tr key={u.id}>
                            <td className="font-semibold">{u.name}</td>
                            <td>{u.email}</td>
                            <td className="text-truncate-2" title={u.address}>{u.address}</td>
                            <td>
                              <span className={`role-badge ${u.role === 'ADMIN' ? 'badge-admin' : u.role === 'STORE_OWNER' ? 'badge-owner' : 'badge-user'}`}>
                                {u.role === 'ADMIN' ? 'Admin' : u.role === 'STORE_OWNER' ? 'Store Owner' : 'Normal User'}
                              </span>
                            </td>
                            <td>
                              {u.role === 'STORE_OWNER' ? (
                                u.rating > 0 ? (
                                  <StarRating rating={u.rating} readOnly size={16} />
                                ) : (
                                  <span className="text-muted small">No ratings yet</span>
                                )
                              ) : (
                                <span className="text-muted small">N/A</span>
                              )}
                            </td>
                            <td style={{ textAlign: 'center' }}>
                              <button
                                className="btn btn-icon btn-sm"
                                onClick={() => setSelectedUserDetail(u)}
                                title="View User Details"
                              >
                                <Eye size={16} />
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB 2: STORES DIRECTORY */}
            {activeTab === 'stores' && (
              <div className="tab-content-wrapper">
                <div className="filters-bar">
                  <div className="search-input-box full-width">
                    <Search size={18} className="search-icon" />
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Filter stores by Name, Email, or Address..."
                      value={storeSearch}
                      onChange={(e) => setStoreSearch(e.target.value)}
                    />
                  </div>
                </div>

                <div className="table-responsive">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th onClick={() => handleStoreSort('name')} className="sortable-th">
                          <span>Store Name</span> {renderSortIcon(storeSortBy, 'name', storeSortOrder)}
                        </th>
                        <th onClick={() => handleStoreSort('email')} className="sortable-th">
                          <span>Email</span> {renderSortIcon(storeSortBy, 'email', storeSortOrder)}
                        </th>
                        <th onClick={() => handleStoreSort('address')} className="sortable-th">
                          <span>Address</span> {renderSortIcon(storeSortBy, 'address', storeSortOrder)}
                        </th>
                        <th onClick={() => handleStoreSort('rating')} className="sortable-th">
                          <span>Overall Rating</span> {renderSortIcon(storeSortBy, 'rating', storeSortOrder)}
                        </th>
                        <th>Owner</th>
                      </tr>
                    </thead>
                    <tbody>
                      {storesLoading ? (
                        <tr>
                          <td colSpan="5" className="text-center py-4">Loading stores list...</td>
                        </tr>
                      ) : stores.length === 0 ? (
                        <tr>
                          <td colSpan="5" className="text-center py-4 text-muted">No stores found matching search criteria.</td>
                        </tr>
                      ) : (
                        stores.map((s) => (
                          <tr key={s.id}>
                            <td className="font-semibold">{s.name}</td>
                            <td>{s.email}</td>
                            <td className="text-truncate-2" title={s.address}>{s.address}</td>
                            <td>
                              <StarRating rating={s.rating} readOnly size={16} />
                              <span className="rating-count-sub">({s.total_ratings} review{s.total_ratings === 1 ? '' : 's'})</span>
                            </td>
                            <td>
                              {s.owner_name ? (
                                <span className="text-sm font-medium">{s.owner_name}</span>
                              ) : (
                                <span className="text-muted small">Unassigned</span>
                              )}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* MODAL 1: ADD NEW USER */}
      <Modal isOpen={isAddUserOpen} onClose={() => setIsAddUserOpen(false)} title="Add New User">
        <form onSubmit={handleCreateUser} className="form-space">
          {addUserError && (
            <div className="alert alert-error">
              <AlertCircle size={18} />
              <span>{addUserError}</span>
            </div>
          )}
          {addUserSuccess && (
            <div className="alert alert-success">
              <Check size={18} />
              <span>{addUserSuccess}</span>
            </div>
          )}

          <div className="form-group">
            <div className="label-with-hint">
              <label className="form-label">Full Name</label>
              <span className={`char-counter ${nuNameValid ? 'text-success' : nuNameLen > 0 ? 'text-danger' : ''}`}>
                {nuNameLen}/60 (Min 20)
              </span>
            </div>
            <input
              type="text"
              className={`form-control ${nuNameLen > 0 && !nuNameValid ? 'is-invalid' : ''}`}
              placeholder="Name (20 - 60 characters)"
              value={newUser.name}
              onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              type="email"
              className={`form-control ${newUser.email && !nuEmailValid ? 'is-invalid' : ''}`}
              placeholder="name@example.com"
              value={newUser.email}
              onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Role</label>
            <select
              className="form-control"
              value={newUser.role}
              onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
            >
              <option value="NORMAL_USER">Normal User</option>
              <option value="ADMIN">System Administrator</option>
              <option value="STORE_OWNER">Store Owner</option>
            </select>
          </div>

          <div className="form-group">
            <div className="label-with-hint">
              <label className="form-label">Address</label>
              <span className={`char-counter ${nuAddressValid ? 'text-success' : nuAddressLen > 400 ? 'text-danger' : ''}`}>
                {nuAddressLen}/400
              </span>
            </div>
            <textarea
              rows="2"
              className="form-control"
              placeholder="Address (Max 400 characters)"
              value={newUser.address}
              onChange={(e) => setNewUser({ ...newUser, address: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Initial Password</label>
            <input
              type="password"
              className="form-control"
              placeholder="Password (8-16 chars, 1 upper, 1 special)"
              value={newUser.password}
              onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
              required
            />
            <div className="validation-rules-card mt-2">
              <div className={`rule-item ${nuPassLenValid ? 'valid' : ''}`}>
                {nuPassLenValid ? <Check size={14} /> : <X size={14} />}
                <span>8 to 16 characters</span>
              </div>
              <div className={`rule-item ${nuPassUpperValid ? 'valid' : ''}`}>
                {nuPassUpperValid ? <Check size={14} /> : <X size={14} />}
                <span>At least 1 uppercase letter</span>
              </div>
              <div className={`rule-item ${nuPassSpecialValid ? 'valid' : ''}`}>
                {nuPassSpecialValid ? <Check size={14} /> : <X size={14} />}
                <span>At least 1 special character</span>
              </div>
            </div>
          </div>

          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={() => setIsAddUserOpen(false)} disabled={addUserLoading}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={addUserLoading || !isAddUserValid}>
              {addUserLoading ? 'Creating...' : 'Create User'}
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL 2: ADD NEW STORE */}
      <Modal isOpen={isAddStoreOpen} onClose={() => setIsAddStoreOpen(false)} title="Add New Store">
        <form onSubmit={handleCreateStore} className="form-space">
          {addStoreError && (
            <div className="alert alert-error">
              <AlertCircle size={18} />
              <span>{addStoreError}</span>
            </div>
          )}
          {addStoreSuccess && (
            <div className="alert alert-success">
              <Check size={18} />
              <span>{addStoreSuccess}</span>
            </div>
          )}

          <div className="form-group">
            <div className="label-with-hint">
              <label className="form-label">Store Name</label>
              <span className={`char-counter ${nsNameValid ? 'text-success' : nsNameLen > 0 ? 'text-danger' : ''}`}>
                {nsNameLen}/60 (Min 20)
              </span>
            </div>
            <input
              type="text"
              className="form-control"
              placeholder="Store Name (20 - 60 characters)"
              value={newStore.name}
              onChange={(e) => setNewStore({ ...newStore, name: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Store Email</label>
            <input
              type="email"
              className="form-control"
              placeholder="store@example.com"
              value={newStore.email}
              onChange={(e) => setNewStore({ ...newStore, email: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <div className="label-with-hint">
              <label className="form-label">Store Address</label>
              <span className={`char-counter ${nsAddressValid ? 'text-success' : nsAddressLen > 400 ? 'text-danger' : ''}`}>
                {nsAddressLen}/400
              </span>
            </div>
            <textarea
              rows="2"
              className="form-control"
              placeholder="Store Address (Max 400 characters)"
              value={newStore.address}
              onChange={(e) => setNewStore({ ...newStore, address: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Assign Store Owner (Optional)</label>
            <select
              className="form-control"
              value={newStore.ownerId}
              onChange={(e) => setNewStore({ ...newStore, ownerId: e.target.value })}
            >
              <option value="">Select a registered Store Owner...</option>
              {storeOwners.map((owner) => (
                <option key={owner.id} value={owner.id}>
                  {owner.name} ({owner.email})
                </option>
              ))}
            </select>
          </div>

          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={() => setIsAddStoreOpen(false)} disabled={addStoreLoading}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={addStoreLoading || !isAddStoreValid}>
              {addStoreLoading ? 'Creating Store...' : 'Create Store'}
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL 3: VIEW USER DETAILS */}
      <Modal
        isOpen={!!selectedUserDetail}
        onClose={() => setSelectedUserDetail(null)}
        title="User Account Details"
      >
        {selectedUserDetail && (
          <div className="user-detail-card">
            <div className="detail-item">
              <span className="detail-label">Name : </span>
              <span className="detail-value font-semibold">{selectedUserDetail.name}</span>
            </div>

            <div className="detail-item">
              <span className="detail-label">Email :</span>
              <span className="detail-value">{selectedUserDetail.email}</span>
            </div>

            <div className="detail-item">
              <span className="detail-label">Address : </span>
              <span className="detail-value">{selectedUserDetail.address}</span>
            </div>

            <div className="detail-item">
              <span className="detail-label">User Role : </span>
              <span className="detail-value">
                <span className={`role-badge ${selectedUserDetail.role === 'ADMIN' ? 'badge-admin' : selectedUserDetail.role === 'STORE_OWNER' ? 'badge-owner' : 'badge-user'}`}>
                  {selectedUserDetail.role === 'ADMIN' ? 'System Administrator' : selectedUserDetail.role === 'STORE_OWNER' ? 'Store Owner' : 'Normal User'}
                </span>
              </span>
            </div>

            {selectedUserDetail.role === 'STORE_OWNER' && (
              <>
                <div className="detail-item border-top mt-2 pt-2">
                  <span className="detail-label">Assigned Store : </span>
                  <span className="detail-value font-medium">
                    {selectedUserDetail.store_name || 'No store assigned yet'}
                  </span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Store Overall Rating : </span>
                  <span className="detail-value">
                    {selectedUserDetail.store_name ? (
                      <StarRating rating={selectedUserDetail.rating} readOnly size={18} />
                    ) : (
                      <span className="text-muted">N/A</span>
                    )}
                  </span>
                </div>
              </>
            )}

            <div className="form-actions mt-4">
              <button className="btn btn-secondary btn-block" onClick={() => setSelectedUserDetail(null)}>
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AdminDashboard;
