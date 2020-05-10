function is(variable) {
	let type = a=>b=>typeof a === typeof b;
	let it = that => that === variable;
	it.it = it; it.this = it;
	it.as = that => variable instanceof that;
	it.type = that => type(variable)(that);
	it.of = it.type;
	it.fn = () => it.type(I => 0);
	it.str = () => it.type('');
	it.num = () => it.type(3);
	it.obj = () => it.type({});
	it.null = () => it(null);
	it.array = () => Array.isArray(variable);
	it.true = that => !!that;
	it.false = that => !that;
	it.not = it.false;
	it.has = that => variable.indexOf(that) > -1;
	it.in = that => that.indexOf(variable) > -1;
	return it;
}

function Path(i){
	if(is(i).num()){
		return Path.fromIndex(i);
	}
	if(is(i).str()){
		return Path.fromString(i);
	}
	if(is(i).array()){
		return i.map(c=>!!c?1:0);
	}
}
Path.fromIndex = function(index){
	if(index === 0) return[0];
	let i = -1,
		x = 0;
	while(x <= index){
		i++;
		x = Math.pow(2, i);
	}
	function Solve(index, i){
		if(i < 0) return [];
		let x = Math.pow(2, i);
		if(x > index) return Solve(index, i-1).concat([0]);
		if(x === index) return Solve(0, i-1).concat([1]);
		// Otherwise x less than index
		return Solve(index - x, i-1).concat([1]);
	}
	return Solve(index, i).slice(0,-1);
};
Path.fromString = function(str){
	if (is(str).str() && str.length >= 2) {
		let unique = '';
		str.split('').forEach(function (c) {
			if (!is(c).in(unique)) unique += c;
		});
		if (is(unique.length)(2)) {
			let f = str[0],
				t = str[1];
			return str.slice(2).split('').map(c=>c==t?1:0)
		}
	}
	return [];
};
Path.toString = function(path, code){
	if(is(path).num()) path = Path.fromIndex(path);
	if(is(path).str()) path = Path.fromString(path);
	if(!is(code).str() || code.length < 2) code = '01';
	if(code.length > 2) code = code.slice(0,2);
	return code+path.map(t=>t?code[1]:code[0]).join('');
};
Path.toIndex = function(path){
	if(is(path).num()) return path;
	if(is(path).str()) path = Path.fromString(path);
	if(!is(path).array()) throw "Path not Array";
	let sum = 0, i = 0;
	path.forEach(c=>{
		if(c) sum += Math.pow(2, i);
		i++;
	});
	return sum;
};
Path.digest = '0123456789EFGHI';
Path.toHex = function(path){
	if(is(path).num()) path = Path.fromIndex(path);
	if(is(path).str()) path = Path.fromString(path);
	if(is(path).array()){
		let hexCode = "";
		while(path.length){
			sum = 0;
			count = 0;
			// A
			sum += path.shift() ? Math.pow( 2, count++ ) : 0;
			// B
			if(path.length==0) path[0] = 0;
			sum += path.shift() ? Math.pow( 2, count++ ) : 0;
			// C
			if(path.length==0) path[0] = 0;
			sum += path.shift() ? Math.pow( 2, count++ ) : 0;
			// D
			if(path.length==0) path[0] = 0;
			sum += path.shift() ? Math.pow( 2, count++ ) : 0;

			hexCode += Path.digest[sum];
		}
		return hexCode;
	}
	return '';
}

let BoxZip = function (initial_state) {
	let States = {};
	let State = 0;
	let LastSet;
	if (arguments.length == 1) States[''] = initial_state;
	function Box(path, state, forceFill) {
		if (is(path).array()) {
			if (!!forceFill) {
				path.forEach(p => Box(p, state));
			} else if (is(state).array()) {
				if (is(state.length)(path.length)) {
					let i = 0;
					path.forEach(function (p) {
						Box(p, state[i]);
						i++;
					})
				} else return Box;
			} else {
				path.forEach(p => Box(p, state));
			}
			return Box;
		} else if (is(path).str() && path.length >= 2) {
			path = Path.toIndex(path);
		}
		if (is(path).num() && !is(state)()) {
			States[path] = state;
		}
		return Box;
	}
	
	Box.Path = Path;

	Box.length = ()=>States.length;
	Box.keys = ()=>Object.keys(States);

	Box.draw = function (draw_function/*/(color, x, y, w, h)/*/, reverse_z) {
		function DrawBox(s){
			// Convert Number Into Path
			let path;
			if(s == '') path = [];
			else path = Box.Path(parseInt(s));
			// Convert Path into start and end coordinates for x and y
			let o = { i: s, x : 0, y : 0, h : 1, w : 1};
			let c = 0, v=1, f, h=0;
			if(path.length){
				for(var i=0; i<path.length; i++){
					f = ((i+1)%2==0)? ((i+1)/2)-1: i/2;
					c = 1 / Math.pow(2, f);
					if(path[i]){
						if(v){
							o.y += c / 2;
							o.h -= c / 2;
						} 
						else{
							o.x += c / 2;
							o.w -= c / 2;
						}
					}else{
						if(v) o.h = o.h/2;
						else o.w = o.w/2;
					}
					v=!v;
					h=!h;
				}
			}
			return o;
		}
		if (is(draw_function).fn()) {
			//console.log('Number of squares being drawn: '+Box.length)
			let Panels = Object.keys(States).sort(function(a,b){
				a = a===''?-1:parseInt(a);
				b = b===''?-1:parseInt(b);
				if(a===b) return 0;
				if(a<b) return -1;
				else return 1;
			});
			let coords = Panels.map(i => DrawBox(i));
			coords.sort((a,b)=>{
				let ac = a.w + a.h ;
				let bc = b.w + b.h ;
				if(ac===bc) return 0;
				if(ac<bc) return reverse_z ? -1 : 1;
				else return reverse_z ? 1 : -1;
			});
			coords.forEach(o => {
				if(typeof o !== 'object') return;
				if(typeof o.i != 'undefined' && typeof States[o.i] != 'undefined') draw_function(States[o.i], o)
				//console.log(o.i,States[o.i]);
			});
		}
	};
	return Box;
};