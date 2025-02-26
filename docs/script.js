// import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
// import { getFirestore, collection, getDocs, addDoc, doc, deleteDoc } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore-lite.js";


//  import { initializeApp } from "firebase/app";
//  import { getFirestore, collection, getDocs, addDoc, doc, deleteDoc } from "firebase/firestore/lite";


// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyASZJUbaKS5ZeZzhXNtOB9q30LcxlL3Fq4",
  authDomain: "eventplanner-8daa7.firebaseapp.com",
  projectId: "eventplanner-8daa7",
  storageBucket: "eventplanner-8daa7.firebasestorage.app",
  messagingSenderId: "180139946253",
  appId: "1:180139946253:web:9b487c5b102dfeded9c044",
  measurementId: "G-NC4EPER0GW"
};


// Initialize Firebase
// import { initializeApp } from "firebase/app";
// import { getFirestore, collection, getDocs, addDoc, doc, deleteDoc } from "firebase/firestore";

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// import { initializeApp } from "firebase/app";
// import { getFirestore, collection, getDocs, addDoc, doc, deleteDoc } from "firebase/firestore/lite";

let nav = 0;
let clicked = null;
let events = [];


const calendar = document.getElementById('calendar');
const newEventModal = document.getElementById('newEventModal');
const deleteEventModal = document.getElementById('deleteEventModal');
const backDrop = document.getElementById('modalBackDrop');
const eventTitleInput = document.getElementById('eventTitleInput');
const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

// function openModal(date) {
//   clicked = date;

//   const eventForDay = events.find(e => e.date === clicked);

//   if (eventForDay) {
//     document.getElementById('eventText').innerText = eventForDay.title;
//     deleteEventModal.style.display = 'block';
//   } else {
//     newEventModal.style.display = 'block';
//   }

//   backDrop.style.display = 'block';
// }


function openModal(date) {
  clicked = date;

  const eventForDay = events.find(e => e.date === clicked);

  if (eventForDay) {
    document.getElementById('eventText').innerText = eventForDay.title;
    document.getElementById('eventTitleInput').value = eventForDay.title;
    document.getElementById('eventDescriptionInput').value = eventForDay.description;
    document.getElementById('eventTimeInput').value = eventForDay.time;
    deleteEventModal.style.display = 'block';
  } else {
    newEventModal.style.display = 'block';
  }

  backDrop.style.display = 'block';
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

  for(let i = 1; i <= paddingDays + daysInMonth; i++) {
    const daySquare = document.createElement('div');
    daySquare.classList.add('day');

    const dayString = `${month + 1}/${i - paddingDays}/${year}`;

    if (i > paddingDays) {
      daySquare.innerText = i - paddingDays;
      const eventForDay = events.find(e => e.date === dayString);

      if (i - paddingDays === day && nav === 0) {
        daySquare.id = 'currentDay';
      }

      if (eventForDay) {
        const eventDiv = document.createElement('div');
        eventDiv.classList.add('event');
        eventDiv.innerText = eventForDay.title;
        daySquare.appendChild(eventDiv);
      }

      daySquare.addEventListener('click', () => openModal(dayString));
    } else {
      daySquare.classList.add('padding');
    }

    calendar.appendChild(daySquare);    
  }
}



// async function load() {
//   const dt = new Date();

//   if (nav !== 0) {
//     dt.setMonth(new Date().getMonth() + nav);
//   }

//   const day = dt.getDate();
//   const month = dt.getMonth();
//   const year = dt.getFullYear();

//   const firstDayOfMonth = new Date(year, month, 1);
//   const daysInMonth = new Date(year, month + 1, 0).getDate();

//   const dateString = firstDayOfMonth.toLocaleDateString('en-us', {
//     weekday: 'long',
//     year: 'numeric',
//     month: 'numeric',
//     day: 'numeric',
//   });
//   const paddingDays = weekdays.indexOf(dateString.split(', ')[0]);

//   document.getElementById('displayMonth').innerText = 
//     `${dt.toLocaleDateString('en-us', { month: 'long' })} ${year}`;

//   calendar.innerHTML = '';

//   // Fetch events from Firebase
//   const eventsSnapshot = await getDocs(collection(db, 'events'));
//   events = eventsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

//   for (let i = 1; i <= paddingDays + daysInMonth; i++) {
//     const daySquare = document.createElement('div');
//     daySquare.classList.add('day');

//     const dayString = `${month + 1}/${i - paddingDays}/${year}`;

//     if (i > paddingDays) {
//       daySquare.innerText = i - paddingDays;
//       const eventsForDay = events.filter(e => e.date === dayString);

//       if (i - paddingDays === day && nav === 0) {
//         daySquare.id = 'currentDay';
//       }

//       eventsForDay.sort((a, b) => a.time.localeCompare(b.time)).forEach(event => {
//         const eventDiv = document.createElement('div');
//         eventDiv.classList.add('event');
//         eventDiv.innerText = `${event.title} - ${event.time}`;
//         daySquare.appendChild(eventDiv);
//       });

//       daySquare.addEventListener('click', () => openModal(dayString));
//     } else {
//       daySquare.classList.add('padding');
//     }

//     calendar.appendChild(daySquare);
//   }
// }

// function closeModal() {
//   eventTitleInput.classList.remove('error');
//   newEventModal.style.display = 'none';
//   deleteEventModal.style.display = 'none';
//   backDrop.style.display = 'none';
//   eventTitleInput.value = '';
//   clicked = null;
//   load();
// }


function closeModal() {
  eventTitleInput.classList.remove('error');
  newEventModal.style.display = 'none';
  deleteEventModal.style.display = 'none';
  backDrop.style.display = 'none';
  eventTitleInput.value = '';
  document.getElementById('eventDescriptionInput').value = '';
  document.getElementById('eventTimeInput').value = '';
  clicked = null;
  load();
}

async function saveEvent() {
  if (eventTitleInput.value) {
    eventTitleInput.classList.remove('error');

    const event = {
      date: clicked,
      title: eventTitleInput.value,
      description: document.getElementById('eventDescriptionInput').value,
      time: document.getElementById('eventTimeInput').value,
    };

    await addDoc(collection(db, 'events'), event);
    closeModal();
  } else {
    eventTitleInput.classList.add('error');
  }
}

async function deleteEvent() {
  const eventToDelete = events.find(e => e.date === clicked);
  if (eventToDelete) {
    await deleteDoc(doc(db, 'events', eventToDelete.id));
  }
  closeModal();
}

function initButtons() {
  document.getElementById('nextButton').addEventListener('click', () => {
    nav++;
    load();
  });

  document.getElementById('backButton').addEventListener('click', () => {
    nav--;
    load();
  });

  document.getElementById('saveButton').addEventListener('click', saveEvent);
  document.getElementById('cancelButton').addEventListener('click', closeModal);
  document.getElementById('deleteButton').addEventListener('click', deleteEvent);
  document.getElementById('closeButton').addEventListener('click', closeModal);
}

initButtons();
load();
