angular.module('myApp')
.controller('VisualizerCtrl', function($scope, $location, jsonObj){

        $scope.jsonObj = jsonObj.getJson(); //Variable avec toutes les informations du JSON
        $scope.cores = []; //Tableau qui contient les informations sur les cores
        $scope.cacheL2 = [];

        $scope.machine = $scope.jsonObj.topology.object._type; //Type de la machine
        $scope.mb = Math.floor((parseInt($scope.jsonObj.topology.object._local_memory)/1024)/1024); //Mémoire totale (en MB)

        $scope.infoSocket = $scope.jsonObj.topology.object.object[0]._type+ " P#"+$scope.jsonObj.topology.object.object[0]._os_index; //Information sur le socket

        //variables for the display
        $scope.entities = [];
        $scope.cacheL3 = []; 
        $scope.cacheL2 = [];
        $scope.cachesL1 = [];
        $scope.deep_core = "";

        //use to browse items in the json file. We use it with the eval function to find them.
        var search = "$scope.jsonObj.topology.object";
        
        //extract core with deep_core variable init in cacheL2.
        $scope.extractCores = function(){
            $scope.cacheL2.forEach(function(cache,index){
                var tab_tmp = [];
                for(var i = 0; i<cache.length; i++){
                    tab_tmp.push((eval($scope.deep_core))[i].object.object.object);
                }
                $scope.cores.push(tab_tmp);
            });
        }

        //Contrairement à $scope.cacheL3 dans laquelle il y a trop d'informations pour les caches L2 la fonction récupère que 3 paramètres
        $scope.extractCachesL2 = function(){
            search += ".object";
            $scope.deep_core = search;
            var tmp_l2 = (eval(search));
            $scope.entities.forEach(function(){
                var tab_tmp = [];
                //while child are not L2 we continue our search et we modify search to do it
                while(true){
                    //if L2 is an array
                    if ((eval(tmp_l2)) instanceof Array){
                        for(var i = 0; i<(eval(tmp_l2)).length; i++){
                           tab_tmp.push({"_type":(eval(tmp_l2))[i]._type, "_depth":(eval(tmp_l2))[i]._depth, "_cache_size":(eval(tmp_l2))[i]._cache_size});
                       }
                       break;
                   }
                   else{
                    //if L2 is just an object
                       if ((eval(tmp_l2))._depth == 2 && (eval(tmp_l2)) != null){
                        tab_tmp.push({"_type":(eval(tmp_l2))._type, "_depth":(eval(tmp_l2))._depth, "_cache_size":(eval(tmp_l2))._cache_size});
                        break;
                    }
                    else{
                        search += ".object";
                    }
                }
            }
            $scope.cacheL2.push(tab_tmp);
        });
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

        // we extract all L3cache
        $scope.extractCacheL3 = function(){
            $scope.entities.forEach(function(entity,index){
                console.log(entity);
                while(true){
                    //if is an array.
                    if((eval(search)) instanceof Array){
                        search += "[0]";
                    }
                    else{
                        //we verify that current object have wanted properties
                        if ((eval(search))._depth == 3 && (eval(search)) != null){
                            $scope.cacheL3.push(eval(search));
                            break;
                        }
                        else{
                            search += ".object";
                        }
                    }
                }
             });
            //console.log($scope.cacheL3)
        }

        /* The more complicated function. We search in the json file:
        *   - first L1cacheD
        *   - then we search L1cacheI.
        */   
        $scope.extractCachesL1Bis= function(){
            var array = [];
             $scope.entities.forEach(function(){
                //here i put l3[0] temporary
                $scope.cacheL3[0].object.forEach(function(Core,index){
                    var deep = "Core.object";
                    var tmpL1 = [];
                    while(true){
                        if ((eval(deep)) instanceof Array){
                            for(i = 0; i < eval(deep).length; i++){
                                var tmp = [];
                                var deep_array = deep + "[i]";
                                while(true){
                                    if((eval(deep_array))._depth != null && (eval(deep_array))._depth == 1){
                                        tmp.push(eval(deep_array));
                                        deep_array += ".object";
                                    }
                                    else{
                                        break;
                                    } 
                                }
                                tmpL1.push(tmp);
                            }
                            break;
                        }

                        else{
                            var tmp = [];
                            if((eval(deep)) != null && (eval(deep))._depth == 1){
                                tmp.push(Core.object);
                                deep += ".object";
                            }
                            else{
                                break;
                            }

                            tmpL1 = tmp;  
                        }
                    }
                    
                    array.push(tmpL1);
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
    }
    );
