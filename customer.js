/* ============================================
   LUXMART — support.js  고객센터 페이지
   ============================================ */

/* ============================================
   FAQ 데이터
   ============================================ */
const FAQS = [
  {
    id: 1,
    cat: "order",
    q: "주문 후 취소가 가능한가요?",
    a: "결제 완료 후 상품 준비(출고) 전까지 마이페이지 > 주문 내역에서 직접 취소하실 수 있습니다. 출고가 시작된 이후에는 취소가 불가하며, 상품 수령 후 반품 절차를 이용해 주세요. 취소 후 환불은 영업일 기준 1~3일 내에 처리됩니다.",
  },
  {
    id: 2,
    cat: "order",
    q: "결제 수단별 환불 기간이 어떻게 되나요?",
    a: "결제 수단에 따라 환불 기간이 다릅니다.\n• 신용카드: 영업일 3~5일 (카드사마다 다를 수 있음)\n• 카카오페이 / 토스페이: 영업일 1~2일\n• 계좌이체: 영업일 1~2일\n• 포인트 결제: 즉시 복원",
  },
  {
    id: 3,
    cat: "order",
    q: "쿠폰과 포인트를 함께 사용할 수 있나요?",
    a: "네, 가능합니다. 결제 페이지에서 쿠폰 적용 후 포인트를 추가로 사용하실 수 있습니다. 단, 쿠폰은 1회 주문당 1장만 사용 가능하며, 일부 쿠폰은 최소 주문금액 조건이 있을 수 있습니다.",
  },
  {
    id: 4,
    cat: "delivery",
    q: "무료 배송 기준이 어떻게 되나요?",
    a: "5만원 이상 구매 시 무료 배송이 적용됩니다. 미충족 시 배송비 3,000원이 부과됩니다. GOLD 등급 이상 회원은 구매 금액과 관계없이 무료 배송이 적용됩니다. 해외 직구 상품의 경우 별도 배송 정책이 적용됩니다.",
  },
  {
    id: 5,
    cat: "delivery",
    q: "배송은 얼마나 걸리나요?",
    a: "결제 완료 후 출고까지 1~2 영업일이 소요되며, 배송은 1~2일이 추가로 걸립니다. 총 수령까지 2~4 영업일을 예상해 주세요. 오후 2시 이전 결제 건은 당일 출고 가능합니다. 제주·도서 산간 지역은 추가 기간이 소요될 수 있습니다.",
  },
  {
    id: 6,
    cat: "delivery",
    q: "배송 중인 상품 주소 변경이 가능한가요?",
    a: "출고 전에는 마이페이지에서 주소 변경이 가능합니다. 이미 출고된 경우 택배사에 직접 배송지 변경을 요청하거나 고객센터(1588-0000)로 연락해 주세요. 배송 기사가 방문하기 전까지 변경 가능하며, 추가 비용이 발생할 수 있습니다.",
  },
  {
    id: 7,
    cat: "return",
    q: "반품 신청은 어떻게 하나요?",
    a: "마이페이지 > 주문 내역 > 해당 주문 선택 > 반품 신청을 통해 접수하실 수 있습니다. 상품 수령 후 14일 이내에 신청해 주세요. 반품 신청 후 수거 기사가 1~2 영업일 내에 방문합니다. 상품 수거 후 검수 완료까지 1~2 영업일이 추가로 소요됩니다.",
  },
  {
    id: 8,
    cat: "return",
    q: "단순 변심 반품 시 배송비는 누가 부담하나요?",
    a: "단순 변심 반품의 경우 반품 배송비 3,000원(왕복)은 고객님 부담입니다. 상품 불량이나 오배송의 경우에는 LUXMART가 전액 부담합니다. GOLD 등급 이상 회원은 월 3회까지 단순 변심 반품 배송비가 무료입니다.",
  },
  {
    id: 9,
    cat: "return",
    q: "교환은 어떤 경우에 가능한가요?",
    a: "사이즈·색상 등 옵션 교환은 상품 수령 후 14일 이내, 미사용·미세탁 상태에서 가능합니다. 교환 재고가 없을 경우 환불로 처리됩니다. 교환 신청도 마이페이지 또는 고객센터를 통해 접수하실 수 있습니다.",
  },
  {
    id: 10,
    cat: "member",
    q: "포인트는 어떻게 적립되나요?",
    a: "구매 확정 시 결제 금액의 1~5%가 포인트로 적립됩니다. 회원 등급에 따라 적립률이 달라집니다.\n• 일반: 1% 적립\n• SILVER: 2% 적립\n• GOLD: 3% 적립\n• VIP: 5% 적립\n포인트는 결제일로부터 14일 후 자동 확정됩니다.",
  },
  {
    id: 11,
    cat: "member",
    q: "회원 탈퇴 후 재가입이 가능한가요?",
    a: "탈퇴 후 30일이 지나면 동일한 이메일로 재가입이 가능합니다. 단, 탈퇴 시 보유 포인트, 쿠폰, 주문 내역 등 모든 데이터가 삭제되며 복구가 불가합니다. 탈퇴는 마이페이지 > 설정 > 회원 탈퇴에서 신청하실 수 있습니다.",
  },
  {
    id: 12,
    cat: "member",
    q: "비밀번호를 잊어버렸어요. 어떻게 찾나요?",
    a: '로그인 페이지의 "비밀번호 찾기"를 클릭하고 가입하신 이메일을 입력하면 임시 비밀번호가 발송됩니다. 임시 비밀번호로 로그인 후 마이페이지에서 비밀번호를 변경해 주세요. 이메일에 접근이 불가한 경우 고객센터(1588-0000)로 문의해 주세요.',
  },
];

/* ============================================
   배송 추적 샘플 데이터
   ============================================ */
const TRACKING_SAMPLES = [
  {
    order: "LX-2025-0512345",
    product: "클래식 울 코트 (베이지) 외 2건",
    status: "배송중",
    steps: [
      {
        title: "주문 접수",
        time: "2025.05.10 14:32",
        desc: "주문이 접수되었습니다.",
        done: true,
      },
      {
        title: "결제 완료",
        time: "2025.05.10 14:33",
        desc: "결제가 완료되었습니다.",
        done: true,
      },
      {
        title: "상품 준비중",
        time: "2025.05.11 09:15",
        desc: "상품을 포장하고 있습니다.",
        done: true,
      },
      {
        title: "배송중",
        time: "2025.05.11 17:40",
        desc: "CJ대한통운 / 운송장번호: 1234-5678-9012",
        done: false,
        current: true,
      },
      { title: "배송 완료", time: "", desc: "", done: false },
    ],
  },
];

/* ============================================
   상태
   ============================================ */
const state = {
  darkMode: false,
  faqCat: "all",
  faqSearch: "",
  chatOpen: false,
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
function showToast(msg, type = "") {
  const wrap = document.getElementById("toastWrap");
  const t = document.createElement("div");
  t.className = `toast ${type}`;
  t.innerHTML = msg;
  wrap.appendChild(t);
  setTimeout(() => t.remove(), 3000);
}

/* ============================================
   탭 전환
   ============================================ */
function switchTab(tabId, triggerEl) {
  document
    .querySelectorAll(".tab-section")
    .forEach((s) => s.classList.remove("active"));
  document
    .querySelectorAll(".side-link")
    .forEach((l) => l.classList.remove("active"));
  const sec = document.getElementById(tabId);
  if (sec) sec.classList.add("active");
  if (triggerEl) triggerEl.classList.add("active");
  window.scrollTo({ top: 0, behavior: "smooth" });
}

/* ============================================
   FAQ
   ============================================ */
function getFaqFiltered() {
  let list = [...FAQS];
  if (state.faqCat !== "all") list = list.filter((f) => f.cat === state.faqCat);
  if (state.faqSearch) {
    const q = state.faqSearch.toLowerCase();
    list = list.filter(
      (f) => f.q.toLowerCase().includes(q) || f.a.toLowerCase().includes(q),
    );
  }
  return list;
}

function renderFaq() {
  const list = getFaqFiltered();
  const el = document.getElementById("faqList");
  if (!list.length) {
    el.innerHTML = `<div class="faq-empty"><i class="fa fa-search"></i><p>검색 결과가 없습니다</p></div>`;
    return;
  }
  el.innerHTML = list
    .map(
      (f) => `
    <div class="faq-item" id="faq-${f.id}">
      <div class="faq-question" onclick="toggleFaq(${f.id})">
        <div class="faq-q-icon">Q</div>
        <div class="faq-q-text">${f.q}</div>
        <i class="fa fa-chevron-down faq-chevron"></i>
      </div>
      <div class="faq-answer">${f.a.replace(/\n/g, "<br/>")}</div>
    </div>
  `,
    )
    .join("");
}

function toggleFaq(id) {
  const el = document.getElementById(`faq-${id}`);
  if (!el) return;
  const isOpen = el.classList.contains("open");
  // 다른 것 닫기
  document
    .querySelectorAll(".faq-item.open")
    .forEach((e) => e.classList.remove("open"));
  if (!isOpen) el.classList.add("open");
}

function filterFaq(cat, btn) {
  state.faqCat = cat;
  document
    .querySelectorAll(".fcat-btn")
    .forEach((b) => b.classList.remove("active"));
  btn.classList.add("active");
  renderFaq();
}

function searchFaq(val) {
  state.faqSearch = val.trim();
  renderFaq();
}

/* ============================================
   1:1 문의 제출
   ============================================ */
function submitInquiry(e) {
  e.preventDefault();
  const type = document.getElementById("inqType").value;
  const name = document.getElementById("inqName").value.trim();
  const email = document.getElementById("inqEmail").value.trim();
  const subject = document.getElementById("inqSubject").value.trim();
  const content = document.getElementById("inqContent").value.trim();
  const agree = document.getElementById("inqAgree").checked;

  if (!type) {
    showToast(
      '<i class="fa fa-exclamation-circle"></i> 문의 유형을 선택해주세요',
      "error",
    );
    return;
  }
  if (!name) {
    showToast(
      '<i class="fa fa-exclamation-circle"></i> 이름을 입력해주세요',
      "error",
    );
    return;
  }
  if (!email) {
    showToast(
      '<i class="fa fa-exclamation-circle"></i> 이메일을 입력해주세요',
      "error",
    );
    return;
  }
  if (!subject) {
    showToast(
      '<i class="fa fa-exclamation-circle"></i> 문의 제목을 입력해주세요',
      "error",
    );
    return;
  }
  if (!content) {
    showToast(
      '<i class="fa fa-exclamation-circle"></i> 문의 내용을 입력해주세요',
      "error",
    );
    return;
  }
  if (!agree) {
    showToast(
      '<i class="fa fa-exclamation-circle"></i> 개인정보 수집 동의가 필요합니다',
      "error",
    );
    return;
  }

  // 제출 처리 (실제로는 서버 전송)
  const btn = document.querySelector(".btn-submit");
  btn.innerHTML = '<i class="fa fa-spinner fa-spin"></i> 접수 중...';
  btn.disabled = true;

  setTimeout(() => {
    showToast(
      '<i class="fa fa-check-circle"></i> 문의가 접수되었습니다. 이메일로 답변 드리겠습니다.',
      "success",
    );
    document.querySelector(".inquiry-form").reset();
    document.getElementById("fileList").innerHTML = "";
    btn.innerHTML = '<i class="fa fa-paper-plane"></i> 문의 접수하기';
    btn.disabled = false;
  }, 1200);
}

/* ============================================
   파일 업로드
   ============================================ */
let selectedFiles = [];
function handleFileSelect(input) {
  const files = Array.from(input.files);
  if (selectedFiles.length + files.length > 3) {
    showToast(
      '<i class="fa fa-exclamation-circle"></i> 파일은 최대 3개까지 첨부 가능합니다',
      "error",
    );
    return;
  }
  files.forEach((f) => {
    if (f.size > 10 * 1024 * 1024) {
      showToast(
        `<i class="fa fa-exclamation-circle"></i> ${f.name}: 10MB를 초과합니다`,
        "error",
      );
      return;
    }
    selectedFiles.push(f);
  });
  renderFileList();
  input.value = "";
}
function renderFileList() {
  const el = document.getElementById("fileList");
  el.innerHTML = selectedFiles
    .map(
      (f, i) => `
    <div class="file-item">
      <i class="fa fa-paperclip"></i>
      <span>${f.name}</span>
      <span style="color:var(--text-muted);font-size:12px">(${(f.size / 1024).toFixed(1)}KB)</span>
      <span class="file-remove" onclick="removeFile(${i})"><i class="fa fa-times"></i></span>
    </div>
  `,
    )
    .join("");
}
function removeFile(idx) {
  selectedFiles.splice(idx, 1);
  renderFileList();
}

/* ============================================
   배송 조회
   ============================================ */
function trackDelivery() {
  const type = document.getElementById("trackingType").value;
  const num = document.getElementById("trackingNum").value.trim();
  if (!num) {
    showToast(
      '<i class="fa fa-exclamation-circle"></i> 번호를 입력해주세요',
      "error",
    );
    return;
  }

  const result = document.getElementById("trackingResult");
  result.innerHTML =
    '<div style="text-align:center;padding:30px;color:var(--text-muted)"><i class="fa fa-spinner fa-spin" style="font-size:24px"></i><p style="margin-top:12px">조회 중...</p></div>';
  result.style.display = "block";

  setTimeout(() => {
    // 샘플 데이터로 표시 (실제는 API 호출)
    const sample = TRACKING_SAMPLES[0];
    result.innerHTML = `
      <div class="track-status-header">
        <div class="track-status-label"><i class="fa fa-truck"></i> ${sample.status}</div>
        <div class="track-order-num">${sample.product}</div>
      </div>
      <div class="track-timeline">
        ${sample.steps
          .map(
            (s) => `
          <div class="track-step ${s.done ? "done" : ""} ${s.current ? "current" : ""}">
            <div class="track-step-left">
              <div class="track-dot"></div>
              <div class="track-line"></div>
            </div>
            <div class="track-step-right">
              <div class="track-step-title">${s.title}</div>
              ${s.time ? `<div class="track-step-time">${s.time}</div>` : ""}
              ${s.desc ? `<div class="track-step-desc">${s.desc}</div>` : ""}
            </div>
          </div>
        `,
          )
          .join("")}
      </div>
    `;
  }, 800);
}

/* ============================================
   채팅
   ============================================ */
const BOT_REPLIES = [
  "안녕하세요! 문의 내용을 확인 중입니다. 잠시만 기다려 주세요. 😊",
  "네, 말씀하신 내용 확인했습니다. 바로 처리해 드리겠습니다.",
  "조금 더 자세히 말씀해 주시면 더욱 정확한 안내가 가능합니다.",
  "해당 내용은 마이페이지 > 주문 내역에서도 확인하실 수 있습니다.",
  "불편을 드려 대단히 죄송합니다. 최대한 빠르게 해결해 드리겠습니다.",
  "추가로 궁금한 사항이 있으시면 편하게 말씀해 주세요!",
];
let botReplyIdx = 0;

function openChat() {
  const popup = document.getElementById("chatPopup");
  const fab = document.getElementById("chatFab");
  popup.style.display = "flex";
  popup.style.flexDirection = "column";
  fab.querySelector(".fab-badge").style.display = "none";
  state.chatOpen = true;
  document.getElementById("chatInput").focus();
}
function closeChat() {
  document.getElementById("chatPopup").style.display = "none";
  state.chatOpen = false;
}

function sendChat() {
  const input = document.getElementById("chatInput");
  const msg = input.value.trim();
  if (!msg) return;
  addChatMessage(msg, "user");
  input.value = "";

  // 봇 응답 딜레이
  setTimeout(() => {
    addChatMessage(BOT_REPLIES[botReplyIdx % BOT_REPLIES.length], "bot");
    botReplyIdx++;
  }, 800);
}

function addChatMessage(text, type) {
  const messages = document.getElementById("chatMessages");
  const now = new Date();
  const timeStr = `${now.getHours()}:${String(now.getMinutes()).padStart(2, "0")}`;
  const div = document.createElement("div");
  div.className = `chat-msg ${type}`;
  div.innerHTML = `
    <div class="chat-bubble">${text}</div>
    <span class="chat-time">${timeStr}</span>
  `;
  messages.appendChild(div);
  messages.scrollTop = messages.scrollHeight;
}

/* ============================================
   드래그 앤 드롭
   ============================================ */
function initDragDrop() {
  const zone = document.querySelector(".file-upload");
  if (!zone) return;
  zone.addEventListener("dragover", (e) => {
    e.preventDefault();
    zone.style.borderColor = "var(--accent)";
  });
  zone.addEventListener("dragleave", () => {
    zone.style.borderColor = "";
  });
  zone.addEventListener("drop", (e) => {
    e.preventDefault();
    zone.style.borderColor = "";
    const files = Array.from(e.dataTransfer.files);
    const fakeInput = { files };
    handleFileSelect(fakeInput);
  });
}

/* ============================================
   초기화
   ============================================ */
document.addEventListener("DOMContentLoaded", () => {
  initDarkMode();
  renderFaq();
  initDragDrop();

  // 사이드 링크 클릭 시 탭 전환
  document.querySelectorAll(".side-link").forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
    });
  });
});
