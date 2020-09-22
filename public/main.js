console.log("Test Websocket");

const socket = io.connect(
    "http://localhost:3000",
    { forceNew: true });

const render = (data) => {
    const html = data.map((elem, index) => `<li>${elem.username}: ${elem.text}</li>`).join(' ');
    document.getElementById('messages').innerHTML = html;
};

socket.on('messages', data => {
    render(data);
})

const sendMessage = function(e) {
    console.log('SEND');

    const text = document.getElementById('message_input').value
    const username = document.getElementById('username').value

    if (!text) {
        return
    }

    const message = { text, username };

    socket.emit('new-message', message);
}
