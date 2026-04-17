<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET');
header('Access-Control-Allow-Headers: Content-Type');
require 'db.php';

$method = $_SERVER['REQUEST_METHOD'];

// 주문 저장
if ($method === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);

    $user_id        = isset($data['user_id']) && $data['user_id'] !== '' ? intval($data['user_id']) : null;
    $buyer_name     = trim($data['buyer_name']     ?? '');
    $buyer_phone    = trim($data['buyer_phone']    ?? '');
    $postcode       = trim($data['postcode']       ?? '');
    $address_main   = trim($data['address_main']   ?? '');
    $address_detail = trim($data['address_detail'] ?? '');
    $pay_method     = trim($data['pay_method']     ?? '');
    $total_price    = intval($data['total_price']  ?? 0);
    $delivery_fee   = intval($data['delivery_fee'] ?? 0);
    $final_price    = intval($data['final_price']  ?? 0);
    $items          = json_encode($data['items']   ?? []);

    // 필수 항목 체크
    if (!$buyer_name || !$buyer_phone || !$postcode || !$address_main || !$pay_method || !$final_price) {
        echo json_encode(['success' => false, 'message' => '필수 항목을 모두 입력해주세요']);
        exit;
    }

    // 고유 주문번호 생성: GZ + 날짜(6자리) + 랜덤 4자리 대문자+숫자
    // ex) GZ250601A3F9
    function generateOrderCode() {
        $date = date('ymd');
        $rand = strtoupper(substr(bin2hex(random_bytes(3)), 0, 4));
        return 'GZ' . $date . $rand;
    }
    do {
        $order_code = generateOrderCode();
        $check = $pdo->prepare("SELECT id FROM orders WHERE order_code = ?");
        $check->execute([$order_code]);
    } while ($check->fetch());

    $stmt = $pdo->prepare("
        INSERT INTO orders
            (order_code, user_id, buyer_name, buyer_phone, postcode, address_main, address_detail, pay_method, total_price, delivery_fee, final_price, items)
        VALUES
            (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ");
    $stmt->execute([
        $order_code, $user_id, $buyer_name, $buyer_phone, $postcode,
        $address_main, $address_detail, $pay_method,
        $total_price, $delivery_fee, $final_price, $items
    ]);

    $order_id = $pdo->lastInsertId();
    echo json_encode(['success' => true, 'message' => '주문이 완료되었습니다', 'order_id' => $order_id, 'order_code' => $order_code]);
    exit;
}

// 주문 조회 (관리자 or 본인)
if ($method === 'GET') {
    $user_id = intval($_GET['user_id'] ?? 0);

    if ($user_id) {
        $stmt = $pdo->prepare("SELECT * FROM orders WHERE user_id = ? ORDER BY id DESC");
        $stmt->execute([$user_id]);
    } else {
        $stmt = $pdo->query("SELECT * FROM orders ORDER BY id DESC");
    }

    $orders = $stmt->fetchAll();
    // items JSON 파싱
    foreach ($orders as &$order) {
        $order['items'] = json_decode($order['items'], true);
    }
    echo json_encode(['success' => true, 'orders' => $orders]);
    exit;
}

echo json_encode(['success' => false, 'message' => '잘못된 요청']);
?>