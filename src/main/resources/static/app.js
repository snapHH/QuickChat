var stompClient = null;
var username = prompt("Enter your name:");

function connect() {
    var socket = new SockJS('/ws');
    stompClient = Stomp.over(socket);
    stompClient.connect({}, function (frame) {
        console.log('Connected: ' + frame);
        stompClient.subscribe('/topic/public', function (message) {
            showMessage(JSON.parse(message.body));
        });

        // Notify everyone of a new user joining
        stompClient.send("/app/chat.newUser", {}, JSON.stringify({
            sender: username,
            type: 'JOIN'
        }));
    });
}

// Function to add a new user
function newUser() {
    var newUsername = prompt("Enter new user's name:");
    if (newUsername && newUsername.trim() !== '') {
        stompClient.send("/app/chat.newUser", {}, JSON.stringify({
            sender: newUsername,
            type: 'JOIN'
        }));

        showMessage({
            sender: newUsername,
            content: newUsername + " has joined the chat!",
            type: 'JOIN'
        });
    }
}

function sendMessage() {
    var messageInput = document.getElementById('message-input').value;
    if (messageInput.trim() !== '') {
        stompClient.send("/app/chat.sendMessage", {}, JSON.stringify({
            sender: username,
            content: messageInput,
            type: 'CHAT'
        }));
        document.getElementById('message-input').value = ''; // Clear input after sending
        hideTypingIndicator();
    }
}

function showMessage(message) {
    var messageElement = document.createElement('div');
    messageElement.classList.add('message');
    if (message.sender === username) {
        messageElement.classList.add('sent');
    }
    messageElement.textContent = message.sender + ": " + message.content;

    var chatBox = document.getElementById('chat-box');
    chatBox.appendChild(messageElement);
    chatBox.scrollTop = chatBox.scrollHeight; // Auto scroll to bottom

    if (message.type === 'CHAT') {
        hideTypingIndicator();
    }
}

function showTypingIndicator() {
    var typingIndicator = document.querySelector('.typing-indicator');
    typingIndicator.style.display = 'flex';
}

function hideTypingIndicator() {
    var typingIndicator = document.querySelector('.typing-indicator');
    typingIndicator.style.display = 'none';
}

//  keypress to show typing indicator
var typingTimeout;
document.getElementById('message-input').addEventListener('keypress', function () {
    showTypingIndicator();
    clearTimeout(typingTimeout);
    typingTimeout = setTimeout(hideTypingIndicator, 1000); // Hide after 1 second of inactivity
});

document.getElementById('send-btn').addEventListener('click', sendMessage);
document.getElementById('profile').addEventListener('click', function(){
    window.location.href = "profile.html";
});
document.getElementById('back').addEventListener('click', function(){
    window.location.href = "index.html";
});
connect();
