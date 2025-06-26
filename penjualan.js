// =================================================================
// PENJUALAN.JS - 100% LENGKAP & FINAL (DENGAN SEMUA PERBAIKAN)
// =================================================================

// --- KONFIGURASI ---
const WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbyQ-ysMvNu9ogUcqcyv3hM9qtJ-O6DOQULiHma9IbVU3r6TQ1NHaTLaHTx_PGGGgbgS/exec'; 

// --- ELEMEN DOM ---
const loadingIndicator = document.getElementById('loadingIndicator');
const noResults = document.getElementById('noResults');
const pageTitle = document.getElementById('page-title');
const akunTableBody = document.getElementById('akun-table-body');
const addAccountForm = document.getElementById('add-account-form');
const searchInputAkun = document.getElementById('searchInput-akun');
const refreshBtnAkun = document.getElementById('refresh-btn-akun');
const gameTableBody = document.getElementById('game-table-body');
const selectAllCheckboxGame = document.getElementById('select-all-checkbox-game');
const copySelectedBtnGame = document.getElementById('copy-selected-btn-game');
const selectedCountGameSpan = document.getElementById('selected-count-game');
const searchInputGame = document.getElementById('searchInput-game');
const refreshBtnGame = document.getElementById('refresh-btn-game');
const filmTableBody = document.getElementById('film-table-body');
const selectAllCheckboxFilm = document.getElementById('select-all-checkbox-film');
const copySelectedBtnFilm = document.getElementById('copy-selected-btn-film');
const selectedCountFilmSpan = document.getElementById('selected-count-film');
const searchInputFilm = document.getElementById('searchInput-film');
const refreshBtnFilm = document.getElementById('refresh-btn-film');

// --- STATE ---
let allAkunData = [], allGameData = [], allFilmData = [];
let selectedGames = new Set(), selectedFilms = new Set();
let currentView = 'akun';

// --- EVENT LISTENERS ---
document.addEventListener('DOMContentLoaded', () => {
    if (WEB_APP_URL.includes('URL_APPS_SCRIPT')) {
        Swal.fire('Konfigurasi Belum Selesai', 'Harap masukkan URL Web App Penjualan Anda di file penjualan.js.', 'error');
        return;
    }
    setupNavListeners();
    addAccountForm.addEventListener('submit', handleAddAccount);
    searchInputAkun.addEventListener('input', () => renderAkunTable(allAkunData.filter(acc => acc.email.toLowerCase().includes(searchInputAkun.value.toLowerCase()))));
    akunTableBody.addEventListener('click', handleAkunTableClick);
    refreshBtnAkun.addEventListener('click', () => fetchData('akun'));
    copySelectedBtnGame.addEventListener('click', handleBulkCopyGame);
    gameTableBody.addEventListener('change', handleGameCheckboxChange);
    selectAllCheckboxGame.addEventListener('change', handleSelectAllGames);
    searchInputGame.addEventListener('input', () => renderGameTable(allGameData.filter(game => game.game.toLowerCase().includes(searchInputGame.value.toLowerCase()))));
    refreshBtnGame.addEventListener('click', () => fetchData('game'));
    copySelectedBtnFilm.addEventListener('click', handleBulkCopyFilm);
    filmTableBody.addEventListener('change', handleFilmCheckboxChange);
    selectAllCheckboxFilm.addEventListener('change', handleSelectAllFilms);
    searchInputFilm.addEventListener('input', () => renderFilmTable(allFilmData.filter(film => film.film.toLowerCase().includes(searchInputFilm.value.toLowerCase()))));
    refreshBtnFilm.addEventListener('click', () => fetchData('film'));
    fetchData('akun');
});

function setupNavListeners() {
    const menuLinks = document.querySelectorAll('.sidebar-menu .menu-link');
    menuLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            menuLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');
            const viewId = link.dataset.view;
            const viewTitle = link.dataset.title;
            showView(viewId, viewTitle);
        });
    });
}

function showView(viewId, viewTitle) {
    currentView = viewId.replace('view-','');
    document.querySelectorAll('.view-container').forEach(view => view.classList.add('d-none'));
    const activeView = document.getElementById(viewId);
    if(activeView) activeView.classList.remove('d-none');
    pageTitle.textContent = viewTitle;
    const dataIsEmpty = (currentView === 'akun' && allAkunData.length === 0) || (currentView === 'game' && allGameData.length === 0) || (currentView === 'film' && allFilmData.length === 0);
    if (dataIsEmpty) { fetchData(currentView); }
}


async function fetchData(view) {
    loadingIndicator.style.display = 'flex';
    noResults.style.display = 'none';
    const tableBody = document.getElementById(`${view}-table-body`);
    if(tableBody) tableBody.innerHTML = '';
    try {
        const response = await fetch(`${WEB_APP_URL}?view=${view}&cache_bust=${new Date().getTime()}`);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        if (data.status === 'error') throw new Error(data.message);
        if (view === 'akun') { allAkunData = data; renderAkunTable(data); }
        else if (view === 'game') { allGameData = data; renderGameTable(data); }
        else if (view === 'film') { allFilmData = data; renderFilmTable(data); }
    } catch (error) { Swal.fire('Gagal Mengambil Data!', error.message, 'error'); } 
    finally { loadingIndicator.style.display = 'none'; }
}

async function postData(action, payload) {
    try {
        const response = await fetch(WEB_APP_URL, { method: 'POST', body: JSON.stringify({ view: currentView, action, payload }), headers: { 'Content-Type': 'text/plain;charset=utf-8' } });
        return await response.json();
    } catch (error) { return { status: 'error', message: 'Koneksi ke server gagal.' }; }
}


function renderAkunTable(akunList) {
    akunTableBody.innerHTML = '';
    if (akunList.length === 0) { noResults.style.display = 'block'; noResults.textContent = "Data tidak ditemukan."; return; }
    noResults.style.display = 'none';
    akunList.forEach(acc => {
        const row = document.createElement('tr');
        row.innerHTML = `<td data-label="Status"><span class="badge rounded-pill ${acc.status === 'TERSEDIA' ? 'text-bg-success' : 'text-bg-danger'}">${acc.status}</span></td><td data-label="Email">${acc.email}</td><td data-label="Waktu Disalin">${acc.timestamp ? new Date(acc.timestamp).toLocaleString('id-ID') : '-'}</td><td data-label="Aksi"><div class="btn-group btn-group-sm w-100"><button class="btn btn-outline-primary" data-action="copy" data-email="${acc.email}" data-password="${acc.password}" ${acc.status !== 'TERSEDIA' ? 'disabled' : ''}><i class="bi bi-clipboard"></i> Salin</button><button class="btn btn-outline-secondary" data-action="undo" data-email="${acc.email}" ${acc.status === 'TERSEDIA' ? 'disabled' : ''}><i class="bi bi-arrow-counterclockwise"></i> Undo</button></div></td>`;
        akunTableBody.appendChild(row);
    });
}

async function handleAkunTableClick(e) {
    const button = e.target.closest('button[data-action]');
    if (!button) return;
    const { action, email, password } = button.dataset;
    if (action === 'copy') {
        await navigator.clipboard.writeText(`Terimakasih sudah membeli di toko kami.\n\nEmail: ${email}\nPassword: ${password}\n\n*Akun akan hilang setelah 7 Hari Jadi tolong jangan menyimpan apapun di akun.`);
        const result = await postData('updateStatus', { email });
        if (result.status === 'success') { Swal.fire({ title: 'Tersalin!', icon: 'success', timer: 1500, showConfirmButton: false }); fetchData('akun'); }
        else { Swal.fire('Gagal!', 'Gagal memperbarui status di server.', 'error'); }
    } else if (action === 'undo') {
        const { isConfirmed } = await Swal.fire({ title: 'Anda Yakin?', text: `Status untuk ${email} akan dikembalikan.`, icon: 'warning', showCancelButton: true, confirmButtonText: 'Ya, Undo!' });
        if (isConfirmed) {
            const result = await postData('resetStatus', { email });
            if (result.status === 'success') { fetchData('akun'); }
            else { Swal.fire('Gagal!', 'Gagal mereset status di server.', 'error'); }
        }
    }
}

async function handleAddAccount(e) {
    e.preventDefault();
    const email = document.getElementById('new-email').value.trim();
    const password = document.getElementById('new-password').value.trim();
    if (!email || !password) return;
    const result = await postData('addAccount', { email, password });
    if (result.status === 'success') { e.target.reset(); fetchData('akun'); }
    else { Swal.fire('Gagal!', 'Tidak dapat menambahkan akun.', 'error'); }
}

function renderGameTable(gameList) {
    gameTableBody.innerHTML = ''; noResults.style.display = 'none';
    if (gameList.length === 0) { noResults.style.display = 'block'; noResults.textContent = "Data tidak ditemukan."; return; }
    gameList.forEach(game => {
        const row = document.createElement('tr');
        row.innerHTML = `<td data-label="Pilih"><input class="form-check-input game-checkbox" type="checkbox" value="${game.id}"></td><td data-label="Game" class="fw-medium">${game.game}</td><td data-label="Link"><a href="${game.link}" target="_blank" class="text-decoration-none">${game.link.substring(0, 40)}...</a></td><td data-label="Jumlah Salin" class="text-center fw-bold">${game.jumlahSalin}</td>`;
        gameTableBody.appendChild(row);
    });
}

function updateGameActionBar() {
    const count = selectedGames.size;
    selectedCountGameSpan.textContent = count;
    // PERBAIKAN: Menggunakan class 'd-none' untuk menampilkan/menyembunyikan tombol di header
    copySelectedBtnGame.classList.toggle('d-none', count === 0);
}

function handleGameCheckboxChange(e) {
    if (e.target.classList.contains('game-checkbox')) {
        const gameId = parseInt(e.target.value);
        if (e.target.checked) selectedGames.add(gameId); else selectedGames.delete(gameId);
        selectAllCheckboxGame.checked = (allGameData.length > 0 && selectedGames.size === allGameData.length);
        updateGameActionBar();
    }
}

function handleSelectAllGames(e) {
    selectedGames.clear();
    const checkboxes = gameTableBody.querySelectorAll('.game-checkbox');
    checkboxes.forEach(cb => { cb.checked = e.target.checked; if(e.target.checked) selectedGames.add(parseInt(cb.value)) });
    updateGameActionBar();
}

async function handleBulkCopyGame() {
    if (selectedGames.size === 0) return;
    const gamesToCopy = allGameData.filter(game => selectedGames.has(game.id));
    await navigator.clipboard.writeText(`Terimakasih sudah membeli di toko kami.\n\n` + gamesToCopy.map(g => `Game : ${g.game}\nLink : ${g.link}`).join('\n//////////\n') + `\n\n*Berikut Game dan Link nya, Bisa liat Tutorial Dibawah jika masih belum menegerti.\n✅Cara Extrak Dan Install : https://drive.google.com/file/d/1mjcUYW79ZX2ko7wpFID1NpZnH-gzuXzT/view?usp=drive_link`);
    const result = await postData('incrementCounts', { ids: Array.from(selectedGames) });
    if (result.status === 'success') {
        Swal.fire({ title: 'Berhasil Disalin!', icon: 'success', timer: 2000, showConfirmButton: false });
        selectedGames.clear(); selectAllCheckboxGame.checked = false; updateGameActionBar(); fetchData('game');
    } else { Swal.fire('Gagal!', 'Gagal memperbarui data di server.', 'error'); }
}

// --- FUNGSI-FUNGSI LOGIKA FILM ---
function renderFilmTable(filmList) {
    filmTableBody.innerHTML = ''; noResults.style.display = 'none';
    if (filmList.length === 0) { noResults.style.display = 'block'; noResults.textContent = "Data tidak ditemukan."; return; }
    filmList.forEach(film => {
        const row = document.createElement('tr');
        row.innerHTML = `<td data-label="Pilih"><input class="form-check-input film-checkbox" type="checkbox" value="${film.id}"></td><td data-label="Film" class="fw-medium">${film.film}</td><td data-label="Link"><a href="${film.link}" target="_blank" class="text-decoration-none">${film.link.substring(0, 40)}...</a></td><td data-label="Jumlah Salin" class="text-center fw-bold">${film.jumlahSalin}</td>`;
        filmTableBody.appendChild(row);
    });
}

function updateFilmActionBar() {
    const count = selectedFilms.size;
    selectedCountFilmSpan.textContent = count;
    // PERBAIKAN: Menggunakan class 'd-none' untuk menampilkan/menyembunyikan tombol di header
    copySelectedBtnFilm.classList.toggle('d-none', count === 0);
}


function handleFilmCheckboxChange(e) {
    if (e.target.classList.contains('film-checkbox')) {
        const filmId = parseInt(e.target.value);
        if (e.target.checked) selectedFilms.add(filmId); else selectedFilms.delete(filmId);
        selectAllCheckboxFilm.checked = (allFilmData.length > 0 && selectedFilms.size === allFilmData.length);
        updateFilmActionBar();
    }
}

function handleSelectAllFilms(e) {
    selectedFilms.clear();
    const checkboxes = filmTableBody.querySelectorAll('.film-checkbox');
    checkboxes.forEach(cb => { cb.checked = e.target.checked; if(e.target.checked) selectedFilms.add(parseInt(cb.value)) });
    updateFilmActionBar();
}

async function handleBulkCopyFilm() {
    if (selectedFilms.size === 0) return;
    const filmsToCopy = allFilmData.filter(film => selectedFilms.has(film.id));
    await navigator.clipboard.writeText(`Terimakasih sudah membeli di toko kami.\n\n` + filmsToCopy.map(f => `Film : ${f.film}\nLink : ${f.link}`).join('\n//////////\n') + `\n\n*Berikut Film dan Link nya, Jika ada kendala bisa hubungi admin!`);
    const result = await postData('incrementCounts', { ids: Array.from(selectedFilms) });
    if (result.status === 'success') {
        Swal.fire({ title: 'Berhasil Disalin!', icon: 'success', timer: 2000, showConfirmButton: false });
        selectedFilms.clear(); selectAllCheckboxFilm.checked = false; updateFilmActionBar(); fetchData('film');
    } else { Swal.fire('Gagal!', 'Gagal memperbarui data di server.', 'error'); }
}