<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');
session_start();
require 'db.php';

$data  = json_decode(file_get_contents('php://input'), true);
$email = trim($data['email'] ?? '');
$pw    = $data['password'] ?? '';

if (!$email || !$pw) {
    echo json_encode(['success' => false, 'message' => '입력값 누락']);
    exit;
}

$stmt = $pdo->prepare("SELECT * FROM users WHERE email = ?");
$stmt->execute([$email]);
$user = $stmt->fetch();

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