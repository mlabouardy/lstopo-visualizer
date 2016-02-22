angular.module('myApp')
.controller('VisualizerCtrl', function($scope, $location, jsonObj){

        $scope.jsonObj = jsonObj.getJson(); //Variable avec toutes les informations du JSON
        
        $scope.machine = $scope.jsonObj.topology.object._type; //Type de la machine
        $scope.mb = Math.floor((parseInt($scope.jsonObj.topology.object._local_memory)/1024)/1024); //Mémoire totale (en MB)

        $scope.infoSocket = $scope.jsonObj.topology.object.object[0]._type+ " P#"+$scope.jsonObj.topology.object.object[0]._os_index; //Information sur le socket
         var indexPack = 0;

        //Cores
        $scope.entities = [];

        $scope.group = [];
        $scope.packages = [];
        $scope.machines = [];
        $scope.cacheL3 = [];
        $scope.cacheL2 = [];
        $scope.cachesL1 = [];
        $scope.cacheL1Bis = [];
        //use to browse items in the json file. We use it with the eval function to find them.
        var search = "$scope.jsonObj.topology.object";
        
        $scope.convertSizeInKb = function(size){
            return parseInt(size)/1024;
        }


        /*
        * We use it to search packages, machines, entities in xml.
        * If there is no packages in an xml we create them.
        */
        function machine(search, packages){           
            var tmp = [];
            var entities_tmp = [];
            if (search instanceof Array){

                search.forEach(function(node,index){
                    if (packages != undefined){
                        $scope.packages.push({ _os_index : indexPack.toString()});
                        indexPack++;
                    }
                    
                    if (node._type != "Bridge"){

                        tmp.push({_type : node._type, _local_memory : node._local_memory});
                        //to find L3 in machines
                        if (node.object instanceof Array){
                            entities_tmp.push(node.object[0]);
                        }
                        else{
                            entities_tmp.push(node.object);
                        }
                    }
                    
                });
            }
            else {
                 if (packages != undefined){
                        $scope.packages.push({ _os_index : indexPack.toString()});
                        indexPack++;
                    }

                    if (search._type != "Bridge"){
                        tmp.push({_type : search._type, _local_memory : search._local_memory});

                         //to find L3 in machines
                        if (search.object instanceof Array){
                            entities_tmp.push(search.object[0]);
                        }
                        else{
                            entities_tmp.push(search.object);
                        }
                    }
            }
            var return_machines = [entities_tmp, tmp];
            return return_machines;
        }

        /*
        * We extract all packages in the xml file
        * Then we extract in the same time all machines in packages extract
        * Finally we put in entities all L3 cache because it's our next extract
        */
        $scope.extractPackagesMachines = function(){
            while(true){
                if((eval(search)) instanceof Array){

                    // xml like jolly ... 
                    if (eval(search)[0]._type == "Package"){
                        (eval(search)).forEach(function(packages,index){
                            $scope.packages.push({ _os_index : packages._os_index });
                            $scope.machines.push(machine(packages.object)[1]);
                            $scope.entities.push(machine(packages.object)[0]);
                        });
                    }

                    // xml like manumanu ...
                    if(eval(search)[0]._type == "Group"){
                        eval(search).forEach(function(groups,index){
                            $scope.group.push(groups._depth);
                            var packages_in_group = [];
                            groups.object.forEach(function(packages,index){
                                var machines_in_package = [];
                                packages_in_group.push({ _os_index : packages._os_index });
                                machines_in_package.push(machine(packages)[1]);
                                $scope.entities.push(machine(packages)[0]);
                                $scope.machines.push(machines_in_package);
                            });
                             $scope.packages.push(packages_in_group);
                        });
                    }

                    //if it's a xml like alaric etc ...
                    if (eval(search)[0]._type != "Package" && eval(search)[0]._type != "Group" ){
                        if (eval(search) instanceof Array){
                            eval(search).forEach(function(packages,index){
                                $scope.machines.push(machine(packages, "package")[1]);
                                $scope.entities.push(machine(packages)[0]);
                            });
                        }
                    }
        
                    break;
                }

                // if in our search it's not the start of the description we browse the file   
                else{
                    search += ".object";
                }
            }
        }

        $scope.extractCachesL3= function(){
            var tmp_l3 = [];
            var tmp_entity =[];

            $scope.entities.forEach(function(cacheL3,index){
                var tmp_cacheL3 = [];
                var tmp_cacheL2 = [];
                if (cacheL3 instanceof Array){
                    var cacheL3_machines = []
                    var deep = "cache_entity"
                    cacheL3.forEach(function(cache_entity,index){
                        while(true){
                            if(eval(deep) instanceof Array){
                                var L3_in_entity = [];
                                var L2_in_L3 = [];
                                eval(deep).forEach(function(number_L3_entity, index){
                                    L3_in_entity.push({ _cache_size : number_L3_entity._cache_size});
                                    L2_in_L3.push(number_L3_entity.object);
                                });
                                tmp_cacheL3.push(L3_in_entity);
                                tmp_cacheL2.push(L2_in_L3);
                                break;
                            }
                            else{
                                if (eval(deep)._depth != null && eval(deep)._depth == 3){
                                    tmp_cacheL3.push({ _cache_size : (eval(deep))._cache_size});
                                    tmp_cacheL2.push(eval(deep).object);
                                    break;
                                }
                                else{
                                    deep += ".object";
                                }
                            } 
                        }
                    });
                }
                else{
                    var deep = "cacheL3"
                    while(true){
                        if (cacheL3._depth != null && cacheL3._depth == 3){
                            tmp_cacheL3.push({ _cache_size : cacheL3._cache_size});
                            tmp_cacheL2.push(cacheL3.object);
                            break;
                        }
                        else{
                            deep += ".object";
                        }
                    }
                }
                $scope.cacheL3.push(tmp_cacheL3);
                $scope.cacheL2.push(tmp_cacheL2);
            });
            $scope.entities = $scope.cacheL2;
        }

        //Contrairement à $scope.cacheL3 dans laquelle il y a trop d'informations pour les caches L2 la fonction récupère que 3 paramètres
        $scope.extractCachesL2 = function(){

           $scope.cacheL2 = [];

           $scope.entities.forEach(function(packages,index){
            var packages_cache = [];
            var packages_cacheL1 = [];
                packages.forEach(function(machines){
                    var cache_in_packages = [];
                    var cache_in_packagesL1 = [];
                    machines.forEach(function(cacheL2,index){

                        cache_in_packages.push(cacheL2._cache_size);
                        cache_in_packagesL1.push(cacheL2.object)
                    });
                    packages_cacheL1.push(cache_in_packagesL1);
                    packages_cache.push(cache_in_packages);

                });
                $scope.cachesL1.push(packages_cacheL1);
                $scope.cacheL2.push(packages_cache);
           });

           $scope.entities = $scope.cachesL1;
        }

        $scope.extractCachesL1= function(){
            $scope.cachesL1 = [];
            var final_entities = [];
            $scope.entities.forEach(function(packages,index){
                 var packages_cacheL1 = [];
                 var packages_cacheL1Bis = [];
                 var package_entity = [];
                packages.forEach(function(machines,index){
                    var cache_in_packagesL1 = [];
                    var cache_in_packagesL1Bis = [];
                    var cache_in_packagesentity = [];
                    machines.forEach(function(L1,index){
                        if(L1 instanceof Array){
                            var array_L1 = [];
                            var array_L1Bis = [];
                            var array_L1Entity = [];
                            L1.forEach(function(individualL1,index){
                                array_L1.push(individualL1._cache_size);
                                if (individualL1.object._depth != null && individualL1.object._depth == 1){
                                    array_L1Bis.push(individualL1.object);
                                }
                                else{
                                    array_L1Entity.push(individualL1.object);
                                }
                            });
                            cache_in_packagesL1.push(array_L1);
                            cache_in_packagesL1Bis.push(array_L1Bis);
                            cache_in_packagesentity.push(array_L1Entity);
                        }
                        else{
                            cache_in_packagesL1.push(L1._cache_size)
                            if (L1.object._depth != null && L1.object._depth == 1){
                                 cache_in_packagesL1Bis.push(L1.object);
                            }
                            else{
                                cache_in_packagesentity.push(L1.object);
                            }
                        }
                    });
                     packages_cacheL1.push(cache_in_packagesL1);
                     packages_cacheL1Bis.push(cache_in_packagesL1Bis);
                     package_entity.push(cache_in_packagesentity);
                });
                
                $scope.cachesL1.push(packages_cacheL1);
                $scope.cacheL1Bis.push(packages_cacheL1Bis);
                final_entities.push(package_entity);
               
            });

            $scope.entities =  final_entities;
        }

        $scope.extractCachesL1Bis = function(){
            var check = false;

            //check if cacheL1Bis is not an empty array
            $scope.cacheL1Bis.forEach(function(array){
                var deep = "array[0]"
                while(true){
                    if (eval(deep) instanceof Array){
                        deep += "[0]"
                    }
                    else{
                        if (eval(deep) != undefined){
                        check = true;
                        break;
                        }
                        else{
                            break;
                        }
                    }
                }
            });

            var L1Bis = [];
            var tmp_entities = [];
            if (check == true){
                $scope.cacheL1Bis.forEach(function(packages){
                    var packages_cacheL1Bis = [];
                    var packages_entity = [];
                    packages.forEach(function(machines){
                        var cache_in_packagesL1Bis = [];
                        var cache_in_packagesEntity = [];
                        machines.forEach(function(cacheL2,index){
                            cache_in_packagesEntity.push(cacheL2.object);
                            cache_in_packagesL1Bis.push(cacheL2._cache_size);
                        });
                        packages_cacheL1Bis.push(cache_in_packagesL1Bis);
                        packages_entity.push(cache_in_packagesEntity);
                    });
                    L1Bis.push(packages_cacheL1Bis);
                    tmp_entities.push(packages_entity);
                });

                $scope.entities = tmp_entities;
            }

            $scope.cacheL1Bis = L1Bis;

           /* console.log($scope.group);
            console.log($scope.packages);
            console.log($scope.machines);*/
            //console.log($scope.cacheL3);
            /*console.log($scope.cacheL2);
            console.log($scope.cachesL1);
            console.log($scope.cacheL1Bis);*/
            //console.log($scope.entities);
        }

        $scope.extractCore = function(){

            $scope.entities.forEach(function(packages,index){
                var core_packages = [];
                packages.forEach(function(machine,index){
                    var machines = [];
                    machine.forEach(function(array_core,index){
                        console.log(array_core);
                    });
                });
            });
        }


        $scope.convertSizeInMb = function(size){
            return parseInt(size)/(1024*1024);
        }

        $scope.CheckCore = function(Core){
            return (Core.object instanceof Array);
        }

         $scope.CheckCoreAndArray = function(Core){
            return (Core instanceof Array && Core != undefined);
        }

         $scope.CheckL3 = function(L3){
            return (L3 instanceof Array);
        }

        $scope.CheckPackage = function(Package){
            return (Package instanceof Array);
        }

        $scope.CheckGroup = function(group){
            return (group[0] == undefined);
        }

        $scope.extractPackagesMachines();
        $scope.extractCachesL3()
        $scope.extractCachesL2();
        $scope.extractCachesL1();
        $scope.extractCachesL1Bis();
        $scope.extractCore();
    }
    );
