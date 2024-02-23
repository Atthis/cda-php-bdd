--
-- Structure de la table `livre`
--

CREATE TABLE IF NOT EXISTS `livre` (
  `reference` varchar(8) NOT NULL,
  `titre` varchar(255) NOT NULL,
  `auteur` varchar(255) NOT NULL,
  UNIQUE KEY `reference` (`reference`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
