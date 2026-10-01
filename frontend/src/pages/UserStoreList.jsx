import React, { useState, useEffect } from 'react';
import axiosInstance from '../api/axiosInstance';
import Navbar from '../components/Navbar';
import StarRating from '../components/StarRating';
import { Search, MapPin, Store, Star, ArrowUpDown, ArrowUp, ArrowDown, CheckCircle2, AlertCircle } from 'lucide-react';

const UserStoreList = () => {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [order, setOrder] = useState('ASC');

  // Rating action notification toast
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    fetchStores();
  }, [searchQuery, sortBy, order]);

  const fetchStores = async () => {
    setLoading(true);
    try {
      const params = {
        search: searchQuery,
        sortBy,
        order
      };
      const res = await axiosInstance.get('/user/stores', { params });
      setStores(res.data);
    } catch (err) {
      console.error('Error fetching store list:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setOrder(order === 'ASC' ? 'DESC' : 'ASC');
    } else {
      setSortBy(field);
      setOrder('ASC');
    }
  };

  const renderSortIcon = (field) => {
    if (sortBy !== field) return <ArrowUpDown size={14} className="sort-icon inactive" />;
    return order === 'ASC' ? <ArrowUp size={14} className="sort-icon active" /> : <ArrowDown size={14} className="sort-icon active" />;
  };

  const handleRateStore = async (storeId, newRating) => {
    try {
      const res = await axiosInstance.post('/user/ratings', {
        storeId,
        rating: newRating
      });

      setNotification({
        type: 'success',
        message: `${res.data.message}`
      });

      // Update local stores state immediately for instant feedback
      setStores((prevStores) =>
        prevStores.map((s) => {
          if (s.id === storeId) {
            return {
              ...s,
              user_rating: newRating,
              rating: res.data.overallRating,
              total_ratings: res.data.totalRatings
            };
          }
          return s;
        })
      );

      setTimeout(() => setNotification(null), 3000);
    } catch (err) {
      setNotification({
        type: 'error',
        message: err.response?.data?.error || 'Failed to submit rating.'
      });
      setTimeout(() => setNotification(null), 3500);
    }
  };

  return (
    <div className="app-layout">
      <Navbar />

      <main className="main-content">
        <div className="content-container">
          <div className="page-header">
            <div>
              <h1 className="page-title">Registered Stores Directory</h1>
              <p className="page-description">Browse stores, view overall ratings, and submit or modify your personal ratings</p>
            </div>
          </div>

          {notification && (
            <div className={`toast-notification ${notification.type}`}>
              {notification.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
              <span>{notification.message}</span>
            </div>
          )}

          {/* Search & Sort Controls Card */}
          <div className="search-card">
            <div className="search-row">
              <div className="search-input-box flex-grow">
                <Search size={18} className="search-icon" />
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search stores by Name or Address..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <div className="sort-buttons-group">
                <span className="sort-label">Sort By:</span>
                <button
                  className={`btn btn-sm ${sortBy === 'name' ? 'btn-primary' : 'btn-outline'}`}
                  onClick={() => handleSort('name')}
                >
                  Name {renderSortIcon('name')}
                </button>
                <button
                  className={`btn btn-sm ${sortBy === 'address' ? 'btn-primary' : 'btn-outline'}`}
                  onClick={() => handleSort('address')}
                >
                  Address {renderSortIcon('address')}
                </button>
                <button
                  className={`btn btn-sm ${sortBy === 'rating' ? 'btn-primary' : 'btn-outline'}`}
                  onClick={() => handleSort('rating')}
                >
                  Overall Rating {renderSortIcon('rating')}
                </button>
                <button
                  className={`btn btn-sm ${sortBy === 'user_rating' ? 'btn-primary' : 'btn-outline'}`}
                  onClick={() => handleSort('user_rating')}
                >
                  My Rating {renderSortIcon('user_rating')}
                </button>
              </div>
            </div>
          </div>

          {/* Store Grid Cards */}
          {loading ? (
            <div className="loading-container">
              <div className="spinner"></div>
              <p>Loading stores...</p>
            </div>
          ) : stores.length === 0 ? (
            <div className="empty-state-card">
              <Store size={48} className="empty-icon" />
              <h3>No stores found</h3>
              <p>No registered stores match your search query "{searchQuery}".</p>
            </div>
          ) : (
            <div className="store-cards-grid">
              {stores.map((s) => (
                <div key={s.id} className="store-card">
                  <div className="store-card-header">
                    <div className="store-icon-wrapper">
                      <Store size={22} />
                    </div>
                    <div className="store-title-block">
                      <h3 className="store-title">{s.name}</h3>
                      <span className="store-email">{s.email}</span>
                    </div>
                  </div>

                  <div className="store-address-box">
                    <MapPin size={16} className="pin-icon" />
                    <span>{s.address}</span>
                  </div>

                  <div className="ratings-comparison-section">
                    <div className="rating-box-item">
                      <span className="rating-box-label">Overall Rating</span>
                      <div className="rating-box-val">
                        <StarRating rating={s.rating} readOnly size={18} />
                        <span className="review-count">({s.total_ratings} rating{s.total_ratings === 1 ? '' : 's'})</span>
                      </div>
                    </div>

                    <div className="rating-box-item my-rating-box">
                      <span className="rating-box-label">
                        {s.user_rating ? 'Your Submitted Rating' : 'Submit Your Rating'}
                      </span>
                      <div className="interactive-rating-wrapper">
                        <StarRating
                          rating={s.user_rating || 0}
                          readOnly={false}
                          size={22}
                          onChange={(newRating) => handleRateStore(s.id, newRating)}
                        />
                        {s.user_rating ? (
                          <span className="user-rating-badge">
                            You rated: {s.user_rating} ⭐ (Click stars to modify)
                          </span>
                        ) : (
                          <span className="user-rating-hint">
                            Click 1-5 stars to rate this store
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default UserStoreList;
