<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PATCH');
header('Access-Control-Allow-Headers: Content-Type');
require 'db.php';

$method = $_SERVER['REQUEST_METHOD'];

// 문의 조회
// - 관리자: GET /QnA.php → 전체 목록 (회원 여부 포함)
// - 사용자: GET /QnA.php?email=xxx → 본인 문의만
if ($method === 'GET') {
    $email = trim($_GET['email'] ?? '');

    if ($email) {
        $stmt = $pdo->prepare("
            SELECT i.*,
                   CASE WHEN u.id IS NOT NULL THEN 1 ELSE 0 END AS is_member
            FROM inquiries i
            LEFT JOIN users u ON LOWER(i.email) = LOWER(u.email)
            WHERE i.email = ?
            ORDER BY i.id DESC
        ");
        $stmt->execute([$email]);
    } else {
        // 관리자 전체 조회 — users 테이블과 이메일 대조해서 회원 여부 판별
        $stmt = $pdo->query("
            SELECT i.*,
                   CASE WHEN u.id IS NOT NULL THEN 1 ELSE 0 END AS is_member
            FROM inquiries i
            LEFT JOIN users u ON LOWER(i.email) = LOWER(u.email)
            ORDER BY i.id DESC
        ");
    }

    $inquiries = $stmt->fetchAll();
    echo json_encode(['success' => true, 'inquiries' => $inquiries]);
    exit;
}

// 문의 등록
if ($method === 'POST') {
    $data    = json_decode(file_get_contents('php://input'), true);
    $type    = trim($data['type']    ?? '');
    $name    = trim($data['name']    ?? '');
    $email   = trim($data['email']   ?? '');
    $subject = trim($data['subject'] ?? '');
    $content = trim($data['content'] ?? '');

    if (!$type || !$name || !$email || !$subject || !$content) {
        echo json_encode(['success' => false, 'message' => '필수 항목을 모두 입력해주세요']);
        exit;
    }

    $stmt = $pdo->prepare("INSERT INTO inquiries (type, name, email, subject, content) VALUES (?, ?, ?, ?, ?)");
    $stmt->execute([$type, $name, $email, $subject, $content]);
    echo json_encode(['success' => true, 'message' => '문의가 접수되었습니다']);
    exit;
}

// 답변 상태 변경 (관리자)
if ($method === 'PATCH') {
    $data   = json_decode(file_get_contents('php://input'), true);
    $id     = intval($data['id'] ?? 0);
    $status = trim($data['status'] ?? '');

    if (!$id || !in_array($status, ['pending', 'answered'])) {
        echo json_encode(['success' => false, 'message' => '잘못된 요청']);
        exit;
    }

    $stmt = $pdo->prepare("UPDATE inquiries SET status = ? WHERE id = ?");
    $stmt->execute([$status, $id]);
    echo json_encode(['success' => true, 'message' => '상태가 변경되었습니다']);
    exit;
}

echo json_encode(['success' => false, 'message' => '잘못된 요청']);
?>