function keyPressed() {
    // also send msg with enter if you are in the party
    if (keyCode === ENTER && !partyIsFull()) {
        sendMsg();
    }
}