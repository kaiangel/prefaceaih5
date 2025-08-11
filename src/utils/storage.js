// utils/storage.js
/**
 * 本地存储服务封装，替代微信小程序的storage API
 */

  // utils/storage.js
  export const getStorageData = (key, defaultValue = null) => {
    try {
      const value = localStorage.getItem(key);
      if (!value) return defaultValue;
      
      // 对token和openid特殊处理，不尝试解析
      if (key === 'token' || key === 'openid') {
        return value;
      }
      
      return JSON.parse(value);
    } catch (error) {
      console.error('读取本地存储失败:', error);
      return defaultValue;
    }
  };
  
  // 设置存储数据
  export const setStorageData = (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error('保存本地存储失败:', error);
      return false;
    }
  };
  
  // 移除存储数据
  export const removeStorageData = (key) => {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error('移除本地存储失败:', error);
      return false;
    }
  };
  
  // 清除所有存储数据
  export const clearStorageData = (preserveKeys = []) => {
    try {
      if (preserveKeys.length > 0) {
        // 保存需要保留的数据
        const preserved = {};
        preserveKeys.forEach(key => {
          const value = localStorage.getItem(key);
          if (value !== null) {
            preserved[key] = value;
          }
        });
        
        // 清除所有数据
        localStorage.clear();
        
        // 恢复保留的数据
        Object.keys(preserved).forEach(key => {
          localStorage.setItem(key, preserved[key]);
        });
      } else {
        localStorage.clear();
      }
      return true;
    } catch (error) {
      console.error('清除本地存储失败:', error);
      return false;
    }
  };
  
  // 获取存储信息
  export const getStorageInfo = () => {
    try {
      let totalSize = 0;
      let keys = [];
      
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        const value = localStorage.getItem(key);
        keys.push(key);
        totalSize += key.length + (value ? value.length : 0);
      }
      
      // 转换为KB
      const sizeInKB = Math.round(totalSize / 1024 * 10) / 10;
      
      return {
        keys,
        currentSize: sizeInKB,
        limitSize: 10 * 1024, // 浏览器localStorage一般限制为5-10MB
        success: true
      };
    } catch (error) {
      console.error('获取存储信息失败:', error);
      return {
        keys: [],
        currentSize: 0,
        limitSize: 0,
        success: false
      };
    }
  };