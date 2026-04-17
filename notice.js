/* ============================================
   notice.js — Ground: Zero 공지사항
   DB 연동 버전
   ============================================ */

function toggleDarkMode() {
  const isDark = document.documentElement.getAttribute("data-theme") === "dark";
  document.documentElement.setAttribute(
    "data-theme",
    isDark ? "light" : "dark",
  );
  const label = document.getElementById("toggleLabel");
  if (label) label.textContent = isDark ? "다크" : "라이트";
  try {
    localStorage.setItem("lx_dark", isDark ? "0" : "1");
  } catch (e) {}
}
function initDarkMode() {
  let saved = "0";
  try {
    saved = localStorage.getItem("lx_dark") || "0";
  } catch (e) {}
  if (saved === "1") {
    document.documentElement.setAttribute("data-theme", "dark");
    const label = document.getElementById("toggleLabel");
    if (label) label.textContent = "라이트";
  }
}

function showToast(msg, type = "") {
  const wrap = document.getElementById("toastWrap");
  if (!wrap) return;
  const t = document.createElement("div");
  t.className = `toast ${type}`;
  t.innerHTML = msg;
  wrap.appendChild(t);
  setTimeout(() => t.remove(), 3000);
}

/* ── 상태 ── */
let ALL_NOTICES = [];
let filteredNotices = [];
let currentCat = "all";
let currentSearch = "";
let currentPage = 1;
const PAGE_SIZE = 8;
let currentIdx = -1;

const CAT_LABELS = {
  service: "서비스",
  event: "이벤트",
  system: "시스템",
  policy: "정책변경",
};
const CAT_COLORS = {
  service: "cat-service",
  event: "cat-event",
  system: "cat-system",
  policy: "cat-policy",
};

/* ── DB에서 공지 불러오기 ── */
async function loadNotices() {
  try {
    const res = await fetch("admin_notice.php");
    const data = await res.json();
    if (data.success) {
      ALL_NOTICES = data.notices.map((n) => ({
        id: parseInt(n.id),
        title: n.title,
        category: n.category,
        content: n.content,
        pinned: parseInt(n.is_pinned) === 1,
        views: parseInt(n.views) || 0,
        date: n.created_at ? n.created_at.split(" ")[0] : "",
      }));
    }
  } catch (e) {
    console.error("공지 로드 실패:", e);
    ALL_NOTICES = [
      {
        id: 1,
        title: "Ground: Zero 서비스 오픈 안내",
        category: "service",
        content: "안녕하세요. Ground: Zero가 정식 오픈했습니다!",
        pinned: true,
        views: 1204,
        date: "2025-06-01",
      },
      {
        id: 2,
        title: "여름 시즌 특가 이벤트",
        category: "event",
        content: "6월 한 달간 전 품목 20% 할인 행사를 진행합니다.",
        pinned: false,
        views: 892,
        date: "2025-06-05",
      },
      {
        id: 3,
        title: "시스템 점검 안내 (6/10)",
        category: "system",
        content: "6월 10일 새벽 2시~4시 시스템 점검이 예정되어 있습니다.",
        pinned: false,
        views: 445,
        date: "2025-06-08",
      },
      {
        id: 4,
        title: "개인정보처리방침 개정 안내",
        category: "policy",
        content: "개인정보처리방침이 일부 개정되었습니다.",
        pinned: false,
        views: 233,
        date: "2025-06-10",
      },
      {
        id: 5,
        title: "배송 정책 변경 안내",
        category: "policy",
        content: "7월 1일부터 5만원 이상 무료배송으로 정책이 변경됩니다.",
        pinned: false,
        views: 678,
        date: "2025-06-12",
      },
      {
        id: 6,
        title: "신규 뷰티 브랜드 입점",
        category: "service",
        content: "프리미엄 뷰티 브랜드 3곳이 새롭게 입점했습니다.",
        pinned: false,
        views: 891,
        date: "2025-06-14",
      },
    ];
  }
  applyFilter();
}

/* ── 필터 ── */
function applyFilter() {
  let list = [...ALL_NOTICES];
  if (currentCat !== "all")
    list = list.filter((n) => n.category === currentCat);
  if (currentSearch.trim()) {
    const q = currentSearch.toLowerCase();
    list = list.filter(
      (n) =>
        n.title.toLowerCase().includes(q) ||
        (n.content && n.content.toLowerCase().includes(q)),
    );
  }
  filteredNotices = list;
  currentPage = 1;
  renderAll();
}

function filterNotice(cat, btn) {
  currentCat = cat;
  document
    .querySelectorAll(".tab-btn")
    .forEach((b) => b.classList.remove("active"));
  if (btn) btn.classList.add("active");
  applyFilter();
}

function searchNotice(val) {
  currentSearch = val;
  applyFilter();
}

/* ── 렌더링 ── */
function renderAll() {
  renderPinned();
  renderList();
  renderPagination();
}

function renderPinned() {
  const pinned = ALL_NOTICES.filter((n) => n.pinned);
  const wrap = document.getElementById("noticePinned");
  const list = document.getElementById("pinnedList");
  if (!pinned.length) {
    wrap.style.display = "none";
    return;
  }
  wrap.style.display = "";
  list.innerHTML = pinned
    .map(
      (n) => `
    <div class="notice-item pinned-item" onclick="openNoticeModal(${n.id})">
      <span class="notice-pin-icon"><i class="fa fa-thumbtack"></i></span>
      <span class="notice-cat-badge ${CAT_COLORS[n.category] || ""}">${CAT_LABELS[n.category] || n.category}</span>
      <div class="notice-title-wrap">
        <span class="notice-title">${n.title}</span>
        ${isNew(n.date) ? '<span class="notice-new">NEW</span>' : ""}
      </div>
      <div class="notice-meta">
        <span class="notice-date">${n.date}</span>
        <span class="notice-views"><i class="fa fa-eye"></i>${n.views.toLocaleString()}</span>
      </div>
    </div>
  `,
    )
    .join("");
}

function renderList() {
  const listEl = document.getElementById("noticeList");
  const unpinned = filteredNotices.filter((n) => !n.pinned);
  const start = (currentPage - 1) * PAGE_SIZE;
  const page = unpinned.slice(start, start + PAGE_SIZE);

  if (!page.length && !filteredNotices.filter((n) => n.pinned).length) {
    listEl.innerHTML = `<div class="empty-result"><i class="fa fa-search"></i><p>검색 결과가 없습니다</p></div>`;
    return;
  }

  listEl.innerHTML = page
    .map(
      (n, i) => `
    <div class="notice-item" onclick="openNoticeModal(${n.id})">
      <span class="notice-num">${start + i + 1}</span>
      <span class="notice-cat-badge ${CAT_COLORS[n.category] || ""}">${CAT_LABELS[n.category] || n.category}</span>
      <div class="notice-title-wrap">
        <span class="notice-title">${n.title}</span>
        ${isNew(n.date) ? '<span class="notice-new">NEW</span>' : ""}
      </div>
      <div class="notice-meta">
        <span class="notice-date">${n.date}</span>
        <span class="notice-views"><i class="fa fa-eye"></i>${n.views.toLocaleString()}</span>
      </div>
    </div>
  `,
    )
    .join("");
}

function renderPagination() {
  const el = document.getElementById("pagination");
  const unpinned = filteredNotices.filter((n) => !n.pinned);
  const total = Math.ceil(unpinned.length / PAGE_SIZE);
  if (total <= 1) {
    el.innerHTML = "";
    return;
  }

  let html = `<button class="page-btn" onclick="goPage(${currentPage - 1})" ${currentPage === 1 ? "disabled" : ""}><i class="fa fa-chevron-left"></i></button>`;
  for (let i = 1; i <= total; i++) {
    html += `<button class="page-btn ${i === currentPage ? "active" : ""}" onclick="goPage(${i})">${i}</button>`;
  }
  html += `<button class="page-btn" onclick="goPage(${currentPage + 1})" ${currentPage === total ? "disabled" : ""}><i class="fa fa-chevron-right"></i></button>`;
  el.innerHTML = html;
}

function goPage(p) {
  const unpinned = filteredNotices.filter((n) => !n.pinned);
  const total = Math.ceil(unpinned.length / PAGE_SIZE);
  if (p < 1 || p > total) return;
  currentPage = p;
  renderList();
  renderPagination();
  document.getElementById("noticeList").scrollIntoView({ behavior: "smooth" });
}

function isNew(dateStr) {
  if (!dateStr) return false;
  return Date.now() - new Date(dateStr).getTime() < 7 * 24 * 60 * 60 * 1000;
}

/* ── 모달 ── */
function openNoticeModal(id) {
  const notice = ALL_NOTICES.find((n) => n.id === id);
  if (!notice) return;

  currentIdx = filteredNotices.findIndex((n) => n.id === id);
  notice.views++;

  const catEl = document.getElementById("modalCat");
  const titleEl = document.getElementById("modalTitle");
  const dateEl = document.getElementById("modalDate");
  const viewEl = document.getElementById("modalViews");
  const bodyEl = document.getElementById("modalBody");

  catEl.textContent = CAT_LABELS[notice.category] || notice.category;
  catEl.className = `modal-cat notice-cat-badge ${CAT_COLORS[notice.category] || ""}`;
  titleEl.textContent = notice.title;
  dateEl.textContent = notice.date;
  viewEl.textContent = `조회 ${notice.views.toLocaleString()}회`;

  bodyEl.innerHTML = notice.content
    ? notice.content.replace(/\n/g, "<br>")
    : '<p style="color:var(--gray-light)">내용이 없습니다.</p>';

  document.getElementById("btnPrev").disabled = currentIdx <= 0;
  document.getElementById("btnNext").disabled =
    currentIdx >= filteredNotices.length - 1;

  document.getElementById("noticeModal").classList.add("show");
  document.body.style.overflow = "hidden";
}

function closeNoticeModal() {
  document.getElementById("noticeModal").classList.remove("show");
  document.body.style.overflow = "";
}

function navigateNotice(dir) {
  const next = currentIdx + dir;
  if (next < 0 || next >= filteredNotices.length) return;
  openNoticeModal(filteredNotices[next].id);
}

/* ── 초기화 ── */
document.addEventListener("DOMContentLoaded", () => {
  initDarkMode();
  loadNotices();
  document
    .getElementById("noticeModal")
    .addEventListener("click", function (e) {
      if (e.target === this) closeNoticeModal();
    });
});
