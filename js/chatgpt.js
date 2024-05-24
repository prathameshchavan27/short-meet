// const { GoogleGenerativeAI } = require('@google/generative-ai');
// import { GoogleGenerativeAI } from "@google/generative-ai";
const GoogleGenerativeAI = "https://cdn.example.com/google-generative-ai/version/generative-ai.min.js" 
const geminiApiKey = 'AIzaSyA3R_k42ZevWBf9fKrLW7bZLX7Chr-jBMI'
// const genAI = new GoogleGenerativeAI(geminiApiKey);


const API_KEY = "YOUR_API_KEY"; // Replace with your actual API key
const genAI = new GoogleGenerativeAI(geminiApiKey);

async function generateStory() {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const prompt = "Write a story about a magic backpack.";
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    document.getElementById("gemini-prompt").innerText = text;
}
let promptButton = document.getElementById('prompt');
promptButton.addEventListener("click", generateStory);


// async function run() {
//     // For text-only input, use the gemini-pro model
//     const model = genAI.getGenerativeModel({ model: "gemini-pro"});
  
//     // const chat = model.startChat({
//     //   history: [
//     //     {
//     //       role: "user",
//     //       parts: [{ text: "Hello, I have 2 dogs in my house." }],
//     //     },
//     //     {
//     //       role: "model",
//     //       parts: [{ text: "Great to meet you. What would you like to know?" }],
//     //     },
//     //   ],
//     //   generationConfig: {
//     //     maxOutputTokens: 100,
//     //   },
//     // });
  
//     // const msg = "How many paws are in my house?";
  
//     // const result = await chat.sendMessage(msg);
//     // const response = await result.response;
//     // console.log(response)
//     // document.getElementById('gemini-promt').innerText = response;
//     // const text = response.text();
//     // console.log(text);
//     const prompt =
//     "Write a sonnet about a programmers life, but also make it rhyme.";
//     const result = await model.generateContent(prompt) ;
//     const response = await result.response;
//     const text = response.text();
//     console.log(text);
// }

// // run();

// let chatgptprompt = (e) => {
//     e.preventDefault();
//     console.log("click")
//     if(promptButton.innerText==='gemini'){
//         document.getElementById('gemini-prompt').style.display = 'grid';
//         document.getElementById('messages').style.display = 'none';
//         run();
//     }else{
//         document.getElementById('gemini-prompt').style.display = 'none';
//         document.getElementById('messages').style.display = 'grid';
//         promptButton.innerText = 'gemini'
//     }
// }
// promptButton.addEventListener('click',chatgptprompt);