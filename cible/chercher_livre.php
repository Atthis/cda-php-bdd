<?php
	require_once 'inc.connexion.php';
	require_once 'recipes.php';
	
	["searched-ref" => $ref] = $_POST;
	$clear_regex = '/[^A-zÀ-ú0-9_\-\'\s.]	/';

	// Global checks
	if (empty($ref) || strlen($ref) > 8)
	{
		$response = ['message' => 'Le format de la référence est incorrecte', 'status' => 'error'];
		echo json_encode($response);
		exit();
	}

	if (preg_match($clear_regex, $ref))
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

	$requete=$bdd->prepare($search_book) or die (print_r($bdd->errorInfo()));
	$requete->execute(array(
		'val'=>$ref
	));
	$data = $requete->fetch();

	if (!$data) {
		$response = ['message' => 'Erreur: livre non référencé.', 'status' => 'error', 'data' => $data];
		echo json_encode($response);
		$requete->closeCursor();
		exit();
	}
	
	$response = ['message' => 'Livre trouvé', 'status' => 'success', 'data' => $data];
	echo json_encode($response);
	$requete->closeCursor();
	exit();
?>