// pages/History/History.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../contexts/AppContext';
import { getHistory } from '../../utils/api';
import { formatDate } from '../../utils/formatter';
import { showToast } from '../../components/common/Toast';
import Modal from '../../components/common/Modal';
import './History.css';

const History = () => {
  const navigate = useNavigate();
  const { globalData } = useApp();
  
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);
  
  useEffect(() => {
    loadRecords();
  }, []);
  
  const goBack = () => {
    navigate(-1);
  };
  
  const onSearch = (e) => {
    setSearchText(e.target.value);
    setRecords([]);
    setPage(1);
    setHasMore(true);
    loadRecords();
  };
  
  const showDetail = (index) => {
    setCurrentItem(records[index]);
    setShowDetailModal(true);
  };
  
  const closeDetail = () => {
    setShowDetailModal(false);
    setCurrentItem(null);
  };
  
  const copyContent = (type) => {
    const content = currentItem?.[type === 'original' ? 'input' : 'result'];
    
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
  
  const loadRecords = async () => {
    if (loading || !hasMore) return;
    
    setLoading(true);
    
    try {
      const response = await getHistory(globalData.openid, page);
      
      if (response.code === 0 && Array.isArray(response.data)) {
        const formattedRecords = response.data.map(record => ({
          id: record.prompt_id,
          createTime: formatDate(new Date(record.created_at), 'YYYY-MM-DD'),
          input: record.content,
          result: record.response,
          isFavorite: record.is_fav === 1
        }));
        
        setRecords(prev => [...prev, ...formattedRecords]);
        setPage(prev => prev + 1);
        setHasMore(formattedRecords.length > 0);
      } else {
        showToast(response.msg || '加载失败', { icon: 'none' });
        setHasMore(false);
      }
    } catch (err) {
      console.error('获取历史记录失败:', err);
      showToast('网络错误', { icon: 'error' });
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  };
  
  const loadMore = () => {
    loadRecords();
  };
  
  const copyResult = (index) => {
    const result = records[index].result;
    
    navigator.clipboard.writeText(result)
      .then(() => {
        showToast('已复制', { icon: 'success' });
      })
      .catch(() => {
        showToast('复制失败', { icon: 'error' });
      });
  };
  
  const deleteRecord = (index) => {
    if (window.confirm('是否删除该记录？')) {
      // 简化为前端删除
      const newRecords = [...records];
      newRecords.splice(index, 1);
      setRecords(newRecords);
      
      showToast('已删除', { icon: 'success' });
    }
  };
  
  const toggleFavorite = async (index) => {
    try {
      const item = records[index];
      const app = useApp();
      
      if (item.isFavorite) {
        await app.removeFavorite(item.id);
      } else {
        await app.addFavorite(item.id);
      }
      
      // 更新状态
      const newRecords = [...records];
      newRecords[index].isFavorite = !newRecords[index].isFavorite;
      setRecords(newRecords);
    } catch (err) {
      showToast(err.message || '操作失败', { icon: 'none' });
    }
  };
  
  return (
    <div className="history-container">
      {/* 顶部导航 */}
      <div className="search-bar">
        <div className="back-btn" onClick={goBack}>
          <span className="back-arrow">←</span>
        </div>
        <div className="page-title">历史记录</div>
      </div>
      
      {/* 记录列表 */}
      <div className="history-list">
        {/* 加载和空状态 */}
        {loading && page === 1 && (
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <span>加载中...</span>
          </div>
        )}
        
        {!loading && records.length === 0 && (
          <div className="empty-state">
            <img className="empty-icon" src="/assets/icons/empty.png" alt="Empty" />
            <span>暂无历史记录</span>
          </div>
        )}
        
        {records.map((item, index) => (
          <div 
            className="history-item"
            key={item.id || index}
            onClick={() => showDetail(index)}
          >
            <div className="item-header">
              <span className="item-date">{item.createTime}</span>
              <div 
                className="favorite-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleFavorite(index);
                }}
              >
                <img 
                  className={`favorite-icon ${item.isFavorite ? 'active' : ''}`} 
                  src={`/assets/icons/${item.isFavorite ? 'star-filled' : 'star'}.png`} 
                  alt="Favorite" 
                />
              </div>
            </div>
            <div className="item-content">
              <span className="content-preview">{item.input}</span>
            </div>
          </div>
        ))}
        
        {/* 加载更多 */}
        {hasMore && records.length > 0 && (
          <div className="load-more" onClick={loadMore}>
            {loading ? '加载中...' : '加载更多'}
          </div>
        )}
      </div>
      
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
            <pre className="prompt-content">{currentItem.input}</pre>
          </div>
          
          <div className="prompt-section">
            <div className="section-header">
              <span className="section-title">点亮后的提示词</span>
              <div 
                className="copy-btn" 
                onClick={() => copyContent('result')}
              >
                <img src="/assets/icons/copy.png" alt="Copy" />
              </div>
            </div>
            <pre className="prompt-content">{currentItem.result}</pre>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default History;