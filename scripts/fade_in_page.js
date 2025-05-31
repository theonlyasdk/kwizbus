let domReady = (cb) => {
  document.readyState === 'interactive' || document.readyState === 'complete'
    ? cb()
    : document.addEventListener('DOMContentLoaded', cb);
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