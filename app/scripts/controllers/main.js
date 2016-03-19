
angular.module('myApp')
.controller('MainCtrl', function($scope, $location, jsonObj, x2js){
        $scope.data = "";
        $scope.message = "Importer le fichier XML";
        $scope.jsonObj = jsonObj;

        $scope.analyseXML = function(){
            var xml = document.getElementById('file').files[0];
            var reader = new FileReader();
            reader.readAsText(xml);

            //appelée lorsque l'opération de lecture s'est terminée avec succès
            reader.onload = function(evt){
                $scope.$apply(function() {
                    $scope.data = evt.target.result.toString();
                    $scope.jsonObj = x2js.xml_str2json($scope.data);
                    jsonObj.setJson($scope.jsonObj);
                    $location.url('/visualizer');
                });
            };

            //appelée lorsque l'opération de lecture est un échec
            reader.onerror = function(evt){
                console.log("error");
            };
        };

    }
);
