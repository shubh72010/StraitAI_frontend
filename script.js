const chatBox = document.getElementById("chat-box");
const userInput = document.getElementById("user-input");
const API_URL = "https://straitai-backend.onrender.com/api/chat";

// Send a message to the backend
async function sendMessage() {
    let message = userInput.value.trim();
    if (message === "") return;

    // Display user message
    displayMessage("User", message, "user-message");
    userInput.value = "";

    // Show AI "thinking..." animation
    const thinkingMessage = displayMessage("Strait-AI", "AI is thinking.", "bot-message");
    animateDots(thinkingMessage.querySelector(".text")); // Apply dots animation

    try {
        // Fetch response from backend with timeout
        const response = await fetchWithTimeout(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ query: message }),
        });

        if (!response.ok) {
            throw new Error(`Server error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        if (!data.response) {
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

// Display a message in the chat box
function displayMessage(name, text, type) {
    let messageDiv = document.createElement("div");
    messageDiv.classList.add("message", type);

    let nameDiv = document.createElement("div");
    nameDiv.textContent = name;
    nameDiv.classList.add("username");

    let textDiv = document.createElement("div");
    textDiv.textContent = text;
    textDiv.classList.add("text");

    messageDiv.appendChild(nameDiv);
    messageDiv.appendChild(textDiv);

    chatBox.appendChild(messageDiv);
    chatBox.scrollTop = chatBox.scrollHeight; // Auto-scroll to the bottom
    return messageDiv;
}

// Animate dots for "thinking..."
function animateDots(element) {
    const dots = ["AI is thinking.", "AI is thinking..", "AI is thinking..."];
    let count = 0;

    const interval = setInterval(() => {
        element.textContent = dots[count % dots.length];
        count++;
    }, 500);

    // Store the interval ID to clear it later
    element.dataset.intervalId = interval;
}

// Utility function: Fetch with timeout
function fetchWithTimeout(url, options, timeout = 6000000000) {
    return Promise.race([
        fetch(url, options),
        new Promise((_, reject) =>
            setTimeout(() => reject(new Error("Request timed out")), timeout)
        ),
    ]);
}

// Clear the animation when no longer needed
function stopAnimation(element) {
    if (element.dataset.intervalId) {
        clearInterval(element.dataset.intervalId);
    }
}

// Add event listeners for Enter and Shift+Enter
userInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
        event.preventDefault(); // Prevent newline
        sendMessage();
    } else if (event.key === "Enter" && event.shiftKey) {
        // Allow Shift+Enter to create a new line
        event.preventDefault();
        userInput.value += "\n";
    }
});
