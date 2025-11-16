import { initializeApp } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-app.js";
import { getAuth, signOut } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-auth.js";

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

// Get all logout buttons (both sidebar and navbar)
const logoutButtons = document.querySelectorAll('.LogOut');

// Add click event to each logout button
logoutButtons.forEach((button) => {
  button.addEventListener('click', (e) => {
    e.preventDefault();

    // Clear user data from localStorage
    localStorage.removeItem('LoggedInUser');
    localStorage.removeItem('movie name');
    localStorage.removeItem('cinema name');
    localStorage.removeItem('date');
    localStorage.removeItem('showtiming');
    localStorage.removeItem('selectedSeats');
    localStorage.removeItem('totalPrice');
    localStorage.removeItem('seatCount');

    // Sign out from Firebase
    signOut(auth)
      .then(() => {
        console.log('✅ User logged out successfully');
        window.location.href = '../form.html';
      })
      .catch((error) => {
        console.error('❌ Error signing out:', error);
        alert('Error logging out. Please try again.');
      });
  });
});