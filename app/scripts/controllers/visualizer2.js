angular.module('myApp')
.controller('Visualizer2Ctrl', function($scope, $location, jsonObj){

        $scope.jsonObj = jsonObj.getJson().topology.object;
        $scope.entities = [];

        function pu(type, os_index) {
            this.type = type;
            this.os_index = os_index;
        }

        function core(type, os_index) {
            this.type = type;
            this.os_index = os_index;
            this.pus = [];
        }

        function cache(type, cache_size, depth) {
            this.type = type;
            this.cache_size = cache_size;
            this.depth = depth;
        }

        function numanode(type, os_index, local_memory) {
            this.type = type;
            this.os_index = os_index;
            this.local_memory = local_memory;
        }

        function packageOfCacheAndCores(type, os_index) {
            this.type = type;
            this.os_index = os_index;
            this.caches = [];
            this.cores = [];
        }

        function entityWithNodeAndCaches() {
            this.numanode = {};
            this.caches = [];
            this.cores = [];
        }

        function entityWithNodeAndPackage() {
            this.numanode = {};
            this.packageOfCacheAndCores = {};

            //PCI
            this.entitiesBridge = [];
        }

        function packageOfEntityWithNodeAndCaches(type, os_index) {
            this.type = type;
            this.os_index = os_index;
            this.entities = [];
        }

        function groupOfEntityWithNodeAndPackage(type, depth){
            this.type = type;
            this.depth = depth;
            this.entities = [];
        }

        function entityBridge(type, depth){
            this.type = type;
            this.depth = depth;
            this.entitiesBridge = [];
            this.entitiesPciDev = [];
        }

        function entityPciDev(type, infos){
            this.type = type;
            this.infos = infos;
            this.entitiesOsDev = [];
        }

        function entityOsDev(type, name, infos){
            this.type = type;
            this.name = name;
            this.infos = infos;
        }

        //Extraction des entités de type Bridge parent
        $scope.extractBridges = function(datas, entity){
            var bridge = new entityBridge(datas._type, datas._depth);

            $scope.extractBridgesChild(datas.object, bridge);

            entity.entitiesBridge.push(bridge);
        }

        //Extraction des entités de type Bridge enfant
        $scope.extractBridgesChild = function(datas, bridge){
            if(datas instanceof Array){
                for(var i=0; i<datas.length; i++){
                    if(datas[i]._type == "Bridge"){
                        var bridgeChild = new entityBridge(datas[i]._type, datas[i]._depth);

                        $scope.extractBridgesChild(datas[i].object, bridgeChild);
                        
                        bridge.entitiesBridge.push(bridgeChild);
                    } 
                    else if(datas[i]._type == "PCIDev"){
                        $scope.extractPciDev(datas[i], bridge);
                    }
                }
            }
            else if(datas._type == "Bridge"){
                var bridgeChild = new entityBridge(datas._type, datas._depth);

                $scope.extractBridgesChild(datas.object, bridgeChild);

                bridge.entitiesBridge.push(bridgeChild);
            }
            else if(datas._type == "PCIDev"){
                $scope.extractPciDev(datas, bridge);
            }
        }

        //Extraction des entités de type PCIDev
        $scope.extractPciDev = function(datas, bridge){

            if(datas instanceof Array){
                for(var i=0; i<datas.length; i++){
                    var pci = new entityPciDev(datas[i]._type, datas[i].info);

                    if(datas[i].object){
                        $scope.extractOsDev(datas[i].object, pci);
                    }

                    bridge.entitiesPciDev.push(pci);
                }
            }
            else{
                var pci = new entityPciDev(datas._type, datas.info);

                if(datas.object){
                    $scope.extractOsDev(datas.object, pci);
                }

                bridge.entitiesPciDev.push(pci);
            }
        }

        //Extraction des entités de type OSDev
        $scope.extractOsDev = function(datas, pci){
            if(datas instanceof Array){
                for(var i=0; i<datas.length; i++){
                    var os = new entityOsDev(datas[i]._type, datas[i]._name, datas[i].info);

                    pci.entitiesOsDev.push(os);
                }

            }
            else{
                var os = new entityOsDev(datas._type, datas._name, datas.info);

                pci.entitiesOsDev.push(os);
            }
        }

        $scope.extractEntities = function(){
            for(var i=0; i < $scope.jsonObj.object.length; i++){

                if($scope.jsonObj.object[i]._type == "NUMANode"){
                    $scope.entities.push($scope.fillEntityWithNodeAndPackage($scope.jsonObj.object[i]));
                }

                else if ($scope.jsonObj.object[i]._type == "Package"){
                    $scope.entities.push($scope.fillPackageOfEntityWithNodeAndCaches($scope.jsonObj.object[i]));
                }

                else if ($scope.jsonObj.object[i]._type == "Group"){
                    console.log("groupe numero : "+i);
                    $scope.entities.push($scope.fillGroupOfEntityWithNodeAndPackage($scope.jsonObj.object[i]));
                }
            }
        }

        $scope.fillGroupOfEntityWithNodeAndPackage = function(datas){
            var group = new groupOfEntityWithNodeAndPackage(datas._type, datas._depth);

            if(datas.object instanceof Array){
                for(var i=0; i<datas.object.length; i++){
                    if(datas.object[i]._type == "NUMANode"){
                        console.log("numero du numanode dans le groupe : "+i);
                        group.entities.push($scope.fillEntityWithNodeAndPackage(datas.object[i]));
                    }
                }
            }

            return group;
        }

        $scope.fillEntityWithNodeAndPackage = function(datas){
            var node = new entityWithNodeAndPackage();
            node.numanode = new numanode(datas._type, datas._os_index, datas._local_memory);


            if(datas.object instanceof Array){
                $scope.extractBridges(datas.object[1], node);
                var package = new packageOfCacheAndCores(datas.object[0]._type, datas.object[0]._os_index);

                $scope.extractCachesAndCores(datas.object[0].object, package);

                node.packageOfCacheAndCores = package;
            }
            else{
                var package = new packageOfCacheAndCores(datas.object._type, datas.object._os_index);

                $scope.extractCachesAndCores(datas.object.object, package);

                node.packageOfCacheAndCores = package;
            }

            return node;
        }

        $scope.fillPackageOfEntityWithNodeAndCaches = function(datas){
            var package = new packageOfEntityWithNodeAndCaches(datas._type, datas._os_index);

            if(datas.object instanceof Array){
                for(var i=0; i<datas.object.length; i++){

                    //Extraction de NUMANode
                    var entity = new entityWithNodeAndCaches();
                    entity.numanode = new numanode(datas.object[i]._type, datas.object[i]._os_index, datas.object[i]._local_memory);

                    if(datas.object[i].object instanceof Array){
                        $scope.extractCachesAndCores(datas.object[i].object[0], entity);
                    }
                    else{
                        $scope.extractCachesAndCores(datas.object[i].object, entity);
                    }

                    package.entities.push(entity);

                }
            }

            return package;
        }

        $scope.extractCachesAndCores = function(datas, entity){
            //Extraction du cache L3

            if(datas instanceof Array){
                for(var i=0; i<datas.length; i++){
                    var cacheL3 = new cache(datas[i]._type, datas[i]._cache_size, datas[i]._depth);
                    entity.caches.push(cacheL3);

                    $scope.extractSecondLevelOfCache(datas[i].object, entity);
                }
            }
            else{
                var cacheL3 = new cache(datas._type, datas._cache_size, datas._depth);
                entity.caches.push(cacheL3);
                
                $scope.extractSecondLevelOfCache(datas.object, entity)
            }
        }

        $scope.extractSecondLevelOfCache = function(datas, entity){
            //Extraction des caches L2
            if(datas instanceof Array){

                for(var j=0; j<datas.length; j++){
                    var cacheL2 = new cache(
                        datas[j]._type,
                        datas[j]._cache_size, 
                        datas[j]._depth);
                    entity.caches.push(cacheL2);

                    //Extraction des caches L1
                    if(datas[j].object instanceof Array){
                        for(var y=0; y<datas[j].object.length; y++){
                            var cacheL1 = new cache(
                                datas[j].object[y]._type,
                                datas[j].object[y]._cache_size,
                                datas[j].object[y]._depth);
                            entity.caches.push(cacheL1);

                            $scope.extractLastLevelOfCacheAndCores(datas[j].object[y].object, entity);
                        }
                    }
                    else{
                        var cacheL1 = new cache(
                                datas[j].object._type,
                                datas[j].object._cache_size,
                                datas[j].object._depth);
                        entity.caches.push(cacheL1);

                        $scope.extractLastLevelOfCacheAndCores(datas[j].object.object, entity);
                    }
                }
            }
            else{
                var cacheL2 = new cache(
                        datas._type,
                        datas._cache_size, 
                        datas._depth);
                entity.caches.push(cacheL2);

                //Extraction des caches L1
                if(datas.object instanceof Array){
                    for(var y=0; y<datas[j].object.length; y++){
                        var cacheL1 = new cache(
                            datas[j].object[y]._type,
                            datas[j].object[y]._cache_size,
                            datas[j].object[y]._depth);
                        entity.caches.push(cacheL1);

                        $scope.extractLastLevelOfCacheAndCores(data[j].object[y].object, entity);
                    }
                }
                else{
                    var cacheL1 = new cache(
                            datas.object._type,
                            datas.object._cache_size,
                            datas.object._depth);
                    entity.caches.push(cacheL1);

                    $scope.extractLastLevelOfCacheAndCores(datas.object.object, entity);
                }
            }
        }

        //Fonction d'extraction du dernier niveau de cache L1 et des cores
        $scope.extractLastLevelOfCacheAndCores = function(datas, entity){
            if(datas._type == "L1iCache"){

                //Extraction du second cache L1
                var cacheL1 = new cache(
                    datas._type,
                    datas._cache_size,
                    datas._depth);
                    entity.caches.push(cacheL1);

                //Extraction des cores
                $scope.extractCores(datas.object, entity);
            }
            else{

                //Extraction des cores
                $scope.extractCores(datas, entity);
            }
        }

        //Fonction d'extraction des cores et des PUs
        $scope.extractCores = function(datas, entity){
            var cpu = new core(
                datas._type,
                datas._os_index);

            //Plusieurs PU dans le core
            if(datas.object instanceof Array){
                for(var i=0; i<datas.object.length; i++){
                    var unity = new pu(
                        datas.object[i]._type,
                        datas.object[i]._os_index);
                    cpu.pus.push(unity);
                }
            }
            //Un seul PU dans le core
            else{
                var unity = new pu(
                    datas.object._type,
                    datas.object._os_index);
                cpu.pus.push(unity);
            }
            entity.cores.push(cpu);
        }

        $scope.isNode = function(entity){
            if(entity.numanode){
                return true;
            }
            else{
                return false;
            }
        }

        $scope.isPackage = function(entity){
            if(entity.type == "Package"){
                return true;
            }
            else{
                return false;
            }
        }

        $scope.isGroup = function(entity){
             if(entity.type == "Group"){
                return true;
            }
            else{
                return false;
            }
        }

        $scope.convertMemory = function(value, unity){
            if(unity == "gb"){
                return Math.round(value/Math.pow(1024, 3));
            }
            else if(unity == "mb"){
                return Math.round(value/Math.pow(1024, 2));
            }
            else if(unity == "kb"){
                return Math.round(value/1024);
            }
        }

        $scope.sizeCache = function(array, type){
            var cpt = 0;
            for(var i=0; i<array.length; i++){
                if(array[i].type == type){
                    cpt++;
                }
            }
            return (100-(cpt))/cpt+"%";
        }

        $scope.extractEntities();
        console.log($scope.entities);
    }
);
