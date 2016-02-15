var myApp = angular.module('myApp', [
    'ngRoute',
    'myAppControllers'
]);

myApp.config(['$routeProvider',
    function($routeProvider) { 
        
        $routeProvider.
        when('/xml', {
            templateUrl: 'importXML.html',
            controller: 'xmlCtrl'
        }).
        when('/lstopo', {
            templateUrl: 'lstopo.html',
            controller: 'lstopoCtrl'
        }).
        otherwise({
            redirectTo: '/xml'
        });
    }
]);

var myAppControllers = angular.module('myAppControllers', []);

myAppControllers.factory('jsonObj',function(){
        var json = {};

        json.setJson = function(obj){
            json = obj;
        };

        json.getJson = function(){
            return json;
        };

        return json;
});

//Contrôleur de la page d'import du fichier XML avec conversion en JSON
myAppControllers.controller('xmlCtrl', function($scope, $location, jsonObj){
        $scope.data = "";
        $scope.message = "Importer le fichier XML";
        $scope.jsonObj = jsonObj;
        
        $scope.analyseXML = function(){
            var x2js = new X2JS();
            var xml = document.getElementById('file').files[0];
            var reader = new FileReader();
            reader.readAsText(xml);

            //appelée lorsque l'opération de lecture s'est terminée avec succès
            reader.onload = function(evt){
                $scope.$apply(function() {
                    $scope.data = evt.target.result.toString();
                    $scope.jsonObj = x2js.xml_str2json($scope.data);
                    jsonObj.setJson($scope.jsonObj);
                    $location.url('/lstopo');
                });
            };

            //appelée lorsque l'opération de lecture est un échec
            reader.onerror = function(evt){
                console.log("error");
            };
        };

        $scope.showContent = function($fileContent){
            $scope.content = $fileContent;
        };
    }
);

//Contrôleur pour la page d'étude de la configuration JSON
myAppControllers.controller('lstopoCtrl', function($scope, $location, jsonObj){
        $scope.jsonObj = jsonObj.getJson(); //Variable avec toutes les informations du JSON
        $scope.cores = []; //Tableau qui contient les informations sur les cores
        $scope.cacheL2 = [];

        $scope.machine = $scope.jsonObj.topology.object._type; //Type de la machine
        $scope.mb = Math.floor((parseInt($scope.jsonObj.topology.object._local_memory)/1024)/1024); //Mémoire totale (en MB)
        
        $scope.infoSocket = $scope.jsonObj.topology.object.object[0]._type+ " P#"+$scope.jsonObj.topology.object.object[0]._os_index; //Information sur le socket
        
        $scope.cacheL3 = $scope.jsonObj.topology.object.object[0].object; //Attention! La variable contient encore le tableau avec tout les autres caches et les cores

        $scope.extractCores = function(array){
            for(var i = 0; i<array.length; i++){
                $scope.cores.push(array[i].object.object.object);
            }
        }

        //Contrairement à $scope.cacheL3 dans laquelle il y a trop d'informations pour les caches L2 la fonction récupère que 3 paramètres
        $scope.extractCachesL2 = function(array){
            for(var i = 0; i<array.length; i++){
                $scope.cacheL2.push({"_type":array[i]._type, "_depth":array[i]._depth, "_cache_size":array[i]._cache_size});
            }
        }

        $scope.convertSizeInKb = function(size){
            return parseInt(size)/1024;
        }

        $scope.extractCores($scope.jsonObj.topology.object.object[0].object.object);
        $scope.extractCachesL2($scope.cacheL3.object);
    }
);