// config/cdn.js
export const CDN = {
    BASE_URL: 'https://cdn.duyueai.com',
    IMAGES: {
      LOGO: '/prompt/logo.png',
      CUSTOMER_SERVICE_QR: '/prompt/xxwhkf.jpeg',
      SHARE_IMAGE: '/prompt/share.png'
    }
  };
  
  export const getImageUrl = (path) => {
    return CDN.BASE_URL + path;
  };