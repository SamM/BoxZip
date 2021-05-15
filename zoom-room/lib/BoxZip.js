/// BoxZip v1.0
/// by Samuel Mulqueen

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

function RGBprint(color){
    function ramp(v){
        return Math.floor(v*256);
    }
    return 'rgb('+[ramp(color.r),ramp(color.g),ramp(color.b)].join(',')+')';
}
function Num2Bin(location, byteSize){
    let a, n = location;
    if(Array.isArray(location)){
        if(location.length === 0) return [];
        let path = [];
        location.forEach(loc=>{path=path.concat(Num2Bin(loc, byteSize))});
        return path;
    }
    if(typeof location != 'number') return [];
    if(location < 0) location = -location;
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
    if(!Array.isArray(path)) return null;
    if(path.length == 0) return null;
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
    if(Array.isArray(location)){
        let d = 0;
        location.forEach(l=>{d+=BitDepth(l)})
        return d;
    }
    let d = 0;
    let n = Math.pow(2, d);
    while(n<=location){
        n = Math.pow(2, ++d);
    }
    return d;
}

function NumX(a,b,d){
    return Num2Bin(a,d).concat(Num2Bin(b,d));
}

function BinX(a,b){
    return a.concat(b);
}

function BitSequence(){
    let args = [].slice.call(arguments);
    let D = 1;
    if(args.length > 1){
        D = args[args.length-1];
        if(typeof D !== 'number') D = 1;
        else args = args.slice(0,-1);
        if(D < 0) D = -D;
        D=Math.floor(D);
    } 
    if(!(this instanceof BitSequence)) return new BitSequence(args, D);

    let seq = [];

    Object.defineProperty(this, 'length', { get: function() { return seq.length; } });
    Object.defineProperty(this, 'toArray', { get: function() { return seq.slice(); } });
    Object.defineProperty(this, 'toBin', { get: function() { 
        let path = [];
        seq.map(i=>Num2Bin(i,D)).forEach(b=>{
            path = path.concat(b);
        });
        return path; 
    } });
    Object.defineProperty(this, 'toInt', { get: function() {
        return Bin2Num(this.toBin,D);
    } });
    
    Object.defineProperty(this, 'D1', { get: function() { D=1; return this } });
    Object.defineProperty(this, 'D2', { get: function() { D=2; return this } });
    Object.defineProperty(this, 'D3', { get: function() { D=3; return this } });
    Object.defineProperty(this, 'D4', { get: function() { D=4; return this } });
    Object.defineProperty(this, 'D5', { get: function() { D=5; return this } });

    this.DX = function(x){
        if(typeof x === 'number') x = Math.floor(x);
        else x = 1;
        if(x < 0) x = -x;
        D = x;
        return this;
    };

    this.reseq = function(bitlen){
        let bin = this.toBin;
        let binlen = bin.length % bitlen === 0 ? bin.length : bin.length - (bin.length % bitlen) + bitlen;
        let s = [];
        let int = [];
        for(let i=0; i+bitlen<=binlen; i+=bitlen){
            int = [];
            for(let b=0; b<bitlen; b++) int.push(bin[i+b]);
            s.push(Bin2Num(int,D));
        }
        seq = s;
        this.DX(bitlen);
        return this;
    };

    this.matches = function(sequence){
        if(arguments.length === 0) return false;
        if(arguments.length > 1) sequence = BitSequence([].call(arguments));
        if(!(sequence instanceof BitSequence)) sequence = BitSequence(sequence);
        let destination = this.toBin;
        let beginnings = sequence.toBin;
        for(var i=0; i< destination.length; i++){
            if(i >= beginnings.length) return true;
            if(destination[i] != beginnings[i]) return false;
        }
        return true;
    }

    this.add = function(int, index){
        function handleInput(input){
            let s = [];
            if(input instanceof BitSequence) s = s.concat(input.toArray);
            else if(Array.isArray(input)) input.map(handleInput).forEach(i=>s = s.concat(i));
            else if(typeof input === 'boolean'){
                if(input) s.push(1);
                else s.push(0);
            }
            else if(typeof input === 'number'){
                input = Math.floor(input);
                s.push(input);
            }
            return s;
        }
        int = handleInput(int);
        
        if(index === undefined) index = this.length;
        if(typeof index !== 'number') index = this.length;
        if(index < 0) index = this.length >= -index ? this.length + index : 0;
        index = Math.floor(index);

        if(index >= this.length){
            while(index > this.length) seq.push(0);
            seq = seq.concat(int);
        }else{
            seq = seq.slice(0,index).concat(int, seq.slice(index));
        }
        return this;
    }

    this.toString = function(p){
        let pad = ' ';
        return 'BitSequence('+pad+'['+pad+seq.join(pad+','+pad)+pad+']'+pad+','+pad+D+pad+')';
    }

    if(args.length) this.add(args);
}

function BoxZipX(D){
    if(typeof D !== 'number') D = 1;
    if(D < 0) D = -D;
    D = Math.floor(D);
    function Make(){
        let o = [1];
        while(o.length < D+1){
            o.push(0.5);
        }
        function Step(index){
            if(Array.isArray(index)) index = Step();
            if(typeof index !== 'number') return null;
            let path = Num2Bin(index,D);
            for(let i=0; i+D-1<path.length; i+=D){
                o[0] = o[0] / 2;
                for(let b=0; b<D; b++){
                    if(path[i+b]) o[1+b] += o[0] / 2;
                    else o[1+b] -= o[0] / 2;
                }
            }
        }
        BitSequence([].slice.call(arguments), D).toArray.forEach(Step);
        return o;
    }
    let address = arguments.length > 1 ? [].slice.call(arguments,1) : [];
    if(this instanceof BoxZipX){
        let xyz = 'wxyzabcdefghijklmnopqrstuv';
        let v = Make.apply(this,address);
        for(let i=0; i<D+1; i++){
            this[xyz[i]] = v[i];
        }
        this.location = BitSequence(address, D).toArray;
    }
    else return Make.apply(this,address);
}

function BoxZip(D){
    return function BoxZipper(){
        let address = arguments.length > 0 ? [].slice.call(arguments) : [];
        if(this instanceof BoxZipper){
            let val = new BoxZipX(D, address);
            Object.assign(this, val);
        }
        else return BoxZipX.apply(this, [D].concat(address));
    }
}

// Initialize BoxZip0 - BoxZip10 functions
// Make them available as BoxZip[0] - BoxZip[10]
BoxZip.X = BoxZipX;
for(let i=0; i<=10; i++){
    this['BoxZip'+i] = BoxZip(i);
    BoxZip[i] = this['BoxZip'+i];
}
delete i;

BoxZip.clamp = function clamp(v){
    if(typeof v != 'number') return 0;
    if(v === 0) return 0;
    if(v === 1) return 1;
    v = v % 1;
    if(v === 0) return 1;
    if(v < 0) return 1-v;
    return v;
};

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
BoxZip.PathsMatch = function(destination, beginnings){
    for(var i=0; i< destination.length; i++){
        if(i >= beginnings.length) return true;
        if(destination[i] != beginnings[i]) return false;
    }
    return true;
}

BoxZip3.rgb = function(index){
    let args = [].slice.call(arguments);
    let val = new BoxZip3(args);
    if(index===undefined || Array.isArray(index) && index.length===0) return {r:1,g:1,b:1};
    function translate(v){
        return v;
    }
    let color = new BoxZip.Color(translate(val.x),translate(val.y),translate(val.z),1);
    color.index = BitSequence(args,3);
    return color;
    return {
        r: translate(val.x),
        g: translate(val.y),
        b: translate(val.z)
    };
};

BoxZip4.rgba = function(index){
    let val = new BoxZip4(index);
    if(index===undefined || Array.isArray(index) && index.length===0) return {r:1,g:1,b:1,a:1};
    function translate(v){
        return v;
    }
    return new BoxZip.Color(translate(val.x),translate(val.y),translate(val.z),translate(val.a));
    return {
        r: translate(val.x),
        g: translate(val.y),
        b: translate(val.z),
        a: translate(val.a)
    };
};