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

// Helper function to convert 12-hour time to 24-hour time for sorting
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

  // Generate time options from 12:00 AM to 12:00 PM in 30-minute intervals
  const timeOptions = [];
  for (let hour = 0; hour < 24; hour++) {
    for (let minute of ['00', '30']) {
      const period = hour < 12 ? 'AM' : 'PM'; // Determine AM or PM
      const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour; // Convert to 12-hour format
      const timeString = `${displayHour}:${minute} ${period}`;
      timeOptions.push({ value: timeString, label: timeString });
    }
  }

  // Initialize Choices.js
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

  return hours * 60 + minutes; // Convert to total minutes since midnight
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





// function openModal(date) {
//   clicked = date;

//   const eventsForDay = events.filter(e => e.date === clicked);

//   if (eventsForDay.length > 0) {
//     // Display all events for the day in the delete modal
//     document.getElementById('eventText').innerText = eventsForDay
//       .sort((a, b) => a.time.localeCompare(b.time)) // Sort by time
//       .map((e, index) => `${index + 1}. ${e.time} - ${e.title}`)
//       .join('\n');
//     deleteEventModal.style.display = 'block';
//   } else {
//     newEventModal.style.display = 'block';
//   }

//   backDrop.style.display = 'block';
// }



// function openModal(date) {
//   clicked = date;

//   const eventsForDay = events.filter(e => e.date === clicked);


//   if (eventsForDay.length > 0) {
//     // Display all events for the day
//     document.getElementById('eventText').innerText = eventsForDay
//       .sort((a, b) => a.time.localeCompare(b.time)) // Sort by time
//       .map(e => `${e.time} - ${e.title}`)
//       .join('\n');
//     deleteEventModal.style.display = 'block';
//   } else {
//     newEventModal.style.display = 'block';
//   }

//   backDrop.style.display = 'block';
// }

//   if (eventsForDay.length > 0) {
//     // Sort events based on time in minutes
//     document.getElementById('eventText').innerHTML = eventsForDay
//       .sort((a, b) => timeToMinutes(a.time) - timeToMinutes(b.time)) // Sort by time
//       .map((e, index) => {
//         return `
//           <div class="event-detail">
//             <strong>${index + 1}. ${e.time} - ${e.title}</strong>
//             ${e.description ? `<p>${e.description}</p>` : ''}
//             <button class="edit-event-button" data-event-id="${e.id}">Edit</button>
//             <button class="delete-event-button" data-event-id="${e.id}">Delete</button>
//           </div>
//         `;
//       })
//       .join('');

//     // Add event listeners to the Edit buttons
//     document.querySelectorAll('.edit-event-button').forEach(button => {
//       button.addEventListener('click', (event) => {
//         const eventId = event.target.getAttribute('data-event-id');
//         const eventToEdit = events.find(e => e.id === eventId);
//         if (eventToEdit) {
//           openEditEventModal(eventToEdit);
//         }
//       });
//     });

//     // Add event listeners to the Delete buttons
//     document.querySelectorAll('.delete-event-button').forEach(button => {
//       button.addEventListener('click', async (event) => {
//         const eventId = event.target.getAttribute('data-event-id');
//         await deleteDoc(doc(db, 'events', eventId));
//         await fetchEvents();
//         refreshEventDetailsModal(clicked);
//       });
//     });

//     deleteEventModal.style.display = 'block';
//   } else {
//     newEventModal.style.display = 'block';
//   }

//   backDrop.style.display = 'block';
// }




function openModal(date) {
  clicked = date;

  const eventsForDay = events.filter(e => e.date === clicked);

  if (eventsForDay.length > 0) {
    // Sort events based on time in minutes
    document.getElementById('eventText').innerHTML = eventsForDay
      .sort((a, b) => timeToMinutes(a.time) - timeToMinutes(b.time)) // Sort by time
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

          // <button class="delete-event-button" data-event-id="${e.id}">Delete</button>

    // Add event listeners to the Edit buttons
    document.querySelectorAll('.edit-event-button').forEach(button => {
      button.addEventListener('click', (event) => {
        const eventId = event.target.getAttribute('data-event-id');
        const eventToEdit = events.find(e => e.id === eventId);
        if (eventToEdit) {
          openEditEventModal(eventToEdit);
        }
      });
    });

  //Add event listeners to the Delete buttons
    // document.querySelectorAll('.delete-event-button').forEach(button => {
    //   button.addEventListener('click', async (event) => {
    //     const eventId = event.target.getAttribute('data-event-id');
    //     await deleteDoc(doc(db, 'events', eventId));
    //     await fetchEvents();
    //     refreshEventDetailsModal(clicked);
    //   });
    // });

    deleteEventModal.style.display = 'block';
  } else {
    newEventModal.style.display = 'block';
  }

  backDrop.style.display = 'block';
}







// function load() {
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

//   for (let i = 1; i <= paddingDays + daysInMonth; i++) {
//     const daySquare = document.createElement('div');
//     daySquare.classList.add('day');

//     const dayString = `${month + 1}/${i - paddingDays}/${year}`;

//     if (i > paddingDays) {
//       daySquare.innerText = i - paddingDays;
//       const eventForDay = events.find(e => e.date === dayString);

//       if (i - paddingDays === day && nav === 0) {
//         daySquare.id = 'currentDay';
//       }

//       if (eventForDay) {
//         const eventDiv = document.createElement('div');
//         eventDiv.classList.add('event');
//         eventDiv.innerText = eventForDay.title;
//         daySquare.appendChild(eventDiv);
//       }

//       daySquare.addEventListener('click', () => openModal(dayString));
//     } else {
//       daySquare.classList.add('padding');
//     }

//     calendar.appendChild(daySquare);
//   }
// }



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


// function deleteEvent() {
//   const eventIndex = prompt('Enter the number of the event you want to delete:');
//   if (eventIndex !== null && !isNaN(eventIndex)) {
//     const indexToDelete = parseInt(eventIndex) - 1;
//     events = events.filter((e, index) => {
//       return e.date !== clicked || index !== indexToDelete;
//     });
//     localStorage.setItem('events', JSON.stringify(events));
//     closeModal();
//   }
// }













function deleteEvent() {
  const eventIndexInput = document.getElementById('eventIndexInput');
  const eventIndex = eventIndexInput.value;

  // if (eventIndex !== null && !isNaN(eventIndex)) {
  //   const indexToDelete = parseInt(eventIndex) - 1;


  //   events = events.filter((e, index) => {
  //     return e.date !== clicked || index !== indexToDelete;
  //   });

  if (eventIndex !== null && !isNaN(eventIndex)) {
    const indexToDelete = parseInt(eventIndex) - 1;
    events = events.filter((e, index) => {
      return e.date !== clicked || index !== indexToDelete;
    });

    localStorage.setItem('events', JSON.stringify(events));

    closeModal();
    
    closeDeletePrompt();

    eventIndexInput.value = '';
  } else {
    alert('Please enter a valid event number.');
  }
}

function openDeletePrompt() {
  const deletePromptModal = document.getElementById('deletePromptModal');
  backDrop.style.display = 'block';
  deletePromptModal.style.display = 'block';
}

function closeDeletePrompt() {
  const deletePromptModal = document.getElementById('deletePromptModal');
  document.getElementById('backdrop').style.display = 'none';
  deletePromptModal.style.display = 'none';
  document.getElementById('eventIndexInput').value = '';
}





// document.addEventListener('DOMContentLoaded', () => {
//   const deleteButton = document.getElementById('deleteButton');
//   const confirmDeleteBtn = document.getElementById('confirmDelete');
//   const cancelDeleteBtn = document.getElementById('cancelDelete');
//   const closeButton = document.getElementById('closeButton');
//   const closePromptBtn = document.querySelector('#deletePromptModal .close');

//   // Open delete prompt when "Delete Event" is clicked
//   deleteButton.addEventListener('click', openDeletePrompt);

//   // Handle confirm delete
//   confirmDeleteBtn.addEventListener('click', deleteEvent);

//   // Handle cancel delete
//   cancelDeleteBtn.addEventListener('click', closeDeletePrompt);

//   // Close the main modal
//   closeButton.addEventListener('click', closeModal);

//   // Close the delete prompt modal
//   closePromptBtn.addEventListener('click', closeDeletePrompt);

//   // Handle clicking outside the modals
//   window.addEventListener('click', (event) => {
//     const deleteEventModal = document.getElementById('deleteEventModal');
//     const deletePromptModal = document.getElementById('deletePromptModal');
//     if (event.target === deleteEventModal) {
//       deleteEventModal.style.display = 'none';
//     }
//     if (event.target === deletePromptModal) {
//       deletePromptModal.style.display = 'none';
//     }
//   });
// });

document.addEventListener('DOMContentLoaded', () => {
  const deleteButton = document.getElementById('deleteButton');
  const confirmDeleteBtn = document.getElementById('confirmDelete');
  const cancelDeleteBtn = document.getElementById('cancelDelete');
  const closeButton = document.getElementById('closeButton');
  const closePromptBtn = document.querySelector('#deletePromptModal .close');

  // Open delete prompt when "Delete Event" is clicked
  if (deleteButton) {
    deleteButton.addEventListener('click', openDeletePrompt);
  }

  // Handle confirm delete
  if (confirmDeleteBtn) {
    confirmDeleteBtn.addEventListener('click', deleteEvent);
  }

  // Handle cancel delete
  if (cancelDeleteBtn) {
    cancelDeleteBtn.addEventListener('click', closeDeletePrompt);
  }

  // Close the main modal
  if (closeButton) {
    closeButton.addEventListener('click', closeModal);
  }

  // Close the delete prompt modal
  if (closePromptBtn) {
    closePromptBtn.addEventListener('click', closeDeletePrompt);
  }

  // Handle clicking outside the modals
  window.addEventListener('click', (event) => {
    const deleteEventModal = document.getElementById('deleteEventModal');
    const deletePromptModal = document.getElementById('deletePromptModal');
    if (event.target === deleteEventModal) {
      deleteEventModal.style.display = 'none';
    }
    if (event.target === deletePromptModal) {
      deletePromptModal.style.display = 'none';
    }
  });
});

// async function deleteEvent() {
//   const eventToDelete = events.find(e => e.date === clicked);
//   if (eventToDelete) {
//     await deleteDoc(doc(db, 'events', eventToDelete.id));

//       // Fetch the updated list of events from Firebase
//       await fetchEvents();

//       // Refresh the calendar
//       load();
//   }
//   closeModal();
// }

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
    // Sort events based on time in minutes
    document.getElementById('eventText').innerHTML = eventsForDay
      .sort((a, b) => timeToMinutes(a.time) - timeToMinutes(b.time)) // Sort by time
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

    // Add event listeners to the Edit buttons
    document.querySelectorAll('.edit-event-button').forEach(button => {
      button.addEventListener('click', (event) => {
        const eventId = event.target.getAttribute('data-event-id');
        const eventToEdit = events.find(e => e.id === eventId);
        if (eventToEdit) {
          openEditEventModal(eventToEdit);
        }
      });
    });

        // Add event listeners to the Delete buttons
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


  document.getElementById('addEventButton').addEventListener('click', () => {
    deleteEventModal.style.display = 'none';
    newEventModal.style.display = 'block';
  });
}

initButtons();
load();


window.addEventListener('error', function (event) { console.error('Error occurred: ', event.message); });


















// import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
// import { getFirestore, collection, getDocs, addDoc, doc, deleteDoc, updateDoc } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore-lite.js";
  

// // Firebase configuration
// const firebaseConfig = {
//   apiKey: "AIzaSyASZJUbaKS5ZeZzhXNtOB9q30LcxlL3Fq4",
//   authDomain: "eventplanner-8daa7.firebaseapp.com",
//   projectId: "eventplanner-8daa7",
//   storageBucket: "eventplanner-8daa7.firebasestorage.app",
//   messagingSenderId: "180139946253",
//   appId: "1:180139946253:web:9b487c5b102dfeded9c044",
//   measurementId: "G-NC4EPER0GW"
// };

// const app = initializeApp(firebaseConfig);
// const db = getFirestore(app);

// let nav = 0;
// let clicked = null;
// let events = [];

// const calendar = document.getElementById('calendar');
// const newEventModal = document.getElementById('newEventModal');
// const deleteEventModal = document.getElementById('deleteEventModal');
// const backDrop = document.getElementById('modalBackDrop');
// const eventTitleInput = document.getElementById('eventTitleInput');
// const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

// // Fetch events from Firebase
// // async function fetchEvents() {
// //   const querySnapshot = await getDocs(collection(db, 'events'));
// //   events = [];
// //   querySnapshot.forEach((doc) => {
// //     events.push({
// //       id: doc.id,
// //       ...doc.data(),
// //     });
// //   });
// // }

// async function fetchEvents() {
//   const querySnapshot = await getDocs(collection(db, 'events'));
//   events = [];
//   querySnapshot.forEach((doc) => {
//     events.push({
//       id: doc.id,
//       ...doc.data(),
//     });
//   });

//   // Sort events by time
//   events.sort((a, b) => {
//     const timeA = convertTimeTo24Hour(a.time);
//     const timeB = convertTimeTo24Hour(b.time);
//     return timeA.localeCompare(timeB);
//   });
// }

// // Helper function to convert 12-hour time to 24-hour time for sorting
// function convertTimeTo24Hour(time) {
//   const [timePart, period] = time.split(' ');
//   let [hours, minutes] = timePart.split(':');
//   if (period === 'PM' && hours !== '12') {
//     hours = parseInt(hours, 10) + 12;
//   }
//   if (period === 'AM' && hours === '12') {
//     hours = '00';
//   }
//   return `${hours}:${minutes}`;
// }


// document.addEventListener('DOMContentLoaded',  async function () {

//   await fetchEvents();

//   // Generate time options from 12:00 AM to 12:00 PM in 30-minute intervals
//   const timeOptions = [];
//   for (let hour = 0; hour < 24; hour++) {
//     for (let minute of ['00', '30']) {
//       const period = hour < 12 ? 'AM' : 'PM'; // Determine AM or PM
//       const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour; // Convert to 12-hour format
//       const timeString = `${displayHour}:${minute} ${period}`;
//       timeOptions.push({ value: timeString, label: timeString });
//     }
//   }

//   // Initialize Choices.js
//   const timeSelect = document.getElementById('eventTimeInput');
//   const choices = new Choices(timeSelect, {
//     choices: timeOptions,
//     placeholder: true,
//     placeholderValue: 'Select a time',
//     searchEnabled: false,
//     shouldSort: false,
//   });

//   const editTimeSelect = document.getElementById('editEventTimeInput');
//   const editChoices = new Choices(editTimeSelect, {
//     choices: timeOptions,
//     placeholder: true,
//     placeholderValue: 'Select a time',
//     searchEnabled: false,
//     shouldSort: false,
//   });


//   load();
// });



// //Original 
// // function openModal(date) {
// //   clicked = date;
  

// //   const eventForDay = events.find(e => e.date === clicked);

// //   if (eventForDay) {
// //     document.getElementById('eventText').innerText = eventForDay.title;
// //     document.getElementById('eventTitleInput').value = eventForDay.title;
// //     document.getElementById('eventDescriptionInput').value = eventForDay.description;
// //     document.getElementById('eventTimeInput').value = eventForDay.time;
// //     deleteEventModal.style.display = 'block';
// //   } else {
// //     newEventModal.style.display = 'block';
// //   }

// //   backDrop.style.display = 'block';
// // }



// //Lists the events 
// // function openModal(date) {
// //   clicked = date;

// //   const eventsForDay = events.filter(e => e.date === clicked);

// //   if (eventsForDay.length > 0) {
// //     // Sort events based on time in minutes
// //     document.getElementById('eventText').innerHTML = eventsForDay
// //       .sort((a, b) => timeToMinutes(a.time) - timeToMinutes(b.time)) // Sort by time
// //       .map((e, index) => {
// //         return `
// //           <div>
// //             <strong>${index + 1}. ${e.time} - ${e.title}</strong>
// //             ${e.description ? `<p>${e.description}</p>` : ''}
// //           </div>
// //         `;
// //       })
// //       .join('');
// //     deleteEventModal.style.display = 'block';
// //   } else {
// //     newEventModal.style.display = 'block';
// //   }

// //   backDrop.style.display = 'block';
// // }


// function timeToMinutes(time) {
//   const [hourMin, period] = time.split(' ');
//   let [hours, minutes] = hourMin.split(':').map(num => parseInt(num, 10));

//   if (period === 'PM' && hours !== 12) {
//     hours += 12;
//   } else if (period === 'AM' && hours === 12) {
//     hours = 0;
//   }

//   return hours * 60 + minutes; // Convert to total minutes since midnight
// }


// let eventToEdit = null;

// function openEditEventModal(event) {
//   eventToEdit = event;
//   document.getElementById('editEventTitleInput').value = event.title;
//   document.getElementById('editEventDescriptionInput').value = event.description;
//   document.getElementById('editEventTimeInput').value = event.time;
//   document.getElementById('editEventModal').style.display = 'block';
//   backDrop.style.display = 'block';
// }


// function openModal(date) {
//   clicked = date;

//   const eventsForDay = events.filter(e => e.date === clicked);

//   if (eventsForDay.length > 0) {
//     // Sort events based on time in minutes
//     document.getElementById('eventText').innerHTML = eventsForDay
//       .sort((a, b) => timeToMinutes(a.time) - timeToMinutes(b.time)) // Sort by time
//       .map((e, index) => {
//         return `
//           <div class="event-detail">
//             <strong>${index + 1}. ${e.time} - ${e.title}</strong>
//             ${e.description ? `<p>${e.description}</p>` : ''}
//             <button class="edit-event-button" data-event-id="${e.id}">Edit</button>
//           </div>
//         `;
//       })
//       .join('');

//     // Add event listeners to the Edit buttons
//     document.querySelectorAll('.edit-event-button').forEach(button => {
//       button.addEventListener('click', (event) => {
//         const eventId = event.target.getAttribute('data-event-id');
//         const eventToEdit = events.find(e => e.id === eventId);
//         if (eventToEdit) {
//           openEditEventModal(eventToEdit);
//         }
//       });
//     });

//     deleteEventModal.style.display = 'block';
//   } else {
//     newEventModal.style.display = 'block';
//   }

//   backDrop.style.display = 'block';
// }






// function load() {
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

//   for (let i = 1; i <= paddingDays + daysInMonth; i++) {
//     const daySquare = document.createElement('div');
//     daySquare.classList.add('day');

//     const dayString = `${month + 1}/${i - paddingDays}/${year}`;

//     if (i > paddingDays) {
//       daySquare.innerText = i - paddingDays;
//       const eventForDay = events.find(e => e.date === dayString);

//       if (i - paddingDays === day && nav === 0) {
//         daySquare.id = 'currentDay';
//       }

//       if (eventForDay) {
//         const eventDiv = document.createElement('div');
//         eventDiv.classList.add('event');
//         eventDiv.innerText = eventForDay.title;
//         daySquare.appendChild(eventDiv);
//       }

//       daySquare.addEventListener('click', () => openModal(dayString));
//     } else {
//       daySquare.classList.add('padding');
//     }

//     calendar.appendChild(daySquare);
//   }
// }


// // function showCustomAlert(title, message) {
// //   // Set the title and message of the alert
// //   document.getElementById('alertTitle').textContent = title;
// //   document.getElementById('alertMessage').textContent = message;
  
// //   // Show the alert modal and backdrop
// //   document.getElementById('customAlertModal').style.display = 'block';
// //   document.getElementById('modalBackdrop').style.display = 'block';

// //   // List of buttons that should close the modal
// //   const closeButtons = ['closeAlertButton2', 'closeAlertButton', 'modalBackdrop'];
  
// //   // Attach click event listener for each close button
// //   closeButtons.forEach(buttonId => {
// //     const button = document.getElementById(buttonId);
// //     if (button) {
// //       button.onclick = closeCustomAlert;
// //     }
// //   });
// // }



// function closeModal() {
//   eventTitleInput.classList.remove('error');
//   newEventModal.style.display = 'none';
//   deleteEventModal.style.display = 'none';
//   backDrop.style.display = 'none';
//   eventTitleInput.value = '';
//   document.getElementById('eventDescriptionInput').value = '';
//   document.getElementById('eventTimeInput').value = '';
//   clicked = null;
//   load();
// }

// async function saveEvent() {
//   if (eventTitleInput.value) {
//     eventTitleInput.classList.remove('error');

//     const event = {
//       date: clicked,
//       title: eventTitleInput.value,
//       description: document.getElementById('eventDescriptionInput').value,
//       time: document.getElementById('eventTimeInput').value,
//     };

//     await addDoc(collection(db, 'events'), event);

//     await fetchEvents();

//     load();


//     closeModal();
//   } else {
//     eventTitleInput.classList.add('error');
//   }
// }



// async function deleteEvent() {
//   const eventToDelete = events.find(e => e.date === clicked);
//   if (eventToDelete) {
//     await deleteDoc(doc(db, 'events', eventToDelete.id));

//       // Fetch the updated list of events from Firebase
//       await fetchEvents();

//       // Refresh the calendar
//       load();
//   }
//   closeModal();
// }



// async function updateEvent() {
//   const title = document.getElementById('editEventTitleInput').value;
//   const description = document.getElementById('editEventDescriptionInput').value;
//   const time = document.getElementById('editEventTimeInput').value;

//   if (title && eventToEdit) {
//     await updateDoc(doc(db, 'events', eventToEdit.id), {
//       title,
//       description,
//       time,
//     });

//     await fetchEvents();
//     load();
//     closeEditModal();


//     refreshEventDetailsModal(clicked);
//     deleteEventModal.style.display = 'block';
//     backDrop.style.display = 'block';

//   }
// }


// function refreshEventDetailsModal(date) {
//   const eventsForDay = events.filter(e => e.date === date);

//   if (eventsForDay.length > 0) {
//     // Sort events based on time in minutes
//     document.getElementById('eventText').innerHTML = eventsForDay
//       .sort((a, b) => timeToMinutes(a.time) - timeToMinutes(b.time)) // Sort by time
//       .map((e, index) => {
//         return `
//           <div class="event-detail">
//             <strong>${index + 1}. ${e.time} - ${e.title}</strong>
//             ${e.description ? `<p>${e.description}</p>` : ''}
//             <button class="edit-event-button" data-event-id="${e.id}">Edit</button>
//           </div>
//         `;
//       })
//       .join('');

//     // Add event listeners to the Edit buttons
//     document.querySelectorAll('.edit-event-button').forEach(button => {
//       button.addEventListener('click', (event) => {
//         const eventId = event.target.getAttribute('data-event-id');
//         const eventToEdit = events.find(e => e.id === eventId);
//         if (eventToEdit) {
//           openEditEventModal(eventToEdit);
//         }
//       });
//     });
//   }
// }

// function closeEditModal() {
//   document.getElementById('editEventModal').style.display = 'none';
//   backDrop.style.display = 'none';
//   eventToEdit = null;
// }

// document.getElementById('updateButton').addEventListener('click', updateEvent);
// document.getElementById('cancelEditButton').addEventListener('click', closeEditModal);


// function initButtons() {
//   document.getElementById('nextButton').addEventListener('click', () => {
//     nav++;
//     load();
//   });

//   document.getElementById('backButton').addEventListener('click', () => {
//     nav--;
//     load();
//   });

//   document.getElementById('saveButton').addEventListener('click', saveEvent);
//   document.getElementById('cancelButton').addEventListener('click', closeModal);
//   document.getElementById('deleteButton').addEventListener('click', deleteEvent);
//   document.getElementById('closeButton').addEventListener('click', closeModal);
// }

// initButtons();
// load();


// window.addEventListener('error', function (event) { console.error('Error occurred: ', event.message); });

















//old 



// import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
// import { getFirestore, collection, getDocs, addDoc, doc, deleteDoc } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore-lite.js";


  // import { initializeApp } from "firebase/app";
  // import { getFirestore, collection, getDocs, addDoc, doc, deleteDoc } from "firebase/firestore";



// Initialize Firebase
// import { initializeApp } from "firebase/app";
// import { getFirestore, collection, getDocs, addDoc, doc, deleteDoc } from "firebase/firestore";



// import { initializeApp } from "firebase/app";
// import { getFirestore, collection, getDocs, addDoc, doc, deleteDoc } from "firebase/firestore/lite";


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