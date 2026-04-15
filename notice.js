/* ============================================
   LUXMART — notice.js  공지사항 페이지
   ============================================ */

/* ============================================
   공지사항 데이터
   ============================================ */
const NOTICES = [
  {
    id: 1,
    pin: true,
    cat: "service",
    title: "[필독] 개인정보 처리방침 개정 안내 (2025년 5월)",
    date: "2025-05-01",
    views: 15243,
    isNew: false,
    content: `
      <p>안녕하세요, LUXMART입니다.</p>
      <p>개인정보 보호법 개정에 따라 당사의 개인정보 처리방침이 아래와 같이 변경됩니다. 주요 변경 사항을 꼭 확인해 주시기 바랍니다.</p>
      <h3>주요 변경 사항</h3>
      <ul>
        <li>개인정보 수집·이용 목적 구체화</li>
        <li>제3자 제공 동의 절차 강화</li>
        <li>개인정보 보유 기간 재정의</li>
        <li>정보주체의 권리 행사 방법 명확화</li>
      </ul>
      <div class="highlight">
        📅 시행일: 2025년 5월 15일 (수) 00:00부터<br/>
        기존 방침은 시행일 이전까지 적용됩니다.
      </div>
      <p>변경된 내용에 동의하지 않으시는 경우 회원 탈퇴를 통해 서비스 이용을 종료하실 수 있습니다. 궁금하신 사항은 고객센터(1588-0000)로 문의해 주세요.</p>
    `,
  },
  {
    id: 2,
    pin: true,
    cat: "system",
    title: "[긴급] 5월 12일(일) 새벽 서버 점검 안내",
    date: "2025-05-08",
    views: 9821,
    isNew: false,
    content: `
      <p>안녕하세요, LUXMART 운영팀입니다.</p>
      <p>서비스 안정화를 위한 긴급 점검이 아래 일정으로 진행될 예정입니다.</p>
      <div class="highlight">
        🛠 점검 일시: 2025년 5월 12일(일) 02:00 ~ 04:00 (2시간)<br/>
        🚫 점검 중 서비스: 전체 서비스 이용 불가
      </div>
      <h3>점검 작업 내용</h3>
      <ul>
        <li>결제 시스템 보안 패치 적용</li>
        <li>데이터베이스 인덱스 최적화</li>
        <li>CDN 서버 업그레이드</li>
      </ul>
      <p>점검 중 불편을 드려 대단히 죄송합니다. 점검 완료 후 더 빠르고 안정적인 서비스를 제공하겠습니다.</p>
    `,
  },
  {
    id: 3,
    pin: false,
    cat: "event",
    title: "🎉 LUXMART 2주년 기념 특별 감사제 — 전 품목 최대 50% 할인!",
    date: "2025-05-10",
    views: 32104,
    isNew: true,
    content: `
      <p>LUXMART를 사랑해 주시는 고객 여러분 덕분에 2주년을 맞이하게 되었습니다. 감사의 마음을 담아 역대 최대 규모의 감사제를 준비했습니다.</p>
      <div class="highlight">
        📅 행사 기간: 2025년 5월 10일 ~ 5월 25일 (16일간)<br/>
        🎁 혜택: 전 품목 최대 50% 할인 + 구매 시 포인트 3배 적립
      </div>
      <h3>카테고리별 할인율</h3>
      <ul>
        <li>패션 전 품목: 최대 50% 할인</li>
        <li>뷰티 브랜드관: 최대 40% 할인</li>
        <li>전자기기: 최대 30% 할인</li>
        <li>라이프·식품: 최대 35% 할인</li>
      </ul>
      <p>이번 감사제를 위해 특별히 준비한 한정 수량 상품도 놓치지 마세요! 재고 소진 시 행사가 조기 종료될 수 있습니다.</p>
    `,
  },
  {
    id: 4,
    pin: false,
    cat: "service",
    title: "신규 결제 수단 추가 안내 — 토스페이·네이버페이 이용 가능",
    date: "2025-05-07",
    views: 7652,
    isNew: true,
    content: `
      <p>고객 편의를 위해 새로운 간편결제 수단을 추가했습니다.</p>
      <h3>신규 지원 결제 수단</h3>
      <ul>
        <li><strong>토스페이:</strong> 토스 앱과 연동하여 빠른 결제</li>
        <li><strong>네이버페이:</strong> 네이버 포인트 적립·사용 가능</li>
      </ul>
      <div class="highlight">
        💳 기존 결제 수단(신용카드, 카카오페이, 계좌이체)은 그대로 유지됩니다.
      </div>
      <p>새로운 결제 수단 이용 중 문제가 발생하면 고객센터로 연락해 주세요.</p>
    `,
  },
  {
    id: 5,
    pin: false,
    cat: "policy",
    title: "배송비 정책 변경 안내 (2025년 6월 1일부터)",
    date: "2025-05-05",
    views: 11320,
    isNew: false,
    content: `
      <p>물류비 인상으로 인해 배송비 정책이 변경됩니다.</p>
      <h3>변경 전</h3>
      <ul><li>3만원 이상 구매 시 무료배송</li></ul>
      <h3>변경 후 (6월 1일부터)</h3>
      <ul><li>5만원 이상 구매 시 무료배송</li><li>미충족 시 배송비 3,000원</li></ul>
      <div class="highlight">
        📅 시행일: 2025년 6월 1일 00:00<br/>
        5월 31일 23:59 이전 주문 건은 기존 정책 적용
      </div>
      <p>불편을 드려 대단히 죄송합니다. 더 좋은 서비스로 보답하겠습니다.</p>
    `,
  },
  {
    id: 6,
    pin: false,
    cat: "event",
    title: "어버이날 기념 선물 기획전 — 감사한 마음을 전하세요",
    date: "2025-05-03",
    views: 8890,
    isNew: false,
    content: `
      <p>어버이날을 맞아 특별한 선물 기획전을 진행합니다.</p>
      <div class="highlight">
        📅 기간: 2025년 5월 3일 ~ 5월 9일<br/>
        🎁 혜택: 선물 포장 서비스 무료 제공 + 감사 카드 동봉
      </div>
      <h3>추천 선물 카테고리</h3>
      <ul>
        <li>건강기능식품 & 영양제</li>
        <li>프리미엄 화장품 & 스킨케어</li>
        <li>편안한 의류 & 홈웨어</li>
        <li>스마트 가전</li>
      </ul>
      <p>기간 내 5만원 이상 구매 시 사은품이 증정됩니다.</p>
    `,
  },
  {
    id: 7,
    pin: false,
    cat: "system",
    title: "iOS / 안드로이드 앱 업데이트 안내 (v3.2.0)",
    date: "2025-04-28",
    views: 5643,
    isNew: false,
    content: `
      <p>LUXMART 앱이 v3.2.0으로 업데이트되었습니다.</p>
      <h3>주요 변경 사항</h3>
      <ul>
        <li>다크모드 지원 추가</li>
        <li>장바구니 UI 개선</li>
        <li>검색 성능 향상 (검색 속도 40% 개선)</li>
        <li>결제 프로세스 단순화</li>
        <li>버그 수정 및 안정성 개선</li>
      </ul>
      <div class="highlight">
        앱 스토어/플레이스토어에서 최신 버전으로 업데이트해 주세요.
      </div>
    `,
  },
  {
    id: 8,
    pin: false,
    cat: "service",
    title: "회원 등급 혜택 개편 안내 — 더 많은 혜택을 드립니다",
    date: "2025-04-20",
    views: 14200,
    isNew: false,
    content: `
      <p>5월 1일부터 회원 등급 체계가 개편됩니다.</p>
      <h3>새로운 등급 체계</h3>
      <ul>
        <li><strong>SILVER:</strong> 연간 구매 30만원 이상 — 포인트 2% 적립</li>
        <li><strong>GOLD:</strong> 연간 구매 100만원 이상 — 포인트 3% + 무료 반품 5회</li>
        <li><strong>VIP:</strong> 연간 구매 300만원 이상 — 포인트 5% + 전담 CS + 무료배송 상시</li>
      </ul>
      <div class="highlight">
        기존 회원의 등급은 자동으로 재산정되며, 불이익 없이 전환됩니다.
      </div>
    `,
  },
  {
    id: 9,
    pin: false,
    cat: "policy",
    title: "취소·환불 정책 일부 변경 안내",
    date: "2025-04-15",
    views: 9102,
    isNew: false,
    content: `
      <p>소비자 보호 강화를 위해 취소·환불 정책이 일부 변경됩니다.</p>
      <h3>주요 변경 내용</h3>
      <ul>
        <li>단순 변심 환불 기간: 수령 후 7일 → 14일로 연장</li>
        <li>환불 처리 기간: 영업일 5일 → 3일로 단축</li>
        <li>반품 비용 무료 조건 완화 (GOLD 등급 이상)</li>
      </ul>
      <div class="highlight">
        📅 시행일: 2025년 5월 1일부터 적용
      </div>
    `,
  },
  {
    id: 10,
    pin: false,
    cat: "event",
    title: "봄 시즌 패션 기획전 — 2025 S/S 컬렉션 최대 40% 할인",
    date: "2025-04-10",
    views: 21300,
    isNew: false,
    content: `
      <p>따뜻한 봄을 맞아 2025 S/S 신상품 기획전을 진행합니다.</p>
      <div class="highlight">
        📅 기간: 2025년 4월 10일 ~ 4월 30일<br/>
        🎁 혜택: S/S 신상품 최대 40% 할인
      </div>
      <h3>행사 품목</h3>
      <ul>
        <li>여성 봄 코트 & 재킷</li>
        <li>남성 린넨 & 슬랙스</li>
        <li>봄 원피스 & 스커트</li>
        <li>스니커즈 & 샌들</li>
      </ul>
    `,
  },
  {
    id: 11,
    pin: false,
    cat: "service",
    title: "해외 직구 서비스 오픈 안내",
    date: "2025-04-01",
    views: 18750,
    isNew: false,
    content: `
      <p>이제 LUXMART에서 해외 브랜드 상품을 직접 구매하실 수 있습니다.</p>
      <h3>서비스 특징</h3>
      <ul>
        <li>미국, 유럽 주요 브랜드 직구 지원</li>
        <li>관세 포함 최종 금액 선 표시</li>
        <li>평균 배송 기간: 7~14일</li>
        <li>해외 직구 전담 CS팀 운영</li>
      </ul>
      <div class="highlight">
        오픈 기념 첫 구매 고객에게 배송비 무료 쿠폰을 드립니다!
      </div>
    `,
  },
  {
    id: 12,
    pin: false,
    cat: "system",
    title: "웹사이트 리뉴얼 오픈 안내 — 새로워진 LUXMART를 만나보세요",
    date: "2025-03-20",
    views: 35600,
    isNew: false,
    content: `
      <p>오랜 준비 끝에 LUXMART 웹사이트가 새롭게 리뉴얼되었습니다.</p>
      <h3>주요 개선 사항</h3>
      <ul>
        <li>전면 UI/UX 재설계로 더 편리한 쇼핑 환경</li>
        <li>다크모드 지원</li>
        <li>모바일 최적화 강화</li>
        <li>상품 검색 정확도 대폭 향상</li>
        <li>빠른 결제 프로세스 도입</li>
      </ul>
      <div class="highlight">
        리뉴얼 기념으로 2주간 전 회원에게 5% 추가 할인 쿠폰을 드립니다.
      </div>
      <p>이용 중 불편한 점이나 개선 사항은 고객센터로 말씀해 주세요.</p>
    `,
  },
];

/* ============================================
   상태
   ============================================ */
const state = {
  darkMode: false,
  currentCat: "all",
  currentSearch: "",
  currentPage: 1,
  perPage: 7,
  openId: null,
  filteredIds: [],
};

/* ============================================
   다크모드
   ============================================ */
function toggleDarkMode() {
  state.darkMode = !state.darkMode;
  document.documentElement.setAttribute(
    "data-theme",
    state.darkMode ? "dark" : "light",
  );
  const label = document.getElementById("toggleLabel");
  if (label) label.textContent = state.darkMode ? "라이트" : "다크";
  try {
    localStorage.setItem("lx_dark", state.darkMode ? "1" : "0");
  } catch (e) {}
}
function initDarkMode() {
  let saved = "0";
  try {
    saved = localStorage.getItem("lx_dark") || "0";
  } catch (e) {}
  if (saved === "1") {
    state.darkMode = true;
    document.documentElement.setAttribute("data-theme", "dark");
    const label = document.getElementById("toggleLabel");
    if (label) label.textContent = "라이트";
  }
}

/* ============================================
   유틸
   ============================================ */
function showToast(msg) {
  const wrap = document.getElementById("toastWrap");
  const t = document.createElement("div");
  t.className = "toast";
  t.innerHTML = msg;
  wrap.appendChild(t);
  setTimeout(() => t.remove(), 3000);
}

function getCatLabel(cat) {
  const map = {
    service: "서비스",
    event: "이벤트",
    system: "시스템",
    policy: "정책변경",
  };
  return map[cat] || cat;
}
function getCatClass(cat) {
  return `cat-${cat}`;
}

function formatDate(d) {
  return d.replace(/-/g, ".");
}

/* ============================================
   렌더링
   ============================================ */
function getFiltered() {
  let list = NOTICES.filter((n) => !n.pin);
  if (state.currentCat !== "all")
    list = list.filter((n) => n.cat === state.currentCat);
  if (state.currentSearch) {
    const q = state.currentSearch.toLowerCase();
    list = list.filter(
      (n) =>
        n.title.toLowerCase().includes(q) ||
        n.content.toLowerCase().includes(q),
    );
  }
  return list;
}

function getPinned() {
  let list = NOTICES.filter((n) => n.pin);
  if (state.currentCat !== "all")
    list = list.filter((n) => n.cat === state.currentCat);
  if (state.currentSearch) {
    const q = state.currentSearch.toLowerCase();
    list = list.filter((n) => n.title.toLowerCase().includes(q));
  }
  return list;
}

function renderPinned() {
  const list = getPinned();
  const wrap = document.getElementById("noticePinned");
  const inner = document.getElementById("pinnedList");
  if (!list.length) {
    wrap.style.display = "none";
    return;
  }
  wrap.style.display = "";
  inner.innerHTML = list
    .map(
      (n) => `
    <div class="notice-item pinned-item" onclick="openNotice(${n.id})">
      <span class="notice-pin-icon"><i class="fa fa-thumbtack"></i></span>
      <span class="notice-cat-badge ${getCatClass(n.cat)}">${getCatLabel(n.cat)}</span>
      <div class="notice-title-wrap">
        <span class="notice-title">${n.title}${n.isNew ? '<span class="notice-new">NEW</span>' : ""}</span>
      </div>
      <div class="notice-meta">
        <span class="notice-date">${formatDate(n.date)}</span>
        <span class="notice-views"><i class="fa fa-eye"></i>${n.views.toLocaleString()}</span>
      </div>
    </div>
  `,
    )
    .join("");
}

function renderList() {
  const filtered = getFiltered();
  state.filteredIds = filtered.map((n) => n.id);
  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / state.perPage));
  if (state.currentPage > totalPages) state.currentPage = 1;

  const start = (state.currentPage - 1) * state.perPage;
  const page = filtered.slice(start, start + state.perPage);

  const list = document.getElementById("noticeList");

  if (!page.length) {
    list.innerHTML = `<div class="empty-result"><i class="fa fa-search"></i><p>검색 결과가 없습니다</p></div>`;
    document.getElementById("pagination").innerHTML = "";
    return;
  }

  list.innerHTML = page
    .map(
      (n, i) => `
    <div class="notice-item" onclick="openNotice(${n.id})">
      <span class="notice-num">${total - start - i}</span>
      <span class="notice-cat-badge ${getCatClass(n.cat)}">${getCatLabel(n.cat)}</span>
      <div class="notice-title-wrap">
        <span class="notice-title">${n.title}${n.isNew ? '<span class="notice-new">NEW</span>' : ""}</span>
      </div>
      <div class="notice-meta">
        <span class="notice-date">${formatDate(n.date)}</span>
        <span class="notice-views"><i class="fa fa-eye"></i>${n.views.toLocaleString()}</span>
      </div>
    </div>
  `,
    )
    .join("");

  renderPagination(totalPages);
}

function renderPagination(total) {
  const pg = document.getElementById("pagination");
  if (total <= 1) {
    pg.innerHTML = "";
    return;
  }
  let html = "";
  html += `<button class="page-btn" onclick="changePage(${state.currentPage - 1})" ${state.currentPage === 1 ? "disabled" : ""}><i class="fa fa-chevron-left"></i></button>`;
  for (let i = 1; i <= total; i++) {
    html += `<button class="page-btn ${i === state.currentPage ? "active" : ""}" onclick="changePage(${i})">${i}</button>`;
  }
  html += `<button class="page-btn" onclick="changePage(${state.currentPage + 1})" ${state.currentPage === total ? "disabled" : ""}><i class="fa fa-chevron-right"></i></button>`;
  pg.innerHTML = html;
}

function render() {
  renderPinned();
  renderList();
}

/* ============================================
   필터 / 검색
   ============================================ */
function filterNotice(cat, btn) {
  state.currentCat = cat;
  state.currentPage = 1;
  document
    .querySelectorAll(".tab-btn")
    .forEach((b) => b.classList.remove("active"));
  btn.classList.add("active");
  render();
}

function searchNotice(val) {
  state.currentSearch = val.trim();
  state.currentPage = 1;
  render();
}

function changePage(p) {
  const filtered = getFiltered();
  const total = Math.ceil(filtered.length / state.perPage);
  if (p < 1 || p > total) return;
  state.currentPage = p;
  renderList();
  document
    .querySelector(".notice-list")
    .scrollIntoView({ behavior: "smooth", block: "start" });
}

/* ============================================
   상세 모달
   ============================================ */
function openNotice(id) {
  const n = NOTICES.find((n) => n.id === id);
  if (!n) return;
  state.openId = id;
  n.views++;

  document.getElementById("modalCat").textContent = getCatLabel(n.cat);
  document.getElementById("modalCat").className =
    `modal-cat notice-cat-badge ${getCatClass(n.cat)}`;
  document.getElementById("modalTitle").textContent = n.title;
  document.getElementById("modalDate").textContent = formatDate(n.date);
  document.getElementById("modalViews").innerHTML =
    `<i class="fa fa-eye"></i> ${n.views.toLocaleString()}회`;
  document.getElementById("modalBody").innerHTML = n.content;

  // 이전/다음 버튼
  const allIds = [...NOTICES.map((n) => n.id)];
  const curIdx = allIds.indexOf(id);
  document.getElementById("btnPrev").disabled = curIdx >= allIds.length - 1;
  document.getElementById("btnNext").disabled = curIdx <= 0;

  document.getElementById("noticeModal").classList.add("show");
  document.body.style.overflow = "hidden";
  render(); // 조회수 갱신
}

function closeNoticeModal() {
  document.getElementById("noticeModal").classList.remove("show");
  document.body.style.overflow = "";
}

function navigateNotice(dir) {
  const allIds = [...NOTICES.map((n) => n.id)];
  const curIdx = allIds.indexOf(state.openId);
  const nextIdx = curIdx - dir;
  if (nextIdx < 0 || nextIdx >= allIds.length) return;
  openNotice(allIds[nextIdx]);
}

/* ============================================
   초기화
   ============================================ */
document.addEventListener("DOMContentLoaded", () => {
  initDarkMode();
  render();

  document.getElementById("noticeModal").addEventListener("click", (e) => {
    if (e.target === document.getElementById("noticeModal")) closeNoticeModal();
  });
});
