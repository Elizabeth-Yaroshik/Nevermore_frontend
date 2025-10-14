document.querySelectorAll('.mobile-nav-item').forEach(item => {
    item.addEventListener('click', function() {
        document.querySelectorAll('.mobile-nav-item').forEach(el => {
            el.classList.remove('active');
        });
        this.classList.add('active');
    });
});
document.addEventListener("DOMContentLoaded", () => {
    const toastContainer = document.getElementById("toastContainer");

    function showToast(type, message) {
        const toast = document.createElement("div");
        toast.className = `toast toast-${type}`;

        let icon = "";
        switch (type) {
            case "success": icon = '<i class="fas fa-check-circle"></i>'; break;
            case "error": icon = '<i class="fas fa-times-circle"></i>'; break;
            case "warning": icon = '<i class="fas fa-exclamation-triangle"></i>'; break;
            case "info": icon = '<i class="fas fa-info-circle"></i>'; break;
        }

        toast.innerHTML = `${icon}<span>${message}</span><button>&times;</button>`;
        toastContainer.appendChild(toast);

        const closeBtn = toast.querySelector("button");
        closeBtn.addEventListener("click", () => toast.remove());

        setTimeout(() => toast.remove(), 4000);
    }

    const searchInput = document.querySelector(".search-bar input");
    searchInput.addEventListener("keydown", e => {
        if (e.key === "Enter") {
            const val = searchInput.value.trim();
            if (!val) {
                showToast("error", "Введите поисковый запрос!");
            }
        }
    });
});
