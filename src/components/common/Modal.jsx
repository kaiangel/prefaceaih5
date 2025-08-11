// components/common/Modal.jsx
import React from 'react';

const Modal = ({ 
  show, 
  title, 
  children, 
  onClose, 
  showCancel = true, 
  confirmText = '确定', 
  cancelText = '取消', 
  onConfirm 
}) => {
  const handleConfirm = () => {
    if (onConfirm) onConfirm();
    onClose();
  };
  
  const handleMaskClick = (e) => {
    // 只有点击遮罩层才关闭，防止点击内容时触发关闭
    if (e.target === e.currentTarget) {
      onClose();
    }
  };
  
  return (
    <div className={`modal ${show ? 'show' : ''}`}>
      <div className="modal-mask" onClick={handleMaskClick}></div>
      <div className="modal-content">
        <div className="modal-header">
          <span className="modal-title">{title}</span>
          <div className="close-btn" onClick={onClose}>×</div>
        </div>
        <div className="modal-body">
          {children}
        </div>
        {(showCancel || onConfirm) && (
          <div className="modal-footer">
            {showCancel && (
              <button className="modal-btn cancel" onClick={onClose}>
                {cancelText}
              </button>
            )}
            {onConfirm && (
              <button className="modal-btn confirm" onClick={handleConfirm}>
                {confirmText}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Modal;