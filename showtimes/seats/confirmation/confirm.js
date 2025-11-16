import { initializeApp } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-auth.js";
import { getFirestore, collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-firestore.js";

// Firebase Config
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
const auth = getAuth();
const db = getFirestore();

// Get elements
const confirmBtn = document.getElementById('confirmBtn');
const backBtn = document.getElementById('backBtn');
const loadingSpinner = document.getElementById('loadingSpinner');
const successMessage = document.getElementById('successMessage');
const errorMessage = document.getElementById('errorMessage');
const errorText = document.getElementById('errorText');

// Get data from localStorage
function getBookingData() {
  return {
    userId: localStorage.getItem('LoggedInUser') || 'Unknown',
    movie: localStorage.getItem('movie name') || 'Unknown',
    cinema: localStorage.getItem('cinema name') || 'Unknown',
    date: localStorage.getItem('date') || 'Unknown',
    showtime: localStorage.getItem('showtiming') || 'Unknown',
    selectedSeats: JSON.parse(localStorage.getItem('selectedSeats')) || [],
    totalPrice: parseInt(localStorage.getItem('totalPrice')) || 0,
    seatCount: parseInt(localStorage.getItem('seatCount')) || 0
  };
}

// Display booking data on page
function displayBookingData() {
  const data = getBookingData();

  document.getElementById('displayMovie').textContent = data.movie;
  document.getElementById('displayCinema').textContent = data.cinema;
  document.getElementById('displayDate').textContent = data.date;
  document.getElementById('displayTime').textContent = data.showtime;
  document.getElementById('displaySeats').textContent = data.selectedSeats.join(', ');
  document.getElementById('displaySeatCount').textContent = data.seatCount;
  document.getElementById('displayTotalPrice').textContent = `₹${data.totalPrice}`;
  document.getElementById('displayUserId').textContent = data.userId;

  // Update bill summary
  document.getElementById('billSeats').textContent = data.seatCount;
  document.getElementById('billPrice').textContent = `₹${data.totalPrice}`;
  document.getElementById('billTotal').textContent = `₹${data.totalPrice}`;
}

// Save booking to Firebase Firestore
async function saveBookingToFirebase() {
  try {
    const data = getBookingData();

    // Create booking document
    const bookingData = {
      userId: data.userId,
      movie: data.movie,
      cinema: data.cinema,
      date: data.date,
      showtime: data.showtime,
      selectedSeats: data.selectedSeats,
      totalPrice: data.totalPrice,
      seatCount: data.seatCount,
      bookingDate: serverTimestamp(),
      status: 'confirmed'
    };

    // Add to Firestore "bookings" collection
    const docRef = await addDoc(collection(db, 'bookings'), bookingData);
    console.log('✅ Booking saved with ID:', docRef.id);

    return true;
  } catch (error) {
    console.error('❌ Error saving to Firestore:', error);
    errorText.textContent = `❌ Error: ${error.message}`;
    return false;
  }
}

// Clear booking data from localStorage (keep userId)
function clearBookingData() {
  localStorage.removeItem('movie name');
  localStorage.removeItem('cinema name');
  localStorage.removeItem('date');
  localStorage.removeItem('showtiming');
  localStorage.removeItem('selectedSeats');
  localStorage.removeItem('totalPrice');
  localStorage.removeItem('seatCount');
  console.log('✅ Booking data cleared from localStorage');
}

// Confirm button click handler
confirmBtn.addEventListener('click', async () => {
  confirmBtn.disabled = true;
  loadingSpinner.classList.remove('hidden');

  try {
    // Save to Firebase
    const saved = await saveBookingToFirebase();

    if (saved) {
      // Clear booking data from localStorage
      clearBookingData();

      // Show success message
      loadingSpinner.classList.add('hidden');
      successMessage.classList.remove('hidden');

      // Redirect after 2 seconds
      setTimeout(() => {
        window.location.href = '../../../homepage/homepage.html';
      }, 2000);
    } else {
      throw new Error('Failed to save booking');
    }
  } catch (error) {
    loadingSpinner.classList.add('hidden');
    errorMessage.classList.remove('hidden');
    errorText.textContent = `❌ Error: ${error.message}`;
    confirmBtn.disabled = false;
  }
});

// Back button click handler
backBtn.addEventListener('click', () => {
  window.history.back();
});

// Display booking data on page load
document.addEventListener('DOMContentLoaded', displayBookingData);