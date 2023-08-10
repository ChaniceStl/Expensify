<?php
session_start();
if(!isset($_SESSION["user"])) {
  $_SESSION["user"] = "";
}

// last request was more than 5 minutes ago
// resource: https://stackoverflow.com/questions/520237/how-do-i-expire-a-php-session-after-30-minutes
if (isset($_SESSION['LAST_ACTIVITY']) && (time() - $_SESSION['LAST_ACTIVITY'] > 300)) {
  session_unset();
  session_destroy();
}
$_SESSION['LAST_ACTIVITY'] = time();

// Get $baseURL from the superglobal $_REQUEST object
$baseURL = $_REQUEST["url"];

// Get request method from the superglobal $_SERVER object
$requestMethod = $_SERVER["REQUEST_METHOD"]; 

function getJSON($baseURL) {
  // auth token is expired
  if(empty($_SESSION["user"])){
    $_SESSION = array();
    $response = array("status" => 'error', 'message' => "User is not logged in.");
    return json_encode($response);
  }

  $ch = curl_init();
  $finalUrl = $baseURL . "&returnValueList=" . $_GET["returnValueList"];
  $token = 'authToken=' . $_SESSION["user"];

  curl_setopt($ch, CURLOPT_URL, $finalUrl);
  curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
  curl_setopt($ch, CURLOPT_HTTPHEADER, array(
    "Accept: application/json"
  ));
  curl_setopt($ch, CURLOPT_COOKIE, $token);

  $json = "";
  $response = curl_exec($ch);

  if ($response === false) {
    $err = curl_error($ch);
    echo $err;
  } else {
    echo $response;
  }
  curl_close($ch);
}

function postJSON($baseURL) {
    $ch = curl_init();
    $data = http_build_query($_POST);

    curl_setopt($ch, CURLOPT_URL, $baseURL);
    // set cookie for consecuitve request
    if(isset($_SESSION["user"])) {
      $token = 'authToken=' . $_SESSION["user"];
      curl_setopt($ch, CURLOPT_COOKIE, $token);
    }
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, $data);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

    $response = curl_exec($ch);

    if ($response === false) {
      $err = curl_error($ch);
      $errorResponse = array("status" => 'error', 'message' => "Something went wrong. Please try again.", 'error' => $err);
      echo json_encode($errorResponse);
      $_SESSION = array();
    }

    $successResponse = json_decode($response, true);
    // first post request receives access token
    if(empty($_SESSION["user"])) {
      $_SESSION['LAST_ACTIVITY'] = time();
      $_SESSION["user"] = $successResponse["authToken"];
      echo json_encode($successResponse);
    } else {
      echo json_encode($successResponse["transactionList"]);
    }
    
    curl_close($ch);
  }

$response = "";
switch ($requestMethod) {
  case "GET":
    $response = getJSON($baseURL);
    break;
  case "POST":
    $response = postJSON($baseURL);
    echo $baseURL;
    break;
  default:
    echo "There has been an error";
    return;
}

echo $response; ?>