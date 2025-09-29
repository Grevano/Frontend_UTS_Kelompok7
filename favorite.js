document.addEventListener('DOMContentLoaded', () => {
    const grid = document.getElementById('favorite-grid');
    const modal = document.getElementById('modal');
    const modalBody = document.getElementById('modal-body');
    const closeButton = document.querySelector('.close-button');

    let alatMusikData = [];
    let favorites = JSON.parse(localStorage.getItem('favorites')) || [];

    async function initializeFavorites() {
        try {
            // 1. Ambil semua data alat musik dari file JSON
            const response = await fetch('alat_musik_db.json');
            if (!response.ok) throw new Error('Gagal memuat data alat musik.');
            alatMusikData = await response.json();

            // 2. Filter data untuk mendapatkan hanya item favorit
            const favoriteInstruments = alatMusikData.filter(item => favorites.includes(item.id));

            // 3. Tampilkan kartu favorit
            renderFavorites(favoriteInstruments);
            setupEventListeners();

        } catch (error) {
            console.error('Error:', error);
            grid.innerHTML = '<p>Gagal memuat koleksi favorit Anda.</p>';
        }
    }

    function renderFavorites(instruments) {
        grid.innerHTML = '';
        if (instruments.length === 0) {
            grid.innerHTML = '<p style="text-align: center; grid-column: 1 / -1;">Anda belum memiliki alat musik favorit. Jelajahi <a href="index.html">Beranda</a> untuk menambahkannya!</p>';
            return;
        }
        instruments.forEach(item => {
            const card = `
                <div class="card" data-id="${item.id}">
                    <img src="${item.gambar}" alt="${item.nama}">
                    <div class="card-content">
                        <h3>${item.nama}</h3>
                        <p>${item.daerah}</p>
                    </div>
                    <button class="favorite-btn favorited" data-id="${item.id}">❤️</button>
                </div>
            `;
            grid.innerHTML += card;
        });
    }

    function toggleFavorite(id) {
        // Hapus dari array favorites
        const index = favorites.indexOf(id);
        if (index > -1) {
            favorites.splice(index, 1);
        }

        // Simpan perubahan ke localStorage
        localStorage.setItem('favorites', JSON.stringify(favorites));

        // Hapus kartu dari tampilan secara langsung untuk feedback instan
        const cardToRemove = grid.querySelector(`.card[data-id="${id}"]`);
        if (cardToRemove) {
            cardToRemove.style.transition = 'transform 0.3s ease, opacity 0.3s ease';
            cardToRemove.style.transform = 'scale(0.9)';
            cardToRemove.style.opacity = '0';
            setTimeout(() => {
                cardToRemove.remove();
                if (grid.children.length === 0) {
                    renderFavorites([]); // Tampilkan pesan jika sudah tidak ada favorit
                }
            }, 300);
        }
    }

    // --- Fungsi Modal (sama seperti di script.js) ---
    function showModal(id) {
        const instrument = alatMusikData.find(item => item.id === id);
        if (instrument) {
            modalBody.innerHTML = `
                <img src="${instrument.gambar}" alt="${instrument.nama}">
                <h2>${instrument.nama}</h2>
                <div class="detail-item"><strong>Daerah Asal:</strong> ${instrument.daerah}</div>
                <div class="detail-item"><strong>Tipe:</strong> ${instrument.tipe}</div>
                <div class="detail-item"><strong>Ditemukan Sejak:</strong> ${instrument.tahun}</div>
                <div class="detail-item"><strong>Sejarah:</strong><p>${instrument.sejarah}</p></div>
                <div class="detail-item"><strong>Kegunaan:</strong><p>${instrument.kegunaan}</p></div>
            `;
            modal.classList.add('show');
        }
    }

    function hideModal() {
        modal.classList.remove('show');
    }

    function setupEventListeners() {
        grid.addEventListener('click', (e) => {
            const card = e.target.closest('.card');
            const favBtn = e.target.closest('.favorite-btn');

            if (favBtn) {
                e.stopPropagation(); // Mencegah modal terbuka saat klik tombol favorit
                const id = parseInt(favBtn.dataset.id);
                toggleFavorite(id);
            } else if (card) {
                const id = parseInt(card.dataset.id);
                showModal(id);
            }
        });

        closeButton.addEventListener('click', hideModal);
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                hideModal();
            }
        });
    }

    // Mulai aplikasi
    initializeFavorites();
});