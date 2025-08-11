// components/NavigationBar/NavigationBar.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../contexts/AppContext';
import './NavigationBar.css';

const NavigationBar = ({ fixed = true, children }) => {
  const navigate = useNavigate();
  const { globalData, logout } = useApp(); // 在组件顶层调用 useApp 钩子，获取所需方法
  
  const [showDropdown, setShowDropdown] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  
  useEffect(() => {
    checkLoginStatus();
  }, [globalData.isLoggedIn]);
  
  const checkLoginStatus = () => {
    setIsLoggedIn(globalData.isLoggedIn);
  };
  
  const toggleDropdown = () => {
    checkLoginStatus();
    setShowDropdown(!showDropdown);
    
    if (!showDropdown) {
      setTimeout(() => {
        setShowDropdown(false);
      }, 2300);
    }
  };
  
  const closeDropdown = () => {
    setShowDropdown(false);
  };
  
  const navigateToPage = (url) => {
    closeDropdown();
    navigate(url);
  };
  
  const navigateToProfile = () => {
    navigateToPage('/profile');
  };
  
  const navigateToHistory = () => {
    navigateToPage('/history');
  };
  
  // 修改这个函数，不要在函数内部调用 useApp
  const handleLoginOrLogout = () => {
    // 使用上面已经获取的 logout 方法，而不是在这里调用 useApp
    if (isLoggedIn) {
      if (window.confirm('确定要退出登录吗？')) {
        logout();
        closeDropdown();
        navigate('/', { replace: true });
      }
    } else {
      navigateToPage('/login');
    }
  };
  
  return (
    <div className={`nav-bar ${fixed ? 'fixed' : ''}`}>
      <div className="nav-bar-content">
        <div className="left">
          {children?.left}
        </div>
        <div className="center">
          {children?.center}
        </div>
        <div className="right">
          <div className="user-btn" onClick={toggleDropdown}>
            <img className="user-icon" src="/assets/icons/user.png" alt="User" />
          </div>
        </div>
      </div>
      
      <div 
        className={`dropdown-mask ${showDropdown ? 'show' : ''}`} 
        onClick={closeDropdown}
      ></div>
      
      <div className={`dropdown-menu ${showDropdown ? 'show' : ''}`}>
        <div className="menu-item" onClick={navigateToProfile}>
          <img className="menu-icon" src="/assets/icons/profile.png" alt="Profile" />
          <div className="menu-text">我的</div>
        </div>
        
        {isLoggedIn && (
          <div className="menu-item" onClick={navigateToHistory}>
            <img className="menu-icon" src="/assets/icons/history.png" alt="History" />
            <div className="menu-text">历史记录</div>
          </div>
        )}
        
        <div className={`menu-item ${isLoggedIn ? 'logout' : 'login'}`} onClick={handleLoginOrLogout}>
          <img 
            className="menu-icon" 
            src={`/assets/icons/${isLoggedIn ? 'logout' : 'login'}.png`} 
            alt={isLoggedIn ? 'Logout' : 'Login'} 
          />
          <div className="menu-text">{isLoggedIn ? '退出登录' : '谷歌登录'}</div>
        </div>
      </div>
    </div>
  );
};

export default NavigationBar;