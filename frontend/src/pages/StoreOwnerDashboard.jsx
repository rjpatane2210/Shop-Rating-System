import React, { useState, useEffect } from 'react';
import axiosInstance from '../api/axiosInstance';
import Navbar from '../components/Navbar';
import StarRating from '../components/StarRating';
import { Store, Star, Users, MapPin, Mail, ArrowUpDown, ArrowUp, ArrowDown, AlertCircle } from 'lucide-react';

const StoreOwnerDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sortBy, setSortBy] = useState('updated_at');
  const [order, setOrder] = useState('DESC');

  useEffect(() => {
    fetchDashboard();
  }, [sortBy, order]);

  const fetchDashboard = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get('/owner/dashboard', {
        params: { sortBy, order }
      });
      setDashboardData(res.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load Store Owner Dashboard.');
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setOrder(order === 'ASC' ? 'DESC' : 'ASC');
    } else {
      setSortBy(field);
      setOrder('DESC');
    }
  };

  const renderSortIcon = (field) => {
    if (sortBy !== field) return <ArrowUpDown size={14} className="sort-icon inactive" />;
    return order === 'ASC' ? <ArrowUp size={14} className="sort-icon active" /> : <ArrowDown size={14} className="sort-icon active" />;
  };

  if (loading && !dashboardData) {
    return (
      <div className="app-layout">
        <Navbar />
        <div className="loading-container p-8">
          <div className="spinner"></div>
          <p>Loading Store Owner Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="app-layout">
      <Navbar />

      <main className="main-content">
        <div className="content-container">
          <div className="page-header">
            <div>
              <h1 className="page-title">Store Owner Dashboard</h1>
              <p className="page-description">Monitor your store's average rating performance and submitted customer reviews</p>
            </div>
          </div>

          {error && (
            <div className="alert alert-error mb-4">
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          {!dashboardData?.hasStore ? (
            <div className="empty-state-card">
              <Store size={48} className="empty-icon" />
              <h3>No Assigned Store Found</h3>
              <p>Your Store Owner account is not currently linked to any registered store. Please contact the System Administrator to assign your store.</p>
            </div>
          ) : (
            <>
              {/* Store Details Header Card */}
              <div className="owner-store-card">
                <div className="owner-store-info">
                  <div className="store-avatar">
                    <Store size={32} />
                  </div>
                  <div className="store-meta">
                    <h2>{dashboardData.store.name}</h2>
                    <div className="meta-pills">
                      <span className="meta-item"><Mail size={14} /> {dashboardData.store.email}</span>
                      <span className="meta-item"><MapPin size={14} /> {dashboardData.store.address}</span>
                    </div>
                  </div>
                </div>

                {/* Metric Summary */}
                <div className="owner-rating-summary">
                  <div className="big-rating-number">
                    {Number(dashboardData.averageRating).toFixed(1)}
                  </div>
                  <div className="rating-stars-col">
                    <StarRating rating={dashboardData.averageRating} readOnly size={22} />
                    <span className="total-reviews-count">
                      Based on {dashboardData.totalRatings} user rating{dashboardData.totalRatings === 1 ? '' : 's'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Customer Ratings Table Section */}
              <div className="directory-card mt-6">
                <div className="section-header-row">
                  <div className="section-title-group">
                    <Users size={20} />
                    <h3>Customer Submitted Ratings</h3>
                    <span className="tab-badge">{dashboardData.ratingsList.length}</span>
                  </div>
                </div>

                <div className="table-responsive">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th onClick={() => handleSort('user_name')} className="sortable-th">
                          <span>User Name</span> {renderSortIcon('user_name')}
                        </th>
                        <th onClick={() => handleSort('user_email')} className="sortable-th">
                          <span>Email</span> {renderSortIcon('user_email')}
                        </th>
                        <th>User Address</th>
                        <th onClick={() => handleSort('rating')} className="sortable-th">
                          <span>Submitted Rating</span> {renderSortIcon('rating')}
                        </th>
                        <th onClick={() => handleSort('updated_at')} className="sortable-th">
                          <span>Date / Time</span> {renderSortIcon('updated_at')}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {dashboardData.ratingsList.length === 0 ? (
                        <tr>
                          <td colSpan="5" className="text-center py-6 text-muted">
                            No customers have submitted ratings for your store yet.
                          </td>
                        </tr>
                      ) : (
                        dashboardData.ratingsList.map((item) => (
                          <tr key={item.rating_id}>
                            <td className="font-semibold">{item.user_name}</td>
                            <td>{item.user_email}</td>
                            <td className="text-truncate-2" title={item.user_address}>
                              {item.user_address}
                            </td>
                            <td>
                              <StarRating rating={item.rating} readOnly size={18} />
                            </td>
                            <td className="text-muted text-sm">
                              {new Date(item.updated_at || item.created_at).toLocaleString()}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default StoreOwnerDashboard;
