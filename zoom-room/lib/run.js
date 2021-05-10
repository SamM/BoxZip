function reset(){
    _HALT = false;

    slides_toggle = !SLIDES_AT_START;
    ToggleSlides();

    NUM_GATES = 30;
    NUM_WORLDS = 10;

    _random = {};

    path = "";
    prev_path = "";
    seed = size = scene = undefined;

    let search = window.location.search.length>1?window.location.search.slice(1):'';
    search = search.split('/');
    mode = search[0] === undefined ? '' : search[0];
    mode = (Object.keys(_modes).indexOf(mode.toLowerCase()) < 0) ? '' : mode.toLowerCase();
    level_seed = search[1] === undefined ? '' : search[1];
    color_seed = search[2] === undefined ? '' : search[2];
    target_seed = search[3] === undefined ? '' : search[3];
    

    position = [];

    last_animation = new Animation(0,[],[],0, null);
    animations_forward = [];
    animation_i = 0;

    animation_step = 0;

    prevPositions = [];
    prevWorlds = [];
    prevTargets = [];
    target_cache = [];

    slides_toggle = false;

    cancelHashChange = true;

    this_world = 0;
    target_world = 0;
    
    worlds = [];
    targets = [];
    colors = [];

    travel_depth = 0;
    points = 0;
    steps = 0;

    inputSets = ['45120 ', 'qwaszx ', 'erdfcv ', 'tyghbn ', 'uijkm, ', 'opl;./ '];
    lastInput = 0;

    document.getElementById('randomize').removeEventListener("click", randomizeButtonClick);
    document.getElementById('screen').removeEventListener('click', backgroundClick);
    document.getElementById('help').removeEventListener('click', helpButtonClick);
    document.getElementById('undo').removeEventListener('click', undoButtonClick);

}
function update(){
    resizeCanvas();
    clearCanvas(scene);

    if(animations_forward.length > animation_i){
        // Animating
        let animation = animations_forward[animation_i] || last_animation;
        worlds[animation.world_from].drawTo(scene, false, animation.position_to, [], animation_step, animation.position_from);
        animation_step++;
        if(animation_step >= ANIMATION_STEPS){
            animation_step = 0;
            last_animation = animations_forward[animation_i];
            if(animation.world_out !== null){
                document.getElementById('screen').style.backgroundColor = Color(worlds[animation.world_out].color);
            }else{
                document.getElementById('screen').style.backgroundColor = DEFAULT_BG_COLOR;
            }
            animation_i++;
        }
    }else{
        // Static - Viewing Level
        animations_forward = [];
        animation_i = 0;
        let animation = last_animation;
        worlds[animation.world_to].drawTo(scene, true, animation.position_end, [], animation_step, animation.position_end);
    }
    
    if(ANIMATE) window.requestAnimationFrame(update);
}

/*/
///
///     Start Function
///
/*/
function start(){
    reset();
    
    if(!level_seed.length || !mode.length || !target_seed.length || !color_seed.length){
        JumpToLevel(!mode.length?RandomMode():mode, !level_seed.length?RandomSeed():level_seed,!color_seed.length?RandomSeed():color_seed,!target_seed.length?RandomSeed():target_seed);
        return;    
    }

    updateSeedLinks();

    scene = document.getElementById('scene');

   _random.level = new Math.seedrandom(level_seed);
   _random.color = new Math.seedrandom(color_seed);
   _random.target = new Math.seedrandom(target_seed);

   ///
   /// Start Level Design

   _modes[mode]();

    /*/
    /// Generate Colors
        One for each world
    /*/
    for(var i=0;i<worlds.length;i++) determineNextColor();
    
    /*/
    /// Colours required past this point
    /*/

    /// DRAW SLIDES
    // Reprint World Images over and over until recursion has been mapped with enough iterations
    let color = Color(worlds[this_world].color);
    scene.style.border = color + " "+BORDER_WIDTH+" solid";
    scene.style.backgroundColor = color;

    let ctx;
    let s = WORLD_IMAGE_SIZE;
    for(var i=0; i< NUM_WORLDS; i++){
        worlds[i].canvas.style.border = Color(worlds[i].color)+" 1vh solid";
        worlds[i].canvas.style.backgroundColor = Color(worlds[i].color);
        ctx = worlds[i].canvas.getContext('2d');
        ctx.fillStyle = Color(worlds[i].color);
        ctx.fillRect(0,0,s,s);
    }
    
    for(var u=0; u < IMAGE_UPDATE_ITERATIONS; u++){
        for(var w=0; w<NUM_WORLDS; w++){
            worlds[w].update(u);
        }
    }

    worlds[this_world].drawTo(scene, true);

    target_world = -1;
    nextTarget();
    prevTargets.push(target_world);
    
    ///
    /// Targets required past this point
    ///
    /// Level Design & Targets required past this point
    let hash = getHash();
    ReplaySequence(validatePath(hash));

    worlds.forEach(function(world){
        document.getElementById('slides').appendChild(world.canvas);
    })

    document.getElementById('randomize').addEventListener("click", randomizeButtonClick);

    scene.addEventListener('click', sceneClick);
    document.getElementById('screen').addEventListener('click', backgroundClick);
    document.getElementById('help').addEventListener('click', helpButtonClick);
    document.getElementById('undo').addEventListener('click', undoButtonClick);
    document.getElementById('slides_modal').addEventListener('click', closeSlidesButtonClick);
    document.getElementById('close_slides').addEventListener('click', closeSlidesButtonClick);
    document.getElementById('logo').addEventListener('click', closeSlidesButtonClick);
    
    resizeCanvas();

    document.getElementById('scene').style.opacity = "100%";

    debug();

    if(ANIMATE) update();
}

