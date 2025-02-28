import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getFirestore, collection, getDocs, addDoc, doc, deleteDoc, updateDoc } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore-lite.js";

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

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

let nav = 0;
let clicked = null;
let events = [];

const calendar = document.getElementById('calendar');
const newEventModal = document.getElementById('newEventModal');
const deleteEventModal = document.getElementById('deleteEventModal');
const backDrop = document.getElementById('modalBackDrop');
const eventTitleInput = document.getElementById('eventTitleInput');
const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

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

// convert 12-hour time to 24-hour time for sorting
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


document.addEventListener('DOMContentLoaded',  async function () {

  await fetchEvents();

  // 30-minute intervals
  const timeOptions = [];
  for (let hour = 0; hour < 24; hour++) {
    for (let minute of ['00', '30']) {
      const period = hour < 12 ? 'AM' : 'PM'; 
      const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
      const timeString = `${displayHour}:${minute} ${period}`;
      timeOptions.push({ value: timeString, label: timeString });
    }
  }

  const timeSelect = document.getElementById('eventTimeInput');
  const choices = new Choices(timeSelect, {
    choices: timeOptions,
    placeholder: true,
    placeholderValue: 'Select a time',
    searchEnabled: false,
    shouldSort: false,
  });

  const editTimeSelect = document.getElementById('editEventTimeInput');
  const editChoices = new Choices(editTimeSelect, {
    choices: timeOptions,
    placeholder: true,
    placeholderValue: 'Select a time',
    searchEnabled: false,
    shouldSort: false,
  });

  load();
});

function timeToMinutes(time) {
  const [hourMin, period] = time.split(' ');
  let [hours, minutes] = hourMin.split(':').map(num => parseInt(num, 10));

  if (period === 'PM' && hours !== 12) {
    hours += 12;
  } else if (period === 'AM' && hours === 12) {
    hours = 0;
  }

  return hours * 60 + minutes; 
}

let eventToEdit = null;

function openEditEventModal(event) {
  eventToEdit = event;
  document.getElementById('editEventTitleInput').value = event.title;
  document.getElementById('editEventDescriptionInput').value = event.description;
  document.getElementById('editEventTimeInput').value = event.time;
  document.getElementById('editEventModal').style.display = 'block';
  backDrop.style.display = 'block';
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

    await fetchEvents();

    load();


    closeModal();
  } else {
    eventTitleInput.classList.add('error');
  }
}


async function deleteEvent() {
  const eventIndexInput = document.getElementById('eventIndexInput').value;
  const eventIndex = parseInt(eventIndexInput, 10);

  if (isNaN(eventIndex) || eventIndex <= 0 || eventIndex > events.length) {
  
    return;
  }

  const eventToDelete = events[eventIndex - 1]; 

  if (eventToDelete) {
    await deleteDoc(doc(db, 'events', eventToDelete.id));
    await fetchEvents();
    load(); 
    refreshEventDetailsModal(clicked);

  }

  closeDeletePrompt();
}

document.getElementById('deleteButton').addEventListener('click', openDeletePrompt);

document.getElementById('confirmDelete').addEventListener('click', deleteEvent);

document.getElementById('cancelDelete').addEventListener('click', closeDeletePrompt);

window.addEventListener('click', (event) => {
  const deletePromptModal = document.getElementById('deletePromptModal');
  if (event.target === deletePromptModal) {
    closeDeletePrompt();
  }
});

function openDeletePrompt() {
  backDrop.style.display = 'block';
  const deletePromptModal = document.getElementById('deletePromptModal');
  deletePromptModal.style.display = 'block';
}


function closeDeletePrompt() {
  backDrop.style.display = 'none';
  const deletePromptModal = document.getElementById('deletePromptModal');
  deletePromptModal.style.display = 'none'; 
  document.getElementById('eventIndexInput').value = ''; 
}


document.getElementById('deleteButton').addEventListener('click', openDeletePrompt);

document.getElementById('confirmDelete').addEventListener('click', deleteEvent);

document.getElementById('cancelDelete').addEventListener('click', closeDeletePrompt);

window.addEventListener('click', (event) => {
  const deletePromptModal = document.getElementById('deletePromptModal');
  if (event.target === deletePromptModal) {
      closeDeletePrompt();
  }
});


const confirmDeleteBtn = document.getElementById('confirmDelete');


document.getElementById('deleteButton').addEventListener('click', openDeletePrompt);
confirmDeleteBtn.addEventListener('click', deleteEvent); // Trigger delete only on confirm


document.addEventListener('DOMContentLoaded', () => {
  const deleteButton = document.getElementById('deleteButton');
  const confirmDeleteBtn = document.getElementById('confirmDelete');
  const cancelDelete = document.getElementById('cancelDelete');

  deleteButton.addEventListener('click', openDeletePrompt);

  confirmDeleteBtn.addEventListener('click', deleteEvent);

  cancelDelete.addEventListener('click', closeDeletePrompt);

});

async function updateEvent() {
  const title = document.getElementById('editEventTitleInput').value;
  const description = document.getElementById('editEventDescriptionInput').value;
  const time = document.getElementById('editEventTimeInput').value;

  if (title && eventToEdit) {
    await updateDoc(doc(db, 'events', eventToEdit.id), {
      title,
      description,
      time,
    });

    await fetchEvents();
    load();
    closeEditModal();

    refreshEventDetailsModal(clicked);
    deleteEventModal.style.display = 'block';
    backDrop.style.display = 'block';

  }
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

function closeEditModal() {
  document.getElementById('editEventModal').style.display = 'none';
  backDrop.style.display = 'none';
  eventToEdit = null;
}

document.getElementById('updateButton').addEventListener('click', updateEvent);
document.getElementById('cancelEditButton').addEventListener('click', closeEditModal);


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
  document.getElementById('cancelDelete').addEventListener('click', closeModal);

  document.getElementById('addEventButton').addEventListener('click', () => {
    deleteEventModal.style.display = 'none';
    newEventModal.style.display = 'block';
  });
}

initButtons();
load();


window.addEventListener('error', function (event) { console.error('Error occurred: ', event.message); });

