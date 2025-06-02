document.addEventListener('DOMContentLoaded', function () {
    const wrapper = document.querySelector('#ajax-reviews-wrapper');
    const spinner = document.querySelector('#reviews-loading-spinner');
    const loadMoreBtn = document.querySelector('#reviews-loadmore-btn');
    const paginationContainer = document.querySelector('#reviews-pagination');
    const prevArrow = paginationContainer.querySelector('.prev-arrow');
    const nextArrow = paginationContainer.querySelector('.next-arrow');
    const paginationNumbers = paginationContainer.querySelector('.pagination-numbers');

    // Check if elements exist
    if (!wrapper || !spinner) return;

    // Initialize variables
    const postsPerPage = parseInt(wrapper.getAttribute('data-posts-per-page'), 10);
    let totalPages = 1;
    let currentPage = 1;

    // Load More button functionality
    if (loadMoreBtn) {
        fetchTotalPages();

        loadMoreBtn.addEventListener('click', function () {
            currentPage = parseInt(loadMoreBtn.getAttribute('data-current-page'), 10);
            const nextPage = currentPage + 1;

            loadReviews(nextPage, true);
        });
    }

    // Arrow pagination
    prevArrow.addEventListener('click', function() {
        if (currentPage > 1) {
            loadReviews(currentPage - 1, false);
        }
    });

    nextArrow.addEventListener('click', function() {
        if (currentPage < totalPages) {
            loadReviews(currentPage + 1, false);
        }
    });

    // Handle number button clicks
    paginationContainer.addEventListener('click', function (e) {
        if (e.target.classList.contains('review-page-btn')) {
            const page = parseInt(e.target.getAttribute('data-page'), 10);
            loadReviews(page, false);
        }
    });

    function loadReviews(page, isLoadMore) {
        // Show spinner
        spinner.style.display = 'block';

        // Fetch reviews
        const formData = new FormData();
            formData.append('action', 'load_reviews');
            formData.append('page', page);
            formData.append('number', postsPerPage);
            formData.append('load_more', isLoadMore ? 'true' : 'false');
            formData.append('product_id', wrapper.dataset.productId);

        fetch('/wp-admin/admin-ajax.php', {
            method: 'POST',
            body: formData,
        })
        .then(res => res.text())
        .then(data => {
            if (isLoadMore) {
                wrapper.insertAdjacentHTML('beforeend', data);
            } else {
                wrapper.innerHTML = data;
            }

            // Update variables
            currentPage = page;
            loadMoreBtn.setAttribute('data-current-page', page);
            spinner.style.display = 'none';

            updatePaginationUI();
        });
    }

    // Update pagination view
    function updatePaginationUI() {
        // Update Load More button
        if (loadMoreBtn) {
            loadMoreBtn.style.display = (currentPage < totalPages) ? 'inline-block' : 'none';
        }

        // Update arrows
        prevArrow.disabled = currentPage <= 1;
        nextArrow.disabled = currentPage >= totalPages;

        // Update pagination numbers
        paginationNumbers.innerHTML = '';
        for (let i = 1; i <= totalPages; i++) {
            const btn = document.createElement('button');
            btn.className = `review-page-btn ${i === currentPage ? 'active' : ''}`;
            btn.setAttribute('data-page', i);
            btn.textContent = i;
            paginationNumbers.appendChild(btn);
        }
    }

    // Fetch total number of pages
    function fetchTotalPages() {
        const formData = new FormData();
        formData.append('action', 'get_reviews_total_pages');
        formData.append('number', postsPerPage);
        formData.append('product_id', wrapper.dataset.productId);

        // Fetch the total number of pages
        fetch('/wp-admin/admin-ajax.php', {
            method: 'POST',
            body: formData
        })
        .then(res => res.json())
        .then(data => {
            totalPages = data.total_pages;
            updatePaginationUI();
        });
    }
});
