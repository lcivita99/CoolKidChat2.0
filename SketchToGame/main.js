// shared objects
let guests, me;

// html
let nameInput, msgInput, button, title, fullParty;
let textBox = [];
let timers = [];
let fallingTextBoxes = [];
    
//     {
//     text : null,
//     fallSpeed : null,
//     curPosX : null,
//     curPosY : null
// };

// role management
let roleLastUpdate;

// vars
const maxCharCount = 50;
const maxPlayerCount = 4;
const timePerMessage = 3; // time before message dissapears
const gravity = 9.81;

function partyIsFull() {
    return me.role_keeper.role === "none";
}

function preload() {
    // connect to party server
    partyConnect("wss://demoserver.p5party.org", "ljc_polishedChat");

    // load shared objects
    me = partyLoadMyShared();
    guests = partyLoadGuestShareds();
    
    // create roles up to max player count.
    // if beyond, assign role to "none"
    new RoleKeeper([...Array(maxPlayerCount).keys()].map(x => x + 1), "none");
}
function setup() {
    // setupPlayerID();
    setupHTML();

    // subscribe to message event
    partySubscribe("message", receiveMsg);
    
    roleLastUpdate = me.role_keeper.role;
}

function draw() {
    let role = me.role_keeper.role;
    
    // update html and functionality if a spot opens up for you
    if (role !== roleLastUpdate && role !== "none") {
        changedRole(me.role_keeper.role);
    }
    roleLastUpdate = role;
    for (i = 0; i < timers.length; i++) {
        timers[i] += deltaTime / 1000;
        if (timers[i] > timePerMessage) {
            fallingTextBoxes.push({
                text: createElement('p', textBox[i].elt.innerText),
                fallSpeed: 0,
                curPosX: textBox[i].position.x,
                curPosY: textBox[i].position.y
            });
            fallingTextBoxes[i].text.position(textBox[i].position.x + 30, textBox[i].position.y);
            textBox[i].remove();
            textBox.splice(i, 1);
            timers.splice(i, 1);
            i--; // adjust loop
        }
    }

    textboxFall();
}

function setupHTML() {
    partyIsFull() ? displayPartyIsFull() : createInputFields();
    displayTitle();
}

function createInputFields() {
    nameInput = createInput();
    nameInput.position(20, 10);
    nameInput.attribute('placeholder', 'username');

    msgInput = createInput();
    msgInput.position(20, 60);
    msgInput.attribute('placeholder', 'message');

    button = createButton('send');
    button.position(msgInput.x + msgInput.width, 60);
    button.mousePressed(sendMsg);
}

function displayPartyIsFull() {
    fullParty = createElement('h3', 'party is full...');
    fullParty.position(20, 30);
}

function displayTitle() {
    title = createElement('h1', 'Cool Kid Chat');
    title.position(20, 100);
}

function changedRole(newRole) {
    if (newRole !== "none") {
        fullParty.remove();
        createInputFields();
    }
}

function receiveMsg(data) {
    const msg = data;
    textBox.push(createElement('p', msg[0] +": " + msg[1]));
    timers.push(0);
    
    for (i = 0; i < textBox.length; i++) {
        textBox[i].position(20, textBox.length * 30 - (i + 1)*30 + 150);
    }
}

function sendMsg() {
    if (msgInput.value() != '') {
        const msg = [nameInput.value(), msgInput.value()];
        msgInput.value('');
        partyEmit("message", msg);
    }
}

function textboxFall() {
    for (i = 0; i < fallingTextBoxes.length; i++) {
        fallingTextBoxes[i].fallSpeed += gravity * deltaTime;
        fallingTextBoxes[i].curPosY += fallingTextBoxes[i].fallSpeed;
        
        fallingTextBoxes[i].text.position(fallingTextBoxes[i].curPosX, fallingTextBoxes[i].curPosY);
    }
}