import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Store, LogOut, Key, User, ChevronDown } from 'lucide-react';
import PasswordModal from './PasswordModal';

const Navbar = () => {
  const { user, logout } = useAuth();
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!user) return null;



  const roleClasses = {
    ADMIN: 'badge-admin',
    NORMAL_USER: 'badge-user',
    STORE_OWNER: 'badge-owner'
  };

  return (
    <>
      <header className="navbar">
        <div className="navbar-container">
          <div className="navbar-brand">
            <div className="brand-icon">
              <Store size={24} />
            </div>
            <div className="brand-text">
              <span className="brand-title">StoreRating</span>
              <span className="brand-subtitle">Platform</span>
            </div>
          </div>

          <div className="navbar-actions" ref={dropdownRef}>
            <button
              className="user-menu-btn"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="User menu"
            >
              <div className="avatar-circle">
                <User size={18} />
              </div>
              <span className="user-name">{user.name}</span>
              <ChevronDown size={16} className={`chevron-icon ${isMenuOpen ? 'open' : ''}`} />
            </button>

            {isMenuOpen && (
              <div className="user-dropdown-menu">
                <div className="dropdown-user-header">
                  <div className="dropdown-user-name">{user.name}</div>
                  <div className="dropdown-user-email">{user.email}</div>
                </div>

                <div className="dropdown-divider"></div>

                <button
                  className="dropdown-item"
                  onClick={() => {
                    setIsMenuOpen(false);
                    setIsPasswordModalOpen(true);
                  }}
                >
                  <Key size={16} />
                  <span>Change Password</span>
                </button>

                <button
                  className="dropdown-item dropdown-item-danger"
                  onClick={() => {
                    setIsMenuOpen(false);
                    logout();
                  }}
                >
                  <LogOut size={16} />
                  <span>Log Out</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <PasswordModal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
      />
    </>
  );
};

export default Navbar;
