/* buy.js */

document.addEventListener("DOMContentLoaded", () => {
  const params = new URLSearchParams(location.search);
  const complete = params.get("complete");
  const orderId = params.get("order_code") || params.get("order_id");
  const name = params.get("name");

  // 주문완료 화면
  if (complete === "1") {
    document.querySelector(".buy-container").innerHTML = `
      <div style="text-align:center;padding:80px 20px">
        <i class="fa fa-check-circle" style="font-size:64px;color:#c9a84c;margin-bottom:24px;display:block"></i>
        <h2 style="font-family:'Playfair Display',serif;font-size:28px;margin-bottom:12px">주문이 완료되었습니다!</h2>
        <p style="color:#666;margin-bottom:8px">${decodeURIComponent(name || "")}님, 주문해 주셔서 감사합니다.</p>
        <p style="font-size:14px;font-weight:700;color:#111;margin-bottom:8px">주문번호</p>
        <p style="font-size:18px;font-weight:900;color:#c9a84c;letter-spacing:2px;margin-bottom:32px;font-family:'Courier New',monospace">${orderId}</p>
        <a href="main.html" style="display:inline-block;padding:13px 32px;background:#111;color:#fff;border-radius:6px;font-weight:700;text-decoration:none">
          쇼핑 계속하기
        </a>
      </div>
    `;
    return;
  }

  // 장바구니 데이터 가져오기
  const cartData = JSON.parse(localStorage.getItem("lx_cart_data") || "[]");

  if (cartData.length === 0) {
    alert("주문할 상품이 없습니다.");
    location.href = "main.html";
    return;
  }

  renderOrderSummary(cartData);

  // 카카오 주소 검색
  const addrBtn = document.getElementById("btnAddrSearch");
  if (addrBtn) {
    addrBtn.addEventListener("click", function () {
      new daum.Postcode({
        oncomplete: function (data) {
          const addr = data.roadAddress || data.jibunAddress;
          document.getElementById("postcode").value = data.zonecode;
          document.getElementById("addressMain").value = addr;
          document.getElementById("addressDetail").focus();
        },
      }).open();
    });
  }

  // 결제 수단 선택 스타일
  document.querySelectorAll(".pay-item").forEach((item) => {
    item.addEventListener("click", function () {
      document
        .querySelectorAll(".pay-item")
        .forEach((i) => i.classList.remove("active"));
      this.classList.add("active");
    });
  });
});

function renderOrderSummary(cart) {
  const listEl = document.getElementById("orderItemList");
  let total = 0;

  listEl.innerHTML = cart
    .map((item) => {
      total += item.price * item.qty;
      return `
      <div class="order-item">
        <div class="order-item-img">${item.emoji || "📦"}</div>
        <div class="order-item-info">
          <div style="font-weight:600">${item.name}</div>
          <div style="font-size:13px;color:#666">${item.qty}개 / ₩${(item.price * item.qty).toLocaleString()}</div>
        </div>
      </div>
    `;
    })
    .join("");

  const delivery = total >= 50000 ? 0 : 3000;
  document.getElementById("totalProductPrice").innerText =
    `₩${total.toLocaleString()}`;
  document.getElementById("deliveryFee").innerText =
    delivery === 0 ? "무료" : `₩${delivery.toLocaleString()}`;
  document.getElementById("finalOrderPrice").innerText =
    `₩${(total + delivery).toLocaleString()}`;
}

async function handlePayment() {
  const buyerName = document.getElementById("buyerName").value.trim();
  const buyerPhone = document.getElementById("buyerPhone").value.trim();
  const postcode = document.getElementById("postcode").value.trim();
  const addressMain = document.getElementById("addressMain").value.trim();
  const addressDetail = document.getElementById("addressDetail").value.trim();
  const payMethod =
    document.querySelector('input[name="payMethod"]:checked')?.value || "card";

  if (!buyerName) {
    alert("받는 사람 이름을 입력해주세요.");
    return;
  }
  if (!buyerPhone) {
    alert("휴대폰 번호를 입력해주세요.");
    return;
  }
  if (!postcode || !addressMain) {
    alert("주소를 입력해주세요.");
    return;
  }

  const cartData = JSON.parse(localStorage.getItem("lx_cart_data") || "[]");
  if (!cartData.length) {
    alert("주문할 상품이 없습니다.");
    return;
  }

  const total = cartData.reduce((s, i) => s + i.price * i.qty, 0);
  const delivery = total >= 50000 ? 0 : 3000;
  const finalPrice = total + delivery;

  const currentUser = JSON.parse(localStorage.getItem("currentUser") || "null");
  const user_id = currentUser ? (currentUser.id ?? null) : null;

  const orderData = {
    user_id,
    buyer_name: buyerName,
    buyer_phone: buyerPhone,
    postcode,
    address_main: addressMain,
    address_detail: addressDetail,
    pay_method: payMethod,
    total_price: total,
    delivery_fee: delivery,
    final_price: finalPrice,
    items: cartData,
  };

  const btn = document.querySelector(".btn-pay");
  btn.textContent = "처리 중...";
  btn.disabled = true;

  try {
    const res = await fetch("order.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(orderData),
    });
    const data = await res.json();

    if (data.success) {
      localStorage.removeItem("lx_cart_data");
      localStorage.removeItem("mp_cart");
      const orderCode = data.order_code || data.order_id;
      location.href = `buy.html?complete=1&order_code=${encodeURIComponent(orderCode)}&name=${encodeURIComponent(buyerName)}`;
    } else {
      alert(data.message || "주문 처리 중 오류가 발생했습니다.");
    }
  } catch (e) {
    alert("서버 연결 오류, 잠시 후 다시 시도해주세요.");
  } finally {
    btn.textContent = "결제하기";
    btn.disabled = false;
  }
}
