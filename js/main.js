function toggleDropdown(event) {
  const dropdown = document.getElementById('dropdown');
  dropdown.style.display = dropdown.style.display !== 'flex' ?
    'flex' :
    'none';
  event.stopPropagation();
}

// Add a click event listener to the document
document.addEventListener('click', function() {
  const dropdown = document.getElementById('dropdown');
  dropdown.style.display = 'none'; // Hide the dropdown
});


document.querySelector('#settings-icon').addEventListener('click', function() {
  document.querySelector('.filter-window').classList.toggle('open');
});
