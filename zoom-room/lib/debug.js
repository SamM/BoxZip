function debug(){
    if(!DEBUG) return;
    function sent(){
        return [].slice.call(arguments).join(' ');
    }
    worlds.forEach(world=>{
        console.log(sent('WORLD',world.id));
        console.log(sent('\tNumber of gates:', world.contents.length));
        console.log(sent('\tGates to self:', world.contents.filter(gate=>gate.world.id===world.id).length))
    })
}
debug.limits = {};
debug.once = function(id){
    if(id===undefined) return;
    if(typeof id !== 'string' && typeof id !== 'number') return;
    return function(){
        if(!DEBUG) return;
        if(debug.limits[id]) return;
        else debug.limits[id] = 1;
        console.log([].slice.call(arguments).join(' '));
    }
}
debug.some = function(id, max){
    if(id===undefined) return;
    if(typeof id !== 'string' && typeof id !== 'number') return;
    if(typeof max !== 'number') max = 1;
    return function(){
        if(!DEBUG) return;
        if(debug.limits[id] && debug.limits[id] >= max) return;
        if(debug.limits[id]) debug.limits[id]++;
        else debug.limits[id] = 1;
        console.log.apply(console.log, [id].concat([].slice.call(arguments)));
    }
}