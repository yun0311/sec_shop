<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST');
header('Access-Control-Allow-Headers: Content-Type');
require 'db.php';

$method = $_SERVER['REQUEST_METHOD'];

// 리뷰 조회
if ($method === 'GET') {
    $product_id = intval($_GET['product_id'] ?? 0);

    // 전체 상품 리뷰 수/평점 요약 (product_id 없으면 전체)
    if (!$product_id) {
        $stmt = $pdo->query("
            SELECT product_id,
                   COUNT(*) as count,
                   ROUND(AVG(rating), 1) as avg_rating
            FROM reviews
            GROUP BY product_id
        ");
        $summary = [];
        foreach ($stmt->fetchAll() as $row) {
            $summary[$row['product_id']] = [
                'count' => (int)$row['count'],
                'avg'   => (float)$row['avg_rating']
            ];
        }
        echo json_encode(['success' => true, 'summary' => $summary]);
        exit;
    }

    $stmt = $pdo->prepare("
        SELECT * FROM reviews
        WHERE product_id = ?
        ORDER BY id DESC
    ");
    $stmt->execute([$product_id]);
    $reviews = $stmt->fetchAll();

    // 평균 평점 계산
    $avg = 0;
    if (count($reviews)) {
        $avg = round(array_sum(array_column($reviews, 'rating')) / count($reviews), 1);
    }

    echo json_encode([
        'success' => true,
        'reviews' => $reviews,
        'count'   => count($reviews),
        'avg'     => $avg
    ]);
    exit;
}

// 리뷰 등록
if ($method === 'POST') {
    $data       = json_decode(file_get_contents('php://input'), true);
    $product_id = intval($data['product_id'] ?? 0);
    $user_id    = isset($data['user_id']) && $data['user_id'] !== '' ? intval($data['user_id']) : null;
    $reviewer   = trim($data['reviewer']   ?? '');
    $rating     = intval($data['rating']   ?? 5);
    $content    = trim($data['content']    ?? '');

    if (!$product_id || !$reviewer || !$content) {
        echo json_encode(['success' => false, 'message' => '필수 항목을 입력해주세요']);
        exit;
    }
    if ($rating < 1 || $rating > 5) $rating = 5;

    $stmt = $pdo->prepare("
        INSERT INTO reviews (product_id, user_id, reviewer, rating, content)
        VALUES (?, ?, ?, ?, ?)
    ");
    $stmt->execute([$product_id, $user_id, $reviewer, $rating, $content]);

    echo json_encode(['success' => true, 'message' => '리뷰가 등록되었습니다']);
    exit;
}

echo json_encode(['success' => false, 'message' => '잘못된 요청']);
?>