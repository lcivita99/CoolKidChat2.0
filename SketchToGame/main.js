// using p5.party library
// influenced by role_keeper example https://p5party.org/examples/role_keeper/

// shared objects
let guests, me;

// html
let nameInput, msgInput, button, title, fullParty;
let textBox = [];
let timers = [];
let fallingTextBoxes = [];
const fontSize = 16;

// role management
let roleLastUpdate;

// sound
let msgSent, msgReceived;

// vars
const maxCharCountMsg = 30;
const maxCharCountName = 10;
const maxPlayerCount = 4;
const timePerMessage = 4; // time before message falls
const gravity = 10;

function partyIsFull() {
    return me.role_keeper.role === "none";
}

function preload() {
    // connect to party server
    partyConnect("wss://demoserver.p5party.org", "ljc_polishedChat");

    // load shared objects
    me = partyLoadMyShared();
    guests = partyLoadGuestShareds();

    // load sound
    msgSent = loadSound("audio/sentMessage.mp3");
    msgReceived = loadSound("audio/newMessage.mp3");
    
    // create roles up to max player count.
    // if beyond, assign role to "none"
    new RoleKeeper([...Array(maxPlayerCount).keys()].map(x => x + 1), "none");
}
function setup() {
    userStartAudio();
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
                curPosX: textBox[i].position().x,
                curPosY: textBox[i].position().y
            });
            
            fallingTextBoxes[i].text.position(textBox[i].position().x, textBox[i].position().y - fontSize);
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
    nameInput.attribute('maxlength', maxCharCountName);

    msgInput = createInput();
    msgInput.position(20, 60);
    msgInput.attribute('placeholder', 'message');
    msgInput.attribute('maxlength', maxCharCountMsg);

    button = createButton('send');
    button.position(msgInput.x + msgInput.width, 60);
    button.mousePressed(sendMsg);
}

function displayPartyIsFull() {
    fullParty = createElement('h3', 'ur not invited.');
    fullParty.position(20, 30);
}

function displayTitle() {
    title = createElement('h1', 'Cool Kid Chat 2.0');
    title.position(20, 95);
}

function changedRole(newRole) {
    if (newRole !== "none") {
        fullParty.remove();
        createInputFields();
    }
}

function receiveMsg(data) {
    const msg = data;
    msg[0] = msg[0] === "" ? "user" + roleLastUpdate : msg[0];
    textBox.push(createElement('p', msg[0] +": " + msg[1]));
    timers.push(0);

    (msg[2] === roleLastUpdate ? msgSent : msgReceived).play();
    
    for (i = 0; i < textBox.length; i++) {
        textBox[i].position(20, textBox.length * 30 - (i + 1)*30 + 160);
    }
}

function sendMsg() {
    if (msgInput.value() != '') {
        const msg = [nameInput.value(), msgInput.value(), roleLastUpdate];
        msgInput.value('');
        partyEmit("message", msg);
    }
}

function textboxFall() {
    for (i = 0; i < fallingTextBoxes.length; i++) {
        fallingTextBoxes[i].text.position(20, fallingTextBoxes[i].curPosY - fontSize);
        fallingTextBoxes[i].fallSpeed += gravity * deltaTime / 1000;
        fallingTextBoxes[i].curPosY += fallingTextBoxes[i].fallSpeed;
        
        if (fallingTextBoxes[i].fallSpeed >= 30) {
            fallingTextBoxes[i].text.remove();
            fallingTextBoxes.splice(i, 1);
        }
    }
}