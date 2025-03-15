const chatBox = document.getElementById("chat-box");
const userInput = document.getElementById("user-input");
const API_URL = "https://straitai-backend.onrender.com/api/chat";

async function sendMessage() {
    let message = userInput.value.trim();
    if (message === "") return;

    // Display user message
    displayMessage("User", message, "user-message");
    userInput.value = "";

    // Show AI "thinking..." message
    let thinkingMessage = displayMessage("Strait-AI", "AI is thinking...", "bot-message");

    try {
        // Add timeout support for the fetch request
        const response = await fetchWithTimeout(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ query: message })
        });

        if (!response.ok) {
            // Handle HTTP errors
            throw new Error(`Server error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        if (!data.response) {
            // Handle missing response field in backend JSON
            throw new Error("Unexpected response format from the AI.");
        }

        // Remove "thinking..." message and display AI response
        chatBox.removeChild(thinkingMessage);
        displayMessage("Strait-AI", data.response, "bot-message");
    } catch (error) {
        // Handle errors gracefully
        chatBox.removeChild(thinkingMessage);
        displayMessage(
            "Strait-AI",
            `Error: ${error.message || "An unknown error occurred."}`,
            "bot-message"
        );
        console.error("Error details:", error);
    }
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

// Utility function: Fetch with timeout
function fetchWithTimeout(url, options, timeout = 30000) {
    return Promise.race([
        fetch(url, options),
        new Promise((_, reject) => 
            setTimeout(() => reject(new Error("Request timed out")), timeout)
        )
    ]);
}
