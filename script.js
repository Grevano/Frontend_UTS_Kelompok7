document.addEventListener('DOMContentLoaded', () => {
    // Variabel global yang dibutuhkan di semua halaman
    let alatMusikData = [];
    let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
    const model = document.getElementById('model');
    const modelBody = document.getElementById('model-body');
    const closeButton = document.querySelector('.close-button');

    // --- FUNGSI-FUNGSI UMUM (digunakan di kedua halaman) ---

    async function fetchData() {
        try {
            const response = await fetch('alat_musik_db.json');
            if (!response.ok) throw new Error('Gagal memuat data alat musik.');
            alatMusikData = await response.json();
            return true;
        } catch (error) {
            console.error('Error fetching data:', error);
            return false;
        }
    }
    
    function showModel(id) {
        const instrument = alatMusikData.find(item => item.id === id);
        if (instrument) {
            modelBody.innerHTML = `
                <img src="${instrument.gambar}" alt="${instrument.nama}">
                <h2>${instrument.nama}</h2>
                <div class="detail-item"><strong>Daerah Asal:</strong> ${instrument.daerah}</div>
                <div class="detail-item"><strong>Tipe:</strong> ${instrument.tipe}</div>
                <div class="detail-item"><strong>Ditemukan Sejak:</strong> ${instrument.tahun}</div>
                <div class="detail-item"><strong>Sejarah:</strong><p>${instrument.sejarah}</p></div>
                <div class="detail-item"><strong>Kegunaan:</strong><p>${instrument.kegunaan}</p></div>`;
            model.classList.add('show');
        }
    }

    function hideModel() {
        model.classList.remove('show');
    }

    // --- DETEKSI HALAMAN & INISIALISASI ---

    // Cek apakah kita berada di halaman Beranda
    if (document.getElementById('instrument-grid')) {
        initializeAppHomepage();
    }

    // Cek apakah kita berada di halaman Favorit
    if (document.getElementById('favorite-grid')) {
        initializeAppFavorites();
    }

    // --- LOGIKA KHUSUS HALAMAN BERANDA ---

    async function initializeAppHomepage() {
        const grid = document.getElementById('instrument-grid');
        const searchInput = document.getElementById('search-input');
        const filterDaerah = document.getElementById('filter-daerah');
        const filterTipe = document.getElementById('filter-tipe');

        if (!await fetchData()) {
            grid.innerHTML = '<p>Gagal memuat data alat musik.</p>';
            return;
        }
        
        populateFilters();
        applyFilters();
        setupHomepageEventListeners();

        function renderInstruments(instruments) {
            grid.innerHTML = '';
            if (instruments.length === 0) {
                grid.innerHTML = '<p style="text-align: center; grid-column: 1 / -1;">Tidak ada alat musik yang cocok.</p>';
                return;
            }
            instruments.forEach(item => {
                const isFavorited = favorites.includes(item.id);
                const card = `
                    <div class="card" data-id="${item.id}">
                        <img src="${item.gambar}" alt="${item.nama}">
                        <div class="card-content"><h3>${item.nama}</h3><p>${item.daerah}</p></div>
                        <button class="favorite-btn ${isFavorited ? 'favorited' : ''}" data-id="${item.id}">${isFavorited ? '❤️' : '🤍'}</button>
                    </div>`;
                grid.innerHTML += card;
            });
        }

        function populateFilters() {
            const daerahs = [...new Set(alatMusikData.map(item => item.daerah))];
            const tipes = [...new Set(alatMusikData.map(item => item.tipe))];
            daerahs.forEach(daerah => { filterDaerah.innerHTML += `<option value="${daerah}">${daerah}</option>`; });
            tipes.forEach(tipe => { filterTipe.innerHTML += `<option value="${tipe}">${tipe}</option>`; });
        }

        function applyFilters() {
            const searchTerm = searchInput.value.toLowerCase();
            const daerah = filterDaerah.value;
            const tipe = filterTipe.value;
            const filtered = alatMusikData.filter(item => 
                item.nama.toLowerCase().includes(searchTerm) &&
                (daerah ? item.daerah === daerah : true) &&
                (tipe ? item.tipe === tipe : true)
            );
            renderInstruments(filtered);
        }

        function toggleFavorite(id) {
            const index = favorites.indexOf(id);
            if (index > -1) favorites.splice(index, 1);
            else favorites.push(id);
            localStorage.setItem('favorites', JSON.stringify(favorites));
            applyFilters();
        }

        function setupHomepageEventListeners() {
            searchInput.addEventListener('input', applyFilters);
            filterDaerah.addEventListener('change', applyFilters);
            filterTipe.addEventListener('change', applyFilters);

            grid.addEventListener('click', (e) => {
                const card = e.target.closest('.card');
                const favBtn = e.target.closest('.favorite-btn');
                if (favBtn) {
                    toggleFavorite(parseInt(favBtn.dataset.id));
                } else if (card) {
                    showModel(parseInt(card.dataset.id));
                }
            });

            closeButton.addEventListener('click', hideModel);
            model.addEventListener('click', e => { if (e.target === model) hideModel(); });
        }
    }

    // --- untuk halaman favorit ---

    async function initializeAppFavorites() {
        const grid = document.getElementById('favorite-grid');

        if (!await fetchData()) {
            grid.innerHTML = '<p>Gagal memuat koleksi favorit Anda.</p>';
            return;
        }
        
        renderFavorites();
        setupFavoritesEventListeners();

        function renderFavorites() {
            const favoriteInstruments = alatMusikData.filter(item => favorites.includes(item.id));
            grid.innerHTML = '';

            if (favoriteInstruments.length === 0) {
                grid.innerHTML = '<p style="text-align: center; grid-column: 1 / -1;">Anda belum punya favorit. Jelajahi <a href="index.html">Beranda</a>!</p>';
                return;
            }
            favoriteInstruments.forEach(item => {
                const card = `
                    <div class="card" data-id="${item.id}">
                        <img src="${item.gambar}" alt="${item.nama}">
                        <div class="card-content"><h3>${item.nama}</h3><p>${item.daerah}</p></div>
                        <button class="favorite-btn favorited" data-id="${item.id}">❤️</button>
                    </div>`;
                grid.innerHTML += card;
            });
        }

        function toggleFavorite(id) {
            const index = favorites.indexOf(id);
            if (index > -1) favorites.splice(index, 1);
            localStorage.setItem('favorites', JSON.stringify(favorites));
            renderFavorites();
        }

        function setupFavoritesEventListeners() {
            grid.addEventListener('click', (e) => {
                const card = e.target.closest('.card');
                const favBtn = e.target.closest('.favorite-btn');
                if (favBtn) {
                    e.stopPropagation();
                    toggleFavorite(parseInt(favBtn.dataset.id));
                } else if (card) {
                    showModel(parseInt(card.dataset.id));
                }
            });

            closeButton.addEventListener('click', hideModel);
            model.addEventListener('click', e => { if (e.target === model) hideModel(); });
        }
    }
});