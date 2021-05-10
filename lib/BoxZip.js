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
BoxZip.PathToLocation = function(path){
    var i = 0;
    var location = 0;
    var direction;
    for(var p=0; p<path.length; p++){
        direction = path[p];
        if(direction) location += Math.pow(2, i);
        i++;
    }
    return location;
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
BoxZip.ColorFromHSL = function(h,s,l,a){
    var r, g, b;

    if(s == 0){
        r = g = b = l; // achromatic
    }else{
        var hue2rgb = function hue2rgb(p, q, t){
            if(t < 0) t += 1;
            if(t > 1) t -= 1;
            if(t < 1/6) return p + (q - p) * 6 * t;
            if(t < 1/2) return q;
            if(t < 2/3) return p + (q - p) * (2/3 - t) * 6;
            return p;
        }

        var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        var p = 2 * l - q;
        r = hue2rgb(p, q, h + 1/3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1/3);
    }
    
    return new BoxZip.Color(r,g,b,a);
}
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

// New Development follows


BoxZip.LocationToDepth = function(address){
    if(address === 0) return 1;
    if(address < 0) address = -address;
    let d = 0;
    let n = Math.pow(2, d);
    while(n<=address){
        n = Math.pow(2, ++d);
    }
    return d;
};

BoxZip.PathToInt = function(path){
    if(!Array.isArray(path)) return Infinity;
    let d = 0;
    let int = 0;
    for(let i=0; i<path.length; i++){
        if(path[i]) int += Math.pow(2, i);
    }
    return int;
}
function R(index){
    if(Array.isArray(index)) return index.map(R);
    if(index === Infinity || typeof index !== 'number') return 1;
    let neg = (index < 0) ? -1 : 1;
    if(index < 0) index = -index;

    if(index === 0) return 0;
    //if(index === 1) return 0.5;
    
    let path = BoxZip.LocationToPath(index, BoxZip.LocationToDepth(index));
    let dec = 0.5;
    let i = 1;
    while(i < path.length){
        if(path[i-1]){
            dec += 1/Math.pow(2, i+1);
        }else{
            dec -= 1/Math.pow(2, i+1);
        }
        i++;
    }
    return dec * neg;
}

console.log("R(Infinity) = "+R(Infinity));
for(let i = 0; i <= 100; i++) console.log("R("+i+") = "+R(i));

console.log("# L()");

function L(index){
    if(typeof index !== 'number') index = Infinity;
    if(index < 0) index = -index;
    if(index === Infinity) return [R(Infinity), 1];
    /*
    let path = BoxZip.LocationToPath(index, BoxZip.LocationToDepth(index));
    
    let X = [];
    let Y = [];
    let addX = true;
    path.forEach(bit=>{
        if(addX) X.push(bit);
        else Y.push(bit);
        addX = !addX;
    })
    if(!addX) Y.push(0);
    */
    let ratio = R(index)
    let depth = 1 / Math.pow(2, BoxZip.LocationToDepth(index)-1);

    //if(X > 0) X = X-1===0?Infinity:X-1;
    //if(Y > 0) Y = Y-1===0?Infinity:Y-1;
    
    return [ratio,depth];
}
//for(let i = 0; i <= 100; i++) console.log("L("+i+") = "+L(i));

function Num2Bin(location, byteSize){
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
}

function Bin2Num(path){
    if(!Array.isArray(path)) return Infinity;
    let d = 0;
    let int = 0;
    for(let i=0; i<path.length; i++){
        if(path[i]) int += Math.pow(2, i);
    }
    return int;
}

function BitDepth(location){
    if(location === 0) return 1;
    if(location < 0) location = -location;
    let d = 0;
    let n = Math.pow(2, d);
    while(n<=location){
        n = Math.pow(2, ++d);
    }
    return d;
}

function NumX(a,b){
    return Bin2Num(Num2Bin(a).concat(Num2Bin(b-1)));
}

function BinX(a,b){
    return a.concat(b);
}

function BoxZip1(){
    function Make(){
        let x = 0.5;
        let w = 1;
        function Step(index){
            if(typeof index !== 'number') return null;
            let path = Num2Bin(index, BitDepth(index));
            let i = 0;
            while(i < path.length){
                w = w/2;
                if(path[i])  x += w/2; // 1/Math.pow(2, i+1);
                else x -= w/2; //1/Math.pow(2, i+1);
                i++;
            }
        }
        [].slice.call(arguments).forEach(Step);
        return [w,x];
    }
    let address = [].slice.call(arguments).filter(index=>typeof index === 'number');
    if(this instanceof BoxZip1){
        this.x = x;
        this.w = w;
        this.i = address.length == 1 ? address[0] : address;
        this.setI = function(i){
            if(typeof i !== 'number') return null;
            let wx = Make(i);
            this.w = wx[0];
            this.x = wx[1];
            this.i = i;
            return wx;
        }
        this.getI = function(location){
            return this.i;
        }
    }
    else return Make.apply(this, arguments);
}

function BoxZip2(){
    function Make(){
        let x = 0.5;
        let y = 0.5;
        let w = 1;
        function Step(index){
            if(typeof index !== 'number') return null;
            let path = Num2Bin(index);
            if(path.length%2!=0) path.push(0);
            for(let i=0; i+1<path.length; i+=2){
                w = w / 2;
                if(path[i]) x += w / 2;
                else x -= w / 2;
                
                if(path[i+1]) y += w / 2;
                else y -= w / 2;
            }
        }
        [].slice.call(arguments).forEach(Step);
        return [w,x,y];
    }
    let address = [].slice.call(arguments).filter(index=>typeof index === 'number');
    if(this instanceof BoxZip1){
        this.x = x;
        this.y = y;
        this.w = w;
        this.i = address.length === 1?address[0]:address;
        this.setI = function(i){
            if(typeof i !== 'number') return null;
            let wxy = Make(i);
            this.w = wxy[0];
            this.x = wxy[1];
            this.y = wxy[2];
            this.i = i;
            return wxy;
        }
        this.getI = function(location){
            return this.i;
        }
    }
    else return Make.apply(this, arguments);
}

function BoxZip3(){
    function Make(){
        let x = 0.5;
        let y = 0.5;
        let z = 0.5;
        let w = 1;
        function Step(index){
            if(typeof index !== 'number') return null;
            let path = Num2Bin(index);
            if(path.length%2!=0) path.push(0);
            if(path.length%2!=0) path.push(0);
            for(let i=0; i+2<path.length; i+=3){
                w = w / 2;
                if(path[i]) x += w / 2;
                else x -= w / 2;
                
                if(path[i+1]) y += w / 2;
                else y -= w / 2;

                if(path[i+1]) z += w / 2;
                else z -= w / 2;
            }
        }
        [].slice.call(arguments).forEach(Step);
        return [w,x,y,z];
    }
    let address = [].slice.call(arguments).filter(index=>typeof index === 'number');
    if(this instanceof BoxZip1){
        this.w = w;
        this.x = x;
        this.y = y;
        this.z = z;
        this.i = address.length === 1?address[0]:address;
        this.setI = function(i){
            if(typeof i !== 'number') return null;
            let address = [].slice.call(arguments).filter(index=>typeof index === 'number');
            let wxyz = Make.apply(this, address);
            this.w = wxyz[0];
            this.x = wxyz[1];
            this.y = wxyz[2];
            this.z = wxyz[3];
            this.i = address.length === 1?address[0]:address;
            return wxyz;
        }
        this.getI = function(location){
            return this.i;
        }
    }
    else return Make.apply(this, address);
}

//console.log('R(L(420))='+R(L(420)));

//for(let i = 0; i <= 16; i++) console.log("L2("+i+") = "+L2(i));