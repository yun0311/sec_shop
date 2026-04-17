<?php
// admin_users.php
header('Content-Type: application/json');

// 1. 파일명이 db.php가 맞는지 확인하세요.
require_once "db.php"; 

try {
    // 현재 요청 방식(GET, POST, PATCH, DELETE 등)을 변수에 저장
    $method = $_SERVER['REQUEST_METHOD'];

    // --- 1. 회원 목록 가져오기 (GET) ---
    if ($method === 'GET') {
        $stmt = $pdo->query("SELECT id, email, name, role, created_at FROM users ORDER BY created_at DESC");
        $users = $stmt->fetchAll();
        
        echo json_encode(["success" => true, "users" => $users]);
        exit;
    }

    // --- 2. 권한 변경하기 (PATCH) ---
    if ($method === 'PATCH') {
        // JS에서 보낸 JSON 데이터를 읽어옵니다.
        $data = json_decode(file_get_contents("php://input"), true);
        
        if (!isset($data['id']) || !isset($data['role'])) {
            throw new Exception("필수 데이터(id 또는 role)가 누락되었습니다.");
        }

        $id = $data['id'];
        $newRole = $data['role']; // 'admin' 또는 'user'

        $stmt = $pdo->prepare("UPDATE users SET role = ? WHERE id = ?");
        $stmt->execute([$newRole, $id]);

        echo json_encode(["success" => true]);
        exit;
    }

    // --- 3. 회원 삭제하기 (DELETE) ---
    if ($method === 'DELETE') {
        if (!isset($_GET['id'])) {
            throw new Exception("삭제할 ID가 전달되지 않았습니다.");
        }

        $id = $_GET['id'];
        
        $stmt = $pdo->prepare("DELETE FROM users WHERE id = ?");
        $stmt->execute([$id]);
        
        echo json_encode(["success" => true]);
        exit;
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "DB 오류: " . $e->getMessage()]);
}
?> 문장(