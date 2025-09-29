document.addEventListener('DOMContentLoaded', () => {
    const grid = document.getElementById('favorite-grid');
    const model = document.getElementById('model');
    const modelBody = document.getElementById('model-body');
    const closeButton = document.querySelector('.close-button');

    let alatMusikData = [];
    let favorites = JSON.parse(localStorage.getItem('favorites')) || [];

    async function initializeFavorites() {
        try {
            const response = await fetch('alat_musik_db.json');
            if (!response.ok) throw new Error('Gagal memuat data alat musik.');
            alatMusikData = await response.json();
            
            renderFavorites();
            setupEventListeners();
        } catch (error) {
            console.error('Error:', error);
            grid.innerHTML = '<p>Gagal memuat koleksi favorit Anda.</p>';
        }
    }

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
                    <div class="card-content">
                        <h3>${item.nama}</h3>
                        <p>${item.daerah}</p>
                    </div>
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

    function setupEventListeners() {
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

    initializeFavorites();
});