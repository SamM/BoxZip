let BoxZip = {};

BoxZip.AddressToPath = function(address, byteSize){
    let path = [];

    if(typeof byteSize != 'number' || byteSize < 1) byteSize = 1;
    byteSize = Math.round(byteSize);

    address.forEach(function(location){
        if(typeof location != 'number') return;
        path = path.concat(BoxZip.LocationToPath(location, byteSize));
    });

    while(byteSize > 1 && path.length % byteSize != 0) path.push(false);

    return path;
};
BoxZip.LocationToPath = function(location, byteSize){
    if(typeof location != 'number') return [];
    if(location < 0) location = -location;
    let a, n = location;
    let path = [];

    if(location === 0) path = [false];
    
    if(typeof byteSize != 'number' || byteSize < 1) byteSize = 1;
    byteSize = Math.round(byteSize);

    while (n > 0)
    {
        a = n % 2;
        path.push(a === 0 ? false : true);
        n = Math.floor(n / 2);
    }

    while(byteSize > 1 && path.length % byteSize != 0) path.push(false);

    return path;
};
BoxZip.PathsMatch = function(destination, beginnings){
    for(var i=0; i< destination.length; i++){
        if(i >= beginnings.length) return true;
        if(destination[i] != beginnings[i]) return false;
    }
    return true;
}
BoxZip.minus = function(path, begins, overwrite){
    while(path.length > 0 && begins.length > 0){
        if(path[0] == begins.shift()) path.shift();
        else if(overwrite) continue;
        else return path;
    }
    return path;
}
BoxZip.clamp = function clamp(v){
    if(typeof v != 'number') return 0;
    if(v === 0) return 0;
    if(v === 1) return 1;
    v = v % 1;
    if(v === 0) return 1;
    if(v < 0) return 1-v;
    return v;
};
BoxZip.unzip = function(path, into){
    // path : Array of booleans
    // into : Integer
    if(typeof into != 'number' || into < 2 || into > 3) into = 2;
    else into = Math.round(into);
    let axii = { x:[], y:[], z:[] };
    let i = 0;
    while(path.length > 0){
        for(i = 0; i < into; i++){
            if(path.length == 0) break;
            axii['xyz'[i]].push(path.shift());
        }
    }
    return axii;
}
BoxZip.setDepth = function(path, depth){
    // path : Array
    // depth : Integer
    if(typeof depth != 'number' || depth < 0) return path;
    while(path.length < depth) path.push(false);
    while(path.length > depth) path.splice(-1,1);
    return path;
}
BoxZip.isPath = function(path){
    if(!Array.isArray(path)) return false;
    for(var i=0; i<path.length; i++){
        if(typeof path[i] != 'boolean') return false;
    }
    return true;
}
BoxZip.PathToAddress = function(path, locationDepth){
    if(typeof locationDepth != 'number' || locationDepth < 1) locationDepth = 1;
    var i = 0;
    var location = 0;
    var address = [];
    var direction;
    for(var p=0; p<path.length; p++){
        direction = path[p];
        if(i!=0 && i % locationDepth == 0)
        {
            i = 0;
            address.push(location);
            location = 0;
        }
        if(direction) location += Math.pow(2, i);
        i++;
    }
    if(i!=0 && i % locationDepth == 0)
    {
        address.push(location);
    }
    return address;
}
BoxZip.roundDepth = function(path, byteSize){
    // path : Array
    // depth : Integer
    if(typeof depth != 'number' || depth < 0) return path;
    while(byteSize > 1 && path.length % byteSize != 0) path.push(false);
    return path;
}
/*/
//
/// BoxZip 1D - Line
//
/*/
BoxZip[1] = function(address, depth){
    // address : Array
    // depth : Integer
    if(!(this instanceof BoxZip[1])) return new BoxZip[1](address, depth);

    let private = {
        address : [],
        depth : 0
    };

    let self = this;

    this.setAddress = function(address){
        if(typeof address == 'number') address = [address];
        if(BoxZip.isPath(address)) address = BoxZip.PathToAddress(address);
        function convertBoolToInt(b){ return typeof b == 'boolean' ? (b ? 1 : 0) : b; }
        if(Array.isArray(address)) address = address.map(convertBoolToInt).filter(a=>typeof a == 'number');
        else return self;

        private.address = address;
        
        return self;
    };
    this.getAddress = function(){
        return private.address;
    }
    this.setDepth = function(depth){
        if(typeof depth == 'number'){
            if(depth > 0){
                private.depth = Math.round(depth);
            }
        }
        return self;
    }
    this.getDepth = function(){
        return private.depth;
    }

    this.setAddress(address);
    this.setDepth(depth == undefined ? this.getAddress().length : depth);

};

BoxZip[1].prototype.toPath = function(){
    return BoxZip.setDepth(BoxZip.AddressToPath(this.getAddress()), this.getDepth());
}
BoxZip[1].prototype.toArea = function(scale, offset){
    let a = 0, b = 1, c = 1;
    let path = this.toPath();
    path.forEach(function(BIT){
        if(BIT)  a += c / 2;
        else  b -= c / 2;
        c = c /2;
    });
    if(typeof scale == 'number'){
        a *= scale;
        b *= scale;
    }
    if(typeof offset == 'number'){
        a += offset;
        b += offset;
    }
    return [a, b];
};
/*/
//
/// BoxZip 2D - Squares
//
/*/
BoxZip[2] = function(address){
    // address : Array
    // depth : Integer
    if(!(this instanceof BoxZip[2])) return new BoxZip[2](address);

    let private = {
        address : []
    };

    let self = this;

    this.setAddress = function(address){
        if(typeof address == 'number') address = [address];
        if(BoxZip.isPath(address)) address = BoxZip.PathToAddress(address,2);
        function convertBoolToInt(b){ return typeof b == 'boolean' ? (b ? 1 : 0) : b; }
        if(Array.isArray(address)) address = address.map(convertBoolToInt).filter(a=>typeof a == 'number');
        else return self;

        private.address = address;
        
        return self;
    };
    this.getAddress = function(){
        return private.address;
    }

    this.setAddress(address);

};
BoxZip[2].prototype.toPath = function(){
    let path = BoxZip.AddressToPath(this.getAddress(), 2);
    return path;
}
BoxZip[2].prototype.toArea = function(){
    let location = BoxZip.unzip(this.toPath(), 2);
    return [BoxZip[1](location.x).toArea(), BoxZip[1](location.y).toArea()];
};
/*/
//
/// BoxZip 3D - Cubes
//
/*/
BoxZip[3] = function(address){
    // address : Array
    // depth : Integer
    if(!(this instanceof BoxZip[3])) return new BoxZip[3](address);

    let private = {
        address : []
    };

    let self = this;

    this.setAddress = function(address){
        if(typeof address == 'number') address = [address];
        if(BoxZip.isPath(address)) address = BoxZip.PathToAddress(address,3);
        function convertBoolToInt(b){ return typeof b == 'boolean' ? (b ? 1 : 0) : b; }
        if(Array.isArray(address)) address = address.map(convertBoolToInt).filter(a=>typeof a == 'number');
        else return self;

        private.address = address;
        
        return self;
    };
    this.getAddress = function(){
        return private.address;
    }

    this.setAddress(address);

};
BoxZip[3].prototype.toPath = function(){
    return BoxZip.AddressToPath(this.getAddress(), 3);
}
BoxZip[3].prototype.toArea = function(scale, offset){
    let location = BoxZip.unzip(this.toPath(), 3);
    return [BoxZip[1](location.x).toArea(), BoxZip[1](location.y).toArea(), BoxZip[1](location.z).toArea()];
};
/*/
/// Vector
/*/
BoxZip.Vector = function(x, y, z){
    if(!(this instanceof BoxZip[3].Vector)) return new BoxZip[3].Vector(x,y,z);
    
    let self = this;
    let private = {};

    let setter = key => value => { private[key] = BoxZip.clamp(value); };
    let getter = key => () => private[key];

    for(var i=0,k; i<3; i++){
        k = 'xyz'[i];
        Object.defineProperty(this, k, { get: getter(k), set: setter(k) });
        setter(k)(arguments[i]);
    }
}
BoxZip.Vector.prototype.toString = function(){
    return "BoxZip[3].Vector("+[this.x, this.y, this.z].join(',')+")";
}
/*/
/// Color
/*/
BoxZip.Color = function(r,g,b,a){
    if(!(this instanceof BoxZip.Color)) return new BoxZip.Color(r,g,b,a);
    
    let self = this;
    let private = {};

    let setter = key => value => { private[key] = BoxZip.clamp(value); };
    let getter = key => () => private[key];

    for(var i=0,k; i<4; i++){
        k = 'rgba'[i];
        Object.defineProperty(self, k, { get: getter(k), set: setter(k) });
        setter(k)(arguments[i]);
    }

    if(a === undefined) this.a = 1;

};
BoxZip.Color.prototype.blend = function(color){
    if(color instanceof BoxZip.Color){
        let r = (this.r + color.r) / 2;
        let g = (this.g + color.g) / 2;
        let b = (this.b + color.b) / 2;
        let a = (this.a + color.a) / 2;
        return new BoxZip.Color(r,g,b,a);
    }
    return this;
}
BoxZip.Color.prototype.difference = function(other){
    return (Math.abs(this.r - other.r) + Math.abs(this.g - other.g) + Math.abs(this.b - other.b)) / 3;
}
BoxZip.Color.prototype.toString = function(){
    let to256 = d=>Math.floor(d * 255);
    let to2dp = d=>Math.round(d * 100) / 100;
    return "rgba("+[to256(this.r), to256(this.g), to256(this.b), to2dp(this.a)].join(',')+")";
}