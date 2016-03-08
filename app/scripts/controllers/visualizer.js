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

        function extractPciDatas(datas, entities){
            if(datas instanceof Array){
                for(var i=0; i<datas.length; i++){
                    sortPciDatas(datas[i], entities);
                }
            }
            else{
                sortPciDatas(datas, entities);
            }
        }

        function sortDatas(data, array){
            if(data._type == "Group"){
                array.push({type: data._type, depth: data._depth, children: []});
                $scope.arrayGroups.push({index : i, os_index : data._depth , value : true, pciTree: []});
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
                array.push({type: data._type, os_index: data._os_index, memory: data._local_memory, children: [], pciTree: []});
                if(data.object){
                    extractDatas(data.object, array[array.length-1].children);
                    extractPciDatas(data.object, array[array.length-1].pciTree);
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

        function sortPciDatas(data, array){
            if(data._type == "Bridge"){
                array.push({type: data._type, os_index: data._os_index, depth: data._depth, children: []});
                if(data.object){
                    extractPciDatas(data.object, array[array.length-1].children);
                }
            }
            else if(data._type == "PCIDev"){
                array.push({type: data._type, os_index: data._os_index, pci_busid: data._pci_busid, children: []});
                if(data.object){
                    extractPciDatas(data.object, array[array.length-1].children);
                }
            }
            else if(data._type == "OSDev"){
                array.push({type: data._type, name: data._name});
                if(data.object){
                    extractPciDatas(data.object, array[array.length-1].children);
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
            },
            {
              "name":"NUMANode",
              "color":"#EFDFDE"
            }
            ,
            {
              "name":"Node",
              "color":"#D2E7A4"
            }
            ,
            {
              "name":"Package",
              "color":"#DEDEDE"
            }
             ,
            {
              "name":"Group",
              "color":"white"
            }
          ]
        };


        $scope.alignement = [{alignement : "vertical", value :true}, {alignement : "horizontal" , value : false}];
        $scope.zoom = 1;

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

       $scope.checkPackage = function(Package){
            var tmp;
            $scope.arrayPackages.forEach(function(packages,index){
                if (packages.os_index == Package.os_index){
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
    }
)


.controller('TestCtrl',function($scope,$timeout){
    function drawTree(array, index){
        var datasTree = array;

        var margin = {top: 30, right: 20, bottom: 30, left: 20},
        width = 960 - margin.left - margin.right,
        barHeight = 20;

        var i = 0;

        var tree = d3.layout.tree().nodeSize([0, 30]);

        //Ensemble des noeuds
        var nodes = tree.nodes(datasTree);

        //Ensemble des liens
        var links = tree.links(nodes);

        var height = nodes.length*33;

        var svg = d3.select("#tree-" + index + "-" + datasTree.os_index)
        .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height)
        .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        //Calcul de l'espacement entre chaque noeud
        nodes.forEach(function(n, i) {
            n.x = i * barHeight;
        });

        var node = svg.selectAll("g.node")
            .data(nodes);

        var nodeEnter = node.enter().append("g")
          .attr("class", "node");

        nodeEnter.append("rect")
          .attr("y", -barHeight / 2)
          .attr("height", 
            function (d) {
                if(d.type == "Bridge")
                    return 8;
                else
                    return barHeight;
            })
          .attr("width",
            function (d) {
                if(d.type == "Bridge")
                    return 8;
                else
                    return "10%";
            })
          .style("fill", 
            function (d) {
                if(d.type == "Bridge")
                    return "white";
                else if(d.type == "PCIDev")
                    return "#BED295";
                else if(d.type == "OSDev")
                    return "#DEDEDE";
            });

        nodeEnter.append("text")
          .attr("dy", 3.5)
          .attr("dx", 5.5)
          .text(
            function (d) {
                if(d.type == "Bridge")
                    return;
                else if(d.type == "PCIDev")
                    return "PCI "+ convertBusid(d.pci_busid);
                else if(d.type == "OSDev")
                    return d.name;
            });

        node.transition()
          .attr("transform", function(d) { return "translate(" + d.y*1.5 + "," + d.x*1.5 + ")"; })
          .style("opacity", 1)
        .select("rect")
          .style("fill", 
            function (d) {
                if(d.type == "Bridge")
                    return "white";
                else if(d.type == "PCIDev")
                    return "#BED295";
                else if(d.type == "OSDev")
                    return "#DEDEDE";
            });

        var link= svg.selectAll("path.link")
            .data(links)
          .enter().append("path")
            .attr("class", "link")
            .attr("d", elbow);  

    }

    function elbow(d, i) {
        return "M" + d.source.y*1.5 + "," + d.source.x*1.5
          + "V" + d.target.x*1.5 + "H" + d.target.y*1.5
          + (d.target.children ? "" : ("v" + 0));
    }

    function convertBusid(value){
        return value.substr(5, 7);
    }

    function size(nodes){
        return Math.round(nodes.length*32);
    }

    $scope.begin=function(array, index){
        $timeout(function() {
            drawTree(array, index);
        }, 0);
    }

});
