let guests, me;
let nameInput, msgInput, button, title, fullParty;
let textBox = [];
let playerID;

const maxCharCount = 50;
let partyIsFull;
const maxPlayerCount = 16;

function preload() {
    // connect to the party server
    partyConnect("wss://demoserver.p5party.org", "ljc_polishedChat");

    // load shared objects
    me = partyLoadMyShared();
    guests = partyLoadGuestShareds();
    
    // create roles up to max player count.
    // if beyond, assign role to "none"
    new RoleKeeper([...Array(maxPlayerCount).keys()].map(x => x + 1), "none");
}
function setup() {
    setupPlayerID();
    setupHTML(partyIsFull);

    // subscribe to message event
    partySubscribe("message", receiveMsg);
}

function setupHTML(isFull) {
    // set up HTML differently if the party is already full
    if (!isFull)
    {
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
    else
    {
        fullParty = createElement('h3', 'party is full...');
        fullParty.position(20, 30);
    }
    
    title = createElement('h1', 'Cool Kid Chat');
    title.position(20, 100);
}

function setupPlayerID() {
    for (const guest of guests) { if (guest === me) playerID = guest.role_keeper.role; }
    partyIsFull = playerID === "none";
}

function receiveMsg(data) {
    const msg = data;

    textBox.push(createElement('p', msg[0] +": " + msg[1]));

    for (i = 0; i < textBox.length; i++) {
        textBox[i].position(20, textBox.length * 30 - (i + 1)*30 + 150);
    }
}

function sendMsg() {
    if (msgInput.value() != '') {
        const msg = [nameInput.value(), msgInput.value(), playerID];
        msgInput.value('');
        partyEmit("message", msg);
    }
}

function keyPressed() {
    // also send msg with enter if you are in the party
    if (keyCode === ENTER && !partyIsFull) {
        sendMsg();
    }
}