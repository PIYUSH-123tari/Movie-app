import { initializeApp } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-app.js";
import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-firestore.js";

// === Firebase Config (MUST be duplicated in seats.js for database access) ===
const firebaseConfig = {
  apiKey: "AIzaSyBGVuxmH84CDQRa9wbfJXPgMf-ki__BbLM",
  authDomain: "login-mtb-11df0.firebaseapp.com",
  projectId: "login-mtb-11df0",
  storageBucket: "login-mtb-11df0.firebasestorage.app",
  messagingSenderId: "469931455269",
  appId: "1:469931455269:web:5108597ad2250aa62e20cc"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore();
// ===========================================================================


const seatContainer = document.getElementById('seatContainer');
const selectedSeatsEl = document.getElementById('selectedSeats');
const totalPriceEl = document.getElementById('totalPrice');
const seatCountEl = document.getElementById('seatCount');
const pricePerSeatEl = document.getElementById('pricePerSeat');
const bookButton = document.getElementById('bookButton');

// Get booking info from localStorage
const movieName = localStorage.getItem('movie name') || 'Unknown';
const cinemaName = localStorage.getItem('cinema name') || 'Unknown';
const showtime = localStorage.getItem('showtiming') || 'Unknown';
const date = localStorage.getItem('date') || 'Unknown';

// Display booking info
document.getElementById('movieName').textContent = movieName;
document.getElementById('cinemaDisplay').textContent = cinemaName;
document.getElementById('timeDisplay').textContent = showtime;
document.getElementById('dateDisplay').textContent = date;

let screenData, selectedSeats = [], currentPrice = 0;
let bookedSeatNumbers = new Set(); // Store seat numbers that are already booked

// Load screen data and booked seats
async function loadScreenData() {
  try {
    // 1. Fetch booked seats from Firestore
    await fetchBookedSeats();

    // 2. Fetch static screen layout
    const res = await fetch('https://gist.githubusercontent.com/PIYUSH-123tari/c27da6ef5606e331e8316bb3498d8d65/raw/b0bb91dc28a0f018e5d6c5921e942594de4f3bcd/screen.json');
    const json = await res.json();
    
    // 3. Process static layout and apply booked status
    screenData = json.sections;
    
    // Apply booked status from the database to the screenData
    screenData.forEach(section => {
      section.seats.forEach(seat => {
        if (bookedSeatNumbers.has(seat.seatNo)) {
          seat.status = 'booked';
        }
      });
    });

    renderScreen();
  } catch (err) {
    console.error('Error loading data:', err);
    seatContainer.innerHTML = `<p style="color:red;">Error loading screen or booking data: ${err.message}</p>`;
  }
}

// Fetch all confirmed bookings from Firebase and populate bookedSeatNumbers Set
async function fetchBookedSeats() {
  // Use current booking details to filter only relevant seats (optional but better)
  const querySnapshot = await getDocs(collection(db, 'bookings'));
  
  querySnapshot.forEach((doc) => {
    const booking = doc.data();
    // A simple way to check if the booking is for the current show
    // (You would typically use a more specific query with Firestore)
    if (booking.movie === movieName && booking.date === date && booking.showtime === showtime && booking.status === 'confirmed') {
        booking.selectedSeats.forEach(seatNo => {
            bookedSeatNumbers.add(seatNo);
        });
    }
  });
  console.log('Booked Seats Fetched:', Array.from(bookedSeatNumbers));
}

// Render seats for Screen 1
function renderScreen() {
  seatContainer.innerHTML = '';

  screenData.forEach(section => {
    // Create section div
    const sectionDiv = document.createElement('div');
    sectionDiv.className = 'section';
    sectionDiv.innerHTML = `<h3>${section.name} (₹${section.price})</h3>`;

    // Create rows
    let seatIndex = 0;
    for (let r = 0; r < section.rows; r++) {
      const rowDiv = document.createElement('div');
      rowDiv.className = 'row';

      for (let c = 0; c < section.columns; c++) {
        const seat = section.seats[seatIndex++];
        const seatBtn = document.createElement('div');
        seatBtn.className = `seat ${seat.status}`;
        seatBtn.textContent = seat.seatNo;
        seatBtn.dataset.seatNo = seat.seatNo;
        seatBtn.dataset.price = section.price;
        seatBtn.dataset.section = section.name;

        // Only add click handler if seat is available
        if (seat.status === 'available') {
          seatBtn.addEventListener('click', () => {
            toggleSeat(seatBtn, section.price);
          });
        } else {
            // Ensure booked seats are unclickable
            seatBtn.style.pointerEvents = 'none';
        }

        rowDiv.appendChild(seatBtn);
      }

      sectionDiv.appendChild(rowDiv);
    }

    seatContainer.appendChild(sectionDiv);
  });
}

// Toggle seat selection (remains the same)
function toggleSeat(seatElement, price) {
  const seatNo = seatElement.dataset.seatNo;
  const section = seatElement.dataset.section;

  if (seatElement.classList.contains('selected')) {
    // Deselect
    seatElement.classList.remove('selected');
    selectedSeats = selectedSeats.filter(s => s.seatNo !== seatNo);
    currentPrice -= parseFloat(price); // Use parseFloat for safe math
  } else {
    // Select
    seatElement.classList.add('selected');
    selectedSeats.push({ seatNo, price: parseFloat(price), section });
    currentPrice += parseFloat(price); // Use parseFloat for safe math
  }

  updateSummary();
}

// Update summary and show/hide book button (remains the same)
function updateSummary() {
  const seatNumbers = selectedSeats.map(s => s.seatNo).join(', ');

  selectedSeatsEl.textContent = selectedSeats.length > 0 ? seatNumbers : 'None';
  seatCountEl.textContent = selectedSeats.length;
  // Note: This logic assumes all selected seats have the same price, which might be incorrect
  // if seats are from different sections. A better approach is to store the actual price.
  pricePerSeatEl.textContent = selectedSeats.length > 0 ? selectedSeats[0].price : '0'; 
  totalPriceEl.textContent = currentPrice.toFixed(0); // Display as integer

  // Show/hide book button
  if (selectedSeats.length > 0) {
    bookButton.classList.remove('hidden');
  } else {
    bookButton.classList.add('hidden');
  }
}

// Book button click handler (modified to remove local 'booked' marking)
bookButton.addEventListener('click', () => {
  if (selectedSeats.length === 0) return;

  // Store booking details in localStorage
  localStorage.setItem('selectedSeats', JSON.stringify(selectedSeats.map(s => s.seatNo)));
  localStorage.setItem('totalPrice', currentPrice.toFixed(0)); // Store as string with no decimals
  localStorage.setItem('seatCount', selectedSeats.length);

  // *** IMPORTANT CHANGE: DO NOT MARK SEATS AS BOOKED HERE ***
  // We don't mark them as 'booked' locally anymore. The confirmation page will save
  // to Firebase, and on page reload/navigation, the new booked status will be
  // fetched from the database.

  // Clear selection for clean slate before redirect
  selectedSeats = [];
  currentPrice = 0;
  updateSummary(); 

  // Show confirmation and redirect
  alert('✅ Confirm your booking now! Redirecting to confirmation page...');
  window.location.href = './confirmation/confirm.html';
});

// Initialize
loadScreenData(); // Start the data loading and rendering process
updateSummary();