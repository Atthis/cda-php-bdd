<?php
	// Param�tres de connexion � la base de donn�es
	// On déclare la variable $id. Celle-ci nous servira si la recherche dans la BDD est infructueuse.
	
	// CONNEXION A LA BASE MySQL //
	try
	{	
		$bdd=new PDO('mysql:host=localhost;dbname=php_cda','dbuser','dbuser'); 
	}
	catch(Exception $e)
	{
		die('Erreur : ' . $e->getMessage());
	}

?>