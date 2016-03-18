angular.module('myApp')
    .controller('VisualizerCtrl', function($scope, $location, treeFactory, $timeout){
            // variables for display or not elements
            $scope.loaded=false;
            $scope.showL1 = false;
            $scope.showL2 = false;
            $scope.showL3 = false;
            var treeParams = treeFactory.load();
            $scope.entities = treeParams.entities;
            $scope.showCores = treeParams.showCores;
            $scope.showNode = treeParams.showNode;
            $scope.showPU = treeParams.showPU;
            $scope.arrayPackages = treeParams.arrayPackages;
            $scope.arrayGroups = treeParams.arrayGroups;
            $scope.arrayNUMANodes = treeParams.arrayNUMANodes;
            $scope.alignement = [{alignement : "vertical", value :true}, {alignement : "horizontal" , value : false}];
            $scope.zoom = 1;
            var componentsChoice = [{name:"Pu" , value : true} , {name : "Groups" , value : true}, {name : "Packages" , value : true},  {name : "NUMANodes" , value : true}]
            $scope.font_size = 14;
            var i = 0;

            $scope.cacheType = function(entity,type){
                if(entity == type){
                    if (type == 'L3Cache'){
                        $scope.showL3 = true;
                    }
                    if (type == 'L2Cache'){
                        $scope.showL2 = true;
                    }
                    if (type == 'L1Cache'){
                        $scope.showL1 = true;
                    }
                    return true;
                }
                else{
                    return false;
                }
            }

            $scope.convertMemory = function(value){
                var i = 0;
                var unity = "B";
                var tmp = value;
                while (tmp > 10000)
                {
                    i += 1;
                    tmp = Math.round(value/Math.pow(1024, i))
                    if(i==1){
                        unity = "KB";
                    }
                    else if(i==2){
                        unity = "MB";
                    }
                    else if(i==3){
                        unity = "GB";
                    }
                    else if(i==4){
                        unity = "TB";
                    }
                }
                return tmp+unity;
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
                    ,
                    {
                        name:"PCI",
                        ticked:true
                    }
                ],
                export:"PDF"
            }

            $scope.userConfig={
                show:[],
                arrayPackages:[],
                arrayGroups:[],
                arrayNUMANodes:[],
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
                        "name":"NUMANodes",
                        "color":"#D2E7A4"
                    }
                    ,
                    {
                        "name":"Node",
                        "color":"#EFDFDE"
                    }
                    ,
                    {
                        "name":"Packages",
                        "color":"#DEDEDE"
                    }
                    ,
                    {
                        "name":"Groups",
                        "color":"white"
                    }
                ]
            };

            $scope.importConfig=function(){
                var xml = document.getElementById('file').files[0];
                var reader = new FileReader();
                reader.readAsText(xml);

                reader.onload = function(evt){
                    $scope.$apply(function() {
                        var data=JSON.parse(evt.target.result.toString());
                        $scope.userConfig.colors=data.colors;
                        toastr.success('User config successfuly imported !',"Lstopo Visualizer");
                    });
                };
            }

            $scope.alignementComponents = function(component){
                var tmp;
                componentsChoice.forEach(function(compo,index){
                    if(compo.name == component){
                        return tmp = compo.value;
                    }
                });
                return tmp;
            }

            $scope.checkComponent = function(component){
                if (component.name == "Packages" || component.name == "Groups" || component.name == "NUMANodes" ){
                    return $scope.checkArray(eval("$scope.array" + component.name));
                }
                else{
                    return eval("$scope.show" + component.name);
                    //return true;
                }
            }

            $scope.reset = function (){
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
                            "name":"NUMANodes",
                            "color":"#D2E7A4"
                        }
                        ,
                        {
                            "name":"Node",
                            "color":"#EFDFDE"
                        }
                        ,
                        {
                            "name":"Packages",
                            "color":"#DEDEDE"
                        }
                        ,
                        {
                            "name":"Groups",
                            "color":"white"
                        }
                    ]
                };
            }

            $scope.changeSize = function (ope){

                var tailleMax = 17;
                var tailleMin= 7;
                if (ope =="+"){

                    $scope.font_size ++ ;
                    if($scope.font_size >= tailleMax ){
                        $scope.font_size = tailleMax;
                    }
                }
                else{
                    $scope.font_size -- ;
                    if($scope.font_size <= tailleMin ){
                        $scope.font_size = tailleMin;

                    }
                }
            }

            $scope.exportConfig=function(){
                var blob = new Blob([JSON.stringify($scope.userConfig)], {type: "application/json"});
                saveAs(blob, "config.json");
                toastr.success('User config successfuly saved !',"Lstopo Visualizer");
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
                        taintTest:true,
                        onrendered: function(canvas) {
                            canvas.toBlob(function(blob) {
                                saveAs(blob, "components.png");
                            });
                        }
                    });
                }
            }
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

            $scope.checkArray = function(group){
                return (group[0] != undefined);
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

            $scope.resizeCaches = function(){
                var cores = document.getElementsByClassName('core');
                for(var i=0; i<cores.length; i++){
                    cores[i].setAttribute("style","width:100px");
                }

                var cache2 = document.getElementsByClassName('cache2');
                var cache3 = document.getElementsByClassName('cache3');
                for(var i=0; i<cache3.length; i++){
                    cache3[i].setAttribute("style","width:"+((cache2.length*100)+(10*cache2.length))/cache3.length+"px");
                }
            }



            // PCI draw
            function initTree(array, index){
                var canvas = document.getElementById('tree-' + index + '-' + array.os_index);

                var widthTree = (computeWidthTree(array.children)-2)*60+220;

                canvas.height = computeHeightTree(array.children);
                canvas.width = widthTree;

                var context = canvas.getContext('2d');

                var x = 10;
                var y = 10;

                //First shape of Bridge type
                context.beginPath();
                context.rect(10, 10, 10, 10);
                context.fillStyle = 'white';
                context.fill();
                context.lineWidth = 2;
                context.strokeStyle = 'black';
                context.stroke();

                drawLevel(array.children, context, x, y);

            }

            function computeHeightTree(datas){
                var sum = 0;
                for(var i=0; i<datas.length; i++){
                    if(datas[i].type == "Bridge"){
                        sum += datas[i].children.length*85;
                    }
                    else{
                        sum += 80;
                    }
                }
                return sum;
            }

            function computeWidthTree(datas){
                var maxDepth = 1;
                for(var i=0; i<datas.length; i++){
                    if(datas[i].children){
                        var depth = computeWidthTree(datas[i].children) + 1;
                    }
                    if(depth > maxDepth){
                        maxDepth = depth;
                    }
                }
                return maxDepth;
            }

            function drawLevel(datas, context, x, y){
                for(var i=0; i<datas.length; i++){
                    if(datas[i].type == "Bridge"){
                        var oldX = x;
                        var oldY = y;

                        //If it's the first element, we draw a straight line
                        if(i == 0){
                            x += 50;
                            makeSimpleLink(context, x, y+5, oldX+10);
                        }

                        //If not, we draw an elbow
                        else{
                            y += (datas[i-1].children.length)*85;
                            makeElbowLink(context, x, y+5, oldX, oldY+5);
                        }

                        //Draw a square of Bridge type
                        context.beginPath();
                        context.rect(x, y, 10, 10);
                        context.fillStyle = 'white';
                        context.fill();
                        context.lineWidth = 2;
                        context.strokeStyle = 'black';
                        context.stroke();

                        if(datas[i].children){
                            drawLevel(datas[i].children, context, x, y);
                        }
                    }
                    else if(datas[i].type == "PCIDev"){

                        var oldX = x;
                        var oldY = y;
                        if(i == 0){
                            x += 80;
                            makeSimpleLink(context, x, y+5, oldX+10);
                        }
                        else{
                            y += 80;
                            makeElbowLink(context, x, y+5, oldX, oldY+5);
                        }

                        //Draw a rectangle of PCI type set with its content
                        context.beginPath();
                        if(datas[i].children.length != 0){
                            if(datas[i].children[0].info){
                                context.rect(x, y-8, 130, 80);
                            }
                            else{
                                context.rect(x, y-8, 80, 50);
                            }
                        }
                        else{
                            context.rect(x, y-8, 80, 30);
                        }
                        context.fillStyle = '#BED295';
                        context.fill();
                        context.lineWidth = 2;
                        context.strokeStyle = 'black';
                        context.stroke();

                        //Draw informations about this element
                        context.font = "12px Arial";
                        context.fillStyle = "black";
                        context.fillText("PCI "+convertBusid(datas[i].pci_busid), x+10, y+10);

                        if(datas[i].children){
                            drawLevel(datas[i].children, context, x, y);
                        }
                    }
                    else if(datas[i].type == "OSDev"){
                        context.beginPath();
                        if(datas[i].info){
                            context.rect(x+10, y+15, 110, 50);
                        }
                        else{
                            context.rect(x+10, y+15, 60, 20);
                        }
                        context.fillStyle = '#DEDEDE';
                        context.fill();
                        context.lineWidth = 2;
                        context.strokeStyle = 'black';
                        context.stroke();

                        context.font = "12px Arial";
                        context.fillStyle = "black";
                        if(datas[i].info){
                            context.fillText(datas[i].name, x+15, y+30);
                            context.fillText(searchNumberOfUnit(datas[i].info)+" compute units", x+15, y+45);
                            context.fillText(searchMemorySize(datas[i].info), x+15, y+60);
                        }
                        else{
                            context.fillText(datas[i].name, x+30, y+30);
                        }
                    }
                }
            }

            function searchNumberOfUnit(datas){
                for(var i=0; i<datas.length; i++){
                    if(datas[i]._name == "OpenCLComputeUnits"){
                        return datas[i]._value;
                    }
                }
            }

            function convertMemory(value){
                var i = 0;
                var unity = "B";
                var tmp = value;
                while (tmp > 10000)
                {
                    i += 1;
                    tmp = Math.round(value/Math.pow(1024, i))
                    if(i==1){
                        unity = "KB";
                    }
                    else if(i==2){
                        unity = "MB";
                    }
                    else if(i==3){
                        unity = "GB";
                    }
                    else if(i==4){
                        unity = "TB";
                    }
                }
                return tmp+unity;
            }

            function searchMemorySize(datas){
                for(var i=0; i<datas.length; i++){
                    if(datas[i]._name == "OpenCLGlobalMemorySize"){
                        return convertMemory(datas[i]._value);
                    }
                }
            }

            function makeElbowLink(context, x, y, oldX, oldY){
                //Firt horizontal line
                context.beginPath();
                context.moveTo(x, y);
                context.lineTo(x-25, y);
                context.stroke();

                //Vertical line
                context.beginPath();
                context.moveTo(x-25, y);
                context.lineTo(x-25, oldY);
                context.stroke();

                //Second horizontal line
                context.beginPath();
                context.moveTo(x-25, oldY);
                context.lineTo(oldX, oldY);
                context.stroke();
            }

            function makeSimpleLink(context, x, y, oldX){
                context.beginPath();
                context.moveTo(oldX, y);
                context.lineTo(x, y);
                context.stroke();
            }

            function convertBusid(value){
                return value.substr(5, 7);
            }

            $scope.begin=function(array, index){
                $timeout(function() {
                    initTree(array, index);
                }, 0);
            }
        }
    )
