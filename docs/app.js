import { GoogleGenerativeAI } from '@google/generative-ai';
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import './styles.css'; // Import CSS
import './script.js'; // Import JavaScript


let genAI;
let model;


const firebaseConfig = {
  apiKey: "AIzaSyASZJUbaKS5ZeZzhXNtOB9q30LcxlL3Fq4",
  authDomain: "eventplanner-8daa7.firebaseapp.com",
  projectId: "eventplanner-8daa7",
  storageBucket: "eventplanner-8daa7.firebasestorage.app",
  messagingSenderId: "180139946253",
  appId: "1:180139946253:web:9b487c5b102dfeded9c044",
  measurementId: "G-NC4EPER0GW"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export async function getApiKey() {
  try {
    // Correct collection name: 'apiKeys' (plural and uppercase)
    const snapshot = await getDoc(doc(db, "apiKeys", "googleGenerativeAI"));
    if (snapshot.exists()) {
      const apiKey = snapshot.data().key; // Get the API key from Firestore
      genAI = new GoogleGenerativeAI(apiKey); // Initialize Gemini AI
      model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" }); // Use the desired model
      console.log("Gemini AI initialized successfully.");
    } else {
      console.error("API key document not found in Firestore.");
      throw new Error("API key document not found in Firestore.");
    }
  } catch (error) {
    console.error("Error fetching API key from Firestore:", error);
    throw error;
  }
}

// Function to ask the chatbot
export async function askChatBot(request) {
  try {
    const result = await model.generateContent(request);
    const response = await result.response;
    return response.text(); // Return the AI's response
  } catch (error) {
    console.error("Error asking chatbot: ", error);
    throw error;
  }
}










// Fetch the API key from Firebase
// export async function getApiKey() {
//   try {
//     const snapshot = await getDoc(doc(db, "apikey", "googleGenerativeAI"));
//     if (snapshot.exists()) {
//       const apiKey = snapshot.data().key; // Get the API key from Firestore
//       genAI = new GoogleGenerativeAI(apiKey); // Initialize Gemini AI
//       model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" }); // Use the desired model
//       console.log("Gemini AI initialized successfully.");
//     } else {
//       console.error("API key document not found in Firestore.");
//       throw new Error("API key document not found in Firestore.");
//     }
//   } catch (error) {
//     console.error("Error fetching API key from Firestore:", error);
//     throw error;
//   }
// }


// // Initialize the Generative AI model
// export async function getApiKey() {
//   const apiKey = 'AIzaSyBI6kabKj2UDORxjPk_htj3oDzZ1sAecPs'; // Replace with your actual API key
//   genAI = new GoogleGenerativeAI(apiKey);
//   model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-002" });
// }

// // Function to ask the chatbot
// // export async function askChatBot(prompt) {
// //   const result = await model.generateContent(prompt);
// //   const response = await result.response;
// //   return response.text();
// // }

// export async function askChatBot(prompt) {
//   try {
//     const result = await model.generateContent(prompt);
//     const response = await result.response;
//     return response.text();
//   } catch (error) {
//     console.error("Error asking chatbot: ", error);
//     throw error;
//   }
// }



// import { GoogleGenerativeAI } from '@google/generative-ai';

// let genAI;
// let model;

// // Initialize the Generative AI model
// export async function getApiKey() {
//   const apiKey = 'YOUR_API_KEY'; // Replace with your actual API key
//   genAI = new GoogleGenerativeAI(apiKey);
//   model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
// }

// // Function to ask the chatbot
// export async function askChatBot(prompt) {
//   const result = await model.generateContent(prompt);
//   const response = await result.response;
//   return response.text();
// }


// import { GoogleGenerativeAI } from '@google/generative-ai';
// import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";

// let apiKey;
// let genAI;
// let model;

// // Fetch the API key from Firestore and initialize the Generative AI model
// async function getApiKey() {
//   try {
//     const snapshot = await getDoc(doc(db, "apikey", "googlegenai"));
//     apiKey = snapshot.data().key;
//     genAI = new GoogleGenerativeAI(apiKey);
//     model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
//     console.log("Chatbot initialized successfully.");
//   } catch (error) {
//     console.error("Error initializing chatbot: ", error);
//   }
// }

// // Ask the chatbot a question
// async function askChatBot(request) {
//   try {
//     const result = await model.generateContent(request);
//     const response = await result.response;
//     return response.text();
//   } catch (error) {
//     console.error("Error asking chatbot: ", error);
//     return "Sorry, something went wrong. Please try again.";
//   }
// }

// // Export functions for use in other modules
// export { getApiKey, askChatBot };

// import { GoogleGenerativeAI } from '@google/generative-ai';
// import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";

// let apiKey;
// let genAI;
// let model;

// // Fetch the API key from Firestore and initialize the Generative AI model
// async function getApiKey() {
//   try {
//     const snapshot = await getDoc(doc(db, "apikey", "googlegenai"));
//     apiKey = snapshot.data().key;
//     genAI = new GoogleGenerativeAI(apiKey);
//     model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
//     console.log("Chatbot initialized successfully.");
//   } catch (error) {
//     console.error("Error initializing chatbot: ", error);
//   }
// }

// // Ask the chatbot a question
// async function askChatBot(request) {
//   try {
//     const result = await model.generateContent(request);
//     const response = await result.response;
//     return response.text();
//   } catch (error) {
//     console.error("Error asking chatbot: ", error);
//     return "Sorry, something went wrong. Please try again.";
//   }
// }

// // Export functions for use in other modules
// export { getApiKey, askChatBot };

// import { GoogleGenerativeAI } from '@google/generative-ai';
// import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";

// let apiKey;
// let genAI;
// let model;

// //Call in the event listener for page load
// async function getApiKey() {
//   let snapshot = await getDoc(doc(db, "apikey", "googlegenai"));
//   apiKey =  snapshot.data().key;
//   genAI = new GoogleGenerativeAI(apiKey);
//   model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
// }

// async function askChatBot(request) {
//   return await model.generateContent(request);
// }