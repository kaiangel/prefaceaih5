// utils/formatter.js
/**
 * 格式化工具函数集合
 */

// 格式化日期
export const formatDate = (date, format = 'YYYY-MM-DD') => {
    if (!date) return '';
    
    if (!(date instanceof Date)) {
      // 尝试转换为Date对象
      try {
        if (typeof date === 'string') {
          // 处理'YYYY-MM-DD'格式的日期字符串
          date = new Date(date.replace(/-/g, '/'));
        } else if (typeof date === 'number') {
          date = new Date(date);
        }
      } catch (e) {
        console.error('日期转换错误:', e);
        return '';
      }
    }
    
    if (!(date instanceof Date) || isNaN(date)) {
      console.error('无效的日期对象:', date);
      return '';
    }
    
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    
    return format
      .replace('YYYY', year)
      .replace('MM', month)
      .replace('DD', day)
      .replace('HH', hours)
      .replace('mm', minutes)
      .replace('ss', seconds);
  };
  
  // 格式化文件大小
  export const formatFileSize = (size) => {
    if (size === null || size === undefined) return '0 KB';
    
    if (size < 1024) {
      return size + ' B';
    } else if (size < 1024 * 1024) {
      return (size / 1024).toFixed(1) + ' KB';
    } else if (size < 1024 * 1024 * 1024) {
      return (size / (1024 * 1024)).toFixed(1) + ' MB';
    } else {
      return (size / (1024 * 1024 * 1024)).toFixed(1) + ' GB';
    }
  };
  
  // 格式化提示词结果
  export const formatPromptResult = (rawResult) => {
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
  
  // 格式化提示词ID
  export const formatPromptId = (id) => {
    if (id === null || id === undefined) {
      return null;
    }
    
    // 确保转换为字符串
    let idStr = String(id);
    
    // 尝试提取纯数字部分
    const numericMatches = idStr.match(/\d+/g);
    if (numericMatches && numericMatches.length > 0) {
      // 使用找到的第一组数字
      return numericMatches[0];
    } 
    
    // 如果没有提取到数字，返回null
    return null;
  };