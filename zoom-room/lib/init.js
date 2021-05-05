let _HALT = false;

let NUM_GATES = 30;
let NUM_WORLDS = 10;

const ANIMATE = true;

const DEFAULT_BG_COLOR = "#202020";

const MAX_GATES = 100;
const MAX_WORLDS = 11;

const MIN_LOCATION = 1;
const MAX_LOCATION = 4;

const DRAW_DEPTH = 10;

const WORLD_IMAGE_SIZE = 1024*2*2;

const IMAGE_UPDATE_ITERATIONS = 6;

const ANIMATION_STEPS = 16;

const BORDER_WIDTH = "2vh";

const ZOOMOUT_CHAR = '-';

const SLIDES_AT_START = false;

const COLOR_THRESHOLD = 0.15;

const COLOR_SATURATION_MIN = 0.6;
const COLOR_SATURATION_MAX = 0.95;

const COLOR_LIGHTNESSES = [0.25,0.5,0.75,0.95];

let path,prev_path,level_seed,target_seed,color_seed,scene,size,position,last_animation,animations_forward,
    animation_i,animation_step,prevPositions,prevWorlds,prevTargets,target_cache,
    cancelHashChange,this_world,target_world,worlds,travel_depth,points,
    steps,inputSets,lastInput,colors,targets,slides_toggle,_random;