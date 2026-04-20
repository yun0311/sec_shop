<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST');
header('Access-Control-Allow-Headers: Content-Type');
session_start();
require 'db.php';

// GET 방식으로 받기 (실습용 - URL에 노출됨)
$email = trim($_GET['email'] ?? '');
$pw    = $_GET['password'] ?? '';

if (!$email || !$pw) {
    echo json_encode(['success' => false, 'message' => '입력값 누락']);
    exit;
}

// 이메일로 먼저 조회
$stmt = $pdo->prepare("SELECT * FROM users WHERE email = ?");
$stmt->execute([$email]);
$user = $stmt->fetch();

// 해시 비밀번호 비교 (GET 방식은 유지)
if (!$user || !password_verify($pw, $user['password'])) {
    echo json_encode(['success' => false, 'message' => '이메일 또는 비밀번호 오류']);
    exit;
}

$_SESSION['user'] = [
    'id'    => $user['id'],
    'name'  => $user['name'],
    'email' => $user['email'],
    'role'  => $user['role'],
];

echo json_encode(['success' => true, 'user' => $_SESSION['user']]);
?>