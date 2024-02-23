<?php
  $check_ref = 'SELECT COUNT(*) as total_result FROM livre WHERE reference LIKE :val';

  $check_title = 'SELECT COUNT(*) as total_result FROM livre WHERE titre LIKE :val';
  
  $add_book = 'INSERT INTO livre (reference, titre, auteur) VALUES (:reference,:titre,:auteur)';
  
  $search_book = 'SELECT * FROM livre WHERE reference=:val';
?>