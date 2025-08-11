// pages/Profile/Profile.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../contexts/AppContext';
import PolicyModal from '../../components/PolicyModal/PolicyModal';
import { CDN, getImageUrl } from '../../config/cdn';
import './Profile.css';

const Profile = () => {
  const navigate = useNavigate();
  const { globalData, checkProStatus, logout } = useApp();
  
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [hasUserInfo, setHasUserInfo] = useState(false);
  const [userInfo, setUserInfo] = useState(null);
  const [stats, setStats] = useState({
    promptCount: 0,
    saveCount: 0
  });
  const [currentPlan, setCurrentPlan] = useState('free');
  const [isEditingNickname, setIsEditingNickname] = useState(false);
  const [tempNickname, setTempNickname] = useState('');
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [showPolicyModal, setShowPolicyModal] = useState(false);
  const [policyType, setPolicyType] = useState('');
  const [justPaid, setJustPaid] = useState(false);
  const [statsLoading, setStatsLoading] = useState(false);
  
  const qrCodeUrl = getImageUrl(CDN.IMAGES.CUSTOMER_SERVICE_QR);
  
  useEffect(() => {
    checkLoginStatus();
  }, []);
  
  useEffect(() => {
    if (justPaid) {
      checkLoginStatus();
    }
    
    if (isLoggedIn) {
      loadStats();
    }
  }, [isLoggedIn, justPaid]);
  
  const checkLoginStatus = async () => {
    const token = localStorage.getItem('token');
    const userInfoData = JSON.parse(localStorage.getItem('userInfo') || 'null');
    
    const isUserLoggedIn = !!token && globalData.isLoggedIn;
    const hasUserInfoData = !!(isUserLoggedIn && userInfoData && userInfoData.name);
    
    setIsLoggedIn(isUserLoggedIn);
    setHasUserInfo(hasUserInfoData);
    setUserInfo(isUserLoggedIn ? {
      avatarUrl: userInfoData?.picture || '/assets/icons/default-avatar.png',
      nickName: userInfoData?.name || '谷歌用户'
    } : {
      avatarUrl: '/assets/icons/default-avatar.png',
      nickName: '未登录'
    });
    
    if (isUserLoggedIn) {
      try {
        const proStatus = await checkProStatus(true);
        setCurrentPlan(proStatus.is_pro ? 'pro' : 'free');
        setJustPaid(false);
      } catch (err) {
        console.error('检查会员状态失败:', err);
        setCurrentPlan(globalData.isPro ? 'pro' : 'free');
      }
    } else {
      setCurrentPlan('free');
    }
  };
  
  const loadStats = () => {
    setStatsLoading(true);
    
    checkProStatus(true)
      .then(status => {
        // 获取收藏数的API调用...
        // 简化为直接设置状态
        setStats({
          promptCount: status.remaining_count || 0,
          saveCount: 0 // 这里应该通过API获取实际收藏数
        });
        setStatsLoading(false);
      })
      .catch(err => {
        console.error('获取剩余次数失败:', err);
        setStats({
          promptCount: 0,
          saveCount: 0
        });
        setStatsLoading(false);
      });
  };
  
  const startEditNickname = () => {
    if (!isLoggedIn) return;
    
    setIsEditingNickname(true);
    setTempNickname(userInfo.nickName);
  };
  
  const onNicknameInput = (e) => {
    setTempNickname(e.target.value);
  };
  
  const saveNickname = (e) => {
    const nickname = (e?.target?.value || tempNickname).trim();
    if (!nickname) {
      alert('昵称不能为空');
      return;
    }
    
    setUserInfo(prev => ({
      ...prev,
      nickName: nickname
    }));
    setIsEditingNickname(false);
    setHasUserInfo(true);
    
    // 保存到localStorage
    const storedUserInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
    localStorage.setItem('userInfo', JSON.stringify({
      ...storedUserInfo,
      nickName: nickname
    }));
  };
  
  const cancelEditNickname = () => {
    setIsEditingNickname(false);
  };
  
  const goBack = () => {
    navigate(-1);
  };
  
  const showPrivacyPolicy = () => {
    setPolicyType('privacy');
    setShowPolicyModal(true);
  };
  
  const showUserAgreement = () => {
    setPolicyType('agreement');
    setShowPolicyModal(true);
  };
  
  const onPolicyModalClose = () => {
    setShowPolicyModal(false);
  };
  
  const selectPlan = async (plan) => {
    // 如果已经是专业会员，不响应任何点击
    if (globalData.isPro) {
      return;
    }
    
    // 如果点击的是当前计划，不做响应
    if (plan === currentPlan && !globalData.isPro) {
      return;
    }
    
    if (plan === 'pro') {
      try {
        const status = await checkProStatus(true);
        
        if (status.is_pro) {
          setCurrentPlan('pro');
          alert('你已是专业版会员');
          return;
        }
        
        if (window.confirm('升级到专业版\n用不了一杯柠檬茶的花费 即可获取168次顶级模型点亮～')) {
          handlePayment();
        }
      } catch (err) {
        alert(err.message || '网络异常，请重试');
      }
    }
  };
  
  const handlePromptCountClick = () => {
    if(stats.promptCount > 0) return;
    
    if (window.confirm('升级到专业版\n用不了一杯柠檬茶的花费 即可获取168次顶级模型点亮～')) {
      handlePayment();
    }
  };
  
  const handlePayment = () => {
    alert('Web版本暂不支持支付功能，请在小程序中完成支付。');
  };
  
  const navigateTo = (path) => {
    if (path === 'feedback') {
      setShowServiceModal(true);
    } else {
      navigate(`/${path}`);
    }
  };
  
  const closeServiceModal = () => {
    setShowServiceModal(false);
  };
  
  const navigateToFavorites = () => {
    navigate('/favorites');
  };
  
  const handleLogin = () => {
    navigate('/login');
  };
  
  const showAbout = () => {
    alert('序话让AI想你所想～从此告别"AI不好用"！');
  };
  
  const handleSignOut = () => {
    if (window.confirm('确定要退出登录吗？')) {
      logout();
      navigate('/', { replace: true });
    }
  };
  
  return (
    <div className="profile-container">
      {/* 顶部导航 */}
      <div className="search-bar">
        <div className="back-btn" onClick={goBack}>
          <span className="back-arrow">←</span>
        </div>
        <div className="page-title">个人中心</div>
      </div>
      
      {/* 用户信息卡片 */}
      <div className="user-card">
        <div className="user-info">
          {isLoggedIn ? (
            <button 
              className="avatar-button"
              onClick={onChooseAvatar}
            >
              <img 
                className="avatar" 
                src={userInfo?.avatarUrl || '/assets/icons/default-avatar.png'} 
                alt="Avatar" 
              />
            </button>
          ) : (
            <img 
              className="avatar" 
              src={userInfo?.avatarUrl || '/assets/icons/default-avatar.png'} 
              alt="Avatar" 
            />
          )}
          
          <div className="user-detail">
            <div className={`nickname-wrapper ${isEditingNickname ? 'editing' : ''}`}>
              {isEditingNickname ? (
                <input 
                  className="nickname-input"
                  value={tempNickname}
                  onChange={onNicknameInput}
                  onBlur={cancelEditNickname}
                  onKeyDown={(e) => e.key === 'Enter' && saveNickname()}
                  autoFocus
                  maxLength={20}
                />
              ) : (
                <span 
                  className={`nickname ${isLoggedIn ? 'editable' : ''}`}
                  onClick={isLoggedIn ? startEditNickname : undefined}
                >
                  {userInfo?.nickName || '微信用户'}
                </span>
              )}
            </div>
            
            {isLoggedIn && (
              <div className={`member-tag ${globalData.isPro ? 'pro' : ''}`}>
                <span>{globalData.isPro ? '专业会员' : '免费用户'}</span>
              </div>
            )}
          </div>
        </div>
        
        {isLoggedIn ? (
          <div className="usage-stats">
            <div 
              className={`stat-item ${!stats.promptCount && isLoggedIn ? 'clickable' : ''}`} 
              onClick={!stats.promptCount && isLoggedIn ? handlePromptCountClick : undefined}
            >
              <span className="stat-num">
                {!statsLoading ? (stats.promptCount || 0) : '...'}
              </span>
              <span className="stat-label">剩余点亮次数</span>
            </div>
            
            <div className="stat-item clickable" onClick={navigateToFavorites}>
              <span className="stat-num">{stats.saveCount || 0}</span>
              <span className="stat-label">收藏</span>
            </div>
          </div>
        ) : (
          <div className="login-btn-wrapper">
            <button className="login-btn" onClick={handleLogin}>Google Login/Signup</button>
          </div>
        )}
      </div>
      
      {/* 会员方案部分 */}
      {isLoggedIn && (
        <>
          <div className="section-title">会员方案</div>
          <div className="plans-grid">
            <div 
              className={`plan-card ${(!globalData.isPro && currentPlan === 'free') || (globalData.isPro && currentPlan !== 'pro') ? 'current' : ''}`} 
              onClick={() => selectPlan('free')}
            >
              <span className="plan-name">
                {globalData.isPro ? '免费版' : (currentPlan === 'free' ? '免费版\n（当前使用）' : '免费版')}
              </span>
              <span className="plan-price">¥0</span>
              <span className="plan-period"></span>
              <div className="plan-features">
                <span>• 每日3次点亮</span>
                <span>• 第一梯队模型（ChatGPT-4o 同级）</span>
              </div>
            </div>
            
            <div 
              className={`plan-card ${globalData.isPro || currentPlan === 'pro' ? 'current' : ''}`} 
              onClick={() => selectPlan('pro')}
            >
              <span className="plan-name">
                {globalData.isPro ? '专业版\n（当前使用）' : '专业版'}
              </span>
              <span className="plan-price">¥9.9</span>
              <span className="plan-period"></span>
              <div className="plan-features">
                <span>• 168次点亮（90天有效）</span>
                <span>• 顶级模型（DeepSeek）</span>
                <span>• 针对性的真实专家角色</span>
              </div>
            </div>
          </div>
        </>
      )}
      
      {/* 功能列表 */}
      <div className="section-title">更多</div>
      <div className="function-list">
        <div className="function-item" onClick={() => navigateTo('settings')}>
          <img className="function-icon" src="/assets/icons/settings.png" alt="Settings" />
          <span>通用设置</span>
          <span className="arrow">→</span>
        </div>
        
        <div className="function-item" onClick={() => navigateTo('feedback')}>
          <img className="function-icon" src="/assets/icons/feedback.png" alt="Feedback" />
          <span>意见反馈</span>
          <span className="arrow">→</span>
        </div>
        
        <div className="function-item" onClick={showAbout}>
          <img className="function-icon" src="/assets/icons/about.png" alt="About" />
          <span>关于序话</span>
          <span className="arrow">→</span>
        </div>
        
        <div className="function-item" onClick={showPrivacyPolicy}>
          <img className="function-icon" src="/assets/icons/privacy.png" alt="Privacy" />
          <span>隐私政策</span>
          <span className="arrow">→</span>
        </div>
        
        <div className="function-item" onClick={showUserAgreement}>
          <img className="function-icon" src="/assets/icons/agreement.png" alt="Agreement" />
          <span>用户协议</span>
          <span className="arrow">→</span>
        </div>
      </div>
      
      <div className="version">Version 0.6.4</div>
      
      {/* 弹窗组件 */}
      <PolicyModal 
        show={showPolicyModal} 
        type={policyType}
        onClose={onPolicyModalClose}
      />
      
      {/* 客服二维码弹窗 */}
      <div className={`modal ${showServiceModal ? 'show' : ''}`}>
        <div className="modal-mask" onClick={closeServiceModal}></div>
        <div className="modal-content">
          <div className="modal-header">
            <span className="modal-title">联系客服</span>
            <div className="close-btn" onClick={closeServiceModal}>×</div>
          </div>
          <div className="modal-body service-modal">
            <img 
              className="qrcode" 
              src={qrCodeUrl} 
              alt="Customer Service QR Code"
            />
            <span className="tip-text">长按二维码添加序话运维</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;