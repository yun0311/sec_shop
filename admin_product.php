<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, DELETE');
header('Access-Control-Allow-Headers: Content-Type');
require 'db.php';

$method = $_SERVER['REQUEST_METHOD'];

// 상품 목록 조회
if ($method === 'GET') {
    $stmt = $pdo->query("SELECT * FROM products ORDER BY id DESC");
    $products = $stmt->fetchAll();
    echo json_encode(['success' => true, 'products' => $products]);
    exit;
}

// 상품 추가 (JSON 방식)
if ($method === 'POST') {
    $data     = json_decode(file_get_contents('php://input'), true);
    $name     = trim($data['name'] ?? '');
    $category = trim($data['category'] ?? '');
    $emoji    = trim($data['emoji'] ?? '📦');
    $price    = intval($data['price'] ?? 0);
    $original = intval($data['original'] ?? $price);
    $discount = $original > 0 ? intval(($original - $price) / $original * 100) : 0;
    $rating   = floatval($data['rating'] ?? 4.5);
    $reviews  = intval($data['reviews'] ?? 0);
    $badge    = trim($data['badge'] ?? '');
    $desc     = trim($data['description'] ?? '');

    if (!$name || !$category || !$price) {
        echo json_encode(['success' => false, 'message' => '필수 항목 누락 (이름, 카테고리, 가격)']);
        exit;
    }

    $stmt = $pdo->prepare("INSERT INTO products (name, category, emoji, price, original, discount, rating, reviews, badge, description) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
    $stmt->execute([$name, $category, $emoji, $price, $original, $discount, $rating, $reviews, $badge, $desc]);
    $id = $pdo->lastInsertId();

    echo json_encode(['success' => true, 'message' => '상품이 등록되었습니다', 'id' => $id]);
    exit;
}

// 상품 삭제
if ($method === 'DELETE') {
    $id = intval($_GET['id'] ?? 0);
    if (!$id) {
        echo json_encode(['success' => false, 'message' => 'ID 없음']);
        exit;
    }
    $stmt = $pdo->prepare("DELETE FROM products WHERE id = ?");
    $stmt->execute([$id]);
    echo json_encode(['success' => true, 'message' => '상품이 삭제되었습니다']);
    exit;
}

echo json_encode(['success' => false, 'message' => '잘못된 요청']);
?>