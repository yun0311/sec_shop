<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, DELETE');
header('Access-Control-Allow-Headers: Content-Type');
require 'db.php';

$method = $_SERVER['REQUEST_METHOD'];

// notices 테이블 자동 생성
$pdo->exec("CREATE TABLE IF NOT EXISTS notices (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    category VARCHAR(30) DEFAULT 'service',
    content TEXT,
    is_pinned TINYINT(1) DEFAULT 0,
    views INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)");

// 공지 목록 조회
if ($method === 'GET') {
    $stmt = $pdo->query("SELECT * FROM notices ORDER BY is_pinned DESC, id DESC");
    $notices = $stmt->fetchAll();
    echo json_encode(['success' => true, 'notices' => $notices]);
    exit;
}

// 공지 추가 (JSON)
if ($method === 'POST') {
    $data     = json_decode(file_get_contents('php://input'), true);
    $title    = trim($data['title'] ?? '');
    $category = trim($data['category'] ?? 'service');
    $content  = trim($data['content'] ?? '');
    $pinned   = intval($data['is_pinned'] ?? 0);

    if (!$title) {
        echo json_encode(['success' => false, 'message' => '제목을 입력해주세요']);
        exit;
    }

    $stmt = $pdo->prepare("INSERT INTO notices (title, category, content, is_pinned) VALUES (?, ?, ?, ?)");
    $stmt->execute([$title, $category, $content, $pinned]);
    $id = $pdo->lastInsertId();

    echo json_encode(['success' => true, 'message' => '공지사항이 등록되었습니다', 'id' => $id]);
    exit;
}

// 공지 삭제
if ($method === 'DELETE') {
    $id = intval($_GET['id'] ?? 0);
    if (!$id) {
        echo json_encode(['success' => false, 'message' => 'ID 없음']);
        exit;
    }
    $stmt = $pdo->prepare("DELETE FROM notices WHERE id = ?");
    $stmt->execute([$id]);
    echo json_encode(['success' => true, 'message' => '공지사항이 삭제되었습니다']);
    exit;
}

echo json_encode(['success' => false, 'message' => '잘못된 요청']);
?>