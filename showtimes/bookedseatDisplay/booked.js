import { initializeApp } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-auth.js";
import { getFirestore, collection, query, where, getDocs } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-firestore.js";

// Firebase Configuration
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

// Get DOM elements
const backBtn = document.getElementById('backBtn');
const bookingsContainer = document.getElementById('bookingsContainer');
const loadingSpinner = document.getElementById('loadingSpinner');
const noBookingsMessage = document.getElementById('noBookingsMessage');
const errorMessage = document.getElementById('errorMessage');
const errorText = document.getElementById('errorText');
const bookNowBtn = document.getElementById('bookNowBtn');

// Back button functionality
backBtn.addEventListener('click', () => {
  window.history.back();
});

// Book Now button functionality
bookNowBtn.addEventListener('click', () => {
  window.location.href = '../show.html';
});

/**
 * Fetch bookings from Firebase Firestore for the logged-in user
 */
async function loadBookings() {
  try {
    // Get logged-in user ID from localStorage
    const userId = localStorage.getItem('LoggedInUser');
    
    if (!userId) {
      throw new Error('User not logged in');
    }

    // Create query to fetch bookings for this user
    const q = query(
      collection(db, 'bookings'),
      where('userId', '==', userId)
    );

    // Execute query
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      // No bookings found
      loadingSpinner.classList.add('hidden');
      noBookingsMessage.classList.remove('hidden');
      return;
    }

    // Process each booking document
    const bookings = [];
    querySnapshot.forEach((doc) => {
      bookings.push({
        id: doc.id,
        ...doc.data()
      });
    });

    // Sort bookings by booking date (newest first)
    bookings.sort((a, b) => {
      const timeA = a.bookingDate?.toDate?.() || new Date(0);
      const timeB = b.bookingDate?.toDate?.() || new Date(0);
      return timeB - timeA;
    });

    // Display bookings
    displayBookings(bookings);

  } catch (error) {
    console.error('❌ Error loading bookings:', error);
    loadingSpinner.classList.add('hidden');
    errorMessage.classList.remove('hidden');
    errorText.textContent = `❌ Error: ${error.message}`;
  }
}

/**
 * Display booking cards on the page
 */
function displayBookings(bookings) {
  loadingSpinner.classList.add('hidden');

  bookings.forEach((booking) => {
    const card = createBookingCard(booking);
    bookingsContainer.appendChild(card);
  });
}

/**
 * Create a booking card element
 */
function createBookingCard(booking) {
  const card = document.createElement('div');
  card.className = 'booking-card';

  // Format booking date
  let formattedDate = 'N/A';
  if (booking.bookingDate) {
    try {
      const date = booking.bookingDate.toDate?.() || new Date(booking.bookingDate);
      formattedDate = date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      formattedDate = 'N/A';
    }
  }

  // Convert seats array to formatted string
  const seatsDisplay = (booking.selectedSeats || []).join(', ');

  // Create card HTML
  card.innerHTML = `
    <!-- Header with movie name and status -->
    <div class="booking-header">
      <div class="movie-name">🎬 ${escapeHtml(booking.movie || 'Unknown')}</div>
      <div class="booking-status">✓ ${booking.status || 'Confirmed'}</div>
    </div>

    <!-- Booking details grid -->
    <div class="booking-details">
      <!-- Cinema -->
      <div class="detail-item">
        <div class="detail-label">🏛 Cinema</div>
        <div class="detail-value">${escapeHtml(booking.cinema || 'N/A')}</div>
      </div>

      <!-- Date -->
      <div class="detail-item">
        <div class="detail-label">📅 Date</div>
        <div class="detail-value">${escapeHtml(booking.date || 'N/A')}</div>
      </div>

      <!-- Showtime -->
      <div class="detail-item">
        <div class="detail-label">⏰ Showtime</div>
        <div class="detail-value">${escapeHtml(booking.showtime || 'N/A')}</div>
      </div>

      <!-- Total Seats -->
      <div class="detail-item">
        <div class="detail-label">🪑 Total Seats</div>
        <div class="detail-value seats">${booking.seatCount || 0}</div>
      </div>

      <!-- Total Price -->
      <div class="detail-item">
        <div class="detail-label">💰 Total Amount</div>
        <div class="detail-value price">₹${booking.totalPrice || 0}</div>
      </div>

      <!-- Booking Date -->
      <div class="detail-item">
        <div class="detail-label">🕐 Booked On</div>
        <div class="detail-value">${formattedDate}</div>
      </div>
    </div>

    <!-- Selected Seats Section -->
    <div class="seats-section">
      <div class="seats-label">🎫 Selected Seats</div>
      <div class="seats-display">
        ${seatsDisplay ? seatsDisplay.split(',').map(seat => `
          <div class="seat-badge">${escapeHtml(seat.trim())}</div>
        `).join('') : '<span>N/A</span>'}
      </div>
    </div>
  `;

  return card;
}

/**
 * Escape HTML special characters to prevent XSS
 */
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Load bookings when page is ready
document.addEventListener('DOMContentLoaded', loadBookings);