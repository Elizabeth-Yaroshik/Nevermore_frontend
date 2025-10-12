document.querySelectorAll('.mobile-nav-item').forEach(item => {
    item.addEventListener('click', function() {
        document.querySelectorAll('.mobile-nav-item').forEach(el => {
            el.classList.remove('active');
        });
        this.classList.add('active');
    });
});