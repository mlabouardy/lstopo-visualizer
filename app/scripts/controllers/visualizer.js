angular.module('myApp')
.controller('VisualizerCtrl', function($scope, $location, jsonObj){

        $scope.jsonObj = jsonObj.getJson(); //Variable avec toutes les informations du JSON
        $scope.cores = []; //Tableau qui contient les informations sur les cores
        $scope.cacheL2 = [];

        $scope.machine = $scope.jsonObj.topology.object._type; //Type de la machine
        $scope.mb = Math.floor((parseInt($scope.jsonObj.topology.object._local_memory)/1024)/1024); //Mémoire totale (en MB)

        $scope.infoSocket = $scope.jsonObj.topology.object.object[0]._type+ " P#"+$scope.jsonObj.topology.object.object[0]._os_index; //Information sur le socket

        $scope.cacheL3 = null //$scope.jsonObj.topology.object.object[0].object; //Attention! La variable contient encore le tableau avec tout les autres caches et les cores
        $scope.entities = [];
        $scope.cachesL1 = [];
        $scope.deep_core = "";

        var search = "$scope.jsonObj.topology.object";
        
        $scope.extractCores = function(){
            var array = $scope.deep_core +"[i]";
            console.log($scope.jsonObj.topology.object);
            for(var i = 0; i<eval($scope.deep_core).length; i++){
                $scope.cores.push((eval(array)).object.object.object);
            }
        }

        //Contrairement à $scope.cacheL3 dans laquelle il y a trop d'informations pour les caches L2 la fonction récupère que 3 paramètres
        $scope.extractCachesL2 = function(){
            var array = $scope.cacheL3;
            var tmp_l2 = "array.object";
            search += ".object";
            while(true){
                if ((eval(tmp_l2)) instanceof Array){
                        for(var i = 0; i<(eval(tmp_l2)).length; i++){
                             $scope.cacheL2.push({"_type":(eval(tmp_l2))[i]._type, "_depth":(eval(tmp_l2))[i]._depth, "_cache_size":(eval(tmp_l2))[i]._cache_size});
                        }
                    break;
                }
                else{
                     if ((eval(tmp_l2))._depth == 2 && (eval(tmp_l2)) != null){
                        $scope.cacheL2.push({"_type":(eval(tmp_l2))._type, "_depth":(eval(tmp_l2))._depth, "_cache_size":(eval(tmp_l2))._cache_size});
                        break;
                     }
                     else{
                        tmp_l2 += ".object";
                        search += ".object";
                     }
                }
            }
           /* for(var i = 0; i<array.length; i++){
                $scope.cacheL2.push({"_type":array[i]._type, "_depth":array[i]._depth, "_cache_size":array[i]._cache_size});
            }*/
        }

        $scope.convertSizeInKb = function(size){
            return parseInt(size)/1024;
        }

        $scope.extractEntities = function(){
            var entities = (eval(search));

            if(entities instanceof Array){
                for(var i=0; i<entities.length; i++){
                    $scope.entities.push(entities[i]);
                }
            }
            else{
                $scope.entities.push(entities);
            }
        }

        $scope.extractCacheL3 = function(){
            console.log((eval(search)));
            while(true){
                if((eval(search)) instanceof Array){
                    search += "[0]";
                }
                else{
                    if ((eval(search))._depth == 3 && (eval(search)) != null){
                        $scope.cacheL3 = (eval(search));
                        break;
                    }
                    else{
                        search += ".object";
                    }
                }
            }

             $scope.deep_core = search + ".object";
        }

        $scope.extractCachesL1Bis= function(){
            var array = [];
            var check  = true;
            $scope.entities.forEach(function(entity,index){
                entity.object[0].object.object.forEach(function(Core,index){
                var tmpL1 = [];
                var deep = "Core.object";
                while(true){
                    if((eval(deep)) != null && (eval(deep))._depth == 1){
                        tmpL1.push(Core.object);
                        deep += ".object";
                        if (check == true){
                        }
                    }
                    else{
                        check = false;
                        break;
                    }  
                }
                array.push({l1 : tmpL1});
                });  
             });
        }

        $scope.convertSizeInMb = function(size){
            return parseInt(size)/(1024*1024);
        }

        
        $scope.extractEntities();
        $scope.extractCacheL3();
        $scope.extractCachesL2();
        $scope.extractCachesL1Bis();
        $scope.extractCores();
        //$scope.extractCores($scope.jsonObj.topology.object.object[0].object.object);
    }
);
