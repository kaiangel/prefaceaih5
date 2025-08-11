// pages/Feedback/Feedback.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../contexts/AppContext';
import { showToast } from '../../components/common/Toast';
import './Feedback.css';

const Feedback = () => {
  const navigate = useNavigate();
  const { globalData } = useApp();
  
  const [feedbackTypes] = useState([
    { id: 1, name: '功能建议' },
    { id: 2, name: '体验问题' },
    { id: 3, name: '其他' }
  ]);
  const [selectedType, setSelectedType] = useState(1);
  const [content, setContent] = useState('');
  const [contact, setContact] = useState('');
  const [images, setImages] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [maxContentLength] = useState(500);
  const [maxContactLength] = useState(50);
  
  const goBack = () => {
    navigate(-1);
  };
  
  const selectType = (type) => {
    setSelectedType(type);
  };
  
  const onContentInput = (e) => {
    setContent(e.target.value);
  };
  
  const onContactInput = (e) => {
    setContact(e.target.value);
  };
  
  const chooseImage = () => {
    const remainCount = 3 - images.length;
    if (remainCount <= 0) {
      showToast('最多上传3张图片', { icon: 'none' });
      return;
    }
    
    // Web环境使用文件选择器
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    fileInput.multiple = remainCount > 1;
    
    fileInput.onchange = (e) => {
      const files = Array.from(e.target.files);
      if (files.length > remainCount) {
        files.length = remainCount;
      }
      
      const fileUrls = files.map(file => URL.createObjectURL(file));
      setImages(prev => [...prev, ...fileUrls]);
    };
    
    fileInput.click();
  };
  
  const deleteImage = (index) => {
    const newImages = [...images];
    URL.revokeObjectURL(newImages[index]); // 释放对象URL
    newImages.splice(index, 1);
    setImages(newImages);
  };
  
  const previewImage = (src) => {
    // Web环境可以使用新标签页打开图片
    window.open(src, '_blank');
  };
  
  const submitFeedback = () => {
    if (!content.trim()) {
      showToast('请输入反馈内容', { icon: 'none' });
      return;
    }
    
    setSubmitting(true);
    
    // 模拟提交
    setTimeout(() => {
      setSubmitting(false);
      showToast('提交成功', { icon: 'success' });
      
      // 等待Toast显示完成后返回
      setTimeout(() => {
        navigate(-1);
      }, 2000);
    }, 1500);
  };
  
  return (
    <div className="feedback-container">
      {/* 顶部导航 */}
      <div className="search-bar">
        <div className="back-btn" onClick={goBack}>
          <span className="back-arrow">←</span>
        </div>
        <div className="page-title">意见反馈</div>
      </div>
      
      {/* 反馈类型 */}
      <div className="section">
        <div className="section-title">反馈类型</div>
        <div className="type-group">
          {feedbackTypes.map(item => (
            <div 
              className={`type-item ${selectedType === item.id ? 'active' : ''}`} 
              key={item.id}
              onClick={() => selectType(item.id)}
            >
              {item.name}
            </div>
          ))}
        </div>
      </div>
      
      {/* 反馈内容 */}
      <div className="section">
        <div className="section-title">反馈内容</div>
        <div className="content-box">
          <textarea 
            className="content-input"
            placeholder="请详细描述您的问题或建议..."
            maxLength={maxContentLength}
            value={content}
            onChange={onContentInput}
          ></textarea>
          <div className="word-count">{content.length}/{maxContentLength}</div>
        </div>
      </div>
      
      {/* 图片上传 */}
      <div className="section">
        <div className="section-title">上传图片（选填，最多3张）</div>
        <div className="image-uploader">
          <div className="image-list">
            {images.map((src, index) => (
              <div className="image-item" key={index}>
                <img 
                  src={src} 
                  alt={`Upload ${index + 1}`}
                  onClick={() => previewImage(src)}
                />
                <div className="delete-btn" onClick={() => deleteImage(index)}>×</div>
              </div>
            ))}
            
            {images.length < 3 && (
              <div className="upload-btn" onClick={chooseImage}>
                <span className="upload-icon">+</span>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* 联系方式 */}
      <div className="section">
        <div className="section-title">联系方式（选填）</div>
        <input 
          className="contact-input"
          placeholder="请留下您的联系方式，方便我们及时回复"
          maxLength={maxContactLength}
          value={contact}
          onChange={onContactInput}
        />
      </div>
      
      {/* 提交按钮 */}
      <button 
        className={`submit-btn ${submitting ? 'submitting' : ''}`} 
        onClick={submitFeedback}
        disabled={submitting}
      >
        {submitting ? '提交中...' : '提交反馈'}
      </button>
    </div>
  );
};

export default Feedback;