// contexts/AppContext.js
import React, { createContext, useState, useContext, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [globalData, setGlobalData] = useState({
    userInfo: null,
    isLoggedIn: false,
    isPro: false,
    remainingCount: 0,
    userId: null,  // 将openid改为userId
    lastCheckTime: 0,
    favoriteMap: new Map(),
    lastGeneratedContent: null,
    lastGeneratedTimestamp: 0
  });
  
  useEffect(() => {
    // 初始化时检查登录状态
    const token = localStorage.getItem('token');
    const userInfo = JSON.parse(localStorage.getItem('userInfo') || 'null');
    const openid = localStorage.getItem('openid');
    
    if (token && userInfo && openid) {
      setGlobalData(prev => ({
        ...prev,
        isLoggedIn: true,
        userId: userInfo.sub,
        userInfo,
        openid: openid
      }));
    }
  }, []);
  
  // 检查专业版状态 - 修改参数名
  const checkProStatus = async (forceCheck = false) => {
    if (!globalData.userId) {
      return Promise.reject(new Error('未登录'));
    }
    
    const now = Date.now();
    if (!forceCheck && (now - globalData.lastCheckTime) < 5 * 60 * 1000) {
      return {
        is_pro: globalData.isPro,
        remaining_count: globalData.remainingCount
      };
    }

    try {
      const response = await fetch('https://www.duyueai.com/userinfo', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId: globalData.userId // 修改参数名
        })
      });
      
      const data = await response.json();
      
      if (data) {
        setGlobalData(prev => ({
          ...prev,
          isPro: data.is_pro,
          remainingCount: data.remaining_count || 0,
          lastCheckTime: now
        }));
        
        return data;
      }
      
      throw new Error('检查会员状态失败');
    } catch (error) {
      console.error('检查会员状态失败:', error);
      if (!forceCheck) {
        return {
          is_pro: globalData.isPro,
          remaining_count: globalData.remainingCount
        };
      }
      throw error;
    }
  };
  
  // contexts/AppContext.js 中的 doGoogleLogin 函数
  const doGoogleLogin = async (credentialResponse) => {
    try {
      const { credential } = credentialResponse;
      
      if (!credential) {
        throw new Error('无法获取登录凭证');
      }
      
      console.log("正在处理Google凭证");
      
      // 解析JWT令牌
      const decodedToken = jwtDecode(credential);
      console.log("解析的令牌:", decodedToken);
      
      if (!decodedToken || !decodedToken.sub) {
        throw new Error('无效的登录令牌');
      }
      
      // 准备发送给后端的数据
      const loginData = {
        "3th_id": decodedToken.sub,
        "email": decodedToken.email
      };
      
      console.log("向后端发送登录数据:", loginData);
      
      // 调用后端API - 使用代理避免CORS问题
      const backendResponse = await fetch("/api/user/3th-login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          "3th_id": decodedToken.sub,
          "email": decodedToken.email
        })
      });
      
      // 解析后端响应
      const responseData = await backendResponse.json();
      console.log("后端响应:", responseData);
      
      // 提取openid
      const openid = responseData.data?.openid;
      
      if (!openid) {
        console.error("错误：后端未返回openid");
        throw new Error('登录成功但未能获取用户ID');
      }
      
      // 构建用户信息对象
      const userInfo = {
        sub: decodedToken.sub,
        name: decodedToken.name || '谷歌用户',
        given_name: decodedToken.given_name,
        family_name: decodedToken.family_name,
        email: decodedToken.email,
        picture: decodedToken.picture || '/assets/icons/default-avatar.png',
        openid: openid  // 保存openid到用户信息中
      };
      
      // 存储令牌和用户信息，注意不要JSON.stringify token
      localStorage.setItem('token', credential);
      localStorage.setItem('userInfo', JSON.stringify(userInfo));
      localStorage.setItem('openid', openid);  // 额外单独存储openid方便访问
      
      // 更新全局状态
      setGlobalData(prev => ({
        ...prev,
        isLoggedIn: true,
        userId: userInfo.sub,
        userInfo,
        openid: openid
      }));
      
      return userInfo;
    } catch (error) {
      console.error('谷歌登录处理失败:', error);
      throw new Error(`登录处理失败: ${error.message}`);
    }
  };
  
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userInfo');
    setGlobalData(prev => ({
      ...prev,
      isLoggedIn: false,
      userInfo: null,
      userId: null,
      isPro: false,
      remainingCount: 0
    }));
  };

  return (
    <AppContext.Provider value={{
      globalData,
      checkProStatus,
      doGoogleLogin, // 替换原来的doLogin
      logout,
      // 保留其他方法...
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};