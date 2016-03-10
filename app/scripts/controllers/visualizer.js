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
        $scope.arrayNUMANodes = [];
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
                array.push({type: data._type, _cpuset : data._cpuset, depth: data._depth, children: []});
                $scope.arrayGroups.push({index : data._cpuset, os_index : data._depth , value : true, pciTree: []});
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
                $scope.arrayNUMANodes.push({os_index : data._os_index , value : true});
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

                var imgWidth = 210;
                var pageHeight = 300;
                var imgHeight = canvas.height * imgWidth / canvas.width;
                var heightLeft = imgHeight;
              var imgData = canvas.toDataURL('image/png');
              var doc = new jsPDF('p', 'mm');
                var position = 0;
              doc.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
                heightLeft -= pageHeight;
                while (heightLeft >= 0) {
                    position = heightLeft - imgHeight;
                    doc.addPage();
                    doc.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
                    heightLeft -= pageHeight;
                }

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

 /*   $scope.downloadBis = function(){
        if($scope.config.export=="PDF"){
            var
                form = $('.form'),
                cache_width = form.width(),
                a4  =[ 595.28,  841.89];  // for a4 size paper width and height

            $('#components').on('click',function(){
                $('body').scrollTop(0);
                createPDF();
            });
//create pdf
            function createPDF(){
                getCanvas().then(function(canvas){
                    var
                        img = canvas.toDataURL("image/png"),
                        doc = new jsPDF({
                            unit:'px',
                            format:'a4'
                        });
                    doc.addImage(img, 'JPEG', 20, 20);
                    doc.save('techumber-html-to-pdf.pdf');
                    form.width(cache_width);
                });
            }

// create canvas object
            function getCanvas(){
                form.width((a4[0]*1.33333) -80).css('max-width','none');
                return html2canvas(form,{
                    imageTimeout:2000,
                    removeContainer:true
                });
            }
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
*/
        $scope.checkArrayEntity = function(entityArray, type){
            var tmp;
            var array = "$scope.array" + type;
            eval(array).forEach(function(entity,index){
                if(type != 'Groups'){
                    if (entity.os_index == entityArray.os_index){
                        tmp = entity.value;
                    }
                }
                else{
                    if(entity.index == entityArray._cpuset){
                        tmp = entity.value;
                    }
                }
            });
            return tmp;
        }

      /* $scope.checkPackage = function(Package){
            var tmp;
            $scope.arrayPackages.forEach(function(packages,index){
                if (packages.os_index == Package.os_index){
                    tmp = packages.value;
                }
            });
            return tmp;
        }

        $scope.checkNUMANodes = function(NUMANode){
           
            var tmp;
            $scope.arrayNUMANodes.forEach(function(entity,index){
                if (entity.os_index == NUMANode.os_index){
                    tmp = entity.value;
                }
            });
            return tmp;
        }*/

        $scope.checkGroups = function(group){
            return (group[0] != undefined);
        }

        /*$scope.ShowGroup = function(entity){
            var check;
            $scope.arrayGroups.forEach(function(group,index){
                if(group.index == $scope.entities.indexOf(entity)){
                    check = group.value;
                }
            });
            return check;
        }*/

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

        $scope.convertBusid = function(value){
            return value.substr(5, 7);
        }

        /*$scope.resize = function(array){
            return Math.round(100/array.length) + "%";
        }

        $scope.shareWidth = function(entity, other){
            console.log(entity);
            if(other){
                console.log("ok");
                return "50%";
            }
            else{
                return "100%";
            }
        }*/
    }
)


.controller('TestCtrl',function($scope,$timeout){
    function drawTree(array, index){
        var datasTree = array;

        var margin = {top: 30, right: 10, bottom: 30, left: 10};
        var width = 600;
        var barHeight = 20;

        var i = 0;

        var tree = d3.layout.tree().nodeSize([0, 30]);

        //Ensemble des noeuds
        var nodes = tree.nodes(datasTree);

        //Ensemble des liens
        var links = tree.links(nodes);

        var height = nodes.length*33;

        var svg = d3.select("#tree-" + index + "-" + datasTree.os_index)
        .append("svg")
            .attr("width", width)
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
          .attr("x", -barHeight / 2)
          .attr("height", 
            function (d) {
                if(d.type == "Bridge")
                    return barHeight;
                else
                    return barHeight;
            })
          .attr("width",
            function (d) {
                if(d.type == "Bridge")
                    return barHeight;
                else if(d.type == "PCIDev")
                    return 80;
                else if(d.type == "OSDev")
                    return 70;
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
          .attr("dx", 0)
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
          .style("opacity", 1);

        var link= svg.selectAll("path.link")
            .data(links)
          .enter().append("path")
            .attr("class", "link")
            .attr("d", elbow);  

    }

    function elbow(d, i) {
        return "M" + d.source.y*1.5 + "," + (d.source.x+8)*1.5
          + "V" + d.target.x*1.5 + "H" + (d.target.y-8)*1.5;
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
