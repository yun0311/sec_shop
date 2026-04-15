/* ============================================
   mypage.js — Ground: Zero 마이페이지
   ============================================ */

/* ============================================
   다크모드
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

/* ============================================
   토스트
   ============================================ */
function showToast(msg, type = "") {
  const wrap = document.getElementById("toastWrap");
  const t = document.createElement("div");
  t.className = `toast ${type}`;
  t.innerHTML = msg;
  wrap.appendChild(t);
  setTimeout(() => t.remove(), 3000);
}

function formatPrice(p) {
  return "₩" + Number(p).toLocaleString("ko-KR");
}

/* ============================================
   로그인 확인 & 유저 정보
   ============================================ */
function checkLogin() {
  const saved = localStorage.getItem("currentUser");
  if (!saved) {
    showToast(
      '<i class="fa fa-exclamation-circle"></i> 로그인이 필요합니다',
      "error",
    );
    setTimeout(() => (location.href = "main.html"), 1500);
    return null;
  }
  return JSON.parse(saved);
}

function handleLogout(e) {
  if (e) e.preventDefault();
  if (confirm("로그아웃 하시겠습니까?")) {
    localStorage.removeItem("currentUser");
    location.href = "main.html";
  }
}

function renderUserInfo(user) {
  const initial = (user.name || "?")[0].toUpperCase();

  // hero
  document.getElementById("userAvatar").textContent = initial;
  document.getElementById("heroName").textContent = `${user.name}님`;

  // sidebar
  document.getElementById("sideAvatar").textContent = initial;
  document.getElementById("sideName").textContent = user.name || "-";
  document.getElementById("sideNick").textContent = user.nickname
    ? `@${user.nickname}`
    : `@${user.name}`;
}

/* ============================================
   localStorage에서 main.js 상태 공유
   cart, wishlist, recentViewed
   ============================================ */
function getCartData() {
  try {
    return JSON.parse(localStorage.getItem("mp_cart") || "[]");
  } catch (e) {
    return [];
  }
}

function getWishData() {
  try {
    return JSON.parse(localStorage.getItem("mp_wish") || "[]");
  } catch (e) {
    return [];
  }
}

function getRecentData() {
  try {
    return JSON.parse(localStorage.getItem("mp_recent") || "[]");
  } catch (e) {
    return [];
  }
}

function saveCart(cart) {
  localStorage.setItem("mp_cart", JSON.stringify(cart));
}

function saveWish(wish) {
  localStorage.setItem("mp_wish", JSON.stringify(wish));
}

function saveRecent(recent) {
  localStorage.setItem("mp_recent", JSON.stringify(recent));
}

/* ============================================
   상품 데이터 불러오기
   ============================================ */
let ALL_PRODUCTS = [];

async function loadAllProducts() {
  try {
    const res = await fetch("products.php");
    const data = await res.json();
    if (data.success) {
      ALL_PRODUCTS = data.products.map((p) => ({
        id: parseInt(p.id),
        name: p.name,
        emoji: p.emoji,
        price: parseInt(p.price),
        category: p.category,
        badge: p.badge,
      }));
    }
  } catch (e) {
    console.error("상품 로드 실패:", e);
  }
}

function getProductById(id) {
  return ALL_PRODUCTS.find((p) => p.id === parseInt(id));
}

/* ============================================
   장바구니 렌더링
   ============================================ */
function renderCart() {
  const cart = getCartData();
  const listEl = document.getElementById("cartList");
  const summEl = document.getElementById("cartSummary");
  const countEl = document.getElementById("cartCount");
  const statEl = document.getElementById("statCart");

  countEl.textContent = cart.length;
  statEl.textContent = cart.length;

  if (!cart.length) {
    listEl.innerHTML = `
      <div class="mp-empty">
        <i class="fa fa-shopping-cart"></i>
        <p>장바구니가 비어있어요</p>
        <a href="main.html" class="mp-btn-fill">상품 보러가기</a>
      </div>`;
    summEl.style.display = "none";
    return;
  }

  listEl.innerHTML = cart
    .map((item) => {
      const p = getProductById(item.id) || item;
      return `
      <div class="mp-cart-item">
        <div class="mp-cart-emoji">${p.emoji || "📦"}</div>
        <div class="mp-cart-info">
          <div class="mp-cart-name">${p.name}</div>
          <div class="mp-cart-price">${formatPrice(p.price)}</div>
          <div class="mp-cart-qty">수량: ${item.qty}개</div>
        </div>
        <button class="mp-cart-remove" onclick="removeFromCart(${item.id})">
          <i class="fa fa-times"></i>
        </button>
      </div>
    `;
    })
    .join("");

  const total = cart.reduce((s, c) => s + c.price * c.qty, 0);
  document.getElementById("cartTotal").textContent = formatPrice(total);
  summEl.style.display = "block";
}

function removeFromCart(id) {
  let cart = getCartData();
  cart = cart.filter((c) => c.id !== parseInt(id));
  saveCart(cart);
  renderCart();
  showToast('<i class="fa fa-check"></i> 장바구니에서 제거했습니다');
}

/* ============================================
   찜 목록 렌더링
   ============================================ */
function renderWish() {
  const wish = getWishData();
  const listEl = document.getElementById("wishList");
  const countEl = document.getElementById("wishCount");
  const statEl = document.getElementById("statWish");

  countEl.textContent = wish.length;
  statEl.textContent = wish.length;

  if (!wish.length) {
    listEl.innerHTML = `
      <div class="mp-empty" style="grid-column:1/-1">
        <i class="fa fa-heart"></i>
        <p>찜한 상품이 없어요</p>
        <a href="main.html" class="mp-btn-fill">상품 보러가기</a>
      </div>`;
    return;
  }

  listEl.innerHTML = wish
    .map((item) => {
      const p = getProductById(item.id) || item;
      return `
      <div class="mp-product-card" onclick="location.href='main.html'">
        <div class="mp-product-img">${p.emoji || "📦"}</div>
        <div class="mp-product-info">
          <div class="mp-product-name">${p.name}</div>
          <div class="mp-product-price">${formatPrice(p.price)}</div>
        </div>
        <button class="mp-product-remove" onclick="event.stopPropagation(); removeFromWish(${p.id})">
          <i class="fa fa-times"></i>
        </button>
      </div>
    `;
    })
    .join("");
}

function removeFromWish(id) {
  let wish = getWishData();
  wish = wish.filter((w) => w.id !== parseInt(id));
  saveWish(wish);
  renderWish();
  showToast('<i class="fa fa-check"></i> 찜 목록에서 제거했습니다');
}

/* ============================================
   최근 본 상품 렌더링
   ============================================ */
function renderRecent() {
  const recent = getRecentData();
  const listEl = document.getElementById("recentList");
  const countEl = document.getElementById("recentCount");
  const statEl = document.getElementById("statRecent");

  countEl.textContent = recent.length;
  statEl.textContent = recent.length;

  if (!recent.length) {
    listEl.innerHTML = `
      <div class="mp-empty" style="grid-column:1/-1">
        <i class="fa fa-clock"></i>
        <p>최근 본 상품이 없어요</p>
        <a href="main.html" class="mp-btn-fill">상품 보러가기</a>
      </div>`;
    return;
  }

  listEl.innerHTML = recent
    .map((item) => {
      const p = getProductById(item.id) || item;
      return `
      <div class="mp-product-card" onclick="location.href='main.html'">
        <div class="mp-product-img">${p.emoji || "📦"}</div>
        <div class="mp-product-info">
          <div class="mp-product-name">${p.name}</div>
          <div class="mp-product-price">${formatPrice(p.price)}</div>
        </div>
        <button class="mp-product-remove" onclick="event.stopPropagation(); removeFromRecent(${p.id})">
          <i class="fa fa-times"></i>
        </button>
      </div>
    `;
    })
    .join("");
}

function removeFromRecent(id) {
  let recent = getRecentData();
  recent = recent.filter((r) => r.id !== parseInt(id));
  saveRecent(recent);
  renderRecent();
}

function clearRecent() {
  if (!confirm("최근 본 상품을 모두 삭제할까요?")) return;
  saveRecent([]);
  renderRecent();
  showToast('<i class="fa fa-check"></i> 최근 본 상품을 삭제했습니다');
}

/* ============================================
   사이드 네비 스크롤
   ============================================ */
function scrollTo(id) {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });

  document
    .querySelectorAll(".side-nav-item")
    .forEach((a) => a.classList.remove("active"));
  event.currentTarget.classList.add("active");
}

/* ============================================
   초기화
   ============================================ */
document.addEventListener("DOMContentLoaded", async () => {
  initDarkMode();

  const user = checkLogin();
  if (!user) return;

  renderUserInfo(user);

  await loadAllProducts();

  // main.js의 state에서 localStorage로 동기화
  // main.js 쪽에서 저장한 데이터가 없으면 빈 배열
  renderCart();
  renderWish();
  renderRecent();
});
