// utils/api.js
import { getStorageData } from './storage';

/**
 * 封装API调用
 * @param {string} url - API端点
 * @param {object} options - 请求选项
 * @returns {Promise} - 返回Promise对象
 */
export const request = async (url, options = {}) => {
  const token = getStorageData('token');
  
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    }
  };
  
  const mergedOptions = {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...(options.headers || {})
    }
  };
  
  try {
    const response = await fetch(url, mergedOptions);
    
    if (!response.ok) {
      // 处理401未授权错误
      if (response.status === 401) {
        throw new Error('未登录或登录已过期');
      }
      throw new Error(`请求失败: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    // 重新包装错误
    throw new Error(error.message || '网络请求失败');
  }
};

/**
 * 调用流式API
 * @param {string} inputText - 用户输入文本
 * @param {function} onChunk - 处理数据块的回调
 * @param {function} onError - 处理错误的回调
 * @param {function} onPromptId - 处理提示词ID的回调
 * @returns {object} - 包含abort方法的对象
 */
// utils/api.js
export const callStreamAPI = (inputText, onChunk, onError, onPromptId) => {
  const controller = new AbortController();
  const signal = controller.signal;
  
  // 直接获取openid，不使用getStorageData
  const openid = localStorage.getItem('openid');
  
  console.log("准备调用流式API:", { openid, contentLength: inputText.length });
  
  if (!openid) {
    console.error("未找到openid");
    onError('未登录或登录状态已失效');
    return { abort: () => {} };
  }
  
  // 使用FormData，与后端期望格式匹配
  const formData = new URLSearchParams();
  formData.append('openid', openid);
  formData.append('content', inputText);
  
  // 添加超时保护
  const timeoutId = setTimeout(() => controller.abort(), 30000);
  
  fetch('/api/botPromptStream', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: formData,
    signal
  })
  .then(response => {
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      throw new Error(`请求失败: ${response.status} ${response.statusText}`);
    }
    
    if (!response.body) {
      throw new Error('响应没有可读取的流');
    }
    
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    
    // 处理流式响应
    function processStream({ done, value }) {
      if (done) {
        console.log("流处理完成");
        return;
      }
      
      try {
        const chunk = decoder.decode(value, { stream: true });
        console.log("收到数据块:", chunk.substring(0, 50) + (chunk.length > 50 ? "..." : ""));
        
        // 尝试解析为JSON，如果失败则当作普通文本
        try {
          const jsonData = JSON.parse(chunk);
          
          // 提取promptId
          if (jsonData.id) {
            onPromptId(jsonData.id);
          }
          
          // 提取内容
          if (jsonData.choices && jsonData.choices.length > 0 && jsonData.choices[0].delta) {
            const content = jsonData.choices[0].delta.content;
            if (content) {
              onChunk(content);
            }
          } else {
            // 可能有其他格式
            if (jsonData.content) {
              onChunk(jsonData.content);
            }
          }
        } catch (jsonErr) {
          // 不是JSON，直接作为文本处理
          onChunk(chunk);
        }
      } catch (chunkErr) {
        console.error("处理数据块错误:", chunkErr);
      }
      
      // 继续读取下一个数据块
      reader.read()
        .then(processStream)
        .catch(readErr => {
          console.error("读取流错误:", readErr);
          if (readErr.name !== 'AbortError') {
            onError('读取响应时发生错误');
          }
        });
    }
    
    // 开始读取流
    reader.read()
      .then(processStream)
      .catch(initialErr => {
        console.error("初始读取错误:", initialErr);
        onError('启动流读取失败');
      });
  })
  .catch(fetchErr => {
    clearTimeout(timeoutId);
    console.error("API请求错误:", fetchErr);
    
    if (fetchErr.name === 'AbortError') {
      onError('请求超时或被中断');
    } else {
      onError(`请求失败: ${fetchErr.message}`);
    }
  });
  
  return {
    abort: () => {
      clearTimeout(timeoutId);
      controller.abort();
    }
  };
};

// 可选：添加谷歌登录特定API
export const loginWithGoogle = async (credential) => {
  return request('https://www.duyueai.com/google_login', {
    method: 'POST',
    body: JSON.stringify({ credential })
  });
};

/**
 * 用户登录
 * @param {object} credentials - 登录凭证
 * @returns {Promise} - 返回Promise对象
 */
export const login = async (credentials) => {
  return request('https://www.duyueai.com/web_login', {
    method: 'POST',
    body: JSON.stringify(credentials)
  });
};

/**
 * 获取用户信息
 * @param {string} openid - 用户openid
 * @returns {Promise} - 返回Promise对象
 */
export const getUserInfo = async () => {
  const openid = getStorageData('openid');
  if (!openid) {
    throw new Error('未登录');
  }
  
  return request('https://www.duyueai.com/userinfo', {
    method: 'POST',
    body: JSON.stringify({ openid })
  });
};

/**
 * 获取历史记录
 * @param {string} openid - 用户openid
 * @param {number} page - 页码
 * @returns {Promise} - 返回Promise对象
 */
export const getHistory = async (page = 1) => {
  const openid = getStorageData('openid');
  if (!openid) {
    throw new Error('未登录');
  }
  
  return request(`https://www.duyueai.com/history?openid=${openid}&page=${page}`);
};

/**
 * 获取收藏列表
 * @param {string} openid - 用户openid
 * @param {number} page - 页码
 * @returns {Promise} - 返回Promise对象
 */
export const getFavorites = async (page = 1) => {
  const openid = getStorageData('openid');
  if (!openid) {
    throw new Error('未登录');
  }
  
  return request(`https://www.duyueai.com/my_favorites?openid=${openid}&page=${page}`);
};

/**
 * 添加收藏
 * @param {string} openid - 用户openid
 * @param {string} promptId - 提示词ID
 * @returns {Promise} - 返回Promise对象
 */
export const addFavorite = async (openid, promptId) => {
  return request('https://www.duyueai.com/favorite', {
    method: 'POST',
    body: JSON.stringify({ openid, prompt_id: promptId })
  });
};

/**
 * 取消收藏
 * @param {string} openid - 用户openid
 * @param {string} promptId - 提示词ID
 * @returns {Promise} - 返回Promise对象
 */
export const removeFavorite = async (openid, promptId) => {
  return request('https://www.duyueai.com/unfavorite', {
    method: 'POST',
    body: JSON.stringify({ openid, prompt_id: promptId })
  });
};

/**
 * 创建预支付订单
 * @param {string} openid - 用户openid
 * @returns {Promise} - 返回Promise对象
 */
export const createPayment = async (openid) => {
  return request('https://www.duyueai.com/order_prepay', {
    method: 'POST',
    body: JSON.stringify({ openid })
  });
};