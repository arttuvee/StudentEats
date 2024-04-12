import {apiUrl} from './variables.js';

const fetchRestaurantsData = async () => {
  try {
    const response = await fetch(`${apiUrl}/api/v1/restaurants`);

    const message = response.ok ?
      `Fetch response status: ${response.status}` :
      'Network response was not ok.';
    console.log(message);

    if (!response.ok) {
      throw new Error('Network response was not ok.');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error: ', error);
  }
};
