const chatBox = document.getElementById("chat-box");
const userInput = document.getElementById("user-input");
const API_URL = "https://straitai-backend.onrender.com/api/chat";

function sendMessage() {
    let message = userInput.value.trim();
    if (message === "") return;

    // Display user message
    displayMessage("User", message, "user-message");
    userInput.value = "";

    // Show AI "thinking..." animation
    let thinkingMessage = displayMessage("Strait-AI", "AI is thinking...", "bot-message");

    // Send message to backend
    fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: message })
    })
    .then(response => {
        if (!response.ok) throw new Error("Network response was not ok");
        return response.json();
    })
    .then(data => {
        // Remove thinking message
        chatBox.removeChild(thinkingMessage);
        // Display AI response
        displayMessage("Strait-AI", data.response, "bot-message");
    })
    .catch(error => {
        chatBox.removeChild(thinkingMessage);
        displayMessage("Strait-AI", "Error: Could not connect to AI.", "bot-message");
        console.error("Error:", error);
    });
}

function displayMessage(name, text, type) {
    let messageDiv = document.createElement("div");
    messageDiv.classList.add("message", type);

    let nameDiv = document.createElement("div");
    nameDiv.textContent = name;
    messageDiv.appendChild(nameDiv);

    let textDiv = document.createElement("div");
    textDiv.textContent = text;
    messageDiv.appendChild(textDiv);

    chatBox.appendChild(messageDiv);
    chatBox.scrollTop = chatBox.scrollHeight;
    return messageDiv;
}
