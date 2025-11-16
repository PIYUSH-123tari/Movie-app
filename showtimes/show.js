const API_URL = "https://gist.githubusercontent.com/PIYUSH-123tari/c27da6ef5606e331e8316bb3498d8d65/raw/b0bb91dc28a0f018e5d6c5921e942594de4f3bcd/db.json";
const dateBar = document.getElementById("dateBar");
const container = document.getElementById("showtimesContainer");
const bookedSeatsBtn = document.getElementById('bookedSeatsBtn');

const activeDates = ["June 17 Tue", "June 18 Wed", "June 19 Thur"];
const allDates = ["June 17 Tue", "June 18 Wed", "June 19 Thur", "June 20 Fri", "June 21 Sat", "June 22 Sun"];

// Booked Seats button click handler
bookedSeatsBtn.addEventListener('click', () => {
  // Check if user is logged in
  const userId = localStorage.getItem('LoggedInUser');
  if (!userId) {
    alert('❌ Please login first to view your bookings');
    window.location.href = '../form.html';
    return;
  }
  // Redirect to booked seats page
  window.location.href = './bookedseatDisplay/booked.html';
});

async function loadShowtimes() {
  try {
    const res = await fetch(API_URL);
    const data = await res.json();
    // Original (and correct) extraction of the main showtimes object
    const showtimesData = data.showtimes; 
    
    renderDateBar(showtimesData); 
    showMovies(showtimesData, activeDates[0]);
  } catch (err) {
    container.innerHTML = `<p style="color:red;">❌ Error loading data: ${err.message}</p>`;
  }
}

function renderDateBar(data) {
  dateBar.innerHTML = "";
  allDates.forEach(d => {
    const btn = document.createElement("button");
    btn.textContent = d;
    btn.className = "date-btn";
    const parts = btn.textContent.split(" ");
    btn.innerHTML = parts.join("<br>");
    if (!activeDates.includes(d)) {
      btn.classList.add("disabled");
      btn.disabled = true;
    } else if (d === activeDates[0]) {
      btn.classList.add("active");
    }
    btn.addEventListener("click", () => {
      document.querySelectorAll(".date-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      showMovies(data, d);
    });
    dateBar.appendChild(btn);
  });
}

function showMovies(data, date) {
  container.innerHTML = "";
  if (!data[date]) {
    container.innerHTML = "<p>No shows available.</p>";
    return;
  }

  const shows = data[date][0];
  for (const movie in shows) {
    const card = document.createElement("div");
    card.className = "showtime-card";

    const title = document.createElement("div");
    title.className = "movie-title";
    title.textContent = movie;

    card.appendChild(title);

    const theatres = shows[movie];
    for (const theatre in theatres) {
      const theatreEl = document.createElement("div");
      theatreEl.className = "theatre";
      theatreEl.textContent = theatre;

      const timesDiv = document.createElement("div");
      theatres[theatre].forEach(time => {
        const timeBtn = document.createElement("button");
        timeBtn.className = "time-btn";
        timeBtn.textContent = time;
        // attach metadata for later use
        timeBtn.dataset.movie = movie;
        timeBtn.dataset.cinema = theatre;
        timeBtn.dataset.date = date;

        // click handler for toggle/select behavior
        timeBtn.addEventListener('click', () => {
          handleTimeClick(timeBtn);
        });

        timesDiv.appendChild(timeBtn);
      });

      card.appendChild(theatreEl);
      card.appendChild(timesDiv);
    }

    // helper to store reference to append Choose Seat when needed
    card.dataset.movie = movie;
    container.appendChild(card);
  }
}

// ---- Selection handling logic ----
function handleTimeClick(button) {
  const isSelected = button.classList.contains('selected');

  // if already selected -> deselect everything
  if (isSelected) {
    clearSelectionState();
    return;
  }

  // otherwise select this and disable others
  clearSelectionState();
  button.classList.add('selected');

  // disable all other time buttons and date buttons
  document.querySelectorAll('.time-btn').forEach(b => {
    if (b !== button) b.classList.add('disabled');
  });
  document.querySelectorAll('.date-btn').forEach(db => {
    db.classList.add('disabled');
    db.disabled = true;
  });

  // mark the active date button as enabled (so user sees which date is active)
  const activeDateBtn = Array.from(document.querySelectorAll('.date-btn')).find(x => x.classList.contains('active'));
  if (activeDateBtn) {
    activeDateBtn.classList.remove('disabled');
    activeDateBtn.disabled = false;
  }

  // append Choose Seat button inside the parent showtime-card
  let card = button.closest('.showtime-card');
  if (!card) return;

  // remove any existing choose-seat in other cards
  document.querySelectorAll('.choose-seat').forEach(el => el.remove());

  const choose = document.createElement('button');
  choose.className = 'choose-seat';
  choose.textContent = 'Choose Seat';
  choose.addEventListener('click', () => {
    // Store booking details in localStorage (separate keys)
    localStorage.setItem('movie name', button.dataset.movie);
    localStorage.setItem('cinema name', button.dataset.cinema);
    localStorage.setItem('showtiming', button.textContent);
    localStorage.setItem('date', button.dataset.date);
    // redirect to seats.html
    window.location.href = './seats/seats.html';
  });

  card.appendChild(choose);
}

function clearSelectionState() {
  document.querySelectorAll('.time-btn').forEach(b => {
    b.classList.remove('selected');
    b.classList.remove('disabled');
    b.disabled = false;
  });
  document.querySelectorAll('.date-btn').forEach(db => {
    db.classList.remove('disabled');
    db.disabled = false;
  });
  // remove choose-seat buttons
  document.querySelectorAll('.choose-seat').forEach(el => el.remove());
}

// Load showtimes on page load
loadShowtimes();