// components/common/Loading.jsx
import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';

let loadingContainer = null;
let loadingCount = 0;

const Loading = ({ text = '加载中...' }) => {
  return (
    <div className="loading-modal">
      <div className="loading-content">
        <div className="loading-spinner"></div>
        <span className="loading-text">{text}</span>
      </div>
    </div>
  );
};

// 显示加载提示
export const showLoading = (options = {}) => {
  const { title = '加载中...', mask = true } = options;
  
  // 确保容器存在
  if (!loadingContainer) {
    loadingContainer = document.createElement('div');
    loadingContainer.className = 'loading-container';
    document.body.appendChild(loadingContainer);
  }
  
  // 增加计数
  loadingCount++;
  
  // 渲染Loading组件
  ReactDOM.render(
    <Loading text={title} />,
    loadingContainer
  );
  
  // 添加遮罩
  if (mask) {
    document.body.classList.add('loading-mask-active');
  }
};

// 隐藏加载提示
export const hideLoading = () => {
  // 减少计数
  loadingCount--;
  
  // 如果计数为0，移除Loading组件
  if (loadingCount <= 0) {
    loadingCount = 0;
    if (loadingContainer) {
      ReactDOM.unmountComponentAtNode(loadingContainer);
      document.body.classList.remove('loading-mask-active');
    }
  }
};

export default Loading;