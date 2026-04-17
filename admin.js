/* ============================================
   admin.js — Ground: Zero 관리자
   ============================================ */

function showToast(msg, type = "") {
  const wrap = document.getElementById("toastWrap");
  if (!wrap) return;
  const t = document.createElement("div");
  t.className = `toast ${type}`;
  t.innerHTML = msg;
  wrap.appendChild(t);
  setTimeout(() => t.remove(), 3200);
}

function showTab(name) {
  document
    .querySelectorAll(".admin-tab-section")
    .forEach((s) => s.classList.remove("active"));
  document
    .querySelectorAll(".admin-nav li")
    .forEach((li) => li.classList.remove("active"));
  document.getElementById(`tab-${name}`).classList.add("active");
  const titles = {
    dashboard: "대시보드",
    products: "상품 관리",
    notices: "공지사항 관리",
    users: "사용자 관리",
    inquiries: "문의사항",
  };
  document.getElementById("pageTitle").innerHTML =
    `${titles[name]} <small>Admin Mode</small>`;
  if (name === "products") loadProductList();
  if (name === "notices") loadNoticeList();
  if (name === "dashboard") loadDashboard();
  if (name === "users") loadUserList();
  if (name === "inquiries") loadInquiryList();
}

async function loadDashboard() {
  try {
    const [pRes, nRes, iRes] = await Promise.all([
      fetch("admin_product.php"),
      fetch("admin_notice.php"),
      fetch("QnA.php"),
    ]);
    const pData = await pRes.json();
    const nData = await nRes.json();
    const iData = await iRes.json();
    if (pData.success)
      document.getElementById("statProducts").textContent =
        pData.products.length + "개";
    if (nData.success) {
      const pinned = nData.notices.filter(
        (n) => parseInt(n.is_pinned) === 1,
      ).length;
      document.getElementById("statNotices").textContent =
        nData.notices.length + "건";
      document.getElementById("statPinned").textContent = pinned + "건";
    }
    if (iData.success) {
      const pending = iData.inquiries.filter(
        (i) => i.status === "pending",
      ).length;
      document.getElementById("statInquiries").textContent = pending + "건";
    }
  } catch (e) {
    document.getElementById("statProducts").textContent = "DB 오류";
    document.getElementById("statNotices").textContent = "DB 오류";
    document.getElementById("statPinned").textContent = "DB 오류";
  }
}

/* ══ 상품 관리 ══ */
const CAT_LABEL = {
  fashion: "패션",
  beauty: "뷰티",
  electronics: "전자기기",
  life: "라이프",
  food: "식품",
  sale: "세일",
};

async function loadProductList() {
  const wrap = document.getElementById("productList");
  wrap.innerHTML =
    '<div class="loading"><i class="fa fa-spinner fa-spin"></i> 불러오는 중...</div>';
  try {
    const res = await fetch("admin_product.php");
    const data = await res.json();
    if (!data.success) throw new Error();
    document.getElementById("productCount").textContent = data.products.length;
    if (!data.products.length) {
      wrap.innerHTML =
        '<div class="empty-table"><i class="fa fa-box-open"></i>등록된 상품이 없습니다</div>';
      return;
    }
    wrap.innerHTML = `
      <table class="admin-table">
        <thead><tr><th>ID</th><th>이모지</th><th>상품명</th><th>카테고리</th><th>판매가</th><th>정가</th><th>배지</th><th>관리</th></tr></thead>
        <tbody>
          ${data.products
            .map(
              (p) => `
            <tr>
              <td style="color:var(--gray-light)">#${p.id}</td>
              <td style="font-size:22px">${p.emoji || "📦"}</td>
              <td style="font-weight:500;max-width:200px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${p.name}</td>
              <td><span class="badge badge-${p.category}">${CAT_LABEL[p.category] || p.category}</span></td>
              <td style="font-weight:700">₩${parseInt(p.price).toLocaleString()}</td>
              <td style="text-decoration:line-through;color:var(--gray-light)">${p.original && p.original > p.price ? "₩" + parseInt(p.original).toLocaleString() : "-"}</td>
              <td>${p.badge ? `<span class="badge badge-${p.badge}" style="text-transform:uppercase">${p.badge}</span>` : "-"}</td>
              <td><button class="btn-del" onclick="deleteProduct(${p.id}, '${p.name.replace(/'/g, "\\'")}')"><i class="fa fa-trash"></i> 삭제</button></td>
            </tr>
          `,
            )
            .join("")}
        </tbody>
      </table>`;
  } catch (e) {
    wrap.innerHTML =
      '<div class="empty-table"><i class="fa fa-exclamation-triangle"></i>DB 연결 오류</div>';
  }
}

async function addProduct() {
  const name = document.getElementById("p-name").value.trim();
  const category = document.getElementById("p-category").value;
  const price = parseInt(document.getElementById("p-price").value);
  const original =
    parseInt(document.getElementById("p-original").value) || price;
  const emojiEl = document.getElementById("p-emoji");
  const emoji = emojiEl ? emojiEl.value.trim() || "📦" : "📦";
  const badge = document.getElementById("p-badge").value;
  const desc = document.getElementById("p-desc").value.trim();

  if (!name) {
    showToast(
      '<i class="fa fa-exclamation-circle"></i> 상품명을 입력해주세요',
      "error",
    );
    return;
  }
  if (!price || price <= 0) {
    showToast(
      '<i class="fa fa-exclamation-circle"></i> 판매가를 입력해주세요',
      "error",
    );
    return;
  }

  try {
    const res = await fetch("admin_product.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        category,
        price,
        original,
        emoji,
        badge,
        description: desc,
      }),
    });
    const data = await res.json();
    if (data.success) {
      showToast(
        `<i class="fa fa-check-circle"></i> "${name}" 상품이 등록되었습니다!`,
        "success",
      );
      ["p-name", "p-price", "p-original", "p-desc"].forEach((id) => {
        const el = document.getElementById(id);
        if (el) el.value = "";
      });
      if (emojiEl) emojiEl.value = "📦";
      document.getElementById("p-badge").value = "";
      loadProductList();
      loadDashboard();
    } else {
      showToast(
        `<i class="fa fa-exclamation-circle"></i> ${data.message}`,
        "error",
      );
    }
  } catch (e) {
    showToast('<i class="fa fa-exclamation-circle"></i> DB 연결 오류', "error");
  }
}

async function deleteProduct(id, name) {
  if (!confirm(`"${name}" 상품을 삭제하시겠습니까?`)) return;
  try {
    const res = await fetch(`admin_product.php?id=${id}`, { method: "DELETE" });
    const data = await res.json();
    if (data.success) {
      showToast(
        '<i class="fa fa-check-circle"></i> 상품이 삭제되었습니다',
        "success",
      );
      loadProductList();
      loadDashboard();
    } else
      showToast(
        `<i class="fa fa-exclamation-circle"></i> ${data.message}`,
        "error",
      );
  } catch (e) {
    showToast('<i class="fa fa-exclamation-circle"></i> DB 연결 오류', "error");
  }
}

/* ══ 공지사항 관리 ══ */
const NOTICE_CAT = {
  service: "서비스",
  event: "이벤트",
  system: "시스템",
  policy: "정책변경",
};

async function loadNoticeList() {
  const wrap = document.getElementById("noticeList");
  wrap.innerHTML =
    '<div class="loading"><i class="fa fa-spinner fa-spin"></i> 불러오는 중...</div>';
  try {
    const res = await fetch("admin_notice.php");
    const data = await res.json();
    if (!data.success) throw new Error();
    document.getElementById("noticeCount").textContent = data.notices.length;
    if (!data.notices.length) {
      wrap.innerHTML =
        '<div class="empty-table"><i class="fa fa-bullhorn"></i>등록된 공지사항이 없습니다</div>';
      return;
    }
    wrap.innerHTML = `
      <table class="admin-table">
        <thead><tr><th>ID</th><th>제목</th><th>카테고리</th><th>고정</th><th>조회수</th><th>등록일</th><th>관리</th></tr></thead>
        <tbody>
          ${data.notices
            .map(
              (n) => `
            <tr>
              <td style="color:var(--gray-light)">#${n.id}</td>
              <td style="font-weight:500;max-width:260px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">
                ${n.title}${parseInt(n.is_pinned) ? '<span class="badge-pinned">📌 고정</span>' : ""}
              </td>
              <td><span class="badge badge-${n.category}">${NOTICE_CAT[n.category] || n.category}</span></td>
              <td>${parseInt(n.is_pinned) ? '<i class="fa fa-thumbtack" style="color:var(--accent)"></i>' : "-"}</td>
              <td>${parseInt(n.views || 0).toLocaleString()}</td>
              <td style="color:var(--gray-light)">${n.created_at ? n.created_at.split(" ")[0] : "-"}</td>
              <td><button class="btn-del" onclick="deleteNotice(${n.id}, '${n.title.replace(/'/g, "\\'")}')"><i class="fa fa-trash"></i> 삭제</button></td>
            </tr>
          `,
            )
            .join("")}
        </tbody>
      </table>`;
  } catch (e) {
    wrap.innerHTML =
      '<div class="empty-table"><i class="fa fa-exclamation-triangle"></i>DB 연결 오류</div>';
  }
}

async function addNotice() {
  const title = document.getElementById("n-title").value.trim();
  const category = document.getElementById("n-category").value;
  const content = document.getElementById("n-content").value.trim();
  const pinned = document.getElementById("n-pinned").checked ? 1 : 0;

  if (!title) {
    showToast(
      '<i class="fa fa-exclamation-circle"></i> 제목을 입력해주세요',
      "error",
    );
    return;
  }

  try {
    const res = await fetch("admin_notice.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, category, content, is_pinned: pinned }),
    });
    const data = await res.json();
    if (data.success) {
      showToast(
        '<i class="fa fa-check-circle"></i> 공지사항이 등록되었습니다!',
        "success",
      );
      document.getElementById("n-title").value = "";
      document.getElementById("n-content").value = "";
      document.getElementById("n-pinned").checked = false;
      loadNoticeList();
      loadDashboard();
    } else {
      showToast(
        `<i class="fa fa-exclamation-circle"></i> ${data.message}`,
        "error",
      );
    }
  } catch (e) {
    showToast('<i class="fa fa-exclamation-circle"></i> DB 연결 오류', "error");
  }
}

async function deleteNotice(id, title) {
  if (!confirm(`"${title}" 공지사항을 삭제하시겠습니까?`)) return;
  try {
    const res = await fetch(`admin_notice.php?id=${id}`, { method: "DELETE" });
    const data = await res.json();
    if (data.success) {
      showToast(
        '<i class="fa fa-check-circle"></i> 공지사항이 삭제되었습니다',
        "success",
      );
      loadNoticeList();
      loadDashboard();
    } else
      showToast(
        `<i class="fa fa-exclamation-circle"></i> ${data.message}`,
        "error",
      );
  } catch (e) {
    showToast('<i class="fa fa-exclamation-circle"></i> DB 연결 오류', "error");
  }
}

/* ══ 사용자 관리 ══ */
async function loadUserList() {
  const userListEl = document.getElementById("userList");
  if (!userListEl) return;
  userListEl.innerHTML =
    '<tr><td colspan="5" class="loading"><i class="fa fa-spinner fa-spin"></i> 불러오는 중...</td></tr>';
  try {
    const res = await fetch("admin_user.php");
    const data = await res.json();
    if (data.success) {
      const users = data.users;
      const countEl = document.getElementById("userCount");
      if (countEl) countEl.textContent = users.length;
      if (!users.length) {
        userListEl.innerHTML =
          '<tr><td colspan="5" class="empty-table">가입된 회원이 없습니다.</td></tr>';
        return;
      }
      userListEl.innerHTML = users
        .map((user) => {
          const isAdmin =
            (user.role &&
              (user.role.trim() === "admin" ||
                user.role.trim() === "관리자")) ||
            user.name === "관리자";
          return `
          <tr>
            <td>${user.email}</td>
            <td><strong>${user.name}</strong></td>
            <td>${user.created_at ? user.created_at.split(" ")[0] : "-"}</td>
            <td><span class="badge badge-${isAdmin ? "system" : "service"}">${isAdmin ? "관리자" : "일반"}</span></td>
            <td>
              <div style="display:flex;gap:5px;">
                <button class="btn-del" style="background:rgba(21,101,192,0.08);color:#1565c0;border-color:rgba(21,101,192,0.2)"
                  onclick="toggleRole('${user.id}', '${isAdmin ? "user" : "admin"}')">
                  <i class="fa fa-sync"></i> ${isAdmin ? "일반으로" : "관리자로"}
                </button>
                ${!isAdmin ? `<button class="btn-del" onclick="deleteUser('${user.id}', '${user.name}')"><i class="fa fa-user-times"></i> 탈퇴</button>` : ""}
              </div>
            </td>
          </tr>`;
        })
        .join("");
    }
  } catch (e) {
    userListEl.innerHTML =
      '<tr><td colspan="5" class="empty-table">DB 연결 오류</td></tr>';
  }
}

async function toggleRole(userId, newRole) {
  if (
    !confirm(
      `권한을 '${newRole === "admin" ? "관리자" : "일반"}'(으)로 변경하시겠습니까?`,
    )
  )
    return;
  try {
    const res = await fetch("admin_user.php", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: userId, role: newRole }),
    });
    const data = await res.json();
    if (data.success) {
      showToast(
        '<i class="fa fa-check"></i> 권한이 변경되었습니다.',
        "success",
      );
      loadUserList();
    }
  } catch (e) {
    showToast("변경 실패", "error");
  }
}

async function deleteUser(id, name) {
  if (!confirm(`${name} 사용자를 강제 탈퇴시키겠습니까?`)) return;
  try {
    const res = await fetch(`admin_user.php?id=${id}`, { method: "DELETE" });
    const data = await res.json();
    if (data.success) {
      showToast(
        `<i class="fa fa-check"></i> ${name} 사용자가 삭제되었습니다.`,
        "success",
      );
      loadUserList();
      loadDashboard();
    } else showToast("삭제에 실패했습니다.", "error");
  } catch (e) {
    showToast("서버 통신 오류", "error");
  }
}

/* ══ 문의사항 관리 ══ */
const INQ_TYPE = {
  order: "주문·결제",
  delivery: "배송",
  return: "반품·교환",
  product: "상품",
  account: "계정",
  other: "기타",
};

async function loadInquiryList() {
  const wrap = document.getElementById("inquiryList");
  if (!wrap) return;
  wrap.innerHTML =
    '<div class="loading"><i class="fa fa-spinner fa-spin"></i> 불러오는 중...</div>';
  try {
    const res = await fetch("QnA.php");
    const data = await res.json();
    if (!data.success) throw new Error();

    const countEl = document.getElementById("inquiryCount");
    if (countEl) countEl.textContent = data.inquiries.length;

    if (!data.inquiries.length) {
      wrap.innerHTML =
        '<div class="empty-table"><i class="fa fa-question-circle"></i>접수된 문의가 없습니다</div>';
      return;
    }

    wrap.innerHTML = `
      <table class="admin-table">
        <thead>
          <tr><th>회원구분</th><th>유형</th><th>이름</th><th>이메일</th><th>제목</th><th>상태</th><th>접수일</th><th>관리</th></tr>
        </thead>
        <tbody>
          ${data.inquiries
            .map((i) => {
              // user_id 또는 is_member 필드로 회원 여부 판별
              // user_id가 있거나 is_member === 1 이면 회원
              const isMember = i.user_id || i.is_member == 1;
              const memberBadge = isMember
                ? `<span style="display:inline-flex;align-items:center;gap:4px;padding:3px 9px;border-radius:50px;font-size:11px;font-weight:700;background:rgba(21,101,192,0.1);color:#1565c0">
                      <i class="fa fa-user"></i> 회원
                    </span>`
                : `<span style="display:inline-flex;align-items:center;gap:4px;padding:3px 9px;border-radius:50px;font-size:11px;font-weight:700;background:rgba(153,153,153,0.1);color:#999999">
                      <i class="fa fa-user-times"></i> 비회원
                    </span>`;
              return `
            <tr>
              <td>${memberBadge}</td>
              <td><span class="badge badge-service">${INQ_TYPE[i.type] || i.type}</span></td>
              <td style="font-weight:500">${i.name}</td>
              <td style="color:var(--gray-light);font-size:12px">${i.email}</td>
              <td style="max-width:200px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;cursor:pointer" onclick="showInquiryDetail(${i.id})"
                title="클릭하여 내용 보기">${i.subject}</td>
              <td>
                <span class="badge ${i.status === "answered" ? "badge-life" : "badge-system"}">
                  ${i.status === "answered" ? "✅ 답변완료" : "⏳ 미답변"}
                </span>
              </td>
              <td style="color:var(--gray-light)">${i.created_at ? i.created_at.split(" ")[0] : "-"}</td>
              <td>
                ${
                  i.status === "pending"
                    ? `<button class="btn-del" style="background:rgba(46,125,50,0.08);color:#2e7d32;border-color:rgba(46,125,50,0.2)"
                      onclick="markAnswered(${i.id})"><i class="fa fa-check"></i> 답변완료</button>`
                    : `<button class="btn-del" style="background:rgba(153,153,153,0.08);color:#999;border-color:rgba(153,153,153,0.2)"
                      onclick="markPending(${i.id})"><i class="fa fa-undo"></i> 미답변으로</button>`
                }
              </td>
            </tr>
          `;
            })
            .join("")}
        </tbody>
      </table>
    `;
  } catch (e) {
    wrap.innerHTML =
      '<div class="empty-table"><i class="fa fa-exclamation-triangle"></i>DB 연결 오류</div>';
  }
}

function showInquiryDetail(id) {
  fetch("QnA.php")
    .then((r) => r.json())
    .then((data) => {
      const inq = data.inquiries.find((i) => i.id === id);
      if (!inq) return;
      const isMember = inq.user_id || inq.is_member == 1;
      const memberLabel = isMember ? "👤 회원" : "🙍 비회원";
      alert(
        `[${INQ_TYPE[inq.type] || inq.type}] ${inq.subject}\n\n작성자: ${inq.name} (${inq.email})\n회원구분: ${memberLabel}\n접수일: ${inq.created_at}\n\n${inq.content}`,
      );
    });
}

async function markAnswered(id) {
  try {
    const res = await fetch("QnA.php", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status: "answered" }),
    });
    const data = await res.json();
    if (data.success) {
      showToast(
        '<i class="fa fa-check"></i> 답변완료로 변경되었습니다',
        "success",
      );
      loadInquiryList();
      loadDashboard();
    }
  } catch (e) {
    showToast("오류가 발생했습니다", "error");
  }
}

async function markPending(id) {
  try {
    const res = await fetch("QnA.php", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status: "pending" }),
    });
    const data = await res.json();
    if (data.success) {
      showToast(
        '<i class="fa fa-undo"></i> 미답변으로 변경되었습니다',
        "success",
      );
      loadInquiryList();
      loadDashboard();
    }
  } catch (e) {
    showToast("오류가 발생했습니다", "error");
  }
}

/* ── 초기화 ── */
document.addEventListener("DOMContentLoaded", () => {
  loadDashboard();
});
