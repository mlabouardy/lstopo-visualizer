 /*************
 **** DRAWING :
 **************/

var graph = new joint.dia.Graph;
var paper = new joint.dia.Paper({
	el: $('#myholder'),
	width: 1280,
	height: 2024,
	model: this.graph,
	gridSize: 1
});
var BRIDGE_SIZE = 10;
var PCI_COLLAPSE_OFFSET = 5;
var PCI_COLOR = "#bed295";
var ETH_SPACING = 5;
var ETH_COLOR = "#dedede";
var preDrawBuffer = [];

// Les petits carrés blancs...
var preDrawBridge = function(x, y) {
	var rect = new joint.shapes.basic.Rect({
        position: { x: x, y: y },
        size: { width: BRIDGE_SIZE, height: BRIDGE_SIZE },
        attrs: { rect: { fill: "white" } }
    });
	preDrawBuffer.push(rect);
	
	return rect;
}

// Les eth
var preDrawEth = function(x, y, name) {
	var rWdt = name.length * 10;
	var rHgt = 30;
	
	var rect = new joint.shapes.basic.Rect({
        position: { x: x, y: y},
        size: { width: rWdt, height: rHgt },
        attrs: { rect: { fill: ETH_COLOR }, text: { text: name, fill: "black" } }
    });
	preDrawBuffer.push(rect);
	
	return rect;
}

// Les PCI
var preDrawPCI = function(x, y, name, nbCollapses, ethNames) {
	var collRects = [];
	var ethRects = []
	var rWdt = name.length * 10;
	var rHgt = 30;
	var lstEthY = y + rHgt + ETH_SPACING;
	
	var rect = new joint.shapes.basic.Rect({
        position: { x: x, y: y},
        size: { width: rWdt, height: rHgt },
        attrs: { rect: { fill: PCI_COLOR }, text: { text: name, fill: "black", "ref-y": ETH_SPACING, "y-alignment": "top" } }
    });
	
	if ( typeof nbCollapses != "undefined" ){
		for ( var i = 0; i < nbCollapses; ++i ){
			collRects[i] = new joint.shapes.basic.Rect({
				position: { x: x + PCI_COLLAPSE_OFFSET * (i+1), y: y + PCI_COLLAPSE_OFFSET * (i+1) },
				size: { width: rWdt, height: rHgt },
				attrs: { rect: { fill: PCI_COLOR } }
			});
			rect.embed(collRects[i]);
		}
	}
	preDrawBuffer.push(collRects.reverse());
	preDrawBuffer.push(rect);
		
	if ( typeof ethNames != "undefined" ){
		for ( var i = 0; i < ethNames.length; ++i ){
			ethRects[i] = preDrawEth( x + ETH_SPACING, lstEthY, ethNames[i]);
			rect.embed(ethRects[i]);
			
			var nWdt = ethRects[i].get("size").width;
			rWdt = nWdt > rWdt ? nWdt : rWdt;
			lstEthY += ethRects[i].get("size").height + ETH_SPACING;
		}
		rHgt = (lstEthY - y) > rHgt ? lstEthY - y : rHgt;
		rect.resize(rWdt, rHgt);
		for ( var i = 0; i < collRects.length; ++i ) collRects[i].resize(rWdt, rHgt);
	}
	
	return rect;
}

// Point d'attache au milieu des liens
var preDrawJoint = function(x, y) {
	var rect = new joint.shapes.basic.Rect({
        position: { x: x, y: y },
        size: { width: 0, height: 0 },
        attrs: { rect: { fill: "black" } }
    });
	preDrawBuffer.push(rect);
	
	return rect;
}

var linkComponents = function(srcRect, dstRect) {
	var link = new joint.dia.Link({
        source: { id: srcRect.id },
        target: { id: dstRect.id }
    });
	preDrawBuffer.push(link);
	
	return link;
}

var drawGraph = function(){
	graph.addCells(preDrawBuffer);
}

/***********
 **** TREE :
 ***********/ 

var TY_BRIDGE = "bridge";
var TY_PCI = "pci";
var TY_JOINT = "joint";
var SIZE_LINK = 60;
var MARGIN_TOP = 50;
var BRANCH_Y_SPACING = 40;

var debugBranch = function(branch, recLvl){
	var strIndent = "";
	if ( recLvl == null ) recLvl = 0;
	else {
		for ( var i = 0; i < recLvl; ++i ) strIndent += "   ";
	}

	console.log(strIndent + " Branch contains : " + branch.nodes.length + " nodes.");
	console.log(strIndent + " Has " + branch.nbChildBranches + " direct child branches.");
	console.log(strIndent + " xLvl: " + branch.xLvl + " node(s) ;");
	console.log(strIndent + " yLvl: " + branch.yLvl + " node(s) ;");
	console.log(strIndent + " Pos: { " + branch.x + " ; " + branch.y + " } ;");
	console.log(strIndent + " Siz: { " + branch.w + " ; " + branch.h + " } ;");
	
	for ( var i = 0; i < branch.nodes.length; ++i )
		if ( branch.nodes[i].childBranch.nodes.length > 0 )
			debugBranch(branch.nodes[i].childBranch, recLvl + 1);
}

// DESSIN DE L'ARBRE :

var drawFuncts = [];

drawFuncts[TY_BRIDGE] = function(x, y, branch, node) {
	node.rect = preDrawBridge(x, y);
}

drawFuncts[TY_PCI] = function(x, y, branch, node) {
	node.rect = preDrawPCI(x, y, node.nodeParams.name, node.nodeParams.nbCollapses, node.nodeParams.ethNames);
}

drawFuncts[TY_JOINT] = function(x, y, branch, node) {
	node.rect = preDrawJoint(x, y);
}

var linkNodes = function(node, nextNode){
	if ( nextNode != null ){
		var yLink = node.branch.y + node.branch.h/2;
	
		var jnt = preDrawJoint(nextNode.rect.get("position").x - 3*SIZE_LINK/4, yLink);
		linkComponents(node.rect, jnt);
		linkComponents(jnt, nextNode.rect);
		
		node.rect.position(node.rect.get("position").x, node.branch.y + node.branch.h/2 - node.rect.get("size").height/2);
		nextNode.rect.position(nextNode.rect.get("position").x, nextNode.branch.y + nextNode.branch.h/2 - nextNode.rect.get("size").height/2);
		
		return jnt;
	}
	
	return null;
}

var drawTree = function(branch, rec, joint) {
	if ( rec == null ) rec = false;
	
	// Lien vers la branche mère :
	if ( joint != null ){
		var lowerJoint = null;
		lowerJoint = preDrawJoint(branch.x - SIZE_LINK/4, branch.y);
		linkComponents(joint, lowerJoint);
		
		if ( branch.nodes.length > 0 ){
			linkComponents( branch.nodes[0].rect, lowerJoint);//*/
		}
	}
	
	// Liens :
	var curNode = null;
	
	for ( var i = branch.nodes.length - 1; i > 0; --i ){
		var nextNode = branch.nodes[i];
		var curNode = branch.nodes[i-1];
		var newJoint = linkNodes(curNode, nextNode);
		
		// Sous-arbre :
		if ( curNode.childBranch.nodes.length != 0){
			endRec = false;
			drawTree(curNode.childBranch, true, newJoint);
		}
	}
	
	// Affichage :
	if ( rec == false ){
		drawGraph();
	}
}

// STRUCTURATION DE L'ARBRE : 
// Private :

var getTotalTreeHeight = function(tree){
	var res = tree.h + BRANCH_Y_SPACING;
	
	for ( var i = 0; i < tree.nodes.length; ++i ){
		var n = tree.nodes[i];
		if ( n.childBranch.nodes.length != 0 ){
			res += getTotalTreeHeight(n.childBranch);
		}
	}
	
	return res;
}

var getTotalTreeHeightFromRoot = function(anyBranch){
	return getTotalTreeHeight(getRoot(anyBranch));
}

var getRoot = function(branch){
	var res = branch;
	
	while ( res.parentNode != null )
		res = res.parentNode.branch;
	
	
	return res;
}

var getTotalHeightFrom = function(branch, source){
	var res = branch.y;
	
	var parentBranch = null;
	if ( branch.parentNode != null ){
		parentBranch = branch.parentNode.branch;
		if ( parentBranch !== source ){
			res += getTotalHeightFrom(parentBranch, branch);
		}
	}
	
	if ( source != null ){
		for ( var i = 0; i < branch.nodes.length; ++i ){
			var n = branch.nodes[i];
			if ( n.childBranch !== source && n.childBranch.nodes.length != 0 ){
				res += getTotalHeightFrom(n.childBranch, branch);
			}
		}
	}
	
	return res;
}

// Public :

var createBranch = function() {
	var res = {	xLvl: 0, yLvl: 0,
				x: MARGIN_TOP, y: MARGIN_TOP, 
				w: 0, h: 0,
				nbChildBranches: 0,
				parentNode: null,
				nodes : []};
	
	//pushNode(res, {type: TY_JOINT});
	
	return res;
}

var createNode = function() {
	return { nodeParams: null,
			 branch: null,
			 childBranch: null,
			 rect: null };
}

var pushNode = function(branch, nodeParams) {
	var newNode = createNode();
	var childBranch = createBranch();
		
	// Setting node :
	newNode.nodeParams = nodeParams;
	newNode.branch = branch;
	newNode.childBranch = childBranch;
	childBranch.parentNode = newNode;
	
	// Pre drawing node :
	var draFct = drawFuncts[nodeParams.type];
	if ( typeof draFct != "undefined" ) {
		draFct(
			branch.x + (branch.nodes.length) * SIZE_LINK,
			branch.y, 
			branch, newNode);
	} else {
		console.log("Erreur. Type inconnu");
	}
	
	// Pushing :
	var rectHeight = newNode.rect.get("size").height;
	if ( rectHeight >= branch.h )
		branch.h = rectHeight;
	branch.nodes.push(newNode);
	
	// Updating parent branch and child branch
	if ( branch.nodes.length == 1 && branch.parentNode != null){
		var parentBranch = branch.parentNode.branch;
		++parentBranch.nbChildBranches;
		
		branch.yLvl = parentBranch.yLvl + parentBranch.nbChildBranches + 1;
		
		var treehgt = getTotalTreeHeightFromRoot(parentBranch);
		var diff = treehgt - branch.y;
		
		drawTree(branch);
		newNode.rect.translate(0, diff);
		branch.y = treehgt;
	}
	childBranch.xLvl = branch.nodes.length;
	childBranch.yLvl = branch.yLvl + branch.nbChildBranches + 1;
	childBranch.x = branch.x + (childBranch.xLvl - 1) * SIZE_LINK;
	var treehgt = getTotalTreeHeightFromRoot(branch);
	childBranch.y = treehgt + branch.h + BRANCH_Y_SPACING;
	
	return newNode;
}

var pushBridge = function(branch) {
	return pushNode(branch, {type: TY_BRIDGE} );
}

var pushPCI = function(branch, name, nbCollapses, ethNames){
	if ( branch.nodes.length == 0 ) {
		pushNode(branch, {type: TY_JOINT});
	}

	return pushNode(branch, {type: TY_PCI, name: name, nbCollapses: nbCollapses, ethNames: ethNames} );
}