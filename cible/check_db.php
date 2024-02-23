<?php
	require_once 'inc.connexion.php';
  require_once 'recipes.php';

  $post_value = strip_tags($_POST['inputValue']);
  
  if ($_SERVER["REQUEST_METHOD"] == "POST" && $_POST['inputId'] === 'ref')
  {
    $post_value = strtoupper($post_value);

    $requete=$bdd->prepare($check_ref) or die (print_r($bdd->errorInfo()));
    
    $requete->execute(array(
      'val'=>$post_value.'%'
    ));
    
    $data = $requete->fetch();
  } else if ($_SERVER["REQUEST_METHOD"] == "POST" && $_POST['inputId'] === 'title')
  {
    $post_value = strtolower($post_value);

    $requete=$bdd->prepare($check_title) or die (print_r($bdd->errorInfo()));
    
    $requete->execute(array(
      'val'=>$post_value
    ));
    
    $data = $requete->fetch(); 
  } else {
    $data = 'Une erreur est survenu.';
  }
  
  $response = ['values' => $data['total_result']];

  echo json_encode($response);

	$requete->closeCursor();
?>