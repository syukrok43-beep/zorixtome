(function() {

    var articlesData = [];

    var homePage = document.getElementById('homePage');
    var detailPage = document.getElementById('detailPage');
    var aboutPage = document.getElementById('aboutPage');
    var articleTableBody = document.getElementById('articleTableBody');
    var noArticleMessage = document.getElementById('noArticleMessage');
    var detailBackBtn = document.getElementById('detailBackBtn');
    var detailTitle = document.getElementById('detailTitle');
    var detailDate = document.getElementById('detailDate');
    var detailBody = document.getElementById('detailBody');
    var msgBackToAll = document.getElementById('msgBackToAll');
    var aboutBackBtn = document.getElementById('aboutBackBtn');
    var navAbout = document.getElementById('navAbout');

    var currentCategory = 'all';
    var currentPage = 1;
    var articlesPerPage = 20;

    // =============================================
    // MUAT ARTIKEL DARI JSON
    // =============================================
    function loadArticles() {
        fetch('articles.json')
            .then(function(response) {
                if (!response.ok) {
                    throw new Error('Gagal memuat articles.json');
                }
                return response.json();
            })
            .then(function(data) {
                articlesData = data;
                setActiveNav('all');
                renderArticleList('all', 1);
            })
            .catch(function(error) {
                articleTableBody.innerHTML = '<tr><td colspan="3" style="text-align:center;padding:40px;color:#8a9baa;">Gagal memuat artikel. Pastikan file articles.json ada.</td></tr>';
            });
    }

    // =============================================
    // SEMBUNYIKAN SEMUA HALAMAN
    // =============================================
    function hideAllPages() {
        homePage.classList.add('hidden');
        detailPage.classList.add('hidden');
        aboutPage.classList.add('hidden');
    }

    // =============================================
    // SET NAVIGASI AKTIF
    // =============================================
    function setActiveNav(category) {
        var navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(function(link) {
            link.classList.remove('active-nav');
            if (link.getAttribute('data-category') === category) {
                link.classList.add('active-nav');
            }
        });
    }

    // =============================================
    // RENDER DAFTAR ARTIKEL DENGAN PAGINATION
    // =============================================
    function renderArticleList(category, page) {
        var filtered;

        if (category === 'teknologi') {
            filtered = articlesData.filter(function(a) {
                return a.category === 'teknologi';
            });
        } else if (category === 'business') {
            filtered = articlesData.filter(function(a) {
                return a.category === 'business';
            });
        } else {
            filtered = articlesData;
        }

        var totalPages = Math.ceil(filtered.length / articlesPerPage);

        if (page < 1) page = 1;
        if (page > totalPages) page = totalPages;

        currentPage = page;

        var start = (page - 1) * articlesPerPage;
        var end = start + articlesPerPage;
        var pageArticles = filtered.slice(start, end);

        articleTableBody.innerHTML = '';

        if (filtered.length === 0) {
            noArticleMessage.classList.remove('hidden');
            document.getElementById('paginationContainer').classList.add('hidden');
        } else {
            noArticleMessage.classList.add('hidden');
        }

        pageArticles.forEach(function(article, index) {
            var tr = document.createElement('tr');
            tr.className = 'article-row';
            tr.setAttribute('data-id', article.id);

            var globalIndex = start + index + 1;

            var dateParts = article.date.split(' ');
            var dateShort = dateParts[0] + ' ' + dateParts[1];
            dateShort = dateShort.replace(',', '');

            tr.innerHTML =
                '<td class="article-number">' + globalIndex + '.</td>' +
                '<td class="article-upvote" title="upvote">&#9650;</td>' +
                '<td class="article-content-cell">' +
                    '<div class="article-title-line">' +
                        '<a class="article-title-link" data-id="' + article.id + '">' + article.title + '</a>' +
                    '</div>' +
                    '<div class="article-meta-line">' +
                        dateShort +
                    '</div>' +
                '</td>';

            articleTableBody.appendChild(tr);
        });

        // Klik judul artikel -> buka detail
        document.querySelectorAll('.article-title-link').forEach(function(link) {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                var id = parseInt(this.getAttribute('data-id'));
                showDetail(id);
            });
        });

        // Upvote (hanya efek visual, tidak mengubah data)
        document.querySelectorAll('.article-upvote').forEach(function(upvote) {
            upvote.addEventListener('click', function() {
                if (this.classList.contains('voted')) {
                    this.classList.remove('voted');
                } else {
                    this.classList.add('voted');
                }
            });
        });

        // Render pagination
        renderPagination(category, page, totalPages);
    }

    // =============================================
    // RENDER TOMBOL PAGINATION
    // =============================================
    function renderPagination(category, currentPage, totalPages) {
        var container = document.getElementById('paginationContainer');

        if (totalPages <= 1) {
            container.classList.add('hidden');
            return;
        }

        container.classList.remove('hidden');

        var html = '';

        // Tombol Previous
        if (currentPage > 1) {
            html += '<a href="#" class="page-link" data-page="' + (currentPage - 1) + '">Previous</a>';
        } else {
            html += '<span class="page-disabled">Previous</span>';
        }

        html += '<span class="page-sep">|</span>';

        // Nomor halaman
        for (var i = 1; i <= totalPages; i++) {
            if (i === currentPage) {
                html += '<span class="page-current">' + i + '</span>';
            } else {
                html += '<a href="#" class="page-link" data-page="' + i + '">' + i + '</a>';
            }

            if (i < totalPages) {
                html += '<span class="page-sep">|</span>';
            }
        }

        // Tombol Next
        html += '<span class="page-sep">|</span>';
        if (currentPage < totalPages) {
            html += '<a href="#" class="page-link" data-page="' + (currentPage + 1) + '">Next</a>';
        } else {
            html += '<span class="page-disabled">Next</span>';
        }

        container.innerHTML = html;

        // Event listener tombol pagination
        document.querySelectorAll('.page-link').forEach(function(link) {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                var page = parseInt(this.getAttribute('data-page'));
                renderArticleList(category, page);
                window.scrollTo(0, 0);
            });
        });
    }

    // =============================================
    // PINDAH KATEGORI
    // =============================================
    function switchCategory(category) {
        currentCategory = category;
        setActiveNav(category);
        renderArticleList(category, 1);
        hideAllPages();
        homePage.classList.remove('hidden');
    }

    // =============================================
    // TAMPILKAN DETAIL ARTIKEL
    // =============================================
    function showDetail(id) {
        var article = articlesData.find(function(a) {
            return a.id === id;
        });

        if (!article) return;

        detailTitle.textContent = article.title;
        detailDate.textContent = article.date;
        detailBody.innerHTML = article.content;

        hideAllPages();
        detailPage.classList.remove('hidden');
    }

    // =============================================
    // TAMPILKAN ABOUT
    // =============================================
    function showAbout() {
        hideAllPages();
        aboutPage.classList.remove('hidden');

        document.querySelectorAll('.nav-link').forEach(function(link) {
            link.classList.remove('active-nav');
        });
    }

    // =============================================
    // KEMBALI KE BERANDA
    // =============================================
    function backToHome() {
        hideAllPages();
        homePage.classList.remove('hidden');
    }

    // =============================================
    // EVENT LISTENER
    // =============================================
    document.querySelectorAll('.nav-link').forEach(function(link) {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            var category = this.getAttribute('data-category');
            switchCategory(category);
        });
    });

    navAbout.addEventListener('click', function(e) {
        e.preventDefault();
        showAbout();
    });

    detailBackBtn.addEventListener('click', function(e) {
        e.preventDefault();
        backToHome();
    });

    aboutBackBtn.addEventListener('click', function(e) {
        e.preventDefault();
        backToHome();
    });

    msgBackToAll.addEventListener('click', function(e) {
        e.preventDefault();
        switchCategory('all');
    });

    // =============================================
    // INISIALISASI
    // =============================================
    loadArticles();

})();