<?php
// server should keep session data for AT LEAST 5 min
ini_set('session.gc_maxlifetime', 450);

session_start();
if(!isset($_SESSION["user"])) {
  $_SESSION["user"] = "";
}
// Get $baseURL from the superglobal $_REQUEST object
$baseURL = $_REQUEST["url"];

// Get request method from the superglobal $_SERVER object
$requestMethod = $_SERVER["REQUEST_METHOD"]; 

function getJSON($baseURL) {

  $ch = curl_init();
  $token = 'authToken=' . $_SESSION["user"];
  $finalUrl = $baseURL . "&returnValueList=" . $_GET["returnValueList"];
// explain setup   
  curl_setopt($ch, CURLOPT_URL, $finalUrl);
  curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
  curl_setopt($ch, CURLOPT_HTTPHEADER, array(
    "Accept: application/json"
  ));
  curl_setopt($ch, CURLOPT_COOKIE, $token);

  $json = "";
  $response = curl_exec($ch);

  if ($response === false) {
    if ($response.jsonCode === 407) {
      session_destroy();
    }
    $err = curl_error($ch);
    echo $err;
  } else {
    $json = json_encode($response);
  }
  
  curl_close($ch);
  echo $json;
}

function postJSON($baseURL) {
    $ch = curl_init();
    $data = http_build_query($_POST);

    curl_setopt($ch, CURLOPT_URL, $baseURL);
    // handle consecutive post request
    if(isset($_SESSION["user"])) {
      $token = 'authToken=' . $_SESSION["user"];
      curl_setopt($ch, CURLOPT_COOKIE, $token);
    }
    // curl_setopt($ch, CURLOPT_HTTPHEADER, array(
    //   "Content-Type: application/x-www-form-urlencoded",
    //   "Connection: keep-alive",
    // ));
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, $data);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

    $json = "";
    $response = curl_exec($ch); 
    if ($response === false) {
      if ($response.jsonCode === 407) {
        session_destroy();
      }
      $err = curl_error($ch);
      echo $err;
    } else {
      $json = json_decode($response, true);
      // first post request receives a cookie
      if(empty($_SESSION["user"])) {
        $_SESSION["user"] = $json["authToken"];
      }
    }
    
    curl_close($ch);

    echo json_encode($json);
  }

// switch to if else if 
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