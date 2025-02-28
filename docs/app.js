import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getFirestore, collection, getDoc, getDocs, addDoc, doc, deleteDoc, updateDoc } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js';
import './script.js'; // Import JavaScript
import { getAuth, GoogleAuthProvider } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";
import { GenerativeModel, GoogleGenerativeAI } from "https://cdn.skypack.dev/@google/generative-ai";

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

let events = []; 
let clicked = null;
let nav = 0;
let genAI;
let model;
const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const backDrop = document.getElementById('modalBackDrop');


function appendMessage(message) {
  const chatHistory = document.getElementById('chat-history');
  const messageDiv = document.createElement('div');
  messageDiv.textContent = message;
  messageDiv.className = 'chat-message';
  chatHistory.appendChild(messageDiv);
  chatHistory.scrollTop = chatHistory.scrollHeight;
}

function convertTimeTo24Hour(time) {
  const [timePart, period] = time.split(' ');
  let [hours, minutes] = timePart.split(':');
  if (period === 'PM' && hours !== '12') {
    hours = parseInt(hours, 10) + 12;
  }
  if (period === 'AM' && hours === '12') {
    hours = '00';
  }
  return `${hours}:${minutes}`;
}


// Call the function to initialize Gemini AI
document.addEventListener('DOMContentLoaded', async () => {
  await getApiKey();
});


export async function getApiKey() {
  try {
    const snapshot = await getDoc(doc(db, "apiKeys", "googleGenerativeAI"));
    if (snapshot.exists()) {
      const apiKey = snapshot.data().key; 
      genAI = new GoogleGenerativeAI(apiKey);
      model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
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

    if (!model) {
      console.error("Gemini AI model not initialized");
      return;
    }

    const result = await model.generateContent(request);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("Error asking chatbot: ", error);
    throw error;
  }
}

const aiButton = document.getElementById('aiButton');
const aiInput = document.getElementById('aiInput');
const chatHistory = document.getElementById('chat-history');

function ruleChatBot(request) {
  // Add Event
  if (request.startsWith("add event")) {
    const eventDetails = request.replace("add event", "").trim();
    const [title, date, time, description] = parseEventDetails(eventDetails);
    if (title && date && time) {
      addEvent(title, date, time, description);
      appendMessage(`Event "${title}" added on ${date} at ${time}.`);
    } else {
      appendMessage("Please specify a valid event title, date, and time.");
    }
    return true;
  }


  // Edit Event
  else if (request.startsWith("edit event")) {
    const editDetails = request.replace("edit event", "").trim();
    const [oldTitle, date, newTitle, newTime] = parseEditDetails(editDetails);
    if (oldTitle && date && newTitle && newTime) {
      editEvent(oldTitle, date, newTitle, newTime);
      appendMessage(`Event "${oldTitle}" on ${date} updated to "${newTitle}" at ${newTime}.`);
    } else {
      appendMessage("Please specify a valid event title, date, new title, and new time.");
    }
    return true;
  }

  // Remove Event
  else if (request.startsWith("remove event")) {
    const removeDetails = request.replace("remove event", "").trim();
    const [title, date] = parseRemoveDetails(removeDetails);
    if (title && date) {
      removeEvent(title, date);
      appendMessage(`Event "${title}" on ${date} removed.`);
    } else {
      appendMessage("Please specify a valid event title and date.");
    }
    return true;
  }

  return false;
}


function parseEventDetails(eventDetails) {
  console.log("Parsing event details:", eventDetails);

  const parts = eventDetails.split(" on ");
  const title = parts[0].trim().replace(/"/g, ''); // Remove quotes and trim

  const dateTimeDesc = parts[1] ? parts[1].split(" at ") : [];
  const date = dateTimeDesc[0] ? dateTimeDesc[0].trim() : null;

  const timeDesc = dateTimeDesc[1] ? dateTimeDesc[1].split(" with ") : [];
  const time = timeDesc[0] ? timeDesc[0].trim() : null;
  const description = timeDesc[1] ? timeDesc[1].trim() : null;

  console.log("Parsed values:", { title, date, time, description });
  return [title, date, time, description];
}

function parseEditDetails(editDetails) {
  console.log("Parsing edit details:", editDetails);

  const parts = editDetails.split(" on ");
  const oldTitle = parts[0].trim().replace(/"/g, '').toLowerCase();

  const dateNewDetails = parts[1] ? parts[1].split(" to ") : [];
  const date = dateNewDetails[0] ? new Date(dateNewDetails[0].trim()).toLocaleDateString('en-US', {
    month: 'numeric',
    day: 'numeric',
    year: 'numeric',
  }) : null;

  const newTitleTime = dateNewDetails[1] ? dateNewDetails[1].split(" at ") : [];
  const newTitle = newTitleTime[0] ? newTitleTime[0].trim().replace(/"/g, '').toLowerCase() : null;
  const newTime = newTitleTime[1] ? newTitleTime[1].trim() : null;

  console.log("Parsed values:", { oldTitle, date, newTitle, newTime });
  return [oldTitle, date, newTitle, newTime];
}

function parseRemoveDetails(removeDetails) {
  console.log("Parsing remove details:", removeDetails);

  const parts = removeDetails.split(" on ");
  const title = parts[0].trim().replace(/"/g, ''); 
  const date = parts[1] ? parts[1].trim() : null;

  console.log("Parsed values:", { title, date });
  return [title, date];
}

function openModal(date) {
  clicked = date;

  const eventsForDay = events.filter(e => e.date === clicked);

  if (eventsForDay.length > 0) {
    document.getElementById('eventText').innerHTML = eventsForDay
      .sort((a, b) => timeToMinutes(a.time) - timeToMinutes(b.time))
      .map((e, index) => {
        return `
          <div class="event-detail">
            <strong>${index + 1}. ${e.time} - ${e.title}</strong>
            ${e.description ? `<p>${e.description}</p>` : ''}
            <button class="edit-event-button" data-event-id="${e.id}">Edit</button>

        
          </div>
        `;
      })
      .join('');

    document.querySelectorAll('.edit-event-button').forEach(button => {
      button.addEventListener('click', (event) => {
        const eventId = event.target.getAttribute('data-event-id');
        const eventToEdit = events.find(e => e.id === eventId);
        if (eventToEdit) {
          openEditEventModal(eventToEdit);
        }
      });
    });

    deleteEventModal.style.display = 'block';
  } else {
    newEventModal.style.display = 'block';
  }

  backDrop.style.display = 'block';
}




function refreshEventDetailsModal(date) {
  const eventsForDay = events.filter(e => e.date === date);

  if (eventsForDay.length > 0) {
    document.getElementById('eventText').innerHTML = eventsForDay
      .sort((a, b) => timeToMinutes(a.time) - timeToMinutes(b.time))
      .map((e, index) => {
        return `
          <div class="event-detail">
            <strong>${index + 1}. ${e.time} - ${e.title}</strong>
            ${e.description ? `<p>${e.description}</p>` : ''}
            <button class="edit-event-button" data-event-id="${e.id}">Edit</button>
          </div>
        `;
      })
      .join('');

    document.querySelectorAll('.edit-event-button').forEach(button => {
      button.addEventListener('click', (event) => {
        const eventId = event.target.getAttribute('data-event-id');
        const eventToEdit = events.find(e => e.id === eventId);
        if (eventToEdit) {
          openEditEventModal(eventToEdit);
        }
      });
    });

        document.querySelectorAll('.delete-event-button').forEach(button => {
          button.addEventListener('click', async (event) => {
            const eventId = event.target.getAttribute('data-event-id');
            await deleteDoc(doc(db, 'events', eventId));
            await fetchEvents();
            refreshEventDetailsModal(clicked);
          });
        });
      }
    }
    
async function addEvent(title, date, time, description) {
  const formattedDate = new Date(date).toLocaleDateString('en-US', {
    month: 'numeric',
    day: 'numeric',
    year: 'numeric',
  });

  const eventData = {
    date: formattedDate,
    time: time,
    title: title,
    description: description, 
  };


    await addDoc(collection(db, 'events'), eventData);
    appendMessage(`Event "${title}" added successfully.`);
    await fetchEvents();
    load();
    refreshEventDetailsModal(clicked);
  }

async function editEvent(oldTitle, date, newTitle, newTime) {
  console.log("Editing event:", { oldTitle, date, newTitle, newTime });

  const eventToEdit = events.find(event => 
    event.title.toLowerCase() === oldTitle.toLowerCase() && 
    event.date === date
  );

  if (eventToEdit) {
    console.log("Event found:", eventToEdit);

    try {
      await updateDoc(doc(db, 'events', eventToEdit.id), {
        title: newTitle,
        time: newTime,
      });

      appendMessage(`Event "${oldTitle}" on ${date} updated to "${newTitle}" at ${newTime}.`);
      await fetchEvents();
      load();
    } catch (error) {
      console.error("Error updating event: ", error);
      appendMessage("Failed to update event. Please try again.");
    }
  } else {
    console.log("Event not found.");
    appendMessage("Event not found.");
  }
}

async function removeEvent(title, date) {
  console.log("Removing event:", { title, date });

  const eventToRemove = events.find(event => event.title === title && event.date === date);

  if (eventToRemove) {
    console.log("Event found:", eventToRemove);

    try {
      await deleteDoc(doc(db, 'events', eventToRemove.id));
      appendMessage(`Event "${title}" on ${date} removed.`);
      await fetchEvents();
      load();
    } catch (error) {
      console.error("Error removing event: ", error);
      appendMessage("Failed to remove event. Please try again.");
    }
  } else {
    console.log("Event not found.");
    appendMessage("Event not found.");
  }
}

aiButton.addEventListener('click', async () => {
  const prompt = aiInput.value.trim().toLowerCase();
  if (prompt) {
    if (!ruleChatBot(prompt)) {
      try {
        const response = await askChatBot(prompt);
        appendMessage(`AI: ${response}`); 
      } catch (error) {
        console.error("Error asking chatbot: ", error);
        appendMessage("Sorry, something went wrong. Please try again.");
      }
    }
  } else {
    appendMessage("Please enter a prompt.");
  }
  aiInput.value = ""; 


  console.log("Fetching events from Firestore..."); 
  await fetchEvents(); 
  console.log("Events fetched:", events); 

  console.log("Loading calendar..."); 
  load(); 
  console.log("Calendar refreshed after chatbot input.");

});

async function fetchEvents() {
  const querySnapshot = await getDocs(collection(db, 'events'));
  events = [];
  querySnapshot.forEach((doc) => {
    events.push({
      id: doc.id,
      ...doc.data(),
    });
  });

  // Sort events by time
  events.sort((a, b) => {
    const timeA = convertTimeTo24Hour(a.time);
    const timeB = convertTimeTo24Hour(b.time);
    return timeA.localeCompare(timeB);
  });
}

function load() {
  const dt = new Date();

  if (nav !== 0) {
    dt.setMonth(new Date().getMonth() + nav);
  }

  const day = dt.getDate();
  const month = dt.getMonth();
  const year = dt.getFullYear();

  const firstDayOfMonth = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const dateString = firstDayOfMonth.toLocaleDateString('en-us', {
    weekday: 'long',
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
  });
  const paddingDays = weekdays.indexOf(dateString.split(', ')[0]);

  document.getElementById('displayMonth').innerText =
    `${dt.toLocaleDateString('en-us', { month: 'long' })} ${year}`;

  calendar.innerHTML = '';

  for (let i = 1; i <= paddingDays + daysInMonth; i++) {
    const daySquare = document.createElement('div');
    daySquare.classList.add('day');

    const dayString = `${month + 1}/${i - paddingDays}/${year}`;

    if (i > paddingDays) {
      daySquare.innerText = i - paddingDays;
      const eventsForDay = events.filter(e => e.date === dayString);

      if (i - paddingDays === day && nav === 0) {
        daySquare.id = 'currentDay';
      }

      if (eventsForDay.length > 0) {
        eventsForDay.forEach(eventForDay => {
          const eventDiv = document.createElement('div');
          eventDiv.classList.add('event');
          eventDiv.innerText = eventForDay.title;
          daySquare.appendChild(eventDiv);
        });
      }

      daySquare.addEventListener('click', () => openModal(dayString));
    } else {
      daySquare.classList.add('padding');
    }

    calendar.appendChild(daySquare);
  }
}
