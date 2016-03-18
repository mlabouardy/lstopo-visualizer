angular.module('myApp')
    .factory('treeFactory',function(jsonObj){
        return {
            load: function(){
                var params = { entities:[], showCores: false, showNode: false, showPU: false, arrayPackages: [], arrayGroups: [], arrayNUMANodes: []}

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
                        params.arrayGroups.push({index : data._cpuset, os_index : data._depth , value : true, pciTree: []});
                        i++;
                        if(data.object){
                            extractDatas(data.object, array[array.length-1].children);
                        }
                    }
                    else if(data._type == "Package"){
                        array.push({type: data._type, os_index: data._os_index, children: []});
                        params.arrayPackages.push({os_index : data._os_index , value : true});
                        if(data.object){
                            extractDatas(data.object, array[array.length-1].children);
                        }
                    }
                    else if(data._type == "NUMANode"){
                        array.push({type: data._type, os_index: data._os_index, memory: data._local_memory, children: [], pciTree: []});
                        params.arrayNUMANodes.push({os_index : data._os_index , value : true});
                        params.showNode = true;
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
                        params.showCores = true;
                        if(data.object){
                            extractDatas(data.object, array[array.length-1].children);
                        }
                    }
                    else if(data._type == "PU"){
                        array.push({type: data._type, os_index: data._os_index});
                        params.showPU = true;
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
                        if(/^opencl.*/.test(data._name)){
                            array.push({type: data._type, name: data._name, info: data.info});
                        }
                        else{
                            array.push({type: data._type, name: data._name});
                        }
                        if(data.object){
                            extractPciDatas(data.object, array[array.length-1].children);
                        }
                    }
                }

                extractDatas(jsonObj.getJson(), params.entities);

                return params;
            }
        }
    })
