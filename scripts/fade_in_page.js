let domReady = (callback) => {
  document.readyState === 'interactive' || document.readyState === 'complete'
    ? callback()
    : document.addEventListener('DOMContentLoaded', callback);
};

domReady(() => {
  document.body.style.opacity = '1';
  document.body.style.transform = 'none';
  document.body.style.filter = 'none';
  document.body.ontransitionend = () => {
    setTimeout(() => {
      document.body.style.overflow = 'auto';
      document.body.ontransitionend = null;
    }, 100);
  };
});