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

    bfs(2048, updateGraph)

    // restoreLevel(cache[0])
    // var r1 = processInput(1, true, false)
    // var r2 = processInput(1, true, false)
    // var r3 = processInput(3, true, true)
    printLevel()
    redraw()
}

async function bfs(limit=10, updateGraphHandler) {
    var textDecoder = new TextDecoder()
    var dontDoWin = true;
    var iteration = 0;
    var temp, rootLevel, rootDat, subDat;
    var cache = [];
    var levelSet = new Set([]);
    cache.push(backupLevel())

    var nodes = [];
    var edges = [];

    while (cache.length > 0 && cache.length <= limit && iteration <= limit) {
        // shift the first level element
        rootLevel = cache.shift()
        rootDat = textDecoder.decode(rootLevel.dat)
        if (levelSet.has(rootDat)) {
            console.log('visited')
            continue;
        }
        levelSet.add(rootDat)
        if (iteration == 0) {
            nodes.push({id: rootDat, normal: {height: 40, shape: "diamond", fill: "#00bfa5", stroke: null}})   // 添加到 nodes 数组中
        } else {
            nodes.push({id: rootDat})
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
            // 添加一条边
            nodes.push({id: subDat})
            edges.push({from: rootDat, to: subDat})
            if (levelSet.has(subDat)) {
                // level already visited or to be expanded
            } else {
                cache.push(temp)
            }
            restoreLevel(rootLevel)
        }
        await sleep(5)
        redraw()
        iteration ++;
        console.log('iteration = ' + iteration  + ", #visited state = " + levelSet.size + ' => #to-visit = ' + cache.length)
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
    redraw()
    printLevel()
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