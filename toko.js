// =================================================================
// KODE LENGKAP FINAL - toko.js (VERSI 100% UTUH)
// Mengelola DUA TAB: Survei dan Keuangan
// =================================================================

// --- KONFIGURASI ---
// !!! GANTI DENGAN URL ANDA MASING-MASING !!!
const SURVEI_WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbx4yYPwE5vMtcs9nkZkWrozKZKEDDXT0rjcrH0OZyJiMGHGW2lWFFdLNzaGMxoRQqQzrw/exec';
const KEUANGAN_WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbwuHBauK4ur3cJnxl4X7X8AS_ysKLyZ29h-X_K5dzBghqBffUr96CBL4TdzUO23rP3Q/exec';
// --- ELEMEN DOM ---
const loadingIndicator = document.getElementById('loadingIndicator');
const noResults = document.getElementById('noResults');
const pageTitle = document.getElementById('page-title');
const surveiContainer = document.getElementById('survei-list-container');
const searchInputSurvei = document.getElementById('searchInput-survei');
const refreshBtnSurvei = document.getElementById('refresh-btn-survei');
const formKeuangan = document.getElementById('form-keuangan');
const totalPemasukanEl = document.getElementById('total-pemasukan');
const totalPengeluaranEl = document.getElementById('total-pengeluaran');
const saldoAkhirEl = document.getElementById('saldo-akhir');
const riwayatTransaksiBody = document.getElementById('riwayat-transaksi-body');
const kategoriDropdown = document.getElementById('kategori');

// --- STATE ---
let allSurveiData = [];
let isKeuanganLoaded = false;

// --- EVENT LISTENERS UTAMA ---
document.addEventListener('DOMContentLoaded', () => {
    setupNavListeners();
    fetchSurveiData();
    refreshBtnSurvei.addEventListener('click', fetchSurveiData);
    formKeuangan.addEventListener('submit', handleKeuanganSubmit);
    surveiContainer.addEventListener('click', handleSurveiAction);
    riwayatTransaksiBody.addEventListener('click', handleKeuanganAction);
    searchInputSurvei.addEventListener('input', filterSurvei);
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
    document.querySelectorAll('.view-container').forEach(view => view.classList.add('d-none'));
    const activeView = document.getElementById(viewId);
    if(activeView) activeView.classList.remove('d-none');
    pageTitle.textContent = viewTitle;
    if(viewId === 'view-survei' && allSurveiData.length === 0) fetchSurveiData();
    if(viewId === 'view-keuangan' && !isKeuanganLoaded) fetchKeuanganData();
}

// --- FUNGSI-FUNGSI UMUM ---
async function fetchData(url, errorHandler) {
    loadingIndicator.style.display = 'block';
    noResults.style.display = 'none';
    try {
        if (!url || url.includes('URL_APPS_SCRIPT')) throw new Error("URL Apps Script belum diatur.");
        const response = await fetch(url + "?cache_bust=" + new Date().getTime());
        if (!response.ok) throw new Error(`Gagal terhubung ke server (Status: ${response.status})`);
        const data = await response.json();
        if (data && data.status === 'error') throw new Error(data.message);
        return data;
    } catch (error) {
        errorHandler(error);
        return null;
    } finally {
        loadingIndicator.style.display = 'none';
    }
}

// <<< INI BAGIAN YANG DIPERBAIKI SECARA TOTAL >>>
async function postData(url, payload) {
    try {
        const response = await fetch(url, {
            method: 'POST',
            body: JSON.stringify(payload),
            // Mengirim data sebagai teks biasa untuk menghindari masalah CORS preflight
            headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        });
        const result = await response.json();
        return result;
    } catch (error) {
        console.error('POST Error:', error);
        // Error 'Failed to fetch' akan ditangkap di sini jika koneksi benar-benar gagal
        return { status: 'error', message: 'Koneksi ke server gagal. ' + error.message };
    }
}

// --- LOGIKA SURVEI ---
async function fetchSurveiData() {
    surveiContainer.innerHTML = '';
    const data = await fetchData(SURVEI_WEB_APP_URL, (error) => {
        noResults.textContent = 'Gagal memuat data survei: ' + error.message;
        noResults.style.display = 'block';
    });
    if (data) { allSurveiData = data; renderSurvei(allSurveiData); }
}

async function handleSurveiAction(e) {
    const button = e.target.closest('button[data-action]');
    if (!button) return;
    const action = button.dataset.action;
    const rowNum = parseInt(button.dataset.rowNum);
    let payload = { action: (action === 'delete' ? 'deleteSurvey' : 'togglePin'), rowNum };

    if (action === 'delete') {
        const result = await Swal.fire({ title: 'Anda Yakin?', text: "Survei ini akan dihapus permanen!", icon: 'warning', showCancelButton: true, confirmButtonColor: '#d33', confirmButtonText: 'Ya, hapus!', cancelButtonText: 'Batal' });
        if (!result.isConfirmed) return;
    }
    Swal.showLoading();
    const postResult = await postData(SURVEI_WEB_APP_URL, payload);
    if (postResult.status === 'success') {
        Swal.fire('Berhasil!', 'Aksi berhasil diproses.', 'success');
        fetchSurveiData();
    } else {
        Swal.fire('Gagal!', 'Terjadi kesalahan di server: ' + (postResult.message || 'Error tidak diketahui.'), 'error');
    }
}

function renderSurvei(surveiList) {
    surveiContainer.innerHTML = ''; noResults.style.display = 'none';
    if (!surveiList || surveiList.length === 0) { noResults.style.display = 'block'; noResults.textContent = searchInputSurvei.value ? "Pencarian tidak ditemukan." : "Belum ada jawaban survei."; return; }
    surveiList.forEach(item => {
        const requestsHTML = (item.requests || '').split('\n').map(req => req.trim() ? `<li>${req.trim()}</li>` : '').join('');
        const timestamp = new Date(item.timestamp).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Asia/Jakarta' });
        const card = document.createElement('div'); card.className = 'col-md-6 col-lg-4 d-flex';
        const isPinnedClass = item.pinned ? 'pinned' : '';
        const pinButtonClass = item.pinned ? 'btn-primary' : 'btn-outline-primary';
        const pinIconClass = item.pinned ? 'bi-pin-angle-fill' : 'bi-pin-angle';
        card.innerHTML = `<div class="card h-100 survei-card ${isPinnedClass} w-100"><div class="card-body d-flex flex-column"><div class="flex-grow-1"><h6 class="card-title fw-bold text-success d-flex align-items-center gap-2"><i class="bi bi-person-circle"></i> ${item.nama}</h6><p class="card-subtitle mb-2 text-muted small"><i class="bi bi-clock"></i> ${timestamp}</p><hr class="my-2"><p class="mb-1 fw-semibold small">Game yang diminta:</p><ul class="list-unstyled mb-0 request-list">${requestsHTML}</ul></div></div><div class="card-footer d-flex justify-content-end gap-2"><button class="btn btn-sm ${pinButtonClass}" data-action="pin" data-row-num="${item.rowNum}" title="Pin Jawaban"><i class="bi ${pinIconClass}"></i></button><button class="btn btn-sm btn-outline-danger" data-action="delete" data-row-num="${item.rowNum}" title="Hapus Jawaban"><i class="bi bi-trash-fill"></i></button></div></div>`;
        surveiContainer.appendChild(card);
    });
}

function filterSurvei() {
    const searchTerm = searchInputSurvei.value.toLowerCase();
    if(allSurveiData && allSurveiData.length > 0) {
        const filteredData = allSurveiData.filter(item => (item.nama && item.nama.toLowerCase().includes(searchTerm)) || (item.requests && item.requests.toLowerCase().includes(searchTerm)));
        renderSurvei(filteredData);
    }
}

// --- LOGIKA KEUANGAN ---
function formatRupiah(angka) { return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(angka); }

async function fetchKeuanganData() {
    riwayatTransaksiBody.innerHTML = '';
    const data = await fetchData(KEUANGAN_WEB_APP_URL, (error) => { riwayatTransaksiBody.innerHTML = `<tr><td colspan="4" class="text-center text-danger">Gagal memuat data: ${error.message}</td></tr>`; });
    if (data) {
        isKeuanganLoaded = true;
        totalPemasukanEl.textContent = formatRupiah(data.totalPemasukan);
        totalPengeluaranEl.textContent = formatRupiah(data.totalPengeluaran);
        saldoAkhirEl.textContent = formatRupiah(data.saldoAkhir);
        kategoriDropdown.innerHTML = '<option value="">Pilih Kategori...</option>';
        (data.kategoriList || []).forEach(kat => { kategoriDropdown.innerHTML += `<option value="${kat}">${kat}</option>`; });
        riwayatTransaksiBody.innerHTML = '';
        if (data.riwayat && data.riwayat.length > 0) {
            data.riwayat.forEach(trx => {
                const row = document.createElement('tr');
                const isPemasukan = trx.tipe === 'Pemasukan';
                row.innerHTML = `<td><div class="fw-bold">${trx.deskripsi}</div><div class="small text-muted">${trx.tanggal} - ${trx.kategori}</div></td><td><span class="badge rounded-pill ${isPemasukan ? 'text-bg-success' : 'text-bg-danger'}">${trx.tipe}</span></td><td class="text-end fw-bold">${formatRupiah(trx.jumlah)}</td><td class="text-center"><button class="btn btn-sm btn-outline-danger" data-action="delete" data-timestamp="${trx.timestamp}" title="Hapus Transaksi"><i class="bi bi-trash-fill"></i></button></td>`;
                riwayatTransaksiBody.appendChild(row);
            });
        } else { riwayatTransaksiBody.innerHTML = `<tr><td colspan="4" class="text-center">Belum ada transaksi.</td></tr>`; }
    }
}

async function handleKeuanganSubmit(e) {
    e.preventDefault();
    const submitButton = e.target.querySelector('button[type="submit"]');
    submitButton.disabled = true; submitButton.innerHTML = `<span class="spinner-border spinner-border-sm"></span>`;
    const payload = { action: 'addTransaction', data: { tanggal: document.getElementById('tanggal').value, deskripsi: document.getElementById('deskripsi').value, jumlah: parseFloat(document.getElementById('jumlah').value), tipe: document.getElementById('tipe').value, kategori: document.getElementById('kategori').value, } };
    
    const result = await postData(KEUANGAN_WEB_APP_URL, payload);
    if(result.status === 'success'){
        Swal.fire('Berhasil!', 'Transaksi berhasil disimpan.', 'success');
        formKeuangan.reset();
        fetchKeuanganData();
    } else {
        Swal.fire('Gagal!', 'Terjadi kesalahan: ' + (result.message || 'Error tidak diketahui.'), 'error');
    }
    submitButton.disabled = false; submitButton.innerHTML = 'Simpan Transaksi';
}

async function handleKeuanganAction(e) {
    const button = e.target.closest('button[data-action="delete"]');
    if (!button) return;
    const timestamp = button.dataset.timestamp;
    const result = await Swal.fire({ title: 'Anda Yakin?', text: "Transaksi ini akan dihapus permanen!", icon: 'warning', showCancelButton: true, confirmButtonColor: '#d33', confirmButtonText: 'Ya, hapus!' });
    if (result.isConfirmed) {
        Swal.showLoading();
        const payload = { action: 'deleteTransaction', timestamp: timestamp };
        const postResult = await postData(KEUANGAN_WEB_APP_URL, payload);
        if (postResult.status === 'success') {
            Swal.fire('Berhasil!', 'Transaksi telah dihapus.', 'success');
            fetchKeuanganData();
        } else {
            Swal.fire('Gagal!', 'Gagal menghapus di server: ' + (postResult.message || 'Error tidak diketahui.'), 'error');
        }
    }
}