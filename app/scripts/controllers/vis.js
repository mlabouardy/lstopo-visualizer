
angular.module('myApp')
    .controller('VisCtrl', function($location, jsonObj){
        this.draw = function(){
            // create an array with nodes
            var nodes = new vis.DataSet([
                {id: 1, label: 'Node 1', size: 500}
            ]);

            // create an array with edges
            var edges = new vis.DataSet([
                {from: 1, to: 2},
                {from: 3, to: 4}
            ]);

            // create a network
            var container = document.getElementById('mynetwork');
            var data = {
                nodes: nodes,
                edges: edges
            };
            var options = {nodes:{shape: "square"}, edges:{physics:false}, layout: {
                hierarchical: {
                    direction: "UD", parentCentralization: true
                }
            }, configure: true
            };
            var network = new vis.Network(container, data, options);

            function drawRect(context, position, color, width, number){
                var x = 500 - 50*number - 100*(number-1), y = 500 - 50;
                context.strokeStyle = '#A6D5F7';
                context.fillStyle = color;
                context.rect(position.x-x, position.y-y,width,width);
                context.fill();
                context.stroke();
            }

            network.on("initRedraw", function () {
                // do something like move some custom elements?
            });
            /*
             network.on("beforeDrawing", function (ctx) {
             var nodeId = 1;
             var nodePosition = network.getPositions([nodeId]);
             drawRect(ctx, nodePosition[nodeId], '#294475', 100);
             });*/

            network.on("afterDrawing", function (ctx) {
                var nodeId = 1;
                var nodePosition = network.getPositions([nodeId]);
                var data = [{},{},{},{},{}]

                for(var i = 0; i<data.length;++i){

                }
                drawRect(ctx, nodePosition[nodeId], '#A6D5F7', 100, 1);

                drawRect(ctx, nodePosition[nodeId], '#A6D5F7', 100, 2);
                drawRect(ctx, nodePosition[nodeId], '#A6D5F7', 100, 3);
                drawRect(ctx, nodePosition[nodeId], '#A6D5F7', 100, 4);
                drawRect(ctx, nodePosition[nodeId], '#A6D5F7', 100, 5);
                drawRect(ctx, nodePosition[nodeId], '#A6D5F7', 100, 6);
                ctx.beginPath();
                ctx.moveTo(600,-300);
                ctx.lineTo(600,400);
                ctx.stroke();
            });

        }
        this.draw()
    })
