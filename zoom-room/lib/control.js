function UndoStep(skip_animation){
    if(steps == 0) return;
    if(CheckIfAnimating()) return;
    
    let direction = path[path.length-1];
    let target = prevTargets.splice(-1,1)[0];
    let prev_target = prevTargets[prevTargets.length-1];
    let old_position = position.slice();
    if(direction === ZOOMOUT_CHAR){
        // Undo Zoom Out
        direction = getCancelledMove(path);
        position.push(direction);
        let pos_path = Num2Bin(position,2);
        let matches = worlds[this_world].contents.filter(function(gate){
            let gate_path = Num2Bin(gate.location,2);
            return (pos_path.length === gate_path.length && BoxZip.PathsMatch(pos_path, gate_path))
        });
        
        if(matches.length > 0){
            prevPositions.unshift(position);
            prevWorlds.unshift(this_world);
            let old_this_world = this_world;
            this_world = matches[0].world.id;
            let world_out = prevWorlds.length > 0 ? prevWorlds[0] : null;
            let a = new Animation(old_this_world, old_position, prevPositions[0], this_world, world_out);
            animations_forward.push(a);
            position = [];
        }else{
            let world_out = prevWorlds.length > 0 ? prevWorlds[0] : null;
            let a = new Animation(this_world, old_position, position, this_world, world_out);
            animations_forward.push(a);
        }
        travel_depth++;
    }else{
        // Undo Zoom In
        if(position.length > 0){
            position.splice(-1,1);
            let world_out = prevWorlds.length > 0 ? prevWorlds[0] : null;
            animations_forward.push(new Animation(this_world, old_position, position, this_world, world_out));
        }else if(prevWorlds.length > 0){
            position = prevPositions.shift();
            old_position = position.slice();
            position.splice(-1,1);
            let old_this_world = this_world;
            this_world = prevWorlds.shift();
            let world_out = prevWorlds.length > 0 ? prevWorlds[0] : null;
            animations_forward.push(new Animation(this_world, old_position, position, this_world, world_out));
        }
        travel_depth--;
        if(travel_depth < 0) travel_depth = 0;
    }

    if(targets[prev_target] !== targets[target_world]){
        points--;
    }
    target_world = prev_target;
    prev_path = path;
    path = path.slice(0,-1);
    steps--;
    prevTarget();
    updateOutputs();
    setHash(path);
}

function ZoomOut(skip_animation){
    if(position.length == 0 && prevWorlds.length == 0) return;
    if(CheckIfAnimating()) return;
    let old_position = position.slice();
    prev_path = path;
    path+=ZOOMOUT_CHAR;
    
    if(position.length > 0){
        position.splice(-1,1);
        steps++;
        let world_out = prevWorlds.length > 0 ? prevWorlds[0] : null;
        if(!skip_animation) animations_forward.push(new Animation(this_world, old_position, position, this_world, world_out));
    }else if(prevWorlds.length > 0){
        position = prevPositions.shift();
        old_position = position.slice();
        position.splice(-1,1);
        let old_this_world = this_world;
        this_world = prevWorlds.shift();
        let world_out = prevWorlds.length > 0 ? prevWorlds[0] : null;
        if(!skip_animation) animations_forward.push(new Animation(this_world, old_position, position, this_world, world_out));
        if(this_world == targets[target_world]){
            points++;
            nextTarget();
        }
        steps++;
    }

    prevTargets.push(target_world);

    travel_depth--;
    if(travel_depth < 0) travel_depth = 0;
    updateOutputs();
    setHash(path);
    if(!ANIMATE) update();
}

function ZoomIn(direction, skip_animation){
    let old_position = position.slice();
    if(CheckIfAnimating()) return;
    position.push(direction);
    prev_path = path;
    path+=""+direction;
    //animation_worlds.push(this_world);
    let pos_path = Num2Bin(position,2);
    let matches = worlds[this_world].contents.filter(function(gate){
        let gate_path = Num2Bin(gate.location,2);
        return (pos_path.length === gate_path.length && BoxZip.PathsMatch(pos_path, gate_path))
    });
    
    if(matches.length > 0){
        prevPositions.unshift(position);
        prevWorlds.unshift(this_world);
        let old_this_world = this_world;
        this_world = matches[0].world.id;
        let world_out = prevWorlds.length > 0 ? prevWorlds[0] : null;
        if(!skip_animation) animations_forward.push(new Animation(old_this_world, old_position, prevPositions[0], this_world, world_out));
        position = [];
        if(this_world == targets[target_world]){
            points++;
            nextTarget();
        }
    }else{
        let world_out = prevWorlds.length > 0 ? prevWorlds[0] : null;
        if(!skip_animation) animations_forward.push(new Animation(this_world, old_position, position, this_world, world_out));
    }

    prevTargets.push(target_world);
    
    steps++;
    travel_depth++;
    updateOutputs();
    setHash(path);
    if(!ANIMATE) update();
}
function restart(){
    _HALT = true;
    start();
}

function controller(event){
    if(event.defaultPrevented) return;
    var handled = false;
    var direction = -1;
    var key;
    if(event.key !== undefined){
        key = event.key;
    }else if(event.keyCode !== undefined){
        key = event.keyCode
    }
    key = key+"";

    if('qetuo4'.indexOf(key) > -1) direction = 0;
    if('wryip5'.indexOf(key) > -1) direction = 1;
    if('1adgjl'.indexOf(key) > -1) direction = 2;
    if('2sfhk;'.indexOf(key) > -1) direction = 3;

    if('0zxcvbnm,./ '.indexOf(key) > -1){
        ZoomOut();
        handled = true; 
    }

    if(direction !== -1 && !handled) {
        ZoomIn(direction);
        handled = true;
    }

    if(handled){
        updateInputSet(key);
        event.preventDefault();
    }
}
function sceneClick(e){
    //if(paused) return;
    var rect = scene.getBoundingClientRect();
    let border = parseFloat(getComputedStyle(scene,null).getPropertyValue('border-left-width'));
    var x = e.clientX - rect.left-border; //x position within the element.
    var y = e.clientY - rect.top-border;  //y position within the element.
    let location = 0;
    if(x >= scene.width / 2) location += 1;
    if(y >= scene.height / 2) location += 2;
    console.log(scene.width, scene.height, x,y, location);
    ZoomIn(location);
    if (e.stopPropagation) e.stopPropagation()
    else e.cancelBubble=true;
    return false;
}
