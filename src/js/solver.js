async function solverClick_Fn() {
    // compile(["loadLevel", 0]);
    printLevel();
    // alert('start')
    consolePrint('solve start')
    var action, r;
    var cache = []
    for (var k = 0; k < 0; k++) {
        action = getRandomInt(4);
        r = processInput(action, true, false)
        isWin = checkWin()
        consolePrint(k + " " + action + ", is win = " + isWin)
        console.log(level.objects)

        if (k % 5 == 0) {
            cache.push(backupLevel())
            await sleep(1000)
            consolePrint(level.objects)
        }
        // printLevel()
        redraw()
        await sleep(50)
        if (isWin) break;
    }

    // bfs(2048, updateGraph)

    stateGraph = stateSearch()
    updateStateGraph(stateGraph)

    // restoreLevel(cache[0])
    // var r1 = processInput(1, true, false)
    // var r2 = processInput(1, true, false)
    // var r3 = processInput(3, true, true)
    printLevel()
    redraw()
}

// function featureSpace
// 指定搜索的特征空间

function groupFn(levelDat) {
    // levelDat: 已转成文本的关卡数据
    const levelArr = new Int32Array(str2ab(levelDat));
    return levelArr
    // 也可以用 level.objects
}

function stateSearch(limit=1000) {
    const textDecoder = new TextDecoder()
    const graph = new Graph(Graph.DIRECTED);
    var dontDoWin = true;
    var iteration = 0;
    var rootLevelDat, subLevelDat;
    var start = backupLevel();

    var startDat = textDecoder.decode(start.dat);
    // var startDat = start.dat.toString()
    
    // 添加初始状态，并开始搜索
    const startDatNode = graph.addVertex(startDat)
    var nodeGenerator = graph.bfs(startDatNode);

    for (let node of nodeGenerator) {
        rootLevelDat = node.value;
        loadLevelFromNodeDat(rootLevelDat)    // 从编码中恢复关卡，并且调用 restoreLevel(...)
        
        // 获取当前关卡的特征，使用 level.objects
        feature = [...level.objects].map((value, index) => { if ((value & 16) > 0) {return index} }).filter(e => e >= 0);
        node.setGroup(feature);
        console.log(node);

        // for each action
        for (var action = 0; action < 4; action++) {
            processInput(action, dontDoWin, false)
            subLevelDat = textDecoder.decode(backupLevel().dat);
            if (graph.hasVertex(subLevelDat)) {
                // 状态已存在，连一条边即可
                graph.addEdge(rootLevelDat, subLevelDat);
            } else {
                // 状态不存在，建节点 + 连边
                graph.addEdge(rootLevelDat, subLevelDat);
            }

            isWin = checkWin(dontDoWin)
            if (isWin) {
                // nodes.push({
                //     id: 'end', 
                //     normal: {height: 40, shape: "star5", fill: "#ffa000", stroke: null}
                // })
                // edges.push({from: rootDat, to: 'end'})
                consolePrint('iteration = ' + iteration )
                // await sleep(10)
                redraw()
                // updateGraphHandler(nodes, edges)
                return graph
            }
            loadLevelFromNodeDat(rootLevelDat);
        }
        console.log(graph)

        iteration ++;

        if (iteration > limit) {
            consolePrint('iteration exceed ' + limit + " abort!")
            return graph;
        }
    }

    console.log('stateSearch ' + iteration + " iteration(s)")
    return graph
}

async function bfs(limit=10, updateGraphHandler) {
    var textDecoder = new TextDecoder()
    var dontDoWin = true;
    var iteration = 0;
    var temp, rootLevel, rootDat, subDat;
    var cache = [];
    var levelSet = new Set([]);

    cache.push(backupLevel())
    console.log('level = ')

    var nodes = [];
    var edges = [];

    while (cache.length > 0 && cache.length <= limit && iteration <= limit) {
        if (levelSet.size != nodes.length) {
            console.log('Diff! #levelSet =' + levelSet.size + ', #nodes =' + nodes.length)
        } 
        // shift the first level element
        rootLevel = cache.shift()
        rootDat = textDecoder.decode(rootLevel.dat)
        if (iteration == 0) {
            levelSet.add(rootDat)
            nodes.push({id: rootDat, normal: {height: 40, shape: "diamond", fill: "#00bfa5", stroke: null}})   // 添加到 nodes 数组中
        }
        restoreLevel(rootLevel)    // NOTE: 当状态过多时，可能需要调用 consolidateDiff 来优化
        // for each action
        for (var action = 0; action < 4; action++) {
            processInput(action, dontDoWin, false)
            isWin = checkWin(dontDoWin)
            if (isWin) {
                nodes.push({
                    id: 'end', 
                    normal: {height: 40, shape: "star5", fill: "#ffa000", stroke: null}
                })
                edges.push({from: rootDat, to: 'end'})
                consolePrint('iteration = ' + iteration  + ", #visited state = " + levelSet.size + ' => #to-visit = ' + cache.length)
                await sleep(10)
                redraw()
                updateGraphHandler(nodes, edges)
                return
            }

            temp = backupLevel()
            subDat = textDecoder.decode(temp.dat)
            if (levelSet.has(subDat)) {
                // level already visited or to be expanded
                console.log('expanded!')
            } else {
                levelSet.add(subDat)
                cache.push(temp)
                nodes.push({id: subDat})
            }
            // 添加一条边
            edges.push({from: rootDat, to: subDat})
            restoreLevel(rootLevel)
        }
        iteration ++;
        await sleep(5)
        redraw()
        console.log('iteration = ' + iteration  + ", #visited state = " + levelSet.size + ' => #to-visit = ' + cache.length)
    }
}

function ab2str(buf) {
    return String.fromCharCode.apply(null, new Uint16Array(buf));
}
function str2ab(str) {
    var buf = new ArrayBuffer(str.length*2); // 2 bytes for each char
    var bufView = new Uint16Array(buf);
    for (var i=0, strLen=str.length; i < strLen; i++) {
        bufView[i] = str.charCodeAt(i);
    }
    return buf;
}

function level2str(level) {
    return ab2str(level.dat.buffer);
}

function str2level(str) {
    // just use str2level().dat is fine to get Array Info
    return {
        dat : new Int32Array(str2ab(str)),
		width : level.width,
		height : level.height,
		oldflickscreendat: oldflickscreendat.concat([])
    }
}

function loadLevelFromNodeDat(nodeDat) {
    var encoder = new TextEncoder();
    var x = encoder.encode(nodeDat);

    // get current level setting
    var ret = {
		dat : new Int32Array(x.buffer),
		width : level.width,
		height : level.height,
		oldflickscreendat: oldflickscreendat.concat([])
	};
    restoreLevel(ret);
}

// QUESTION?
// 如何实现用 Z 来撤销状态？
//   addUndoState(state) in engine.js，其内部会有个 consolidateDiff 函数来实现状态的压缩
//   backupLevel() 会将 level.objects 装在到一个字典对象里，记做 level
//   restoreLevel(level) 会把当前状态修改为 level 所描述的状态

function getRandomInt(max) {
    return Math.floor(Math.random() * max);
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}


// NOTES:
// 从 editor.html 按钮中找到 level editor，进而找到加载关卡的函数 loadFile (in compiler.js），
// 从中找到一个名为 codeMirrorFn 的处理类（in parser.js）

// 如何 loadState?
//  compile(["loadLevel", 0]);
//  alert(state)

// 关卡数据？
//   全局变量 state.levels 中存储了关卡的 **初始状态**
//   全局变量 level 中存储了当前加载的关卡的 **当前状态**

//   使用 printLevel 函数（in inputoutput.js）可以在控制台打印当前关卡的状态。（快捷键：P）

// 操作交互？
//   使用 pushInput() 将操作序列放入缓存中
//   使用 processInput(inputdir) 交互来改变当前关卡状态
//   使用 redraw() 来更新画布内容

// 如何确认到达了胜利条件
//   使用 checkWin 函数来判断