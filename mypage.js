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
  if (user.email) loadInquiryList(user.email);
  if (user.id) loadOrderList(user.id);
});

/* ============================================
   주문내역
   ============================================ */
const PAY_LABELS = {
  card: "신용/체크카드",
  transfer: "계좌이체",
  vbank: "무통장입금",
};
const ORDER_STATUS = {
  paid: { label: "결제완료", color: "#1565c0", bg: "rgba(21,101,192,0.1)" },
  shipping: { label: "배송중", color: "#e65100", bg: "rgba(230,81,0,0.1)" },
  done: { label: "배송완료", color: "#2e7d32", bg: "rgba(46,125,50,0.1)" },
  cancel: { label: "취소됨", color: "#e53935", bg: "rgba(229,57,53,0.1)" },
};

async function loadOrderList(userId) {
  const listEl = document.getElementById("orderList");
  const countEl = document.getElementById("orderCount");
  if (!listEl) return;

  try {
    const res = await fetch(`order.php?user_id=${userId}`);
    const data = await res.json();
    if (!data.success) throw new Error();

    if (countEl) countEl.textContent = data.orders.length;

    if (!data.orders.length) {
      listEl.innerHTML = `
        <div class="mp-empty">
          <i class="fa fa-box"></i>
          <p>주문내역이 없어요</p>
          <a href="main.html" class="mp-btn-fill">쇼핑하러 가기</a>
        </div>`;
      return;
    }

    listEl.innerHTML = data.orders
      .map((order) => {
        const status = ORDER_STATUS[order.status] || ORDER_STATUS.paid;
        const items = Array.isArray(order.items) ? order.items : [];
        const date = order.created_at ? order.created_at.split(" ")[0] : "-";

        const itemHTML = items
          .map(
            (item) => `
        <div style="display:flex;align-items:center;gap:10px;padding:8px 0;border-bottom:1px solid var(--border)">
          <span style="font-size:28px;width:44px;height:44px;background:var(--bg-soft);border-radius:6px;display:flex;align-items:center;justify-content:center;flex-shrink:0">${item.emoji || "📦"}</span>
          <div style="flex:1">
            <div style="font-size:13px;font-weight:600;color:var(--black)">${item.name}</div>
            <div style="font-size:12px;color:var(--gray-light)">${item.qty}개 · ₩${(item.price * item.qty).toLocaleString()}</div>
          </div>
        </div>
      `,
          )
          .join("");

        return `
        <div style="border:1px solid var(--border);border-radius:10px;overflow:hidden;margin-bottom:14px;background:#fff">
          <!-- 주문 헤더 -->
          <div style="display:flex;justify-content:space-between;align-items:center;padding:14px 18px;background:var(--bg-soft);border-bottom:1px solid var(--border)">
            <div style="display:flex;align-items:center;gap:10px">
              <span style="font-size:12px;font-weight:700;color:var(--gray-light)">주문번호 #${order.id}</span>
              <span style="font-size:12px;color:var(--gray-light)">${date}</span>
            </div>
            <span style="padding:3px 10px;border-radius:50px;font-size:11px;font-weight:700;background:${status.bg};color:${status.color}">
              ${status.label}
            </span>
          </div>
          <!-- 주문 상품 -->
          <div style="padding:4px 18px">
            ${itemHTML}
          </div>
          <!-- 주문 요약 -->
          <div style="padding:14px 18px;border-top:1px solid var(--border);display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px">
            <div style="font-size:13px;color:var(--gray)">
              <span>${PAY_LABELS[order.pay_method] || order.pay_method}</span>
              <span style="margin:0 6px">·</span>
              <span>배송비 ${order.delivery_fee > 0 ? "₩" + Number(order.delivery_fee).toLocaleString() : "무료"}</span>
            </div>
            <div style="font-size:16px;font-weight:700;color:var(--black)">
              총 ₩${Number(order.final_price).toLocaleString()}
            </div>
          </div>
          <!-- 배송지 -->
          <div style="padding:10px 18px 14px;font-size:12px;color:var(--gray-light)">
            <i class="fa fa-map-marker-alt" style="color:var(--accent);margin-right:5px"></i>
            ${order.address_main} ${order.address_detail || ""} · ${order.buyer_name} · ${order.buyer_phone}
          </div>
        </div>
      `;
      })
      .join("");
  } catch (e) {
    listEl.innerHTML =
      '<div class="mp-empty"><i class="fa fa-exclamation-triangle"></i><p>주문내역을 불러올 수 없습니다</p></div>';
  }
}
async function loadInquiryList(email) {
  const listEl = document.getElementById("inquiryList");
  const countEl = document.getElementById("inquiryCount");
  if (!listEl) return;

  try {
    const res = await fetch(`qna.php?email=${encodeURIComponent(email)}`);
    const data = await res.json();

    if (!data.success) throw new Error();

    if (countEl) countEl.textContent = data.inquiries.length;

    if (!data.inquiries.length) {
      listEl.innerHTML = `
        <div class="mp-empty" style="grid-column:1/-1">
          <i class="fa fa-question-circle"></i>
          <p>접수된 문의가 없습니다</p>
          <a href="customer.html" class="mp-btn-fill">문의하기</a>
        </div>`;
      return;
    }

    const INQ_TYPE = {
      order: "주문·결제",
      delivery: "배송",
      return: "반품·교환",
      product: "상품",
      account: "계정",
      other: "기타",
    };

    listEl.innerHTML = data.inquiries
      .map(
        (i) => `
      <div style="border:1px solid var(--border,#e8e8e8);border-radius:8px;padding:18px 20px;margin-bottom:12px;background:#fff;transition:all 0.18s;">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:10px;">
          <div style="display:flex;align-items:center;gap:8px;">
            <span style="padding:2px 9px;border-radius:50px;font-size:11px;font-weight:700;background:rgba(21,101,192,0.1);color:#1565c0">
              ${INQ_TYPE[i.type] || i.type}
            </span>
            <span style="font-size:15px;font-weight:600;color:#111">${i.subject}</span>
          </div>
          <span style="padding:3px 10px;border-radius:50px;font-size:11px;font-weight:700;
            ${
              i.status === "answered"
                ? "background:rgba(46,125,50,0.1);color:#2e7d32"
                : "background:rgba(229,57,53,0.1);color:#e53935"
            }">
            ${i.status === "answered" ? "✅ 답변완료" : "⏳ 처리중"}
          </span>
        </div>
        <p style="font-size:13px;color:#666;line-height:1.7;margin-bottom:8px;white-space:pre-line">${i.content}</p>
        <span style="font-size:12px;color:#999">${i.created_at ? i.created_at.split(" ")[0] : ""}</span>
      </div>
    `,
      )
      .join("");
  } catch (e) {
    if (listEl)
      listEl.innerHTML =
        '<div class="mp-empty"><i class="fa fa-exclamation-triangle"></i><p>문의내역을 불러올 수 없습니다</p></div>';
  }
}
