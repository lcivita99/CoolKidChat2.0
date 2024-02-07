let me;
let guests;
let shared;

function preload() {
    // connect to the party server
    partyConnect("wss://demoserver.p5party.org", "ljc_sketch4");

    // assign shared objects
    shared = partyLoadShared("shared", {});
    me = partyLoadMyShared();
    guests = partyLoadGuestShareds();
}

function setup() {
    let canvas = createCanvas(500, 500);
    canvas.parent('myCanvasContainer');
    
    background(0);
}

function draw() {
    background(155);
}