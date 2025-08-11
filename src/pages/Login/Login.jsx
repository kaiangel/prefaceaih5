// pages/Login/Login.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../contexts/AppContext';
import { GoogleLogin } from '@react-oauth/google';
import { showToast } from '../../components/common/Toast';
import './Login.css';

const Login = () => {
  const navigate = useNavigate();
  const { globalData, doGoogleLogin } = useApp();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  useEffect(() => {
    // 检查是否已登录
    if (globalData.isLoggedIn) {
      navigate('/', { replace: true });
    }
  }, [globalData.isLoggedIn, navigate]);
  
  // pages/Login/Login.jsx 中的 handleLoginSuccess 函数
  const handleLoginSuccess = async (credentialResponse) => {
    console.log("Google登录成功:", credentialResponse);
    if (loading) return;
    
    setLoading(true);
    setError('');
    
    // 在处理登录前检查凭证是否有效
    if (!credentialResponse || !credentialResponse.credential) {
      console.error("无效的登录凭证");
      setError('登录失败：凭证无效');
      setLoading(false);
      return;
    }
    
    try {
      const result = await doGoogleLogin(credentialResponse);
      console.log("登录处理结果:", result);
      
      // 登录成功
      showToast('登录成功', { icon: 'success' });
      navigate('/', { replace: true });
    } catch (err) {
      console.error("登录处理错误:", err);
      setError(err.message || '登录失败，请重试');
      showToast('登录失败: ' + (err.message || '未知错误'), { icon: 'error' });
    } finally {
      setLoading(false);
    }
  };
  
  const handleLoginError = (error) => {
    console.error("Google登录错误:", error);
    setError('登录失败，请重试');
    showToast('登录失败', { icon: 'error' });
  };
  
  return (
    <div className="login-container">
      <div className="login-box">
        <div className="logo">
          <img src="/assets/icons/default-avatar.png" alt="Logo" />
        </div>
        
        <div className="title">序话</div>
        <div className="subtitle">烦恼用不好 AI ？有我在！</div>
        
        {/* 谷歌登录按钮 */}
        <div className="google-login-container">
          <GoogleLogin
            onSuccess={handleLoginSuccess}
            onError={handleLoginError}
            useOneTap
            theme="filled_blue"
            text="continue_with"
            shape="rectangular"
            locale="zh_CN"
          />
        </div>
        
        {error && <div className="error-msg">{error}</div>}
      </div>
    </div>
  );
};

export default Login;