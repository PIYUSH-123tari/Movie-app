document.querySelectorAll('.video-container').forEach(container => {
    const iframe = container.querySelector('iframe');
    const src = iframe.src;

    container.addEventListener('mouseenter', () => {
        iframe.src = src + '&autoplay=1';
    });

    container.addEventListener('mouseleave', () => {
        iframe.src = src;
    });
});