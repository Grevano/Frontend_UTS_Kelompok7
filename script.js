document.addEventListener('DOMContentLoaded', () => {
    // Ambil elemen DOM
    const grid = document.getElementById('instrument-grid');
    const searchInput = document.getElementById('search-input');
    const filterDaerah = document.getElementById('filter-daerah');
    const filterTipe = document.getElementById('filter-tipe');
    const model = document.getElementById('model');
    const modelBody = document.getElementById('model-body');
    const closeButton = document.querySelector('.close-button');
    const navBeranda = document.getElementById('nav-beranda');
    const navFavorit = document.getElementById('nav-favorit');

    // Variabel global untuk menyimpan data setelah di-fetch
    let alatMusikData = [];
    let favorites = JSON.parse(localStorage.getItem('favorites')) || [];

    // --- FUNGSI UTAMA UNTUK MENGAMBIL DATA DAN INISIALISASI APLIKASI ---
    async function initializeApp() {
        try {
            const response = await fetch('alat_musik_db.json');
            if (!response.ok) {
                throw new Error('Gagal mengambil data!');
            }
            alatMusikData = await response.json();
            
            // Setelah data siap, jalankan fungsi-fungsi lainnya
            populateFilters();
            renderInstruments(alatMusikData);
            setupEventListeners();

        } catch (error) {
            console.error('Terjadi masalah:', error);
            grid.innerHTML = '<p>Maaf, gagal memuat data alat musik. Silakan coba lagi nanti.</p>';
        }
    }

    // --- RENDER FUNCTIONS ---
    function renderInstruments(instruments) {
        grid.innerHTML = '';
        if (instruments.length === 0) {
            grid.innerHTML = '<p>Tidak ada alat musik yang cocok dengan kriteria Anda.</p>';
            return;
        }
        instruments.forEach(item => {
            const isFavorited = favorites.includes(item.id);
            const card = `
                <div class="card" data-id="${item.id}">
                    <img src="${item.gambar}" alt="${item.nama}">
                    <div class="card-content">
                        <h3>${item.nama}</h3>
                        <p>${item.daerah}</p>
                    </div>
                    <button class="favorite-btn ${isFavorited ? 'favorited' : ''}" data-id="${item.id}">
                        ${isFavorited ? '❤️' : '🤍'}
                    </button>
                </div>
            `;
            grid.innerHTML += card;
        });
    }

    function populateFilters() {
        const daerahs = [...new Set(alatMusikData.map(item => item.daerah))];
        const tipes = [...new Set(alatMusikData.map(item => item.tipe))];

        daerahs.forEach(daerah => {
            filterDaerah.innerHTML += `<option value="${daerah}">${daerah}</option>`;
        });
        tipes.forEach(tipe => {
            filterTipe.innerHTML += `<option value="${tipe}">${tipe}</option>`;
        });
    }

    // --- Model Function ---
    function showmodel(id) {
        const instrument = alatMusikData.find(item => item.id === id);
        if (instrument) {
            modelBody.innerHTML = `
                <img src="${instrument.gambar}" alt="${instrument.nama}">
                <h2>${instrument.nama}</h2>
                <div class="detail-item"><strong>Daerah Asal:</strong> ${instrument.daerah}</div>
                <div class="detail-item"><strong>Tipe:</strong> ${instrument.tipe}</div>
                <div class="detail-item"><strong>Ditemukan Sejak:</strong> ${instrument.tahun}</div>
                <div class="detail-item"><strong>Sejarah:</strong><p>${instrument.sejarah}</p></div>
                <div class="detail-item"><strong>Kegunaan:</strong><p>${instrument.kegunaan}</p></div>
            `;
            model.classList.add('show');
        }
    }

    function hidemodel() {
        model.classList.remove('show');
    }
    
    // --- FAVORITE FUNCTIONS ---
    function toggleFavorite(id) {
        const index = favorites.indexOf(id);
        if (index > -1) {
            favorites.splice(index, 1);
        } else {
            favorites.push(id);
        }
        localStorage.setItem('favorites', JSON.stringify(favorites));
        applyFilters();
    }
    
    // --- FILTER & SEARCH LOGIC ---
    function applyFilters() {
        const searchTerm = searchInput.value.toLowerCase();
        const daerah = filterDaerah.value;
        const tipe = filterTipe.value;

        const filtered = alatMusikData.filter(item => {
            const nameMatch = item.nama.toLowerCase().includes(searchTerm);
            const daerahMatch = daerah ? item.daerah === daerah : true;
            const tipeMatch = tipe ? item.tipe === tipe : true;
            return nameMatch && daerahMatch && tipeMatch;
        });

        renderInstruments(filtered);
    }

    // --- SETUP EVENT LISTENERS ---
    function setupEventListeners() {
        searchInput.addEventListener('input', applyFilters);
        filterDaerah.addEventListener('change', applyFilters);
        filterTipe.addEventListener('change', applyFilters);

        grid.addEventListener('click', (e) => {
            const card = e.target.closest('.card');
            const favBtn = e.target.closest('.favorite-btn');

            if (favBtn) {
                const id = parseInt(favBtn.dataset.id);
                toggleFavorite(id);
            } else if (card) {
                const id = parseInt(card.dataset.id);
                showmodel(id);
            }
        });

        closeButton.addEventListener('click', hidemodel);
        model.addEventListener('click', (e) => {
            if (e.target === model) {
                hidemodel();
            }
        });

        navBeranda.addEventListener('click', (e) => {
            e.preventDefault();
            searchInput.value = '';
            filterDaerah.value = '';
            filterTipe.value = '';
            renderInstruments(alatMusikData);
        });

    }

    // --- Panggil fungsi inisialisasi ---
    initializeApp();
});