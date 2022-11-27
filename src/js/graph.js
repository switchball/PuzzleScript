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

async function updateGraph(nodes, edges) {
    var data = {nodes: nodes, edges: edges};
    // create a chart and set the data
    // var chart = anychart.graph(data);
    chart.data(data)
    // set chart title
    chart.title("Graph Data (" + nodes.length + " nodes)");
    
    // for (var ic = 0; ic < 500; ic+= 100) {
        // set chart layout
        chart.layout().iterationCount(50 + nodes.length);
        // set chart container and draw
        chart.draw();
        await sleep(100);
    // }

    // alert(100)

}

function cleanGraph() {
    chart.data({nodes: [], edges: []})

}