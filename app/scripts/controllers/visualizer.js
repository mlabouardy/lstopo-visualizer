angular.module('myApp')
.controller('VisualizerCtrl', function($scope, $location, jsonObj){

        $scope.jsonObj = jsonObj.getJson().topology.object;
        $scope.entities = [];

        // variables for display or not elements
        $scope.showL1 = true;
        $scope.showL2 = true;
        $scope.showL3 = true;
        $scope.cores = true;
        $scope.Pu = true;
        $scope.arrayPackages = [];
        $scope.arrayGroups = [];
        var i = 0;

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

        function extractDatas(datas, entities){
            if(datas instanceof Array){
                for(var i=0; i<datas.length; i++){
                    sortDatas(datas[i], entities);
                }
            }
            else{
                sortDatas(datas, entities);
            }
        }

        function sortDatas(data, array){
            if(data._type == "Group"){
                array.push({type: data._type, depth: data._depth, children: []});
                $scope.arrayGroups.push({index : i, os_index : data._depth , value : true});
                i++;
                if(data.object){
                    extractDatas(data.object, array[array.length-1].children);
                }
            }
            else if(data._type == "Package"){
                array.push({type: data._type, os_index: data._os_index, children: []});
                $scope.arrayPackages.push({os_index : data._os_index , value : true});
                if(data.object){
                    extractDatas(data.object, array[array.length-1].children);
                }
            }
            else if(data._type == "NUMANode"){
                array.push({type: data._type, os_index: data._os_index, memory: data._local_memory, children: []});
                if(data.object){
                    extractDatas(data.object, array[array.length-1].children);
                }
            }
            else if(/^L\d{1}.*/.test(data._type)){
                array.push({type: data._type, size: data._cache_size, children: []});
                if(data.object){
                    extractDatas(data.object, array[array.length-1].children);
                }
            }
            else if(data._type == "Core"){
                array.push({type: data._type, os_index: data._os_index, children: []});
                if(data.object){
                    extractDatas(data.object, array[array.length-1].children);
                }
            }
            else if(data._type == "PU"){
                array.push({type: data._type, os_index: data._os_index});
                if(data.object){
                    extractDatas(data.object, array[array.length-1].children);
                }
            }
        }

        extractDatas($scope.jsonObj.object, $scope.entities);

        $scope.cacheType = function(entity,type){
            if(entity == type){
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

        $scope.renameCache = function(entity){
            if(entity.children[0].type == "L2iCache" || entity.children[0].type == "L1iCache"){
                return entity.type.substring(0, 2)+"d";
            }
            else if(entity.type == "L2iCache" || entity.type == "L1iCache"){
                return entity.type.substring(0, 2)+"i";
            }
            else{
                return entity.type.substring(0, 2);
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

        $scope.sizePu = function(array, type){
            console.log(array.length);
            var cpt = 0;
            for(var i=0; i<array.length; i++){
                if(array[i].type == type){
                    cpt++;
                }
            }
            return (100-(cpt))/cpt * 3+"%";
        }

        // Config part

        $scope.config={
          show:[
            {
              name:"L3",
              ticked:true
            },
            {
              name:"L2",
              ticked:true
            },
            {
              name:"L1",
              ticked:true
            },
            {
              name:"Cores",
              ticked:true
            },
            {
              name:"PU",
              ticked:true
            }
          ],
          export:"PDF"
        }

        $scope.userConfig={
          show:[],
          colors:[
            {
              "name":"L3",
              "color":"#FFFFFF"
            },
            {
              "name":"L2",
              "color":"#FFFFFF"
            },
            {
              "name":"L1",
              "color":"#FFFFFF"
            },
            {
              "name":"Cores",
              "color":"#BEBEBE"
            },
            {
              "name":"PU",
              "color":"#FFFFFF"
            }
          ]
        };

        $scope.exportConfig=function(){
          var blob = new Blob([JSON.stringify($scope.userConfig)], {type: "application/json"});
          saveAs(blob, "config.json");
        }


        $scope.download = function(){
          if($scope.config.export=="PDF"){
            html2canvas($("#components"), {
            onrendered: function(canvas) {
              var imgData = canvas.toDataURL('image/png');
              var doc = new jsPDF('p', 'mm');
              doc.addImage(imgData, 'PNG', 10, 10);
              doc.save('components.pdf');
            }
            });
          }else{
            html2canvas($("#components"), {
            onrendered: function(canvas) {
              canvas.toBlob(function(blob) {
                    saveAs(blob, "components.png");
              });
            }
            });
          }
        }

        //variable for color
        $scope.arrayColors= [{name : "basic_red" , value : "#EFDFDE"}, {name : "basic_green" , value : "#D2E7A4"},
         { name : "basic_grey_light", value :"#DEDEDE"} , { name : "white", value :"#FFFFFF"}, { name : "basic_grey", value :"#BEBEBE"}];
        $scope.items = [{object : "Cores", value : "#BEBEBE" } , {object : "Pu", value : "#FFFFFF" },
        {object : "L3", value : "#FFFFFF" },{object : "L2", value : "#FFFFFF" },{object : "L1", value : "#FFFFFF" },
        {object : "Package", value : "#DEDEDE" }, {object : "NUMANode", value : "#EFDFDE" }, {object : "Node", value : "#D2E7A4" }];
        $scope.currentItem = ["Cores","white"];
        $scope.alignement = [{alignement : "vertical", value :true}, {alignement : "horizontal" , value : false}];
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

        $scope.change = function(choice){
            $scope.alignement.forEach(function(entity){
                if (entity.alignement != choice.alignement){
                    entity.value = false;
                }
            });
        }

        $scope.Zoom = function(fonction){
            if(fonction == 'zoomIn'){
                $scope.zoom += 0.1;
            }
            else{
                $scope.zoom -= 0.1;
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

        $scope.convertBusid = function(value){
            return value.substr(5, 7);
        }

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
