angular.module('myApp')
.controller('VisualizerCtrl', function($scope, $location, jsonObj){
		
        $scope.jsonObj = jsonObj.getJson(); //Variable avec toutes les informations du JSON
        $scope.cores = []; //Tableau qui contient les informations sur les cores
        $scope.cacheL2 = [];
        $scope.machine = $scope.jsonObj.topology.object._type; //Type de la machine
        $scope.mb = $scope.jsonObj.topology.object._local_memory; //Mémoire totale

        $scope.infoSocket = $scope.jsonObj.topology.object.object[0]._type+ " P#"+$scope.jsonObj.topology.object.object[0]._os_index; //Information sur le socket

        $scope.cacheL3 = $scope.jsonObj.topology.object.object[0].object; //Attention! La variable contient encore le tableau avec tout les autres caches et les cores
        $scope.entities = [];

        $scope.extractEntities = function(entities){
            if(entities instanceof Array){
                for(var i=0; i<entities.length; i++){
                    $scope.entities.push(entities[i]);
                }
            }
            else{
                $scope.entities.push(entities);
            }
        }

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

        $scope.convertSizeInMb = function(size){
            return Math.floor(parseInt(size)/(1024*1024));
        }
		
        $scope.extractCores($scope.jsonObj.topology.object.object[0].object.object);
        $scope.extractCachesL2($scope.cacheL3.object);
    }
);
