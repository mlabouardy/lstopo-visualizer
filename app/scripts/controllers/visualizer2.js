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
            }
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

        //petite modification à faire : rendre dynamique le rendu selon la taille
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

        $scope.checkGroups = function(){
            return ($scope.arrayGroups[0] != undefined);
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
                if (entity.type != "Group" && entity.type != "Package" ){
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

        $scope.extractEntities();
        $scope.extractPackage();
    }
);
