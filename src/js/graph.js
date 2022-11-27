// Docs: https://docs.anychart.com/Basic_Charts/Network_Graph

anychart.onDocumentLoad(function() {
    return;
});

// create a chart and set the data
var chart = anychart.graph({nodes: [], edges: []});
// set chart container and draw
chart.container("container")
// set chart node listener
chart.listen('click', function(e) {
    var tag = e.domTarget.tag;
    if (tag) {
        console.log(`Clicked ${tag.type} with ID ${tag.id}`);
        if (tag.type == 'node') {
            var dat = tag.id;
            
            // in solver.js
            loadLevelFromNodeDat(dat);
            redraw()
            printLevel()
            // get attrib from data directly
            // var attrib;
            // for (var i = 0; i < data.nodes.length; i++) {
            //     if (data.nodes[i].id === tag.id) {
            //         attrib = data.nodes[i].attrib;
            //         break;
            //     }
            // }
        }
    }
})

function updateStateGraph(stateGraph) {
    var nodes = [...stateGraph.nodes.values()].map(function(arr) { return {id: arr.value} } )
    var edges = []
    for (let node of stateGraph.nodes.values()) {
        for (let dest of node.getAdjacents()) {
            edges.push({from: node.value, to: dest.value})
        }
    }
    console.log(nodes)
    console.log(edges)
    updateGraph(nodes, edges);
}

async function updateGraph(nodes, edges) {
    var data = {nodes: nodes, edges: edges};
    // create a chart and set the data
    // var chart = anychart.graph(data);
    chart.data(data)
    // set chart title
    chart.title("Graph Data (" + nodes.length + " nodes)");
    
    // set nodes size
    // nodes = chart.nodes();
    // nodes.normal().height(10);
    // nodes.hovered().height(30);
    // nodes.selected().height(40);
    // for (var ic = 0; ic < 500; ic+= 100) {
    // set chart layout
    chart.layout().iterationCount(100 + nodes.length);

    nodes = chart.nodes();
    nodes.normal().height(5);
    nodes.hovered().height(15);
    nodes.selected().height(20);
    // set chart container and draw
    chart.draw();
    await sleep(100);
    // }

    // alert(100)

}

function cleanGraph() {
    chart.data({nodes: [], edges: []})

}