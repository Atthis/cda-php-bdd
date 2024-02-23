<?php
	require_once 'inc.connexion.php';
	require_once 'recipes.php';

	["title" => $title, "author" => $author, "ref" => $ref] = $_POST;
	$clear_regex = '/[^A-zÀ-ú0-9_\-\'\s.]/';

	// Global checks
	if ((empty($title) || strlen($title) < 2) || (empty($author) || strlen($author)) < 2 || (empty($ref) || strlen($ref) > 8))
	{
		$response = ['message' => 'Les zones de texte n\'ont pas été correctement remplies', 'status' => 'error'];
		echo json_encode($response);
		exit();
	}

	if (preg_match($clear_regex, $title) || preg_match($clear_regex, $author) || preg_match($clear_regex, $ref))
	{
		$response = ['message' => 'Les zones de texte n\'ont pas été correctement remplies', 'status' => 'error'];
		echo json_encode($response);
		exit();
	}

	// Reference checks
	$ref = strtoupper(preg_replace($clear_regex, '', $ref));

	if (!preg_match('/^[A-Z]{4}\d{4}$/', $ref))
	{
		$response = ['message' => 'Erreur sur la référence', 'status' => 'error'];
		echo json_encode($response);
		exit();
	}

	$requete=$bdd->prepare($check_ref) or die (print_r($bdd->errorInfo()));
	$requete->execute(array(
		'val'=>$ref
	));
	$ref_check = $requete->fetch();
	$is_ref_available = $ref_check['total_result'] <= 0 ? true : false ;

	if (!$is_ref_available) {
		$response = ['message' => 'Erreur: référence non-disponible.', 'status' => 'error'];
		echo json_encode($response);
		$requete->closeCursor();
		exit();
	}
	
	// Title checks
	$title = strtolower(preg_replace($clear_regex, '', $title));

	$requete=$bdd->prepare($check_title) or die (print_r($bdd->errorInfo()));
	$requete->execute(array(
		'val'=>$title
	));
	$title_check = $requete->fetch();
	$is_title_available = $title_check['total_result'] <= 0 ? true : false ;

	if (!$is_title_available) {
		$response = ['message' => 'Titre déjà enregistré.', 'status' => 'error'];
		echo json_encode($response);
		$requete->closeCursor();
		exit();
	}

	// Author checks
	$author = strtolower(preg_replace($clear_regex, '', $author));


	// If all checks OK, add book to db
	$requete=$bdd->prepare($add_book) or die (print_r($bdd->errorInfo()));

	$requete->execute(array(
	'titre'=>$_POST['title'],
	'auteur'=>$_POST['author'],	
	'reference'=>$_POST['ref']
	));

	$response = ['message' => 'Le nouveau livre a bien été enregistré !', 'status' => 'success'];

	echo json_encode($response);

	$requete->closeCursor();
?>