// pages/Favorites/Favorites.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../contexts/AppContext';
import { getFavorites } from '../../utils/api';
import { formatDate } from '../../utils/formatter';
import { showToast } from '../../components/common/Toast';
import Modal from '../../components/common/Modal';
import './Favorites.css';

const Favorites = () => {
  const navigate = useNavigate();
  const { globalData, removeFavorite } = useApp();
  
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);
  const [isEmpty, setIsEmpty] = useState(false);
  
  useEffect(() => {
    loadFavorites();
  }, []);
  
  const loadFavorites = async () => {
    if (!hasMore || (loading && page > 1)) return;
    
    setLoading(true);
    
    try {
      const response = await getFavorites(globalData.openid, page);
      
      if (response.code === 0 && Array.isArray(response.data)) {
        const newFavorites = response.data.map(item => {
          const date = new Date(item.created_at.replace(/-/g, '/'));
          return {
            id: item.id,
            originalPrompt: item.content,
            optimizedPrompt: item.response,
            timestamp: date.getTime(),
            formattedDate: formatDate(date)
          };
        });
        
        setFavorites(prev => [...prev, ...newFavorites]);
        setPage(prev => prev + 1);
        setHasMore(newFavorites.length > 0);
        setIsEmpty(page === 1 && newFavorites.length === 0);
      } else {
        showToast(response.msg || '加载失败', { icon: 'none' });
        setHasMore(false);
      }
    } catch (err) {
      console.error('加载收藏失败:', err);
      showToast('网络错误', { icon: 'error' });
    } finally {
      setLoading(false);
    }
  };
  
  const showDetail = (index) => {
    setCurrentItem(favorites[index]);
    setShowDetailModal(true);
  };
  
  const closeDetail = () => {
    setShowDetailModal(false);
    setCurrentItem(null);
  };
  
  const copyContent = (type) => {
    const content = currentItem?.[type === 'original' ? 'originalPrompt' : 'optimizedPrompt'];
    
    if (!content) {
      showToast('没有可复制的内容', { icon: 'none' });
      return;
    }
    
    navigator.clipboard.writeText(content)
      .then(() => {
        showToast('复制成功', { icon: 'success' });
      })
      .catch(() => {
        showToast('复制失败', { icon: 'error' });
      });
  };
  
  const handleRemoveFavorite = async (index) => {
    try {
      const item = favorites[index];
      
      if (window.confirm('确定要取消收藏这条内容吗？')) {
        await removeFavorite(item.id);
        
        // 从列表中移除
        const newFavorites = favorites.filter((_, i) => i !== index);
        setFavorites(newFavorites);
        setIsEmpty(newFavorites.length === 0);
        
        // 如果当前显示的是被删除的项，则关闭弹窗
        if (currentItem && currentItem.id === item.id) {
          closeDetail();
        }
        
        showToast('已取消收藏', { icon: 'success' });
      }
    } catch (err) {
      showToast(err.message || '操作失败', { icon: 'error' });
    }
  };
  
  const goBack = () => {
    navigate(-1);
  };
  
  return (
    <div className="favorites-container">
      {/* 顶部导航 */}
      <div className="search-bar">
        <div className="back-btn" onClick={goBack}>
          <span className="back-arrow">←</span>
        </div>
        <div className="page-title">我的收藏</div>
      </div>
      
      {/* 加载中状态 */}
      {loading && page === 1 && (
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <span>加载中...</span>
        </div>
      )}
      
      {/* 空状态 */}
      {!loading && isEmpty && (
        <div className="empty-state">
          <img className="empty-icon" src="/assets/icons/empty.png" alt="Empty" />
          <span>还没有收藏的内容哦</span>
        </div>
      )}
      
      {/* 收藏列表 */}
      {favorites.length > 0 && (
        <div className="favorites-list">
          {favorites.map((item, index) => (
            <div 
              className="favorite-item"
              key={item.id || index}
              onClick={() => showDetail(index)}
            >
              <div className="item-header">
                <span className="item-date">{item.formattedDate}</span>
                <div 
                  className="remove-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveFavorite(index);
                  }}
                >
                  <img src="/assets/icons/delete.png" alt="Delete" />
                </div>
              </div>
              <div className="item-content">
                <span className="content-preview">{item.originalPrompt}</span>
              </div>
            </div>
          ))}
          
          {/* 加载更多 */}
          {hasMore && (
            <div className="load-more" onClick={loadFavorites}>
              {loading ? '加载中...' : '加载更多'}
            </div>
          )}
        </div>
      )}
      
      {/* 详情弹窗 */}
      {showDetailModal && currentItem && (
        <Modal
          show={showDetailModal}
          title="详情"
          onClose={closeDetail}
          showCancel={false}
        >
          <div className="prompt-section">
            <div className="section-header">
              <span className="section-title">原始提示词</span>
              <div 
                className="copy-btn" 
                onClick={() => copyContent('original')}
              >
                <img src="/assets/icons/copy.png" alt="Copy" />
              </div>
            </div>
            <pre className="prompt-content">{currentItem.originalPrompt}</pre>
          </div>
          
          <div className="prompt-section">
            <div className="section-header">
              <span className="section-title">点亮后的提示词</span>
              <div 
                className="copy-btn" 
                onClick={() => copyContent('optimized')}
              >
                <img src="/assets/icons/copy.png" alt="Copy" />
              </div>
            </div>
            <pre className="prompt-content">{currentItem.optimizedPrompt}</pre>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default Favorites;