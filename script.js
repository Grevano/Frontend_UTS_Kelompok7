document.addEventListener('DOMContentLoaded', () => {

    let alatMusikData = []; // Array untuk menyimpan semua data alat musik dari JSON
    let favorites = JSON.parse(localStorage.getItem('favorites')) || []; // Mengambil ID favorit dari localStorage, atau array kosong jika belum ada
    let userInstruments = JSON.parse(localStorage.getItem('userInstruments')) || []; // Instrumen yang ditambahkan pengguna
    const model = document.getElementById('model'); // Elemen model overlay
    const modelBody = document.getElementById('model-body'); // Konten di dalam model
    const closeButton = document.querySelector('.close-button'); // Tombol 'x' untuk menutup model

    // --- FUNGSI-FUNGSI UMUM (digunakan di beberapa halaman) ---

    // Fungsi untuk mengambil data dari file JSON
    async function fetchData() {
        try {
            const response = await fetch('alat_musik_db.json'); // Mengambil data
            if (!response.ok) throw new Error('Gagal memuat data alat musik.'); // Cek jika fetch gagal
            alatMusikData = await response.json(); // Mengubah response menjadi format JSON dan menyimpannya
            return true; // Mengembalikan true jika berhasil
        } catch (error) {
            console.error('Error fetching data:', error); // Menampilkan error di console jika gagal
            return false; // Mengembalikan false jika gagal
        }
    }
    
    // Fungsi untuk menampilkan detail alat musik di dalam model
    function showModel(id) {
        const allData = [...alatMusikData, ...userInstruments];
        const instrument = allData.find(item => item.id === id); // Cari alat musik berdasarkan ID
        if (instrument) {
            // Mengisi konten model dengan data dari alat musik yang ditemukan
            modelBody.innerHTML = `
                <img src="${instrument.gambar}" alt="${instrument.nama}">
                <h2>${instrument.nama}</h2>
                <div class="detail-item"><strong>Daerah Asal:</strong> ${instrument.daerah}</div>
                <div class="detail-item"><strong>Tipe:</strong> ${instrument.tipe}</div>
                <div class="detail-item"><strong>Ditemukan Sejak:</strong> ${instrument.tahun}</div>
                <div class="detail-item"><strong>Sejarah:</strong><p>${instrument.sejarah}</p></div>
                <div class="detail-item"><strong>Kegunaan:</strong><p>${instrument.kegunaan}</p></div>`;
            model.classList.add('show'); // Menambahkan class 'show' untuk menampilkan model
        }
    }

    // Fungsi untuk menyembunyikan model
    function hideModel() {
        model.classList.remove('show'); // Menghapus class 'show' untuk menyembunyikan model
    }

    // DETEKSI HALAMAN & INISIALISASI 
    // Script ini digunakan di beberapa halaman, jadi kita perlu mendeteksi halaman mana yang sedang aktif
    // untuk menjalankan fungsi yang sesuai.

    // Cek apakah ada elemen dengan ID 'instrument-grid'. Jika ada, berarti kita di halaman Beranda.
    if (document.getElementById('instrument-grid')) {
        initializeAppHomepage();
    }

    // Cek apakah ada elemen dengan ID 'favorite-grid'. Jika ada, berarti kita di halaman Favorit.
    if (document.getElementById('favorite-grid')) {
        initializeAppFavorites();
    }

    // LOGIKA KHUSUS HALAMAN BERANDA 

    async function initializeAppHomepage() {
        // Mendapatkan elemen-elemen dari halaman Beranda
        const grid = document.getElementById('instrument-grid');
        const searchInput = document.getElementById('search-input');
        const filterDaerah = document.getElementById('filter-daerah');
        const filterTipe = document.getElementById('filter-tipe');

        // Mengambil data, jika gagal, tampilkan pesan error
        if (!await fetchData()) {
            grid.innerHTML = '<p>Gagal memuat data alat musik.</p>';
            return;
        }
        
        // Setelah data berhasil diambil, jalankan fungsi-fungsi ini
        populateFilters(); // Mengisi pilihan filter dropdown
        applyFilters(); // Menampilkan semua alat musik pada awalnya
        setupHomepageEventListeners(); // Menyiapkan semua event listener untuk halaman Beranda

        // Fungsi untuk merender (menampilkan) kartu-kartu alat musik ke dalam grid
        function renderInstruments(instruments) {
            grid.innerHTML = ''; // Kosongkan grid terlebih dahulu
            // Tambahkan card "+" di awal grid
            grid.innerHTML += `
                <div class="card add-card" id="add-card" title="Tambah Instrumen Baru">
                    <div class="add-icon">+</div>
                </div>
            `;
            if (instruments.length === 0) {
                grid.innerHTML += '<p style="text-align: center; grid-column: 1 / -1;">Tidak ada alat musik yang cocok.</p>';
                return;
            }
            instruments.forEach(item => {
                const isFavorited = favorites.includes(item.id); // Cek apakah alat musik ini ada di daftar favorit
                // Membuat template HTML untuk setiap kartu
                const isUserInstrument = userInstruments.some(ui => ui.id === item.id);
                const deleteButton = isUserInstrument ? `<button class="delete-btn" data-id="${item.id}">🗑️</button>` : '';
                const card = `
                    <div class="card" data-id="${item.id}">
                        <img src="${item.gambar}" alt="${item.nama}">
                        <div class="card-content"><h3>${item.nama}</h3><p>${item.daerah}</p></div>
                        <button class="favorite-btn ${isFavorited ? 'favorited' : ''}" data-id="${item.id}">${isFavorited ? '❤️' : '🤍'}</button>
                        ${deleteButton}
                    </div>`;
                grid.innerHTML += card; // Menambahkan kartu ke dalam grid
            });
        }

        // Fungsi untuk mengisi pilihan pada dropdown filter secara dinamis
        function populateFilters() {
            // Mengambil semua nilai unik untuk daerah dan tipe dari data
            const allData = [...alatMusikData, ...userInstruments];
            const daerahs = [...new Set(allData.map(item => item.daerah))];
            const tipes = [...new Set(allData.map(item => item.tipe))];
            // Menambahkan setiap daerah dan tipe sebagai <option> di dalam <select>
            daerahs.forEach(daerah => { filterDaerah.innerHTML += `<option value="${daerah}">${daerah}</option>`; });
            tipes.forEach(tipe => { filterTipe.innerHTML += `<option value="${tipe}">${tipe}</option>`; });
        }

        // Fungsi untuk menyaring dan menampilkan alat musik sesuai input pengguna
        function applyFilters() {
            const searchTerm = searchInput.value.toLowerCase(); // Ambil teks pencarian
            const daerah = filterDaerah.value; // Ambil nilai filter daerah
            const tipe = filterTipe.value; // Ambil nilai filter tipe
            // Lakukan filter pada data utama dan userInstruments
            const allData = [...alatMusikData, ...userInstruments];
            const filtered = allData.filter(item => 
                item.nama.toLowerCase().includes(searchTerm) && // Cocokkan nama
                (daerah ? item.daerah === daerah : true) && // Cocokkan daerah (jika dipilih)
                (tipe ? item.tipe === tipe : true) // Cocokkan tipe (jika dipilih)
            );
            renderInstruments(filtered); // Tampilkan hasil filter
        }

        // Fungsi untuk menambah atau menghapus dari daftar favorit
        function toggleFavorite(id) {
            const index = favorites.indexOf(id); // Cari ID di dalam array favorites
            if (index > -1) favorites.splice(index, 1); // Jika ada, hapus
            else favorites.push(id); // Jika tidak ada, tambahkan
            localStorage.setItem('favorites', JSON.stringify(favorites)); // Simpan array baru ke localStorage
            applyFilters(); // Render ulang kartu untuk update tampilan tombol favorit
        }

        // Fungsi untuk mengatur semua event listener di halaman Beranda
        function setupHomepageEventListeners() {
            // Tambahkan listener untuk input pencarian dan perubahan filter
            searchInput.addEventListener('input', applyFilters);
            filterDaerah.addEventListener('change', applyFilters);
            filterTipe.addEventListener('change', applyFilters);

            // Gunakan event delegation pada grid untuk menangani klik pada kartu atau tombol favorit atau delete atau add
            grid.addEventListener('click', (e) => {
                const card = e.target.closest('.card');
                const favBtn = e.target.closest('.favorite-btn');
                const deleteBtn = e.target.closest('.delete-btn');
                if (favBtn) { // Jika yang diklik adalah tombol favorit
                    toggleFavorite(parseInt(favBtn.dataset.id));
                } else if (deleteBtn) { // Jika yang diklik adalah tombol delete
                    deleteInstrument(parseInt(deleteBtn.dataset.id));
                } else if (card && card.id === 'add-card') { // Jika yang diklik adalah card add
                    showAddModal();
                } else if (card) { // Jika yang diklik adalah bagian lain dari kartu
                    showModel(parseInt(card.dataset.id));
                }
            });

            // Event listener untuk menutup model
            closeButton.addEventListener('click', hideModel);
            model.addEventListener('click', e => { if (e.target === model) hideModel(); }); // Tutup model jika klik di luar konten

            // Event listener untuk add modal
            const addModal = document.getElementById('add-modal');
            const closeAdd = document.getElementById('close-add');
            const addForm = document.getElementById('add-form');
            closeAdd.addEventListener('click', hideAddModal);
            addModal.addEventListener('click', e => { if (e.target === addModal) hideAddModal(); });
            addForm.addEventListener('submit', handleAddInstrument);
        }

        // Fungsi untuk menampilkan modal add
        function showAddModal() {
            document.getElementById('add-modal').classList.add('show');
        }

        // Fungsi untuk menyembunyikan modal add
        function hideAddModal() {
            document.getElementById('add-modal').classList.remove('show');
        }

        // Fungsi untuk menangani submit form add
        function handleAddInstrument(e) {
            e.preventDefault();
            const newInstrument = {
                id: Date.now(),
                nama: document.getElementById('nama').value,
                daerah: document.getElementById('daerah').value,
                tipe: document.getElementById('tipe').value,
                tahun: document.getElementById('tahun').value,
                sejarah: document.getElementById('sejarah').value,
                kegunaan: document.getElementById('kegunaan').value,
                gambar: document.getElementById('gambar').value,
                isUserAdded: true
            };
            userInstruments.push(newInstrument);
            localStorage.setItem('userInstruments', JSON.stringify(userInstruments));
            hideAddModal();
            applyFilters(); // re-render
            e.target.reset();
        }

        // Fungsi untuk menghapus instrumen
        function deleteInstrument(id) {
            userInstruments = userInstruments.filter(item => item.id !== id);
            localStorage.setItem('userInstruments', JSON.stringify(userInstruments));
            applyFilters(); // re-render
        }
    }

    // LOGIKA KHUSUS HALAMAN FAVORIT 

    async function initializeAppFavorites() {
        const grid = document.getElementById('favorite-grid');

        // Ambil data, jika gagal tampilkan pesan
        if (!await fetchData()) {
            grid.innerHTML = '<p>Gagal memuat koleksi favorit Anda.</p>';
            return;
        }
        
        // Jalankan fungsi untuk halaman favorit
        renderFavorites();
        setupFavoritesEventListeners();

        // Fungsi untuk merender kartu alat musik yang ada di daftar favorit
        function renderFavorites() {
            // Filter data utama untuk mendapatkan hanya item yang ID-nya ada di array 'favorites'
            const favoriteInstruments = alatMusikData.filter(item => favorites.includes(item.id));
            grid.innerHTML = ''; // Kosongkan grid

            if (favoriteInstruments.length === 0) {
                // Tampilkan pesan jika tidak ada favorit
                grid.innerHTML = '<p style="text-align: center; grid-column: 1 / -1;">Anda belum punya favorit. Jelajahi <a href="index.html">Beranda</a>!</p>';
                return;
            }
            // Buat kartu untuk setiap item favorit
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

        // Fungsi untuk menghapus dari favorit (di halaman favorit, tombol hanya berfungsi untuk menghapus)
        function toggleFavorite(id) {
            const index = favorites.indexOf(id);
            if (index > -1) favorites.splice(index, 1); // Hapus ID dari array
            localStorage.setItem('favorites', JSON.stringify(favorites)); // Simpan perubahan ke localStorage
            renderFavorites(); // Render ulang daftar favorit
        }

        // Fungsi untuk mengatur event listener di halaman Favorit
        function setupFavoritesEventListeners() {
            // Gunakan event delegation, sama seperti di Beranda
            grid.addEventListener('click', (e) => {
                const card = e.target.closest('.card');
                const favBtn = e.target.closest('.favorite-btn');
                if (favBtn) { // Jika tombol favorit diklik
                    e.stopPropagation(); // Mencegah event klik menyebar ke kartu (agar model tidak terbuka)
                    toggleFavorite(parseInt(favBtn.dataset.id));
                } else if (card) { // Jika kartu diklik
                    showModel(parseInt(card.dataset.id));
                }
            });

            // Event listener untuk menutup model
            closeButton.addEventListener('click', hideModel);
            model.addEventListener('click', e => { if (e.target === model) hideModel(); });
        }
    }
});