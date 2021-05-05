function World(i, color){
    this.id = i;
    this.color = i;
    this.contents = [];
    this.destinations = [];

    this.add =  function(gate) { this.contents.push(gate); };
    this.drawTo = function(canvas, position, offset, step, from_position) {
        let zoom_path = BoxZip[2](position).toPath();
        let offset_path = BoxZip[2](offset).toPath();
        let from_path = BoxZip[2](from_position).toPath();
        step = typeof step == 'number' ? step : 0;

        let zoom_area = BoxZip[2](zoom_path).toArea();
        let offset_area = BoxZip[2](offset_path).toArea();
        let from_area = BoxZip[2](from_path).toArea();

        let ss = WORLD_IMAGE_SIZE;
        let ds = canvas.width;
        let p = linear((1/ANIMATION_STEPS)*step);

        let sx = zoom_area[0][0];
        let sw = zoom_area[0][1] - sx;
        let sy = zoom_area[1][0];
        let sh = zoom_area[1][1] - sy;

        let dx = offset_area[0][0];
        let dw = offset_area[0][1] - dx;
        let dy = offset_area[1][0];
        let dh = offset_area[1][1] - dy;

        sx = (p*zoom_area[0][0])+((1-p)*from_area[0][0]);
        sw = (p*zoom_area[0][1])+((1-p)*from_area[0][1]) - sx;
        sy = (p*zoom_area[1][0])+((1-p)*from_area[1][0]);
        sh = (p*zoom_area[1][1])+((1-p)*from_area[1][1]) - sy;

        let ctx = canvas.getContext('2d');

        ctx.drawImage(this.canvas, sx*s,sy*s,sw*s,sh*s, dx*ds, dy*ds, dw*ds, dh*ds);
    };
    this.update = function(i){
        let canvas = this.canvas;
        let ctx = canvas.getContext('2d');
        let s = WORLD_IMAGE_SIZE;
        ctx.fillStyle = Color(this.color);
        ctx.fillRect(0,0,s,s);
        let id = this.id;
        this.contents.filter((gate)=>gate.world.id!==id).forEach((gate)=>gate.drawTo.call(gate, canvas));
        let same = this.contents.filter((gate)=>gate.world.id===id);
        for(var i=0; i<IMAGE_UPDATE_ITERATIONS;i++)
        same.forEach((gate)=>{
                gate.drawTo.call(gate, canvas);
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
Gate.prototype.drawTo = function(canvas, position){
    this.world.drawTo(canvas, position, this.location);
}

function Animation(world_from, position_from, position_to, world_to, outter_world){
    this.world_from = world_from;
    this.position_from = position_from;
    this.position_to = position_to;
    this.world_to = world_to;
    this.position_end = world_to === world_from ? position_to : [];
    this.world_out = outter_world;
}