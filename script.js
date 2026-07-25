/* DOM elements */
const chatForm = document.getElementById("chatForm");
const userInput = document.getElementById("userInput");
const chatWindow = document.getElementById("chatWindow");

const SYSTEM_PROMPT = `You are an L'Oréal beauty assistant. Answer only questions about L'Oréal products, routines, and beauty recommendations. If the user asks something unrelated, politely say you can only help with L'Oréal beauty topics. Keep answers short, friendly, and useful. Remember the recent conversation so you can refer to earlier details naturally.`;

// Replace this with your Cloudflare Worker URL from the README.
const workerUrl = "https://misty-sun-33d0.tun72981.workers.dev/";
const conversationHistory = [];

// Set initial message
chatWindow.textContent = "👋 Hello! Ask me about L'Oréal products or routines.";

function addMessage(text, role) {
  const message = document.createElement("div");
  message.className = `msg ${role}`;
  message.textContent = text;
  chatWindow.appendChild(message);
  chatWindow.scrollTop = chatWindow.scrollHeight;
}

/* Handle form submit */
chatForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const userMessage = userInput.value.trim();
  if (!userMessage) {
    return;
  }

  const latestQuestion = document.createElement("div");
  latestQuestion.className = "msg user";
  latestQuestion.textContent = userMessage;
  chatWindow.appendChild(latestQuestion);

  userInput.value = "";
  addMessage("Thinking...", "ai");

  try {
    conversationHistory.push({ role: "user", content: userMessage });

    const response = await fetch(workerUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          ...conversationHistory.slice(-8),
        ],
      }),
    });

    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`);
    }

    const data = await response.json();
    const reply =
      data.choices?.[0]?.message?.content ||
      "Sorry, I could not generate a response.";

    conversationHistory.push({ role: "assistant", content: reply });

    chatWindow.lastElementChild.remove();
    addMessage(reply, "ai");
  } catch (error) {
    chatWindow.lastElementChild.remove();
    addMessage(
      "Sorry, I could not reach the assistant right now. Please try again.",
      "ai",
    );
    console.error(error);
  }
});
