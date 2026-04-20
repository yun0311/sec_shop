/* ============================================
   LUXMART — main.js
   보안 관제 실습용 쇼핑몰 자바스크립트
   ============================================ */

/* ============================================
   상품 데이터
   ============================================ */
let PRODUCTS = [];

async function loadProducts() {
  const [prodRes, reviewRes] = await Promise.all([
    fetch("products.php"),
    fetch("review.php"),
  ]);
  const prodData = await prodRes.json();
  const reviewData = await reviewRes.json();
  const reviewMap = reviewData.success ? reviewData.summary : {};

  if (prodData.success) {
    PRODUCTS = prodData.products.map((p) => {
      const rv = reviewMap[p.id] || {};
      return {
        id: p.id,
        name: p.name,
        category: p.category,
        emoji: p.emoji,
        price: parseInt(p.price),
        original: parseInt(p.original),
        discount: parseInt(p.discount),
        rating: rv.avg !== undefined ? rv.avg : parseFloat(p.rating),
        reviews: rv.count !== undefined ? rv.count : 0,
        badge: p.badge,
        desc: p.description,
      };
    });
    renderProducts();
  }
}

/* ============================================
   앱 상태
   ============================================ */
const state = {
  cart: [],
  wishlist: [],
  currentUser: null,
  currentCategory: "all",
  currentSearch: "",
  currentSort: "default",
  currentView: "grid",
  currentSlide: 0,
  slideTimer: null,
  productModalData: null,
  productModalQty: 1,
  darkMode: false,
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
   유틸리티
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
  return "₩" + p.toLocaleString("ko-KR");
}

function renderStars(rating) {
  const full = Math.floor(rating);
  const half = rating % 1 >= 0.5;
  let s = "";
  for (let i = 0; i < full; i++) s += "★";
  if (half) s += "½";
  return s;
}

function closeAllModals() {
  document
    .querySelectorAll(".modal-overlay")
    .forEach((m) => m.classList.remove("show"));
  document.body.style.overflow = "";

  // product_id 제거 (user/pw는 유지)
  const cp = new URLSearchParams(window.location.search);
  cp.delete("product_id");
  const q = cp.toString();
  history.pushState(null, "", q ? `?${q}` : window.location.pathname);
}

function openModal(id) {
  closeAllModals();
  document.getElementById(id).classList.add("show");
  document.body.style.overflow = "hidden";
}

function closeModal(id) {
  document.getElementById(id).classList.remove("show");
  document.body.style.overflow = "";
}

function switchModal(from, to) {
  closeModal(from);
  openModal(to);
}

/* ============================================
   관리자 설정
   ============================================ */
const ADMIN_CONFIG = {
  email: "admin@admin.com",
  pw: "admin123",
};

/* ============================================
   로그인 상태 유지 및 UI 업데이트
   ============================================ */
function checkLoginStatus() {
  const savedUser = localStorage.getItem("currentUser");
  if (savedUser) {
    const user = JSON.parse(savedUser);
    state.currentUser = user;
    updateUIForLogin(user);
  }
}

function updateUIForLogin(user) {
  const loginBtn = document.getElementById("loginBtn");
  const registerBtn = document.getElementById("registerBtn");
  const logoutBtn = document.getElementById("logoutBtn");
  const mypageBtn = document.getElementById("mypageBtn");

  if (loginBtn) loginBtn.style.display = "none";
  if (registerBtn) registerBtn.style.display = "none";
  if (logoutBtn) logoutBtn.style.display = "";
  if (mypageBtn) {
    mypageBtn.style.display = "";
    mypageBtn.textContent = `${user.name}님`;
  }

  if (user.email === ADMIN_CONFIG.email) {
    createAdminLink();
  }
}

/* ============================================
   로그인 / 로그아웃 / 회원가입 핸들러
   ============================================ */
async function handleLogin() {
  const id = document.getElementById("loginId").value.trim();
  const pw = document.getElementById("loginPw").value.trim();

  if (!id || !pw) {
    showToast(
      '<i class="fa fa-exclamation-circle"></i> 아이디와 비밀번호를 입력해주세요',
      "error",
    );
    return;
  }

  // GET 방식 - URL에 이메일/비밀번호 노출 (실습용)
  const loginUrl = `login.php?email=${encodeURIComponent(id)}&password=${encodeURIComponent(pw)}`;
  const res = await fetch(loginUrl, { method: "GET" });
  const data = await res.json();

  if (data.success) {
    state.currentUser = data.user;
    localStorage.setItem("currentUser", JSON.stringify(data.user));
    updateUIForLogin(data.user);
    closeModal("loginModal");

    // 로그인 성공 후 URL에 user/pw 노출
    history.pushState(
      null,
      "",
      `?user=${encodeURIComponent(id)}&pw=${encodeURIComponent(pw)}`,
    );

    showToast(
      `<i class="fa fa-check-circle"></i> ${data.user.name}님, 환영합니다!`,
      "success",
    );
    logSecurityEvent("LOGIN_ATTEMPT", {
      userId: id,
      timestamp: new Date().toISOString(),
    });
  } else {
    showToast(
      `<i class="fa fa-exclamation-circle"></i> ${data.message}`,
      "error",
    );
  }
}

function handleLogout() {
  if (confirm("로그아웃 하시겠습니까?")) {
    state.currentUser = null;
    localStorage.removeItem("currentUser");

    // URL에서 user/pw/product_id 제거
    history.pushState(null, "", window.location.pathname);

    document.getElementById("loginBtn").style.display = "";
    document.getElementById("registerBtn").style.display = "";
    document.getElementById("logoutBtn").style.display = "none";
    document.getElementById("mypageBtn").style.display = "none";

    const adminBtn = document.getElementById("adminMoveBtn");
    if (adminBtn) adminBtn.remove();

    showToast('<i class="fa fa-sign-out-alt"></i> 로그아웃 되었습니다');
    logSecurityEvent("LOGOUT", { timestamp: new Date().toISOString() });
    location.reload();
  }
}

async function handleRegister() {
  const name = document.getElementById("regName").value.trim();
  const email = document.getElementById("regEmail").value.trim();
  const pw = document.getElementById("regPw").value;
  const pwc = document.getElementById("regPwConfirm").value;
  const agreeItems = document.querySelectorAll(".agree-item");

  if (!name || !email || !pw) {
    showToast(
      '<i class="fa fa-exclamation-circle"></i> 필수 항목을 모두 입력해주세요',
      "error",
    );
    return;
  }
  if (pw !== pwc) {
    showToast(
      '<i class="fa fa-exclamation-circle"></i> 비밀번호가 일치하지 않습니다',
      "error",
    );
    return;
  }
  if (!agreeItems[0].checked || !agreeItems[1].checked) {
    showToast(
      '<i class="fa fa-exclamation-circle"></i> 필수 약관에 동의해주세요',
      "error",
    );
    return;
  }

  const res = await fetch("register.php", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, password: pw }),
  });
  const data = await res.json();

  if (data.success) {
    closeModal("registerModal");
    showToast('<i class="fa fa-gift"></i> 회원가입 완료!', "success");
    logSecurityEvent("REGISTER", {
      name,
      email,
      timestamp: new Date().toISOString(),
    });
    switchModal("registerModal", "loginModal");
  } else {
    showToast(
      `<i class="fa fa-exclamation-circle"></i> ${data.message}`,
      "error",
    );
  }
}

/* ============================================
   관리자 전용 기능
   ============================================ */
function createAdminLink() {
  const headerLinks = document.querySelector(".header-top-links");
  const customerLink = headerLinks.querySelector('a[href="customer.html"]');

  if (document.getElementById("adminMoveBtn")) return;

  const adminBtn = document.createElement("a");
  adminBtn.id = "adminMoveBtn";
  adminBtn.href = "admin.html";
  adminBtn.innerHTML = '<i class="fa fa-user-shield"></i> 관리자';
  adminBtn.style.color = "var(--accent)";
  adminBtn.style.fontWeight = "bold";
  adminBtn.style.marginRight = "10px";

  if (customerLink) headerLinks.insertBefore(adminBtn, customerLink);
  else headerLinks.appendChild(adminBtn);
}

/* ============================================
   기타 유틸리티
   ============================================ */
function checkEmail() {
  const email = document.getElementById("regEmail").value.trim();
  if (!email) {
    showToast("이메일을 먼저 입력해주세요", "error");
    return;
  }
  showToast(
    '<i class="fa fa-check-circle"></i> 사용 가능한 이메일입니다',
    "success",
  );
}

function sendResetEmail() {
  const email = document.getElementById("findEmail").value.trim();
  if (!email) {
    showToast("이메일을 입력해주세요", "error");
    return;
  }
  showToast(
    `<i class="fa fa-envelope"></i> ${email}로 임시 비밀번호를 발송했습니다`,
    "success",
  );
  closeModal("findPwModal");
}

function socialLogin(provider) {
  showToast(`<i class="fa fa-spinner fa-spin"></i> ${provider} 로그인 중...`);
  setTimeout(() => {
    const user = {
      id: `${provider}_user`,
      name: `${provider}회원`,
      email: `user@${provider}.com`,
    };
    state.currentUser = user;
    localStorage.setItem("currentUser", JSON.stringify(user));
    updateUIForLogin(user);
    closeModal("loginModal");
    showToast(
      `<i class="fa fa-check-circle"></i> ${provider}로 로그인 되었습니다`,
      "success",
    );
  }, 1000);
}

function toggleAllAgree(cb) {
  document
    .querySelectorAll(".agree-item")
    .forEach((el) => (el.checked = cb.checked));
}

function checkPwStrength(pw) {
  const bar = document.getElementById("pwBar");
  const msg = document.getElementById("pwMsg");
  if (!bar || !msg) return;

  let score = 0;
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;

  const colors = ["#d32f2f", "#ff9800", "#fbc02d", "#2e7d32"];
  const labels = ["매우 약함", "약함", "보통", "강함"];
  bar.style.width = (score / 4) * 100 + "%";
  bar.style.background = colors[score - 1] || "#eee";
  msg.textContent = pw
    ? `비밀번호 강도: ${labels[score - 1] || "입력 중"}`
    : "";
}

function searchAddress() {
  new daum.Postcode({
    oncomplete: function (data) {
      // 도로명 주소 우선, 없으면 지번 주소
      const addr = data.roadAddress || data.jibunAddress;
      const postcode = data.zonecode;

      document.getElementById("regAddr").value = addr;
      document.getElementById("regPostcode").value = postcode;

      // 상세주소 입력칸으로 포커스 이동
      document.getElementById("regAddrDetail").focus();
      showToast('<i class="fa fa-check"></i> 주소가 선택되었습니다');
    },
    // 팝업창 스타일 설정
    width: "100%",
    height: "100%",
    animation: true,
  }).open();
}

/* ============================================
   상품 렌더링
   ============================================ */
function getFilteredProducts() {
  let list = [...PRODUCTS];
  if (state.currentCategory !== "all") {
    list = list.filter((p) => p.category === state.currentCategory);
  }
  if (state.currentSearch) {
    const q = state.currentSearch.toLowerCase();
    list = list.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.category.includes(q) ||
        p.desc.toLowerCase().includes(q),
    );
  }
  switch (state.currentSort) {
    case "price-asc":
      list.sort((a, b) => a.price - b.price);
      break;
    case "price-desc":
      list.sort((a, b) => b.price - a.price);
      break;
    case "rating":
      list.sort((a, b) => b.rating - a.rating);
      break;
    case "new":
      list.sort((a, b) => b.id - a.id);
      break;
  }
  return list;
}

function renderProducts() {
  const grid = document.getElementById("productGrid");
  const noRes = document.getElementById("noResult");
  const countEl = document.getElementById("productCount");
  const list = getFilteredProducts();

  if (!list.length) {
    grid.innerHTML = "";
    noRes.style.display = "block";
    countEl.textContent = "";
    return;
  }
  noRes.style.display = "none";
  countEl.textContent = `총 ${list.length}개 상품`;

  grid.innerHTML = list
    .map(
      (p, i) => `
    <div class="product-card" style="animation-delay:${i * 0.04}s" onclick="openProductModal(${p.id})">
      <div class="product-img">
        ${p.badge ? `<div class="product-badges"><span class="badge-tag badge-${p.badge}">${p.badge === "new" ? "NEW" : p.badge === "hot" ? "HOT" : "SALE"}</span></div>` : ""}
        <button class="wish-btn ${state.wishlist.includes(p.id) ? "active" : ""}" onclick="toggleWish(event,${p.id})">
          <i class="fa${state.wishlist.includes(p.id) ? "s" : "r"} fa-heart"></i>
        </button>
        ${p.emoji}
      </div>
      <div class="product-info">
        <div class="product-cat">${getCatLabel(p.category)}</div>
        <div class="product-name">${p.name}</div>
        <div class="product-rating">
          <span class="stars">${renderStars(p.rating)}</span>
          <span class="rating-num">${p.rating} (${p.reviews.toLocaleString()})</span>
        </div>
        <div class="product-price-wrap">
          <span class="product-price">${formatPrice(p.price)}</span>
          ${
            p.discount > 0
              ? `<span class="product-original">${formatPrice(p.original)}</span>
               <span class="product-discount">-${p.discount}%</span>`
              : ""
          }
        </div>
      </div>
      <div class="product-card-footer">
        <button class="btn-cart" onclick="addToCart(event,${p.id})">
          <i class="fa fa-cart-plus"></i> 장바구니
        </button>
        <button class="btn-wish-add" onclick="toggleWish(event,${p.id})">
          <i class="fa fa-heart"></i>
        </button>
      </div>
    </div>
  `,
    )
    .join("");
}

function getCatLabel(cat) {
  const map = {
    fashion: "패션",
    beauty: "뷰티",
    electronics: "전자기기",
    life: "라이프",
    food: "식품",
    sale: "특가 SALE",
    sport: "스포츠",
  };
  return map[cat] || cat;
}

/* ============================================
   카테고리 / 검색 / 정렬
   ============================================ */
async function filterCategory(cat) {
  state.currentCategory = cat;
  state.currentSearch = "";
  document.getElementById("searchInput").value = "";

  const titles = {
    all: "인기 상품",
    fashion: "패션",
    beauty: "뷰티",
    electronics: "전자기기",
    life: "라이프",
    food: "식품",
    sport: "스포츠",
    sale: "🔥 SALE 특가",
  };
  document.getElementById("sectionTitle").textContent = titles[cat] || cat;

  const url = cat === "all" ? "products.php" : `products.php?category=${cat}`;
  const res = await fetch(url);
  const data = await res.json();

  if (data.success) {
    PRODUCTS = data.products.map((p) => ({
      id: p.id,
      name: p.name,
      category: p.category,
      emoji: p.emoji,
      price: parseInt(p.price),
      original: parseInt(p.original),
      discount: parseInt(p.discount),
      rating: parseFloat(p.rating),
      reviews: parseInt(p.reviews),
      badge: p.badge,
      desc: p.description,
    }));
    renderProducts();
  }

  document.getElementById("mainContent").scrollIntoView({ behavior: "smooth" });
}

async function doSearch() {
  const q = document.getElementById("searchInput").value.trim();
  if (!q) {
    filterCategory("all");
    return;
  }

  state.currentSearch = q;
  state.currentCategory = "all";
  document.getElementById("sectionTitle").textContent = `"${q}" 검색 결과`;

  const res = await fetch(`products.php?search=${encodeURIComponent(q)}`);
  const data = await res.json();

  if (data.success) {
    PRODUCTS = data.products.map((p) => ({
      id: p.id,
      name: p.name,
      category: p.category,
      emoji: p.emoji,
      price: parseInt(p.price),
      original: parseInt(p.original),
      discount: parseInt(p.discount),
      rating: parseFloat(p.rating),
      reviews: parseInt(p.reviews),
      badge: p.badge,
      desc: p.description,
    }));
    renderProducts();
  }

  hideSuggest();
  document.getElementById("mainContent").scrollIntoView({ behavior: "smooth" });
}

function showSearchSuggest(val) {
  const box = document.getElementById("searchSuggest");
  if (!val.trim()) {
    hideSuggest();
    return;
  }
  const keywords = [
    "패션",
    "뷰티",
    "스킨케어",
    "청바지",
    "코트",
    "이어폰",
    "스마트워치",
    "커피",
    "견과류",
    "요가매트",
    "디퓨저",
    "운동화",
  ];
  const matched = keywords.filter((k) => k.includes(val));
  const prods = PRODUCTS.filter((p) =>
    p.name.toLowerCase().includes(val.toLowerCase()),
  ).slice(0, 4);

  if (!matched.length && !prods.length) {
    hideSuggest();
    return;
  }

  let html = "";
  if (matched.length)
    html += matched
      .map(
        (k) =>
          `<div class="suggest-item" onclick="selectSuggest('${k}')"><i class="fa fa-search"></i> ${k}</div>`,
      )
      .join("");
  if (prods.length)
    html += prods
      .map(
        (p) =>
          `<div class="suggest-item" onclick="selectSuggest('${p.name}')">${p.emoji} ${p.name} — ${formatPrice(p.price)}</div>`,
      )
      .join("");

  box.innerHTML = html;
  box.classList.add("show");
}

function selectSuggest(val) {
  document.getElementById("searchInput").value = val;
  hideSuggest();
  doSearch();
}

function hideSuggest() {
  document.getElementById("searchSuggest").classList.remove("show");
}

async function sortProducts(val) {
  state.currentSort = val;
  const url = `products.php?category=${state.currentCategory}&sort=${val}`;
  const res = await fetch(url);
  const data = await res.json();

  if (data.success) {
    PRODUCTS = data.products.map((p) => ({
      id: p.id,
      name: p.name,
      category: p.category,
      emoji: p.emoji,
      price: parseInt(p.price),
      original: parseInt(p.original),
      discount: parseInt(p.discount),
      rating: parseFloat(p.rating),
      reviews: parseInt(p.reviews),
      badge: p.badge,
      desc: p.description,
    }));
    renderProducts();
  }
}

function setView(type) {
  state.currentView = type;
  document
    .getElementById("productGrid")
    .classList.toggle("list-view", type === "list");
  document
    .getElementById("gridViewBtn")
    .classList.toggle("active", type === "grid");
  document
    .getElementById("listViewBtn")
    .classList.toggle("active", type === "list");
}

async function goHome() {
  state.currentCategory = "all";
  state.currentSearch = "";
  document.getElementById("searchInput").value = "";
  document.getElementById("sectionTitle").textContent = "인기 상품";
  document.getElementById("heroSection").scrollIntoView({ behavior: "smooth" });
  await loadProducts();
}

/* ============================================
   장바구니
   ============================================ */
function addToCart(e, id) {
  if (e) e.stopPropagation();
  const p = PRODUCTS.find((p) => p.id === id);
  if (!p) return;
  const existing = state.cart.find((c) => c.id === id);
  if (existing) existing.qty++;
  else state.cart.push({ ...p, qty: 1 });
  updateCartUI();
  showToast(
    `<i class="fa fa-check-circle"></i> <b>${p.name}</b>이(가) 장바구니에 담겼습니다`,
    "success",
  );
  logSecurityEvent("ADD_TO_CART", {
    productId: id,
    productName: p.name,
    price: p.price,
  });
}

function updateCartUI() {
  const total = state.cart.reduce((s, c) => s + c.qty, 0);
  const totalEl = document.getElementById("cartCount");
  const sideEl = document.getElementById("cartCountSide");
  totalEl.textContent = total;
  sideEl.textContent = total;

  const itemsEl = document.getElementById("cartItems");
  const footerEl = document.getElementById("cartFooter");

  if (!state.cart.length) {
    itemsEl.innerHTML =
      '<p class="cart-empty"><i class="fa fa-shopping-bag"></i><br/>장바구니가 비어 있습니다</p>';
    footerEl.style.display = "none";
    return;
  }

  itemsEl.innerHTML = state.cart
    .map(
      (c) => `
    <div class="cart-item">
      <div class="cart-item-img">${c.emoji}</div>
      <div class="cart-item-info">
        <div class="cart-item-name">${c.name}</div>
        <div class="cart-item-price">${formatPrice(c.price)}</div>
        <div class="cart-item-qty">수량: ${c.qty}개</div>
      </div>
      <div style="display:flex;flex-direction:column;gap:6px;align-items:flex-end">
        <button class="cart-item-remove" onclick="removeFromCart(${c.id})"><i class="fa fa-times"></i></button>
        <div style="display:flex;gap:6px;align-items:center">
          <button style="width:24px;height:24px;border:1px solid var(--border);border-radius:50%;font-size:14px;color:var(--text-main)" onclick="changeCartQty(${c.id},-1)">−</button>
          <span style="font-size:13px;font-weight:600;color:var(--text-main)">${c.qty}</span>
          <button style="width:24px;height:24px;border:1px solid var(--border);border-radius:50%;font-size:14px;color:var(--text-main)" onclick="changeCartQty(${c.id},1)">+</button>
        </div>
      </div>
    </div>
  `,
    )
    .join("");

  const sum = state.cart.reduce((s, c) => s + c.price * c.qty, 0);
  document.getElementById("cartTotal").textContent = formatPrice(sum);
  footerEl.style.display = "block";
}

function removeFromCart(id) {
  state.cart = state.cart.filter((c) => c.id !== id);
  updateCartUI();
}

function changeCartQty(id, delta) {
  const item = state.cart.find((c) => c.id === id);
  if (!item) return;
  item.qty = Math.max(1, item.qty + delta);
  updateCartUI();
}

function toggleCart() {
  const panel = document.getElementById("cartPanel");
  const overlay = document.getElementById("cartOverlay");
  const isOpen = panel.classList.contains("open");
  panel.classList.toggle("open", !isOpen);
  overlay.classList.toggle("show", !isOpen);
}

/* main.js 내의 checkout 함수를 아래 내용으로 교체하세요 */

function checkout() {
  if (state.cart.length === 0) {
    showToast("장바구니가 비어 있습니다.", "error");
    return;
  }
  localStorage.setItem("lx_cart_data", JSON.stringify(state.cart));
  showToast(
    `<i class="fa fa-credit-card"></i> 결제 페이지로 이동합니다`,
    "success",
  );
  setTimeout(() => {
    location.href = "buy.html";
  }, 1000);
}

/* ============================================
   찜하기
   ============================================ */
function toggleWish(e, id) {
  if (e) e.stopPropagation();
  const idx = state.wishlist.indexOf(id);
  if (idx >= 0) {
    state.wishlist.splice(idx, 1);
    showToast('<i class="far fa-heart"></i> 찜 목록에서 제거되었습니다');
  } else {
    state.wishlist.push(id);
    showToast(
      '<i class="fas fa-heart" style="color:#d32f2f"></i> 찜 목록에 추가되었습니다',
      "success",
    );
  }
  const wc = document.getElementById("wishCount");
  wc.style.display = state.wishlist.length ? "" : "none";
  wc.textContent = state.wishlist.length;
  renderProducts();
}

/* ============================================
   상품 상세 모달
   ============================================ */
function openProductModal(id) {
  const p = PRODUCTS.find((p) => p.id === id);
  if (!p) return;
  state.productModalData = p;
  state.productModalQty = 1;

  const imgEl = document.getElementById("pmImg");
  imgEl.textContent = p.emoji;
  imgEl.style.fontSize = "100px";
  document.getElementById("pmCat").textContent = getCatLabel(p.category);
  document.getElementById("pmName").textContent = p.name;
  document.getElementById("pmRating").innerHTML =
    `<span class="stars">${renderStars(p.rating)}</span> <a href="#" onclick="openReviewModal(${p.id}, event)" style="color:var(--gray-light);font-size:13px;text-decoration:underline;text-underline-offset:2px">${p.rating} (${p.reviews.toLocaleString()}개 리뷰)</a>`;
  document.getElementById("pmPrice").textContent = formatPrice(p.price);
  document.getElementById("pmDesc").textContent = p.desc;
  document.getElementById("pmQty").textContent = 1;

  // URL에 product_id 추가 (GET 형식)
  const pParams = new URLSearchParams(window.location.search);
  pParams.set("product_id", id);
  history.pushState(null, "", `?${pParams.toString()}`);

  openModal("productModal");
  logSecurityEvent("PRODUCT_VIEW", { productId: id, productName: p.name });
}

function changeQty(delta) {
  state.productModalQty = Math.max(1, state.productModalQty + delta);
  document.getElementById("pmQty").textContent = state.productModalQty;
}

function addToCartFromModal() {
  if (!state.productModalData) return;
  const p = state.productModalData;
  const existing = state.cart.find((c) => c.id === p.id);
  if (existing) existing.qty += state.productModalQty;
  else state.cart.push({ ...p, qty: state.productModalQty });
  updateCartUI();
  closeModal("productModal");
  showToast(
    `<i class="fa fa-check-circle"></i> ${state.productModalQty}개가 장바구니에 담겼습니다`,
    "success",
  );
}

function buyNow() {
  if (!state.productModalData) return;
  const p = state.productModalData;
  const qty = state.productModalQty || 1;
  const existing = state.cart.find((c) => c.id === p.id);
  if (existing) existing.qty += qty;
  else state.cart.push({ ...p, qty });
  updateCartUI();
  localStorage.setItem("lx_cart_data", JSON.stringify(state.cart));
  closeModal("productModal");
  showToast('<i class="fa fa-bolt"></i> 결제 페이지로 이동합니다', "success");
  setTimeout(() => {
    location.href = "buy.html";
  }, 800);
}

/* ============================================
   리뷰 모달
   ============================================ */
async function openReviewModal(productId, e) {
  if (e) e.preventDefault();
  const modal = document.getElementById("reviewModal");
  if (!modal) return;
  const p = PRODUCTS.find((x) => x.id === productId);
  const titleEl = document.getElementById("reviewProductName");
  if (titleEl && p) titleEl.textContent = p.name;
  modal.dataset.productId = productId;
  const currentUser = JSON.parse(localStorage.getItem("currentUser") || "null");
  const nameEl = document.getElementById("reviewerName");
  if (nameEl && currentUser) {
    nameEl.value = currentUser.name || "";
    nameEl.readOnly = true;
  } else if (nameEl) {
    nameEl.value = "";
    nameEl.readOnly = false;
  }
  setReviewRating(5);
  await loadReviews(productId);
  modal.classList.add("show");
  document.body.style.overflow = "hidden";
}

function closeReviewModal() {
  document.getElementById("reviewModal").classList.remove("show");
  document.body.style.overflow = "";
}

async function loadReviews(productId) {
  const listEl = document.getElementById("reviewList");
  const statsEl = document.getElementById("reviewStats");
  if (!listEl) return;
  listEl.innerHTML =
    '<div style="text-align:center;padding:30px;color:#999"><i class="fa fa-spinner fa-spin"></i> 불러오는 중...</div>';
  try {
    const res = await fetch(`review.php?product_id=${productId}`);
    const data = await res.json();
    if (!data.success) throw new Error();
    if (statsEl) {
      const filled = Math.round(data.avg);
      const stars = "★".repeat(filled) + "☆".repeat(5 - filled);
      statsEl.innerHTML = `
        <div style="display:flex;align-items:center;gap:16px;padding:16px;background:#f7f7f7;border-radius:8px;margin-bottom:18px">
          <div style="text-align:center">
            <div style="font-size:36px;font-weight:900;color:#111">${data.avg}</div>
            <div style="color:#c9a84c;font-size:18px">${stars}</div>
            <div style="font-size:12px;color:#999;margin-top:2px">총 ${data.count}개 리뷰</div>
          </div>
        </div>`;
    }
    if (!data.reviews.length) {
      listEl.innerHTML =
        '<div style="text-align:center;padding:30px;color:#999">아직 리뷰가 없어요. 첫 번째 리뷰를 남겨주세요!</div>';
      return;
    }
    listEl.innerHTML = data.reviews
      .map(
        (r) => `
      <div style="padding:16px 0;border-bottom:1px solid #e8e8e8">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:7px">
          <div style="display:flex;align-items:center;gap:8px">
            <span style="font-size:13px;font-weight:700;color:#111">${r.reviewer}</span>
            <span style="color:#c9a84c;font-size:13px">${"★".repeat(r.rating)}${"☆".repeat(5 - r.rating)}</span>
          </div>
          <span style="font-size:12px;color:#999">${r.created_at ? r.created_at.split(" ")[0] : ""}</span>
        </div>
        <p style="font-size:14px;color:#444;line-height:1.7">${r.content}</p>
      </div>
    `,
      )
      .join("");
  } catch (e) {
    listEl.innerHTML =
      '<div style="text-align:center;padding:30px;color:#999">리뷰를 불러올 수 없습니다</div>';
  }
}

let selectedRating = 5;
function setReviewRating(rating) {
  selectedRating = rating;
  document.querySelectorAll(".star-btn").forEach((btn, i) => {
    btn.textContent = i < rating ? "★" : "☆";
    btn.style.color = i < rating ? "#c9a84c" : "#ccc";
  });
}

async function submitReview() {
  const modal = document.getElementById("reviewModal");
  const productId = parseInt(modal.dataset.productId);
  const reviewer = document.getElementById("reviewerName").value.trim();
  const content = document.getElementById("reviewContent").value.trim();
  const currentUser = JSON.parse(localStorage.getItem("currentUser") || "null");
  if (!reviewer) {
    showToast("이름을 입력해주세요", "error");
    return;
  }
  if (!content) {
    showToast("리뷰 내용을 입력해주세요", "error");
    return;
  }
  try {
    const res = await fetch("review.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        product_id: productId,
        user_id: currentUser ? (currentUser.id ?? null) : null,
        reviewer,
        rating: selectedRating,
        content,
      }),
    });
    const data = await res.json();
    if (data.success) {
      showToast('<i class="fa fa-check"></i> 리뷰가 등록되었습니다', "success");
      document.getElementById("reviewContent").value = "";
      setReviewRating(5);
      await loadReviews(productId);
      await loadProducts();
    } else {
      showToast(data.message || "오류가 발생했습니다", "error");
    }
  } catch (e) {
    showToast("서버 연결 오류", "error");
  }
}

/* ============================================
   HERO 슬라이더
   ============================================ */
function goSlide(idx) {
  const slides = document.querySelectorAll(".hero-slide");
  const dots = document.querySelectorAll(".dot");
  slides[state.currentSlide].classList.remove("active");
  dots[state.currentSlide].classList.remove("active");
  state.currentSlide = idx;
  slides[state.currentSlide].classList.add("active");
  dots[state.currentSlide].classList.add("active");
}

function nextSlide() {
  const total = document.querySelectorAll(".hero-slide").length;
  goSlide((state.currentSlide + 1) % total);
}

function prevSlide() {
  const total = document.querySelectorAll(".hero-slide").length;
  goSlide((state.currentSlide - 1 + total) % total);
}

function startSlider() {
  state.slideTimer = setInterval(nextSlide, 4500);
}

/* ============================================
   모바일 메뉴
   ============================================ */
function toggleMobileMenu() {
  document.getElementById("mainNav").classList.toggle("open");
}

/* ============================================
   헤더 스크롤 효과
   ============================================ */
window.addEventListener("scroll", () => {
  const header = document.getElementById("mainHeader");
  if (window.scrollY > 60) header.classList.add("scrolled");
  else header.classList.remove("scrolled");
  hideSuggest();
});

/* ============================================
   보안 관제 이벤트 로깅 (실습용)
   ============================================ */
const securityLog = [];

function logSecurityEvent(type, data) {
  const entry = {
    type,
    data,
    userAgent: navigator.userAgent,
    timestamp: new Date().toISOString(),
    sessionId: getSessionId(),
  };
  securityLog.push(entry);
  console.log("[SECURITY LOG]", entry);
}

function getSessionId() {
  if (!window._sessionId) {
    window._sessionId = "sess_" + Math.random().toString(36).substr(2, 12);
  }
  return window._sessionId;
}

window.addEventListener("error", (e) => {
  logSecurityEvent("JS_ERROR", {
    message: e.message,
    filename: e.filename,
    lineno: e.lineno,
  });
});

document.addEventListener("contextmenu", () => {
  logSecurityEvent("CONTEXT_MENU_OPEN", {
    timestamp: new Date().toISOString(),
  });
});

function detectXSSPattern(input) {
  const patterns = [
    /<script/i,
    /javascript:/i,
    /onerror=/i,
    /onload=/i,
    /alert\(/i,
  ];
  return patterns.some((p) => p.test(input));
}

document.addEventListener("input", (e) => {
  if (e.target.tagName === "INPUT" && detectXSSPattern(e.target.value)) {
    logSecurityEvent("SUSPICIOUS_INPUT", {
      value: e.target.value,
      fieldId: e.target.id,
      timestamp: new Date().toISOString(),
    });
    showToast(
      '<i class="fa fa-shield-alt"></i> 보안 위협이 감지되어 기록되었습니다',
      "error",
    );
  }
});

/* ============================================
   초기화 (단일 DOMContentLoaded)
   ============================================ */
document.addEventListener("DOMContentLoaded", () => {
  loadProducts().then(() => {
    // URL에 product_id 있으면 자동으로 상품 모달 열기
    const initParams = new URLSearchParams(location.search);
    const pid = initParams.get("product_id");
    if (pid) openProductModal(parseInt(pid));
  });
  startSlider();
  updateCartUI();

  // URL에 user/pw 있으면 자동 로그인 시도
  const urlParams = new URLSearchParams(location.search);
  const urlUser = urlParams.get("user");
  const urlPw = urlParams.get("pw");

  if (urlUser && urlPw) {
    fetch(
      `login.php?email=${encodeURIComponent(urlUser)}&password=${encodeURIComponent(urlPw)}`,
    )
      .then((r) => r.json())
      .then((data) => {
        if (data.success) {
          state.currentUser = data.user;
          localStorage.setItem("currentUser", JSON.stringify(data.user));
          updateUIForLogin(data.user);
          showToast(
            `<i class="fa fa-check-circle"></i> ${data.user.name}님, 환영합니다!`,
            "success",
          );
        } else {
          localStorage.removeItem("currentUser");
          state.currentUser = null;
          showToast(
            '<i class="fa fa-exclamation-circle"></i> 잘못된 접근입니다',
            "error",
          );
          history.pushState(null, "", window.location.pathname);
        }
      });
  } else {
    checkLoginStatus();
  }

  document.addEventListener("click", (e) => {
    if (!e.target.closest(".search-wrap")) hideSuggest();
  });

  document.querySelectorAll(".modal-overlay").forEach((overlay) => {
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) {
        overlay.classList.remove("show");
        document.body.style.overflow = "";
      }
    });
  });

  const style = document.createElement("style");
  style.textContent = `
    #mainHeader.scrolled .header-main { padding: 10px 0; }
    #mainHeader.scrolled .logo { font-size: 22px; }
    #mainHeader { transition: background 0.35s ease; }
  `;
  document.head.appendChild(style);

  logSecurityEvent("PAGE_VISIT", {
    url: window.location.href,
    referrer: document.referrer,
    timestamp: new Date().toISOString(),
  });
});
/* ============================================
   찜 패널
   ============================================ */
function toggleWishPanel() {
  const panel = document.getElementById("wishPanel");
  const overlay = document.getElementById("wishOverlay");
  if (!panel) {
    buildWishPanel();
    return;
  }
  const isOpen = panel.classList.contains("open");
  panel.classList.toggle("open", !isOpen);
  overlay.classList.toggle("show", !isOpen);
  if (!isOpen) renderWishPanel();
}

function buildWishPanel() {
  // 오버레이
  const overlay = document.createElement("div");
  overlay.id = "wishOverlay";
  overlay.className = "cart-overlay";
  overlay.onclick = toggleWishPanel;
  document.body.appendChild(overlay);

  // 패널
  const panel = document.createElement("div");
  panel.id = "wishPanel";
  panel.className = "cart-panel";
  panel.innerHTML = `
    <div class="cart-header">
      <h3>찜 목록 <span id="wishPanelCount">0</span>개</h3>
      <button onclick="toggleWishPanel()"><i class="fa fa-times"></i></button>
    </div>
    <div class="cart-items" id="wishPanelItems">
      <p class="cart-empty"><i class="fa fa-heart"></i><br/>찜한 상품이 없습니다</p>
    </div>
  `;
  document.body.appendChild(panel);

  // 열기
  setTimeout(() => {
    overlay.classList.add("show");
    panel.classList.add("open");
    renderWishPanel();
  }, 10);
}

function renderWishPanel() {
  const itemsEl = document.getElementById("wishPanelItems");
  const countEl = document.getElementById("wishPanelCount");
  if (!itemsEl) return;

  countEl.textContent = state.wishlist.length;

  if (!state.wishlist.length) {
    itemsEl.innerHTML =
      '<p class="cart-empty"><i class="fa fa-heart"></i><br/>찜한 상품이 없습니다</p>';
    return;
  }

  itemsEl.innerHTML = state.wishlist
    .map((id) => {
      const p = PRODUCTS.find((p) => p.id === id);
      if (!p) return "";
      return `
      <div class="cart-item">
        <div class="cart-item-img">${p.emoji}</div>
        <div class="cart-item-info">
          <div class="cart-item-name">${p.name}</div>
          <div class="cart-item-price">${formatPrice(p.price)}</div>
        </div>
        <div style="display:flex;flex-direction:column;gap:6px;align-items:flex-end">
          <button class="cart-item-remove" onclick="toggleWish(null,${p.id});renderWishPanel()">
            <i class="fa fa-times"></i>
          </button>
          <button style="font-size:11px;padding:4px 8px;background:var(--accent);color:var(--navy);border-radius:4px;font-weight:700"
            onclick="addToCart(null,${p.id})">
            장바구니 담기
          </button>
        </div>
      </div>
    `;
    })
    .join("");
}
