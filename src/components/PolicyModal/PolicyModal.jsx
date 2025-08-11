// components/PolicyModal/PolicyModal.jsx
import React, { useState, useEffect } from 'react';
import './PolicyModal.css';

const PolicyModal = ({ show, type, onClose }) => {
  const [currentContent, setCurrentContent] = useState('');
  
  useEffect(() => {
    if (show) {
      setCurrentContent(getContent());
    }
  }, [show, type]);
  
  const getContent = () => {
    return type === 'privacy' ? privacyPolicy : userAgreement;
  };
  
  const privacyPolicy = `隐私政策

1. 信息收集
本小程序会收集用户的以下信息：
· 账户信息：包括微信昵称、头像等通过微信授权登录获得的信息。
· 操作数据：用户在使用过程中生成的收藏、历史记录和输入内容。
...`;  // 完整内容省略

  const userAgreement = `用户协议

第一条 协议范围
本协议是用户（下称"您"）与本小程序（下称"平台"）之间的法律协议，明确使用本平台的权利和义务。
...`;  // 完整内容省略
  
  return (
    <div className={`policy-modal ${show ? 'show' : ''}`}>
      <div className="modal-mask" onClick={onClose}></div>
      <div className="modal-content">
        <div className="modal-header">
          <span className="modal-title">{type === 'privacy' ? '隐私政策' : '用户协议'}</span>
          <div className="close-btn" onClick={onClose}>×</div>
        </div>
        <div className="modal-body">
          <pre className="policy-text">{currentContent}</pre>
        </div>
      </div>
    </div>
  );
};

export default PolicyModal;