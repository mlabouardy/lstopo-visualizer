## Analyse de VisJS


[VisJS](http://visjs.org) est une bibliothèque de visualisation. Cette bibliothèque est basée sur l'[API standard HTML Canvas](http://www.w3schools.com/html/html5_canvas.asp). Elle permet de manipuler une grande quantité de données dynamiques. La bibliothèque est découpée en plusieurs composants séparés. Celui qui nous intéresse est le composant Network.

Les possibilités qui sont offertes par ce composant sont très spécifiques. On peut construire des noeuds et des arêtes qui forment des graphes et des arbres. La position des noeuds est calculée automatiquement.

Les représentations possibles sont [limitées](http://visjs.org/network_examples.html). Vu qu'on a besoin d'une représentation particulière sous forme de rectangles imbriqués, on doit avoir recours à l'API HTML Canvas.
Pour réaliser le projet en utilisant VisJS, il aurait fallu créer des noeuds rectangulaires, fixer leur taille et leurs paramètres, fixer la position des noeuds en fonction de la hiérarchie qu'on veut obtenir et créer des rectangles qui englobent ces noeuds. On aurait besoin de calculer les positions pour chaque élement. 
Celà reviendrait à écrire la majeure partie de la visualisation avec l'API Canvas. Par conséquent, on aurait peu utilisé les possibilités de VisJS.

Etant donné que VisJS offre peu de possibilités de personnalisation, on aurait pu se pencher sur des bibliothèques basés sur le HTML Canvas qui offrent plus de flexibilité, [EaselJS](http://www.createjs.com/getting-started/easeljs) par exemple.
[CytoscapeJS](http://js.cytoscape.org/?utm_source=javascriptweekly&utm_medium=email) est une autre bibliothèque qui offre les mêmes possibilités que VisJS et bien plus encore. Elle est plus flexible et offre beaucoup de représentations différentes, ce qui aurait facilité le développement.