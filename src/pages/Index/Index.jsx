// pages/Index/Index.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import NavigationBar from '../../components/NavigationBar/NavigationBar';
import { useApp } from '../../contexts/AppContext';
import { callStreamAPI } from '../../utils/api';
import './Index.css';

const Index = () => {
  const navigate = useNavigate();
  const { globalData } = useApp();
  
  const [inputText, setInputText] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [currentPromptId, setCurrentPromptId] = useState(null);
  const [isFavorited, setIsFavorited] = useState(false);
  const [showScrollArrow, setShowScrollArrow] = useState(false);
  const [originalResponse, setOriginalResponse] = useState('');
  
  // 打字效果相关状态
  const [bufferContent, setBufferContent] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [typingSpeed, setTypingSpeed] = useState(30);
  const [showCursor, setShowCursor] = useState(true);
  const [fullContent, setFullContent] = useState('');
  const [streamEndSignal, setStreamEndSignal] = useState(false);
  
  const typingTimerRef = useRef(null);
  const lastDataReceivedTimeRef = useRef(Date.now());
  const streamRequestRef = useRef(null);
  
  useEffect(() => {
    // 添加滚动事件监听
    window.addEventListener('scroll', handleScroll);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      
      // 清理定时器
      if (typingTimerRef.current) {
        clearTimeout(typingTimerRef.current);
      }
      
      // 中止请求
      if (streamRequestRef.current) {
        streamRequestRef.current.abort();
      }
    };
  }, [showResult, showScrollArrow]);
  
  const handleScroll = () => {
    if (showResult && showScrollArrow) {
      const scrollPosition = window.scrollY;
      const windowHeight = window.innerHeight;
      const documentHeight = document.body.scrollHeight;
      
      if (scrollPosition + windowHeight > documentHeight - 100) {
        setShowScrollArrow(false);
      } else {
        setShowScrollArrow(true);
      }
    }
  };
  
  const onInputChange = (e) => {
    setInputText(e.target.value);
  };
  
  const startTypingEffect = () => {
    if (isTyping) return;
    
    setIsTyping(true);
    setShowCursor(true);
    
    const typeNextChar = () => {
      if (bufferContent.length > 0) {
        // 从缓冲区取出第一个字符
        const char = bufferContent.charAt(0);
        const remainingBuffer = bufferContent.substring(1);
        
        // 更新完整内容
        const newFullContent = fullContent + char;
        
        // 格式化并显示结果
        const formattedResult = formatResult(newFullContent);
        
        // 更新状态
        setBufferContent(remainingBuffer);
        setFullContent(newFullContent);
        setResult(formattedResult);
        setOriginalResponse(newFullContent);
        
        // 继续打字效果
        typingTimerRef.current = setTimeout(typeNextChar, typingSpeed);
        
        // 检查是否需要显示向下箭头
        if (bufferContent.length % 20 === 0) {
          checkScrollArrow();
        }
      } else {
        // 缓冲区为空，暂停打字效果
        setIsTyping(false);
        
        // 检查是否收到流结束信号或长时间无新数据
        const timeSinceLastData = Date.now() - lastDataReceivedTimeRef.current;
        
        if (streamEndSignal || timeSinceLastData > 2000) {
          finishGeneration();
        } else {
          // 设置短时间检查
          setTimeout(() => {
            const newTimeDiff = Date.now() - lastDataReceivedTimeRef.current;
            if (newTimeDiff > 2000) {
              finishGeneration();
            }
          }, 500);
        }
      }
    };
    
    // 开始打字效果
    typeNextChar();
  };
  
  const appendToBuffer = (text) => {
    const isFirstContent = fullContent === '' && bufferContent === '';
    
    // 优化缓冲区大小
    if (bufferContent.length > 10000) {
      setBufferContent(prevBuffer => 
        prevBuffer.substring(prevBuffer.length - 5000) + text
      );
    } else {
      setBufferContent(prevBuffer => prevBuffer + text);
    }
    
    // 首次内容显示结果区
    if (isFirstContent) {
      setShowResult(true);
    }
    
    // 如果未开始打字效果，启动它
    if (!isTyping) {
      startTypingEffect();
    }
    
    // 检查是否显示向下箭头
    setTimeout(checkScrollArrow, 300);
  };
  
  // pages/Index/Index.jsx - onGeneratePrompt 函数
  const onGeneratePrompt = () => {
    if (!inputText.trim()) {
      alert('请输入内容');
      return;
    }
    
    // 添加详细日志
    const openid = localStorage.getItem('openid');
    console.log("点亮灵感时的状态:", {
      inputLength: inputText.length,
      openid: openid,
      isLoggedIn: globalData.isLoggedIn
    });
    
    if (!openid) {
      if (window.confirm('登录状态已失效，需要重新登录')) {
        navigate('/login');
      }
      return;
    }
    
    // 重置状态
    setIsGenerating(true);
    setResult(formatResult(''));
    setShowResult(false);
    setBufferContent('');
    setFullContent('');
    setIsTyping(false);
    setStreamEndSignal(false);
    setShowCursor(true);
    setOriginalResponse('');
    
    // 添加一个重试计数
    let retryCount = 0;
    const maxRetries = 1;
    
    const attemptStreamRequest = () => {
      // 调用流式API
      streamRequestRef.current = callStreamAPI(
        inputText,
        (chunk) => {
          // 处理数据块
          lastDataReceivedTimeRef.current = Date.now();
          appendToBuffer(chunk);
        },
        (error) => {
          // 处理错误
          console.error('调用API错误:', error);
          
          if (retryCount < maxRetries) {
            console.log(`尝试重试 (${retryCount + 1}/${maxRetries})...`);
            retryCount++;
            setTimeout(attemptStreamRequest, 1000);
          } else {
            handleError(error);
          }
        },
        (promptId) => {
          // 设置promptId
          setCurrentPromptId(promptId);
        }
      );
    };
    
    attemptStreamRequest();
  };
  
  // 添加到 Index.jsx
  const handleError = (message) => {
    // 清理定时器
    if (typingTimerRef.current) {
      clearTimeout(typingTimerRef.current);
    }
    
    // 更新状态
    setIsGenerating(false);
    setShowResult(true);
    setIsTyping(false);
    setShowCursor(false);
    
    // 显示错误信息
    setResult({
      sections: [{
        title: '',
        content: ['生成失败: ' + message]
      }]
    });
    
    // 显示弹窗
    if (message.includes('登录') || message.includes('openid')) {
      if (window.confirm('登录状态已失效，需要重新登录')) {
        navigate('/login');
      }
    } else {
      alert('生成失败: ' + message);
    }
  };
  
  const finishGeneration = () => {
    // 防止重复调用
    if (!isGenerating) {
      return;
    }
    
    // 清理定时器
    if (typingTimerRef.current) {
      clearTimeout(typingTimerRef.current);
      typingTimerRef.current = null;
    }
    
    // 更新状态
    setIsGenerating(false);
    setStreamEndSignal(false);
    setShowCursor(false);
    
    // 检查收藏状态
    checkFavoriteStatus();
    
    // 生成完成后显示向下箭头
    setTimeout(() => {
      setShowScrollArrow(true);
    }, 500);
  };
  
  const formatResult = (rawResult) => {
    // 对于空内容，返回空结构
    if (!rawResult || rawResult.trim() === '') {
      return {
        sections: []
      };
    }
    
    const sections = [...new Set(rawResult.split('\n\n').filter(s => s.trim()))];
    const formattedResult = {
      sections: []
    };
    
    sections.forEach((section) => {
      if (section.includes(':')) {
        const [title, ...contentParts] = section.split(':');
        const content = contentParts.join(':').trim()
          .split('\n')
          .map(line => line.trim())
          .filter(line => line);
        
        formattedResult.sections.push({
          title: title.trim(),
          content
        });
      } else {
        const content = section.trim()
          .split('\n')
          .map(line => line.trim())
          .filter(line => line);
        
        formattedResult.sections.push({
          title: '',
          content
        });
      }
    });
    
    return formattedResult;
  };
  
  const handleCopy = () => {
    if (!originalResponse) {
      alert('没有可复制的内容');
      return;
    }
    
    navigator.clipboard.writeText(originalResponse)
      .then(() => {
        alert('复制成功');
      })
      .catch(() => {
        alert('复制失败');
      });
  };
  
  const checkFavoriteStatus = () => {
    if (!currentPromptId) return;
    
    // 检查是否已收藏 - 通过API实现
    setIsFavorited(false); // 示例默认值
  };
  
  const toggleFavorite = async () => {
    if (!result) {
      alert('没有可收藏的内容');
      return;
    }
    
    try {
      if (isFavorited) {
        // 取消收藏逻辑
        setIsFavorited(false);
        alert('已取消收藏');
      } else {
        // 添加收藏逻辑
        setIsFavorited(true);
        alert('已收藏');
      }
    } catch (err) {
      console.error('收藏操作失败:', err);
      alert('操作失败，请稍后再试');
    }
  };
  
  const checkScrollArrow = () => {
    if (!showResult || !result) return;
    
    if (showResult && (isGenerating || result.sections.length > 0)) {
      setShowScrollArrow(true);
    }
  };
  
  const scrollToBottom = () => {
    window.scrollTo({
      top: document.body.scrollHeight,
      behavior: 'smooth'
    });
    
    if (!isGenerating) {
      setTimeout(() => {
        setShowScrollArrow(false);
      }, 500);
    }
  };
  
  return (
    <div className="container">
      <NavigationBar>
        <div className="nav-title" slot="center">序话</div>
      </NavigationBar>
      
      <div className="content">
        {/* 标题区域 */}
        <div className="title-area">
          <div className="main-title">序话</div>
          <div className="sub-title">当你要AI想你所想...</div>
        </div>
        
        {/* 输入区域 */}
        <div className="input-area">
          <textarea 
            className="input-box" 
            placeholder="随意写下任何想法，即可一键将其转化为与AI沟通的显著增强版提示词！（例：我要发一封请假邮件 / 我想写个西餐厅的小红书种草文案 / 我想制定一个以周为单位的减肥计划 / 我要学习并吸收马斯克自传这本书的精髓...）"
            value={inputText}
            onChange={onInputChange}
          ></textarea>
        </div>
        
        {/* 按钮区域 */}
        <div className="button-area">
          <button 
            className={`inspire-btn ${isGenerating ? 'generating' : ''}`} 
            onClick={onGeneratePrompt}
            disabled={isGenerating || !inputText}
          >
            <img src="/assets/icons/spark.png" alt="Spark" />
            {isGenerating ? '点亮中.....' : '点亮灵感'}
          </button>
        </div>
        
        {/* 结果区域 */}
        {result && (
          <div className={`result-area ${showResult ? 'show' : ''}`}>
            <div className="result-card">
              <div className="result-header">
                <span className="result-title">点亮结果</span>
                <div className="header-actions">
                  {/* 收藏按钮 */}
                  <div className="favorite-button" onClick={toggleFavorite}>
                    <img 
                      className={`favorite-icon ${isFavorited ? 'active' : ''}`} 
                      src={`/assets/icons/${isFavorited ? 'star-filled' : 'star'}.png`} 
                      alt="Favorite" 
                    />
                  </div>
                  <div className="copy-button" onClick={handleCopy}>
                    <img className="copy-icon" src="/assets/icons/copy.png" alt="Copy" />
                  </div>
                </div>
              </div>
              
              <div className="result-content">
                {result.sections.map((section, sectionIndex) => (
                  <div className="section" key={sectionIndex}>
                    {section.title && <div className="section-title">{section.title}</div>}
                    <div className="section-content">
                      {section.content.map((line, lineIndex) => (
                        <div className={`content-line ${line.indexOf('<') !== -1 ? 'tag-line' : ''}`} key={lineIndex}>
                          <span className="content-text">{line}</span>
                          {/* 在最后一行的最后添加光标 */}
                          {sectionIndex === result.sections.length - 1 && 
                           lineIndex === section.content.length - 1 && 
                           showCursor && 
                           isGenerating && (
                            <span className="typing-cursor"></span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* 向下箭头按钮 */}
      <div className={`scroll-to-bottom-arrow ${showScrollArrow ? 'show' : ''}`} onClick={scrollToBottom}>
        <img src="/assets/icons/arrow-down.png" alt="Scroll to bottom" />
      </div>
    </div>
  );
};

export default Index;