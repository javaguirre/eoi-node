console.log("Test Websocket");

const socket = io.connect(
    "http://localhost:3000",
    { forceNew: true });

const render = (data) => {
    const html = data.map((elem, index) => `<li>${elem.text}</li>`).join(' ');
    document.getElementById('messages').innerHTML = html;
};

socket.on('messages', data => {
    render(data);
})

const sendMessage = function(e) {
    e.preventDefault();
    console.log('SEND');

    const text = document.getElementById('message_input').value

    if (!text) {
        return
    }

    const message = { text };

    socket.emit('new-message', message);
}
