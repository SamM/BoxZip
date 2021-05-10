function World(i, color){
    this.id = i;
    this.color = i;
    this.contents = [];
    this.destinations = [];

    this.add =  function(gate) { this.contents.push(gate); };
    this.drawTo = function(canvas, redraw_worlds, position, offset, step, from_position) {
        step = typeof step == 'number' ? step : 0;

        let zoom_area = BoxZip2(position);
        let offset_area = BoxZip2(offset);
        let from_area = BoxZip2(from_position);

        let ss = WORLD_IMAGE_SIZE;
        let ds = canvas.width;
        let p = linear((1/ANIMATION_STEPS)*step);

        let sx = zoom_area[1] - zoom_area[0]/2;
        let sw = zoom_area[0];
        let sy = zoom_area[2] - zoom_area[0]/2;
        let sh = zoom_area[0]

        let dw = offset_area[0];
        let dx = offset_area[1] - (dw/2);
        let dh = dw;
        let dy = offset_area[2] - (dh/2);
        
        sx = (p*sx)+((1-p)*(from_area[1] - from_area[0]/2));
        sw = (p*sw)+((1-p)*from_area[0]);
        sy = (p*sy)+((1-p)*(from_area[2] - from_area[0]/2));
        sh = (p*sh)+((1-p)*from_area[0]);

        let ctx = canvas.getContext('2d');

        ctx.drawImage(this.canvas, sx*ss,sy*ss,sw*ss,sh*ss, dx*ds, dy*ds, dw*ds, dh*ds);
        
        if(redraw_worlds){
            let pos = Num2Bin(position,2);
            this.contents.filter(gate=>{
                let loc = Num2Bin(gate.location,2);
                return BoxZip.PathsMatch(pos, loc);
            }).forEach(gate=>{
                gate.world.drawTo(canvas, false, [], Bin2Num(Num2Bin(gate.location).slice(pos.length)));
            });
        }
        
    };
    this.update = function(i){
        let canvas = this.canvas;
        let ctx = canvas.getContext('2d');
        let s = WORLD_IMAGE_SIZE;
        ctx.fillStyle = Color(this.color);
        ctx.fillRect(0,0,s,s);
        let id = this.id;
        this.contents.filter((gate)=>gate.world.id!==id).forEach((gate)=>gate.drawTo.call(gate, canvas, false));
        let same = this.contents.filter((gate)=>gate.world.id===id);
        for(var i=0; i<IMAGE_UPDATE_ITERATIONS;i++)
        same.forEach((gate)=>{
            gate.drawTo.call(gate, canvas, false);
        });
    }

    // World Image
    this.canvas = document.createElement('canvas');
    let s = WORLD_IMAGE_SIZE;
    this.canvas.height = this.canvas.width = s;
    this.canvas.className = "slide";
    
}

function Gate(place, world){
    this.location = place;
    this.world = world;
}
Gate.prototype.drawTo = function(canvas, redraw, position){
    this.world.drawTo(canvas, redraw, NumX(position,this.location,2), this.location);
}

function Animation(world_from, position_from, position_to, world_to, outter_world){
    this.world_from = world_from;
    this.position_from = position_from;
    this.position_to = position_to;
    this.world_to = world_to;
    this.position_end = world_to === world_from ? position_to : [];
    this.world_out = outter_world;
}

function BuildInitialPath(){
    for(var i = 0, next; i < worlds.length; i++){
        next = (i + 1) % worlds.length;
        let location = RandomLocation(worlds[i]);
        if(location !== 0) worlds[i].add(new Gate(location, worlds[next]));
    }
}

function PopulateWorlds(steps){
    if(typeof steps != 'number') return;
    if(steps <= 0) return;

    let world = RandomWorld();
    let world2 = RandomWorld();
    let location = RandomLocation(world2);

    if(location !== 0){
        let gate = new Gate(location, world);
        world2.add(gate);
    }

    PopulateWorlds(steps-1);
}

function PopulateToMin(min){
    if(typeof min != 'number') return;
    if(min <= 0) return;

    worlds.filter(world=>world.contents.length < min).forEach(world=>{
        let world2, location;
        while(world.contents.length < min){
            world2 = RandomWorld();
            location = RandomLocation(world);

            if(location !== 0){
                let gate = new Gate(location, world2);
                world.add(gate);
            }else{
                break;
            }
        }
    })
    
}

function RandomLocation(world){
    let locations_used = Array.isArray(world) ? world : typeof world == 'object' && Array.isArray(world.destinations) ? world.destinations : [];
    function randomize(){
        function RandomStep(){
            return Num2Bin(Math.floor(_random.level()*4),2);
        }
        let path = RandomStep();
        let i = 0;
        while(_random.level() > 0.5 || i < MIN_LOCATION){
            path = path.concat(RandomStep());
            i++;
            if(MAX_LOCATION <= i) break;
        }
        return Bin2Num(path);
        //return Math.pow(2,MIN_LOCATION)+OFFSET_LOCATION+Math.floor(_random.level()*Math.pow(2, MAX_LOCATION-MIN_LOCATION));
    }
    let location = randomize();
    function getIntersects(location1){
        let path1 = Num2Bin(location1, 2);
        return locations_used.filter((location2)=>{
            if(location2 === location1) return true;
            let path2 = Num2Bin(location2, 2);
            let same = 0;
            let ideal = Math.min(path2.length, path1.length);
            for(let i=0; i<ideal; i++){
                if(path1[i] === path2[i]) same++;
            }
            return same === ideal;
        }).length
    }
    
    let intersects = getIntersects(location);
    let tries = 500;
    while(intersects > 0){
        location = randomize();
        intersects = getIntersects(location);
        tries--;
        if(intersects > 0 && tries <= 0) return 0;
    }
    locations_used.push(location);
    return location;
}