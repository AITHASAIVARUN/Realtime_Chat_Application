// const socket = io('http://localhost:3000');

const socket = io('https://realtime-chat-application-s7eu.onrender.com'); // Replace with your actual backend URL




const form = document.getElementById('send-con');
const messageContainer = document.querySelector(".container1");
const emojiButton = document.getElementById("emoji-btn");
const emojiContainer = document.getElementById("emoji-picker-container");
const messageInput = document.getElementById("messageInp");

let pickerVisible = false;

// Function to create emoji picker
function createEmojiPicker() {
    const picker = new EmojiMart.Picker({
        onEmojiSelect: (emoji) => {
            messageInput.value += emoji.native; // Append selected emoji to input
            emojiContainer.style.display = "none"; // Hide picker after selection
            pickerVisible = false;
        }
    });
    emojiContainer.innerHTML = ''; // Clear previous instances
    emojiContainer.appendChild(picker);
}

// Toggle Emoji Picker
emojiButton.addEventListener("click", (event) => {
    event.stopPropagation(); // Prevent closing when clicking the button
    if (!pickerVisible) {
        createEmojiPicker();
        emojiContainer.style.display = "block";
        pickerVisible = true;
    } else {
        emojiContainer.style.display = "none";
        pickerVisible = false;
    }
});

// Hide Emoji Picker When Clicking Outside
document.addEventListener("click", (event) => {
    if (!emojiContainer.contains(event.target) && event.target !== emojiButton) {
        emojiContainer.style.display = "none";
        pickerVisible = false;
    }
});

// User name management
let nameofperson = localStorage.getItem('chat_username');
if (!nameofperson) {
    nameofperson = prompt('Enter your name to join the chat');
    if (nameofperson) {
        localStorage.setItem('chat_username', nameofperson);
        socket.emit('new-user-joined', nameofperson);
    }
} else {
    socket.emit('new-user-joined', nameofperson);
}

// Ensure the audio file path is correct
var audio = new Audio('Message.mp3');

const append = (message, position) => {
    const messageElement = document.createElement('div');
    const messageParts = message.split(":");
    
    const nameElement = document.createElement('span');
    nameElement.innerText = messageParts[0] + ": ";  // Name part
    nameElement.style.fontWeight = "bold";
    
    const messageText = document.createElement('span');
    messageText.innerText = messageParts[1];

    messageElement.appendChild(nameElement);
    messageElement.appendChild(messageText);
    
    messageElement.classList.add('message', position);
    messageContainer.appendChild(messageElement);

    messageContainer.scrollTo({
        top: messageContainer.scrollHeight,
        behavior: "smooth"
    });

    if (position === 'left') {
        audio.play().catch(error => console.log("Audio playback error:", error));
    }
}

// Prevent form refresh
form.addEventListener('submit', (e) => {
    e.preventDefault();
    const message = messageInput.value.trim();
    if (message) {
        append(`You: ${message}`, 'right');
        socket.emit('send', message);
        messageInput.value = '';
    }
});

// Listen for events
socket.on('user-joined', (nameofperson) => {
    append(`${nameofperson} joined the chat`, 'left');
});

socket.on('receive', (data) => {
    append(`${data.nameofperson}: ${data.message}`, 'left');
});

socket.on('user-left', (nameofperson) => {
    append(`${nameofperson} left the chat`, 'left');
});