function GridGame(gameName){
    this.name = !gameName ? "Grid Game" : gameName;
    this.screen = document.createElement('div');
}

GridGame.makeElementFill = function(element){
    let style = element.style;
    style.top = style.bottom = style.left = style.right = "0";
    style.width = style.height = "100%";
    style.position = "absolute";
    return element;
};

GridGame.getQuery = function(){
    let query = window.location.href.split('?');
    let out = {};
    if(query.length == 1) return out;
    query = query[1].split('&').forEach(function(str){
        str = str.split('=');
        if(str.length==1) out[str.toLowerCase()] = true;
        else out[str[0].toLowerCase()] = toVariable(str.slice(1).join('='))
    });
    return out;
};

GridGame.prototype = {

    show : function(screen){
        this.screen.innerHTML = "";
        this.screen.appendChild(screen);
    },
    
    logo : function(){
        let logo = document.createElement('h1');
        logo.className = 'game-logo';
        let style = logo.style;
        style.color = 'white';
        style.textAlign = "center";
        style.margin = "5% 0";
        logo.innerText = this.name;
        return logo;
    },

    difficulty_select : function(customValue){
        let menu = document.createElement('div');
        let selection = document.createElement('input');
        selection.type = 'hidden';
        selection.name = 'health';
        selection.value = 100;
        menu.appendChild(selection);
        let choose1 = document.createElement('button');
        let val1 = 250;
        let val2 = 100;
        let val3 = 50;
        let valC = typeof customValue == 'number' ? Math.round(customValue) : 97;
        choose1.innerText = ""+val1;
        let style = choose1.style;
        style.width = "25%";
        menu.appendChild(choose1);
        choose1.addEventListener('click', function(){

        });
        let choose2 = document.createElement('button');
        choose2.innerText = ""+val2;
        style = choose2.style;
        style.display = "inline-block";
        style.width = "25%";
        menu.appendChild(choose2);
        let choose3 = document.createElement('button');
        choose3.innerText = ""+val3;
        style = choose3.style;
        style.display = "inline-block";
        style.width = "25%";
        menu.appendChild(choose3);
        let chooseCustom = document.createElement('input');
        chooseCustom.value = valC;
        chooseCustom.type = 'number';
        style = chooseCustom.style;
        style.display = "inline-block";
        style.width = "25%";
        menu.appendChild(chooseCustom);

        function makeEventListener(which){
            let b = [];
            b[0] = choose1;
            b[1] = choose2;
            b[2] = choose3;
            b[3] = chooseCustom;
            let button = b[which];
            return function(){
                b.forEach(function(item, i){
                    if(i!==which){
                        item.style.backgroundColor = 'transparent';
                        item.style.color = 'white';
                        return;
                    }else{
                        item.style.backgroundColor = 'white';
                        item.style.color = 'black';
                    }
                });
                if(which === 3){
                    selection.value = b[which].value;
                }else{
                    selection.value = b[which].innerText;
                }
            };
        }
        return menu;
    },

    level_select : function(level, health){
        if(typeof level !== 'string') level = typeof this.level === 'string' ? this.level : "1";
        if(typeof health !== 'number') health = typeof this.health === 'number' ? Math.round(this.health) : undefined;
        let form = document.createElement('form');
        let style = form.style;
        style.width = "80%";
        style.margin = "2.5% 10%";
        style.padding = "0";
        style.color = "white";
        let label = document.createElement('label');
        style = label.style;
        style.fontSize = "2em";
        style.fontWeight = "bold";
        style.textAlign = "left";
        style.display = "block";
        style.margin = "0.5em 0.5em";
        label.innerText = "Choose a level: ";
        let sideNote = document.createElement('span');
        style = sideNote.style;
        style.fontSize = "0.5em";
        style.fontWeight = "0";
        sideNote.innerText = "(any text will do)"
        label.appendChild(sideNote);
        form.appendChild(label);
        let level_select = document.createElement('input');
        level_select.type = 'text';
        level_select.value = level;
        level_select.name = 'level';
        style = level_select.style;
        style.width = '100%';
        style.display = "inline-block";
        style.border = "white 2px dashed";
        style.color = 'white';
        style.fontSize = "2em";
        style.backgroundColor = "transparent";
        style.padding = "0.5em 0";
        style.textAlign = "center";
        form.appendChild(level_select);
        label.addEventListener('click', function(){
            level_select.focus();
        });
        form.appendChild(this.difficulty_select(health));
        let submit = document.createElement('input');
        submit.type = 'submit';
        submit.value = "Start Game!";
        form.addEventListener('submit', function(e){
            if(level_select.value === ''){
                e.preventDefault();
                e.returnValue = false;
                alert('Type in a level name to start.');
                return false;
            }
        });
        return form;
    },

    start_screen : function(){
        let screen = GridGame.makeElementFill(document.createElement('div'));
        let style = screen.style;
        style.backgroundColor = 'black';
        style.color = 'white';
        let logo = this.logo();
        screen.appendChild(logo);
        screen.appendChild(this.level_select());
        return screen;
    },

    game_screen : function(){

    }
    
};