/* eslint-disable max-len */
'use strict';

// Elements
const formLogin = document.getElementById('login-form');
const formRegister = document.getElementById('register-form');
const buttonLogout = document.getElementById('logout-button');
const buttonLogin = document.getElementById('login-button');
const buttonRegister = document.getElementById('register-button');
const buttonReturnRegister = document.getElementById('register-return-button');
const buttonReturnLogin = document.getElementById('login-return-button');

const userInfo = document.getElementById('user-info');
const dialogBox = document.querySelector('dialog');

let menuType = '';

// Leaflet map
const leafletMap = L.map('map');
leafletMap.locate({setView: true, maxZoom: 16});
leafletMap.on('locationfound', function(e) {
  leafletMap.setView(e.latlng, 10);
  const iconMy = L.icon({
    iconUrl: '#', // kesken
    iconSize: [41, 41],
    iconAnchor: [12, 41],
    popupAnchor: [8, -41],
  });
  L.marker(e.latlng, {icon: iconMy}).addTo(leafletMap).bindPopup('Your location');
});
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright"></a>',
}).addTo(leafletMap);

document.addEventListener('DOMContentLoaded', async function() {
  await fetchRestaurants();
  await checkUser();
});

formLogin.addEventListener('submit', async function(event) {
  await loginUser(event);
});

formRegister.addEventListener('submit', async function(event) {
  await registerUser(event);
});

buttonLogout.addEventListener('click', function() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  buttonLogin.style.display = 'block';
  buttonRegister.style.display = 'block';
  buttonLogout.style.display = 'none';
  userInfo.textContent = '';
});

buttonLogin.onclick = function() {
  formLogin.style.display = 'block';
  buttonLogin.style.display = 'none';
  buttonRegister.style.display = 'none';
};

buttonRegister.onclick = function() {
  formRegister.style.display = 'block';
  buttonLogin.style.display = 'none';
  buttonRegister.style.display = 'none';
};

buttonReturnRegister.onclick = function() {
  formRegister.style.display = 'none';
  buttonLogin.style.display = 'block';
  buttonRegister.style.display = 'block';
  userInfo.style.display = 'none';
  formRegister.reset();
};

buttonReturnLogin.onclick = function() {
  formLogin.style.display = 'none';
  buttonLogin.style.display = 'block';
  buttonRegister.style.display = 'block';
  userInfo.style.display = 'none';
  formLogin.reset();
};

async function fetchRestaurants() {
  const url = 'https://10.120.32.94/restaurant/api/v1/restaurants/';
  try {
    const response = await fetch(url);
    const data = await response.json();
    data.forEach((item) => {
      const coordinates = item.location.coordinates;
      const latitude = coordinates[0];
      const longitude = coordinates[1];
      const id = item._id;
      const marker = L.marker([longitude, latitude], {restaurantId: id});
      marker.addTo(leafletMap);
      marker.on('click', () => clickMarker(item, id));
    });
  } catch (error) {
    console.log(error);
  }
}

function clickMarker(item, id) {
  console.log(id);
  dialogBox.innerHTML = `
    <h1>${item.name}</h1>
    <p>${item.address}, ${item.postalCode}, ${item.city}</p>
    <form method="dialog">
    <button class="button">Close</button>
    <button class="button" id="menuButtonDay">Daily menu</button>
    <button class="button" id="menuButtonWeek">Weekly menu</button>
    <button class="button" id="favoriteRes">Favorite</button>
    </form>`;

  dialogBox.showModal();
  const menuButtonDay = document.querySelector('#menuButtonDay');
  const menuButtonWeek = document.querySelector('#menuButtonWeek');
  const favorite = document.querySelector('#favoriteRes');

  menuButtonDay.addEventListener('click', function() {
    const menuType = 'daily';
    console.log(id);
    getMenu(id, menuType);
  });

  menuButtonWeek.addEventListener('click', function() {
    menuType = 'weekly';
    console.log(id);
    getMenu(id, menuType);
  });

  favorite.addEventListener('click', async function() {
    console.log(id);
    await setFavoriteRestaurant(id);
    location.reload();
    console.log(id);
  });
}

async function getMenu(id, menuType) {
  const url = `https://10.120.32.94/restaurant/api/v1/restaurants/${menuType}/${id}/en`;
  try {
    const response = await fetch(url);
    const data = await response.json();
    const menuDiv = document.getElementById('restaurant-menu');
    menuDiv.innerHTML = '';
    if (data.days && Array.isArray(data.days) && data.days.length > 0) {
      data.days.forEach((day) => {
        const dayElement = document.createElement('h3');
        dayElement.style.color = 'white';
        dayElement.style.fontWeight = 'bold';
        dayElement.style.textDecoration = 'underline';
        dayElement.textContent = day.date;
        menuDiv.appendChild(dayElement);
        day.courses.forEach((course) => {
          const courseElement = document.createElement('p');
          const priceText = course.price ? `: ${course.price}` : '';
          courseElement.textContent = `${course.name}${priceText}`;
          courseElement.style.color = 'black';
          menuDiv.appendChild(courseElement);
        });
      });
    } else if (
      data.courses &&
      Array.isArray(data.courses) &&
      data.courses.length > 0
    ) {
      data.courses.forEach((item) => {
        const menuItem = document.createElement('p');
        const priceText = item.price ? `: ${item.price}` : '';
        menuItem.textContent = `${item.name}${priceText}`;
        menuItem.style.color = 'black';
        menuDiv.appendChild(menuItem);
      });
    }
  } catch (error) {
    console.log(error);
  }
}

// Register
async function registerUser(event) {
  event.preventDefault();
  const registerName = document.getElementById('register-username');
  const registerNameValue = registerName.value;
  const registerPassword = document.getElementById('register-password');
  const registerPasswordValue = registerPassword.value;
  const registerEmail = document.getElementById('register-email');
  const registerEmailValue = registerEmail.value;

  const data = {
    body: JSON.stringify({
      username: registerNameValue,
      password: registerPasswordValue,
      email: registerEmailValue,
    }),
    method: 'POST',
    headers: {
      'Content-type': 'application/json',
    },
  };

  try {
    console.log(data);
    const response = await fetch('https://10.120.32.94/restaurant/api/v1/users', data);
    console.log(response);
    if (!response.ok) {
      throw new Error('Registration failed');
    }

    const responseData = await response.json();
    localStorage.setItem('token', responseData.token);
    localStorage.setItem('user', JSON.stringify(responseData.data));
    buttonLogin.style.display = 'none';
    buttonRegister.style.display = 'none';
    formRegister.style.display = 'none';
    buttonLogout.style.display = 'block';
    const userDiv = document.getElementById('user-info');
    const userData = document.createElement('p');
    if (responseData && responseData.data) {
      userData.textContent = `Welcome, ${registerNameValue}`;
      userData.style.color = 'white';
    }
    userDiv.textContent = '';
    userDiv.appendChild(userData);
  } catch (error) {
    console.log(error);
    const userDiv = document.getElementById('user-info');
    const userData = document.createElement('p');
    userData.textContent = 'Error trying to register...!';
    userData.style.color = 'red';
    userDiv.textContent = '';
    userDiv.appendChild(userData);
  }
}

// Login
async function loginUser(event) {
  event.preventDefault();
  const loginName = document.getElementById('login-username');
  const loginPassword = document.getElementById('login-password');
  const loginNameValue = loginName.value;
  const loginPasswordValue = loginPassword.value;
  const userDetails = {
    username: loginNameValue,
    password: loginPasswordValue,
  };

  try {
    const response = await fetch('https://10.120.32.94/restaurant/api/v1/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userDetails),
    });

    if (!response.ok) {
      throw new Error('Unauthorized');
    }

    const data = await response.json();
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.data));
    localStorage.set;
    buttonLogin.style.display = 'none';
    buttonRegister.style.display = 'none';
    formLogin.style.display = 'none';
    buttonLogout.style.display = 'block';
    const userDiv = document.getElementById('user-info');
    const userData = document.createElement('p');
    const favoriteRes = document.createElement('p');
    if (data && data.data) {
      userData.textContent = `Welcome, ${data.data.username}`;
      userData.style.color = 'white';
      const favoriteId = data.data.favouriteRestaurant;
      const favorite = await getFavorite(favoriteId);
      console.log(favorite);
      favoriteRes.textContent = 'Favorite: ' + favorite.name;
      favoriteRes.style.color = 'white';
    }
    userDiv.textContent = '';
    userDiv.appendChild(userData);
    userDiv.appendChild(favoriteRes);
  } catch (error) {
    const userDiv = document.getElementById('user-info');
    const userData = document.createElement('p');
    userData.textContent = 'Unknown username or password!';
    userData.style.color = 'red';
    userDiv.textContent = '';
    userDiv.appendChild(userData);
  }
}

// Check if user is logged in
async function checkUser() {
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user'));
  if (token && user) {
    buttonLogin.style.display = 'none';
    buttonRegister.style.display = 'none';
    const userData = document.createElement('p');
    const favoriteRes = document.createElement('p');
    userData.textContent = `Tervetuloa, ${user.username}`;
    userData.style.color = 'white';
    const favoriteId = user.favouriteRestaurant;
    const favorite = await getFavorite(favoriteId);
    console.log(favorite);
    favoriteRes.textContent = 'Favorite: ' + favorite.name;
    favoriteRes.style.color = 'white';
    userInfo.appendChild(userData);
    userInfo.appendChild(favoriteRes);
    buttonLogout.style.display = 'block';
  }
}

// Favorite restaurant
async function setFavoriteRestaurant(id) {
  const restaurant = {
    favouriteRestaurant: id,
  };

  const token = localStorage.getItem('token');

  const data = {
    method: 'PUT',
    headers: {
      'Authorization': 'Bearer ' + token,
      'Content-type': 'application/json',
    },
    body: JSON.stringify(restaurant),
  };

  try {
    const response = await fetch('https://10.120.32.94/restaurant/api/v1/users', data);
    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }
    const user = JSON.parse(localStorage.getItem('user'));
    user.favouriteRestaurant = id;
    localStorage.setItem('user', JSON.stringify(user));
    const favRestaurantInfo = document.getElementById('favRestaurantInfo');
    const favorite = await getFavorite(id);
    favRestaurantInfo.textContent = 'Favorite: ' + favorite.name;
  } catch (error) {
    console.error('Error:', error);
  }
}

const getFavorite = async function(id) {
  const response = await fetch(`https://10.120.32.94/restaurant/api/v1/restaurants/${id}`);
  return await response.json();
};
