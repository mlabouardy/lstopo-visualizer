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

        function cache(type, cache_size, depth, cache_type) {
            this.type = type;
            this.cache_size = cache_size;
            this.depth = depth;
            this.cache_type = cache_type;
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

        function entitySocket(type, os_index){
            this.type = type;
            this.os_index = os_index;
            this.caches = [];
            this.cores = [];
        }

        function entityBridge(type, depth){
            this.type = type;
            this.depth = depth;
            this.child = [];
            /*this.entitiesBridge = [];
            this.entitiesPciDev = [];*/
        }

        function entityPciDev(type, pci_busid, infos){
            this.type = type;
            this.pci_busid = pci_busid;
            this.infos = infos;
            this.entitiesOsDev = [];
        }

        function entityOsDev(type, name, infos){
            this.type = type;
            this.name = name;
            this.infos = infos;
        }

        $scope.extractEntitiesBridge = function(datas, container){
            if(datas instanceof Array){
                for(var i=0; i<datas.length; i++){
                    $scope.sortByType(datas[i], container);
                }
            }
            else{
                $scope.sortByType(datas, container);
            }
        }

        $scope.sortByType = function(datas, container){
            if(datas._type == "Bridge"){
                    var bridge = new entityBridge(datas._type, datas._depth);
                    container.push(bridge);
                    if(datas.object)
                        $scope.extractEntitiesBridge(datas.object, bridge.child);
            }
            else if(datas._type == "PCIDev"){
                var pci = new entityPciDev(datas._type, datas._pci_busid, datas.info);
                container.push(pci);
                if(datas.object)
                    $scope.extractEntitiesBridge(datas.object, pci.entitiesOsDev);
            }
            else if(datas._type == "OSDev"){
                var os = new entityOsDev(datas._type, datas._name, datas.info);
                container.push(os);
            }
        }

        //Extraction des entités de type Bridge parent
        /*$scope.extractBridges = function(datas, entity){
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
                    var pci = new entityPciDev(datas[i]._type, datas[i]._pci_busid, datas[i].info);

                    if(datas[i].object){
                        $scope.extractOsDev(datas[i].object, pci);
                    }

                    bridge.entitiesPciDev.push(pci);
                }
            }
            else{
                var pci = new entityPciDev(datas._type, datas._pci_busid,  datas.info);

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
        }*/

        $scope.extractEntities = function(){
            for(var i=0; i < $scope.jsonObj.object.length; i++){

                if($scope.jsonObj.object[i]._type == "NUMANode"){
                    $scope.entities.push($scope.fillEntityWithNodeAndPackage($scope.jsonObj.object[i]));
                }

                else if ($scope.jsonObj.object[i]._type == "Package"){
                    $scope.entities.push($scope.fillPackageOfEntityWithNodeAndCaches($scope.jsonObj.object[i]));
                }

                else if ($scope.jsonObj.object[i]._type == "Group"){
                    $scope.entities.push($scope.fillGroupOfEntityWithNodeAndPackage($scope.jsonObj.object[i]));
                }

                else if ($scope.jsonObj.object[i]._type == "Socket"){
                    $scope.entities.push($scope.fillSocket($scope.jsonObj.object[i]));
                }
            }
        }

        $scope.fillSocket = function(datas){
            var socket = new entitySocket(datas._type, datas._os_index);

            $scope.extractCachesAndCores(datas.object, socket);

            return socket;
        }

        $scope.fillGroupOfEntityWithNodeAndPackage = function(datas){
            var group = new groupOfEntityWithNodeAndPackage(datas._type, datas._depth);

            if(datas.object instanceof Array){
                for(var i=0; i<datas.object.length; i++){
                    if(datas.object[i]._type == "NUMANode"){
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
                //$scope.extractBridges(datas.object[1], node);
                $scope.extractEntitiesBridge(datas.object[1], node.entitiesBridge);
                //console.log(datas.object[1]);
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
                    var cacheL3 = new cache(datas[i]._type, datas[i]._cache_size, datas[i]._depth, datas[i]._cache_type);
                    entity.caches.push(cacheL3);

                    $scope.extractSecondLevelOfCache(datas[i].object, entity);
                }
            }
            else{
                var cacheL3 = new cache(datas._type, datas._cache_size, datas._depth, datas._cache_type);
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
                        datas[j]._depth,
                        datas[j]._cache_type);
                    entity.caches.push(cacheL2);

                    $scope.extractThirdLevelOfCache(datas[j].object, entity);
                }
            }
            else{
                var cacheL2 = new cache(
                        datas._type,
                        datas._cache_size,
                        datas._depth,
                        datas._cache_type);
                entity.caches.push(cacheL2);

                $scope.extractThirdLevelOfCache(datas.object, entity);
            }
        }

        $scope.extractThirdLevelOfCache = function(datas, entity){
            //Extraction des caches L1
            if(datas instanceof Array){
                for(var y=0; y<datas.length; y++){
                    var cacheL1 = new cache(
                        datas[y]._type,
                        datas[y]._cache_size,
                        datas[y]._depth,
                        datas[y]._cache_type);
                    entity.caches.push(cacheL1);

                    $scope.extractLastLevelOfCacheAndCores(datas[y].object, entity);
                }
            }
            else{
                var cacheL1 = new cache(
                        datas._type,
                        datas._cache_size,
                        datas._depth,
                        datas._cache_type);
                entity.caches.push(cacheL1);

                $scope.extractLastLevelOfCacheAndCores(datas.object, entity);
            }
        }

        //Fonction d'extraction du dernier niveau de cache L1 et des cores
        $scope.extractLastLevelOfCacheAndCores = function(datas, entity){
            if(datas._type == "L1iCache" || datas._type == "Cache"){

                //Extraction du second cache L1
                var cacheL1 = new cache(
                    datas._type,
                    datas._cache_size,
                    datas._depth,
                    datas._cache_type);
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

        $scope.isSocket = function(entity){
             if(entity.type == "Socket"){
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

        // variables for display or not elements
        $scope.showL1 = true;
        $scope.showL2 = true;
        $scope.showL3 = true;
        $scope.cores = true;
        $scope.Pu = true;
        $scope.arrayPackages = [];
        $scope.arrayGroups = [];

        //variable for color
        $scope.arrayColors= [{name : "basic_red" , value : "#EFDFDE"}, {name : "basic_green" , value : "#D2E7A4"},
         { name : "basic_grey_light", value :"#DEDEDE"} , { name : "white", value :"#FFFFFF"}, { name : "basic_grey", value :"#BEBEBE"}];
        $scope.items = [{object : "Cores", value : "#BEBEBE" } , {object : "Pu", value : "#FFFFFF" },
        {object : "L3", value : "#FFFFFF" },{object : "L2", value : "#FFFFFF" },{object : "L1", value : "#FFFFFF" },
        {object : "Package", value : "#DEDEDE" }, {object : "NUMANode", value : "#EFDFDE" }, {object : "Node", value : "#D2E7A4" }];
        $scope.currentItem = ["Cores","white"];
        $scope.AddColor = ["",""];
        $scope.alignement = true;
        $scope.zoom = 1;

       $scope.checkPackage = function(Package){
            var tmp;
            $scope.arrayPackages.forEach(function(packages,index){
                if (packages.os_index == Package){
                    tmp = packages.value;
                }
            });
            return tmp;
        }

        $scope.checkGroups = function(group){
            return (group[0] != undefined);
        }

        $scope.ShowGroup = function(entity){
            var check;
            $scope.arrayGroups.forEach(function(group,index){
                if(group.index == $scope.entities.indexOf(entity)){
                    check = group.value;
                }
            });
            return check;
        }

       var i = 0;
        $scope.extractPackage = function(){
            $scope.entities.forEach(function(entity,index){
                if (entity.type == "Package"){
                    $scope.arrayPackages.push({os_index : entity.os_index , value : true});
                }
                if (entity.type == "Group"){
                    $scope.arrayGroups.push({index : i, os_index : entity.depth , value : true});
                    i++;
                    entity.entities.forEach(function(packages){
                        $scope.arrayPackages.push({os_index : packages.packageOfCacheAndCores.os_index , value : true});
                    });
                }
                if (entity.type != "Group" && entity.type != "Package" && entity.type != "Socket"){
                    $scope.arrayPackages.push({os_index : entity.packageOfCacheAndCores.os_index , value : true});
                }
            });
        }

        $scope.ChangeColor = function(){
            var tmp;

             $scope.arrayColors.forEach(function(Color,index){
                if(Color.name == $scope.currentItem[1]){
                    tmp = Color.value;
                }
            });
            $scope.items.forEach(function(item,index){
                if(item.object == $scope.currentItem[0]){
                    item.value = tmp;
                }
            });
        }

        $scope.AddColor = function(){
            $scope.arrayColors.push({name : $scope.AddColor[0] , value : $scope.AddColor[1]});
        }

        $scope.AsImg = function(){
            html2canvas(document.getElementById('left'), {
                onrendered: function(canvas) {
                    window.location=canvas.toDataURL('png');
                 }
            });
        }

        $scope.Zoom = function(fonction){
            if(fonction == 'zoomIn'){
                $scope.zoom += 0.2;
            }
            else{
                $scope.zoom -= 0.2;
            }
        }

        $scope.sizeCacheWithDepthAndType = function(array, depth, type){
            var cpt = 0;
            for(var i=0; i<array.length; i++){
                if(array[i].depth == depth && array[i].cache_type == type){
                    cpt++;
                }
            }
            return (100-(cpt))/cpt+"%";
        }

        $scope.extractEntities();
        $scope.extractPackage();
        console.log($scope.entities);
    }
)


.controller('TestCtrl',function($scope,$timeout){
    $scope.test=function(array, index){
        paper = new joint.dia.Paper({
            el: $('#object-'+index),
            model: graph,
            gridSize: 1
        });

        var e = document.getElementById("object-"+index);

        var root = createBranch();
        pushBridge(root);
        pushBridge(root);
        pushPCI(root, "test", 0, ["eth0"]);

        $scope.drawBridgesAndPciDev(root, array[0].child);

        drawTree(root);
    }

    $scope.drawBridgesAndPciDev = function(root, datas){
        var level;
        for(var i=1; i<datas.length; i++){
            if(i==1){
                level = root.nodes[0].childBranch;
                pushJoint(level);
                pushBridge(level);
                pushPCI(level, "test", 0, ["eth"+i]);
            }
            else{
                level = $scope.addBranch(level);
                pushJoint(level);
                pushBridge(level);
                pushPCI(level, "test", 0, ["eth"+i]);
            }
        }
    }

    $scope.addBranch = function(origin){
        return origin.nodes[0].childBranch;
    }

    $scope.begin=function(array, index){
        $timeout(function() {
          $scope.test(array,index);
        }, 0);
    }

});
