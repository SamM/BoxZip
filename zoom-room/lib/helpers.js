function getHash(){
    let value = window.location.hash;
    if(value.length == 0 || value==="#") return '';
    return value.slice(1);
}
function setHash(value){
    window.location.hash = '#' + value;
    cancelHashChange=true;
}

function LevelLink(mode, level,color,target, keephash){
    let search = [mode,level,color,target].join('/');
    return location.href.split('#')[0].split('?')[0] + (search.length>0 ? '?'+search : '') + (keephash && location.href.indexOf('#') > -1? '#'+location.href.split('#').slice(1).join('#') : '');
}
function JumpToLevel(mode, level,color,target, keephash){
    location.href = LevelLink(mode, level,color,target, keephash);
}
function RandomSeed(){
    let seed = RandomWord(1 + Math.floor(Math.random()*2), Math.random()>0.5);
    if(Math.random()>0.5) seed += Math.floor(Math.random()*100000);
    if(Math.random()>0.85) seed += "!";
    return seed;
}
function linear(x){
    return x;
}
function easeOutCirc(x) {
    return Math.sqrt(1 - Math.pow(x - 1, 2));
}
function easeInOutQuart(x) {
    return x < 0.5 ? 8 * x * x * x * x : 1 - Math.pow(-2 * x + 2, 4) / 2;
}
function easeInOutCubic(x){
    return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
}
function clearCanvas(scene){
    let ctx = scene.getContext("2d");
    ctx.clearRect(0,0,scene.width,scene.height);
}
function ToggleSlides(){
    slides_toggle = !slides_toggle;
    document.getElementById('slides_modal').style.display = slides_toggle ? 'flex' : 'none';
}
function backgroundClick(){
    //if(paused) return;
    ZoomOut();
}

function clearWithTargetColor(canvas){
    let ctx = canvas.getContext('2d');
    let target = worlds[targets[target_world]];
    if(target){
        ctx.fillStyle = Color(target.color).toString();
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
}

function helpButtonClick(event){
    event.stopPropagation();
}

function cancelBGClick(event){
    event.stopPropagation();
}

function undoButtonClick(event){
    event.stopPropagation();
    UndoStep();
}

function closeSlidesButtonClick(event){
    event.stopPropagation();
    ToggleSlides();
}

function RandomMode(){
    let modes = Object.keys(_modes);
    let _mode = modes[Math.floor(Math.random()*modes.length)];
    while(_mode === mode){
        _mode = modes[Math.floor(Math.random()*modes.length)];
    }
    return _mode;
}

function NextMode(){
    let modes = _mode_order;
    let _mode = modes.indexOf(mode);
    if(_mode === -1) _mode = 0;
    else _mode = (_mode + 1) % modes.length;
    _mode = modes[_mode];
    return _mode;
}

function randomizeButtonClick(event){
    event.stopPropagation();
    let same = 1;
    JumpToLevel(RandomMode(),same?RandomSeed():level_seed,same?RandomSeed():color_seed,!same?RandomSeed():target_seed);
}
function RandomWorld(justIndex){
    if(justIndex) return Math.floor(_random.target()*worlds.length);
    return worlds[Math.floor(_random.level()*worlds.length)];
}

function RandomTarget(){
    return Math.floor(_random.target()*worlds.length);
}

function RandomColor(alpha){
    if(alpha === undefined) alpha = 1;
    function randomize(){
        let seq = BitSequence().D3;
        while(seq.length < COLOR_SEQ_LEN) seq.add(Math.floor(_random.color()*8));
        seq.add(COLOR_SEQ_SUFFIX);
        return BoxZip3.rgb(seq);
        return BoxZip.ColorFromHSL(_random.color(),COLOR_SATURATION_MIN+_random.color()*(COLOR_SATURATION_MAX-COLOR_SATURATION_MIN),COLOR_LIGHTNESSES[Math.floor(_random.color()*COLOR_LIGHTNESSES.length)],alpha);
    }
    let color = randomize();
    
    function colorMatch(used){
        return used.index.matches(color.index.toArray[0]);
    }

    function match(used){
        let diff = color.difference(used);
        return diff <= COLOR_THRESHOLD;
    }
    
    while(colors.filter(colorMatch).length > 0 ? colors.filter(match).length > 0 : false){
        color = randomize();
    }

    return color;
}
function Color(i, alpha){
    return (colors[i] || RandomColor(alpha)).toString()
}

function determineNextTarget(){
    let target = RandomTarget();
    while(target === (targets.length>0?targets[targets.length-1]:0)) target = RandomTarget();
    targets.push(target);
}
function determineNextColor(){
    colors.push(RandomColor());
}

function resizeCanvas(){
    size = window.innerHeight * 0.7;
    if(window.innerHeight >= window.innerWidth * 1.7) size = window.innerWidth * 0.9;
    scene.width = size;
    scene.height = size;
    let ctx = scene.getContext('2d');
    ctx.fillStyle = Color(worlds[this_world].color);
    ctx.fillRect(0,0,size,size);
}

function toVariable(str){
    if(str.toLowerCase() === 'true') return true;
    if(str.toLowerCase() === 'false') return false;
    if(str.indexOf(/[^0-9\.\+\-]/g) > -1) return str;
    let num = parseFloat(str);
    if(isNaN(num)) return str;
    else return num;
}

function nextTarget(){
    if(target_cache.length && target_cache.length > points){
        target_world = target_cache[points];
    } else {
        target_world++;
        if(target_world >= targets.length){
            while(target_world + 5 >= targets.length) determineNextTarget();
        }
        target_cache.push(target_world);
    }
    //let color = Color(worlds[targets[target_world]].color);
    //scene.style.border = color + " "+BORDER_WIDTH+" solid";
    //scene.style.backgroundColor = color;
}

function prevTarget(){
    //let color = Color(worlds[this_world].color);
    //scene.style.border = color + " "+BORDER_WIDTH+" solid";
    //scene.style.backgroundColor = color;
}
function validatePath(path){
    let p = path.split(/[^0123\-]+/i).join('');
    while(p[0]==ZOOMOUT_CHAR) p = p.slice(1);
    let c = 0;
    let i = '';
    let o = '';
    let v = '';
    while(c < p.length){
        if(p[c] == ZOOMOUT_CHAR){
            if(o.length<i.length){
                v+=ZOOMOUT_CHAR;
                o += ZOOMOUT_CHAR;
            }
        } else {
            i+=p[c];
            v+=p[c];
        }
        c++;
    }
    return v;
}
function updateSeedLinks(){
    document.getElementById('mode').innerText = mode;
    document.getElementById('level_seed').innerText = level_seed;
    document.getElementById('target_seed').innerText = target_seed;
    document.getElementById('color_seed').innerText = color_seed;
    document.getElementById('mode').href = LevelLink(NextMode(), level_seed, color_seed, target_seed);
    document.getElementById('level_seed').href = LevelLink(mode, '', color_seed, target_seed)
    document.getElementById('color_seed').href = LevelLink(mode, level_seed, '', target_seed, true)
    document.getElementById('target_seed').href = LevelLink(mode, level_seed, color_seed, '')
}

function ReplaySequence(seq){
    if(seq.length>0){
        for(let i=0; i<seq.length; i++){
            if("0123".indexOf(seq[i]) >-1) ZoomIn(parseInt(seq[i]), i!=seq.length-1);
            if(seq[i] == ZOOMOUT_CHAR) ZoomOut(i!=seq.length-1);
        }
    }
}
function calculateScore(points, steps){
    if(steps === 0) return 0;
    return Math.floor((points/steps)*2000);
}

function updateOutputs(){
    document.getElementById('score').innerText = points;
    document.getElementById('steps').innerText = steps;
    document.getElementById('depth').innerText = travel_depth;
    document.getElementById('overall').innerText = calculateScore(points, steps);
}

function updateInputSet(char){
    for(var i=0; i< inputSets.length; i++){
        if(inputSets[i].indexOf(char) > -1) {
            lastInput = i;
            return i;
        }
    }
    return -1;
}

function CheckIfAnimating(){
    return animation_step > 0;
}

function getCancelledMove(path){
    let i = 0;
    let n = 0;
    let dirs = '';
    while(i < path.length-1){
        if(path[i] == ZOOMOUT_CHAR){
            if(dirs.length > 0) dirs = dirs.slice(0,-1);
        }else{
            dirs += path[i];
        }
        i++;
    }
    return parseInt(dirs[dirs.length-1]);
}