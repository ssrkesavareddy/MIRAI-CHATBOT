
const chatbotToggler = document.querySelector(".chatbot-toggler");
const closeBtn = document.querySelector(".close-btn");
const chatbox = document.querySelector(".chatbox");
const chatInput = document.querySelector(".chat-input textarea");
const sendChatBtn = document.querySelector(".chat-input span");

let userMessage = null; // Variable to store user's message
// const API_KEY =""; 
const inputInitHeight = chatInput.scrollHeight;

const createChatLi = (message, className) => {
    // Create a chat <li> element with passed message and className
    const chatLi = document.createElement("li");
    chatLi.classList.add("chat", `${className}`);
    let chatContent = className === "outgoing" ? `<p></p>` : `<span class="material-symbols-outlined">smart_toy</span><p></p>`;
    chatLi.innerHTML = chatContent;
    chatLi.querySelector("p").textContent = message;
    return chatLi; // return chat <li> element
}
function url(chatInput) {
    const userMessage = chatInput.trim().replace(/ /g, '-'); // Process the user input
    const apiUrl = `https://ssrkesavareddy.github.io/MIRAI-CHATBOT/chat?input=${encodeURIComponent(userMessage)}`; // Construct the URL

    return fetch(apiUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            const { response } = data;
            console.log(response);
            return response; // Return the response from the API
        })
        .catch(error => {
            console.log('Sorry, an error occurred:', error.message);
            throw new Error('Sorry, an error occurred.');
        });
}

// const generateResponse = (chatElement) => {
//     const API_URL = "https://api.openai.com/v1/chat/completions";
//     const messageElement = chatElement.querySelector("p");

//     const requestOptions = {
//         method: "POST",
//         headers: {
//             "Content-Type": "application/json",
//             "Authorization": `Bearer ${API_KEY}`
//         },
//         body: JSON.stringify({
//             model: "gpt-3.5-turbo",
//             messages: [{role: "user", content: userMessage}],
//         })
//     }

//     console.log("Sending request to OpenAI API...");
//     fetch(API_URL, requestOptions)
//         .then(res => {
//             if (!res.ok) {
//                 throw new Error(`HTTP error! Status: ${res.status}`);
//             }
//             return res.json();
//         })
//         .then(data => {
//             console.log("Response from OpenAI API:", data);
//             messageElement.textContent = data.choices[0].message.content.trim();
//         })
//         .catch((error) => {
//             console.error("Error from OpenAI API:", error);
//             messageElement.classList.add("error");
//             messageElement.textContent = "Oops! Something went wrong. Please try again.";
//         })
//         .finally(() => chatbox.scrollTo(0, chatbox.scrollHeight));
// }


const handleChat = () => {
    userMessage = chatInput.value.trim(); // Get user entered message and remove extra whitespace
    if(!userMessage) return;

    // Clear the input textarea and set its height to default
    chatInput.value = "";
    chatInput.style.height = `${inputInitHeight}px`;

    // Append the user's message to the chatbox
    chatbox.appendChild(createChatLi(userMessage, "outgoing"));
    chatbox.scrollTo(0, chatbox.scrollHeight);
    
    setTimeout(() => {
        // Display "Thinking..." message while waiting for the response
        const incomingChatLi = createChatLi("Thinking...", "incoming");
        chatbox.appendChild(incomingChatLi);
        chatbox.scrollTo(0, chatbox.scrollHeight);
        generateResponse1(incomingChatLi);
    }, 600);
}
const generateResponse1 = async (chatElement) => {
    const messageElement = chatElement.querySelector("p");
    try {
        let response = await url(userMessage);
        messageElement.textContent = response.trim();
    } catch (error) {
        console.error("Error fetching response:", error);
        messageElement.classList.add("error");
        messageElement.textContent = "Oops! Something went wrong while fetching the response.";
    }
}

chatInput.addEventListener("input", () => {
    // Adjust the height of the input textarea based on its content
    chatInput.style.height = `${inputInitHeight}px`;
    chatInput.style.height = `${chatInput.scrollHeight}px`;
});

chatInput.addEventListener("keydown", (e) => {
    // If Enter key is pressed without Shift key and the window 
    // width is greater than 800px, handle the chat
    if(e.key === "Enter" && !e.shiftKey && window.innerWidth > 800) {
        e.preventDefault();
        handleChat();
    }
});

sendChatBtn.addEventListener("click", handleChat);
closeBtn.addEventListener("click", () => document.body.classList.remove("show-chatbot"));
chatbotToggler.addEventListener("click", () => document.body.classList.toggle("show-chatbot"));
