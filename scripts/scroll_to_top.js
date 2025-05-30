const scrollTopBtn = document.getElementById('scrollTopBtn');
function toggleScrollTopBtn() {
    if (window.innerWidth <= 768 && window.scrollY > 100) {
        scrollTopBtn.classList.remove('hidden');
        scrollTopBtn.classList.remove('fade-out');
        scrollTopBtn.classList.add('fade-in');
    } else {
        if (!scrollTopBtn.classList.contains('hidden')) {
            scrollTopBtn.classList.remove('fade-in');
            scrollTopBtn.classList.add('fade-out');
            setTimeout(() => scrollTopBtn.classList.add('hidden'), 300);
        }
    }
}
scrollTopBtn.onclick = function () {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    scrollTopBtn.classList.remove('fade-in');
    scrollTopBtn.classList.add('fade-out');
    setTimeout(() => scrollTopBtn.classList.add('hidden'), 300);
};
window.addEventListener('scroll', toggleScrollTopBtn);
window.addEventListener('resize', toggleScrollTopBtn);
document.addEventListener('DOMContentLoaded', toggleScrollTopBtn);