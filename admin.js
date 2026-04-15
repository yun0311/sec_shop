// main.js 에 추가 또는 수정할 내용

// 1. 관리자 정보 설정
const ADMIN_INFO = {
  email: "admin@admin.com",
  pw: "admin",
};

// 2. 로그인 핸들러 수정
function handleLogin() {
  const idInput = document.getElementById("loginId").value;
  const pwInput = document.getElementById("loginPw").value;

  if (idInput === ADMIN_INFO.email && pwInput === ADMIN_INFO.pw) {
    showToast("관리자 계정으로 로그인되었습니다.");
    // 관리자 전용 버튼 생성
    createAdminLink();
    closeModal("loginModal");
  } else {
    // 일반 로그인 로직 (기존 코드)
    showToast("로그인되었습니다.");
    closeModal("loginModal");
  }
}

// 3. 관리자 링크 생성 함수 (다크모드와 고객센터 사이)
function createAdminLink() {
  const headerLinks = document.querySelector(".header-top-links");
  const customerCenterLink = headerLinks.querySelector(
    'a[href="customer.html"]',
  );

  // 이미 버튼이 있다면 생성 안함
  if (document.getElementById("adminMoveBtn")) return;

  const adminBtn = document.createElement("a");
  adminBtn.id = "adminMoveBtn";
  adminBtn.href = "admin.html";
  adminBtn.innerHTML = '<i class="fa fa-user-shield"></i> 관리자';
  adminBtn.style.color = "var(--accent)";
  adminBtn.style.fontWeight = "bold";

  // 고객센터 링크 앞에 삽입
  headerLinks.insertBefore(adminBtn, customerCenterLink);
}
