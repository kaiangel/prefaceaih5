// pages/Settings/Settings.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../contexts/AppContext';
import { getStorageInfo, clearStorageData } from '../../utils/storage';
import { formatFileSize } from '../../utils/formatter';
import { showToast } from '../../components/common/Toast';
import './Settings.css';

const Settings = () => {
  const navigate = useNavigate();
  const { globalData, logout } = useApp();
  
  const [notificationEnabled, setNotificationEnabled] = useState(false);
  const [cacheSize, setCacheSize] = useState('0 KB');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  
  useEffect(() => {
    // 加载通知设置状态
    loadNotificationSetting();
    // 计算缓存大小
    calculateCacheSize();
    // 检查登录状态
    checkLoginStatus();
  }, [globalData.isLoggedIn]);
  
  const checkLoginStatus = () => {
    setIsLoggedIn(globalData.isLoggedIn);
  };
  
  const goBack = () => {
    navigate(-1);
  };
  
  const loadNotificationSetting = () => {
    try {
      const enabled = localStorage.getItem('notificationEnabled') === 'true';
      setNotificationEnabled(enabled);
    } catch (e) {
      console.error('加载通知设置失败:', e);
    }
  };
  
  const toggleNotification = (e) => {
    const enabled = e.target.checked;
    setNotificationEnabled(enabled);
    
    try {
      localStorage.setItem('notificationEnabled', enabled.toString());
    } catch (error) {
      console.error('保存通知设置失败:', error);
      // 还原开关状态
      setNotificationEnabled(!enabled);
      showToast('设置保存失败', { icon: 'error' });
    }
  };
  
  const calculateCacheSize = () => {
    const storageInfo = getStorageInfo();
    setCacheSize(`${storageInfo.currentSize} KB`);
  };
  
  const clearCache = () => {
    if (window.confirm('确定要清除所有缓存数据吗？')) {
      try {
        // 保留的关键数据的key
        const preserveKeys = ['token', 'userInfo'];
        
        // 清除非关键数据
        clearStorageData(preserveKeys);
        
        // 重新计算缓存大小
        calculateCacheSize();
        
        showToast('清除成功', { icon: 'success' });
        
        // 重新加载通知设置
        loadNotificationSetting();
      } catch (error) {
        console.error('清除缓存失败:', error);
        showToast('清除失败', { icon: 'error' });
      }
    }
  };
  
  const handleSignOut = () => {
    if (window.confirm('确定要退出登录吗？')) {
      logout();
      navigate('/', { replace: true });
    }
  };
  
  return (
    <div className="settings-container">
      {/* 顶部导航 */}
      <div className="search-bar">
        <div className="back-btn" onClick={goBack}>
          <span className="back-arrow">←</span>
        </div>
        <div className="page-title">通用设置</div>
      </div>
      
      {/* 设置列表 */}
      <div className="settings-list">
        {/* 通知设置 */}
        <div className="settings-item">
          <div className="item-left">
            <img className="item-icon" src="/assets/icons/notification.png" alt="Notification" />
            <span className="item-label">网页内通知</span>
          </div>
          <label className="switch">
            <input 
              type="checkbox"
              checked={notificationEnabled}
              onChange={toggleNotification}
            />
            <span className="slider round"></span>
          </label>
        </div>
        
        {/* 清除缓存 */}
        <div className="settings-item" onClick={clearCache}>
          <div className="item-left">
            <img className="item-icon" src="/assets/icons/clear.png" alt="Clear" />
            <span className="item-label">清除缓存</span>
          </div>
          <div className="item-right">
            <span className="cache-size">{cacheSize}</span>
            <span className="arrow">→</span>
          </div>
        </div>
        
        {/* 退出登录 */}
        {isLoggedIn && (
          <div className="settings-item settings-item-signout" onClick={handleSignOut}>
            <div className="item-left">
              <img className="item-icon" src="/assets/icons/logout.png" alt="Logout" />
              <span className="item-label">退出登录</span>
            </div>
            <div className="item-right">
              <span className="arrow">→</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Settings;