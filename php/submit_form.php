<?php
session_start();

function send_json_response($status_code, $data) {
    http_response_code($status_code);
    header('Content-Type: application/json');
    echo json_encode($data);
    exit;
}

// Basic honeypot spam protection
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    // Honeypot field (should be empty)
    if (!empty($_POST['website'])) {
        send_json_response(400, ['error' => 'Spam detected.']);
    }

    // CSRF token check (optional, if you want to implement)
    /*
    if (!isset($_POST['csrf_token']) || $_POST['csrf_token'] !== $_SESSION['csrf_token']) {
        send_json_response(403, ['error' => 'Invalid CSRF token.']);
    }
    */

    // Sanitize inputs
    $name = htmlspecialchars(trim($_POST["name"] ?? ''));
    $email = filter_var(trim($_POST["email"] ?? ''), FILTER_SANITIZE_EMAIL);
    $message = htmlspecialchars(trim($_POST["message"] ?? ''));

    // Validate inputs
    if (empty($name) || empty($email) || empty($message)) {
        send_json_response(400, ['error' => 'Please complete all fields.']);
    }

    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        send_json_response(400, ['error' => 'Invalid email address.']);
    }

    // Save submission to CSV file
    $csv_file = __DIR__ . '/submissions.csv';
    $csv_data = [$name, $email, $message, date('Y-m-d H:i:s')];
    $fp = fopen($csv_file, 'a');
    if ($fp === false) {
        send_json_response(500, ['error' => 'Could not save submission.']);
    }
    fputcsv($fp, $csv_data);
    fclose($fp);

    // Send email notification
    $to = "your-email@example.com"; // Replace with your email address
    $subject = "New Form Submission from $name";
    $body = "Name: $name\nEmail: $email\n\nMessage:\n$message";
    $headers = "From: $email";

    if (mail($to, $subject, $body, $headers)) {
        send_json_response(200, ['message' => 'Thank you for your message!']);
    } else {
        send_json_response(500, ['error' => 'Oops! Something went wrong, please try again.']);
    }
} else {
    send_json_response(403, ['error' => 'There was a problem with your submission, please try again.']);
}
?>
