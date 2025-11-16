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

// Load screen data from screen.json
fetch('https://gist.githubusercontent.com/PIYUSH-123tari/c27da6ef5606e331e8316bb3498d8d65/raw/b0bb91dc28a0f018e5d6c5921e942594de4f3bcd/screen.json')
  .then(res => res.json())
  .then(json => {
    // Use only the first screen (Screen 1)
    screenData = json.sections;
    renderScreen();
  })
  .catch(err => {
    seatContainer.innerHTML = `<p style="color:red;">Error loading screen data: ${err.message}</p>`;
  });

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
        }

        rowDiv.appendChild(seatBtn);
      }

      sectionDiv.appendChild(rowDiv);
    }

    seatContainer.appendChild(sectionDiv);
  });
}

// Toggle seat selection
function toggleSeat(seatElement, price) {
  const seatNo = seatElement.dataset.seatNo;
  const section = seatElement.dataset.section;

  if (seatElement.classList.contains('selected')) {
    // Deselect
    seatElement.classList.remove('selected');
    selectedSeats = selectedSeats.filter(s => s.seatNo !== seatNo);
    currentPrice -= price;
  } else {
    // Select
    seatElement.classList.add('selected');
    selectedSeats.push({ seatNo, price, section });
    currentPrice += price;
  }

  updateSummary();
}

// Update summary and show/hide book button
function updateSummary() {
  const seatNumbers = selectedSeats.map(s => s.seatNo).join(', ');

  selectedSeatsEl.textContent = selectedSeats.length > 0 ? seatNumbers : 'None';
  seatCountEl.textContent = selectedSeats.length;
  pricePerSeatEl.textContent = selectedSeats.length > 0 ? selectedSeats[0].price : '0';
  totalPriceEl.textContent = currentPrice;

  // Show/hide book button
  if (selectedSeats.length > 0) {
    bookButton.classList.remove('hidden');
  } else {
    bookButton.classList.add('hidden');
  }
}

// Book button click handler
bookButton.addEventListener('click', () => {
  if (selectedSeats.length === 0) return;

  // Store booking details in localStorage
  localStorage.setItem('selectedSeats', JSON.stringify(selectedSeats.map(s => s.seatNo)));
  localStorage.setItem('totalPrice', currentPrice);
  localStorage.setItem('seatCount', selectedSeats.length);

  // Mark selected seats as booked
  selectedSeats.forEach(seat => {
    const seatElement = document.querySelector(`[data-seat-no="${seat.seatNo}"]`);
    if (seatElement) {
      seatElement.classList.remove('selected');
      seatElement.classList.add('booked');
      seatElement.style.pointerEvents = 'none';

      // Update data status
      screenData.forEach(section => {
        const seatObj = section.seats.find(s => s.seatNo === seat.seatNo);
        if (seatObj) seatObj.status = 'booked';
      });
    }
  });

  // Clear selection and reset
  selectedSeats = [];
  currentPrice = 0;
  updateSummary();

  // Show confirmation and redirect
  alert('✅ confirm your booking now! redirecting to confirmation page...');
  window.location.href = './confirmation/confirm.html';
});

// Initialize
updateSummary();