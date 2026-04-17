<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');
require 'db.php';

$data  = json_decode(file_get_contents('php://input'), true);
$name  = trim($data['name'] ?? '');
$email = trim($data['email'] ?? '');
$pw    = $data['password'] ?? '';

if (!$name || !$email || !$pw) {
    echo json_encode(['success' => false, 'message' => '필수 항목 누락']);
    exit;
}

$stmt = $pdo->prepare("SELECT id FROM users WHERE email = ?");
$stmt->execute([$email]);
if ($stmt->fetch()) {
    echo json_encode(['success' => false, 'message' => '이미 사용 중인 이메일']);
    exit;
}

$hash = password_hash($pw, PASSWORD_BCRYPT);
$stmt = $pdo->prepare("INSERT INTO users (name, email, password) VALUES (?, ?, ?)");
$stmt->execute([$name, $email, $hash]);

echo json_encode(['success' => true, 'message' => '회원가입 완료']);
?>