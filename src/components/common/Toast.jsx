// components/common/Toast.jsx
import React, { useState, useEffect, useCallback } from 'react';
import ReactDOM from 'react-dom';

let toastContainer = null;

const Toast = ({ message, duration = 2000, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);
    
    return () => clearTimeout(timer);
  }, [duration, onClose]);
  
  return (
    <div className="toast">
      {message}
    </div>
  );
};

export const showToast = (message, options = {}) => {
  const { duration = 2000, icon = 'none' } = options;
  
  // 确保容器存在
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.className = 'toast-container';
    document.body.appendChild(toastContainer);
  }
  
  // 创建一个随机ID
  const id = Math.random().toString(36).substr(2, 9);
  
  // 创建一个新的div来挂载Toast组件
  const toastElement = document.createElement('div');
  toastElement.id = `toast-${id}`;
  toastContainer.appendChild(toastElement);
  
  // 移除Toast的函数
  const removeToast = () => {
    ReactDOM.unmountComponentAtNode(toastElement);
    toastContainer.removeChild(toastElement);
  };
  
  // 渲染Toast组件
  ReactDOM.render(
    <Toast
      message={message}
      duration={duration}
      onClose={removeToast}
    />,
    toastElement
  );
  
  return id;
};

export default Toast;