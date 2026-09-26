const measurementId = 'G-9MF0L4G98P';

window.dataLayer = window.dataLayer || [];
window.gtag = function gtag() {
  window.dataLayer.push(arguments);
};

window.gtag('js', new Date());
window.gtag('config', measurementId);

const googleTag = document.createElement('script');
googleTag.async = true;
googleTag.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
document.head.appendChild(googleTag);
