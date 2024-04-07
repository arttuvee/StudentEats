// Function to open user info dropdown in header
function toggleDropdown(event) {
  const dropdown = document.getElementById('dropdown');
  dropdown.style.display = dropdown.style.display !== 'flex' ?
    'flex' :
    'none';
  event.stopPropagation();
}

// Click event listener to close the dropdown when clicked outside of it
document.addEventListener('click', function() {
  const dropdown = document.getElementById('dropdown');
  dropdown.style.display = 'none'; // Hide the dropdown
});

// Function to open the filter window for the map
document.querySelector('#settings-icon').addEventListener('click', function() {
  document.querySelector('.filter-window').classList.toggle('open');
});

// Leaflet map
const map = L.map('leaflet-map').setView([60.21, 24.94], 11);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
}).addTo(map);

