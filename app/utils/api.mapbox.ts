import axios from 'axios';
import mapboxgl from 'mapbox-gl';

// URL for the Mapbox Geocoding API to get geographic coordinates based on a postcode
export const getGeocodeUrl = (postcode: string, accessToken: string) => 
    `https://api.mapbox.com/geocoding/v5/mapbox.places/${postcode}.json?access_token=${accessToken}`;

// URL for the Mapbox Directions API to calculate the road distance between two points
export const getDirectionsUrl = (startLongitude: number, startLatitude: number, endLongitude: number, endLatitude: number, accessToken: string) =>
    `https://api.mapbox.com/directions/v5/mapbox/driving/${startLongitude},${startLatitude};${endLongitude},${endLatitude}?geometries=geojson&access_token=${accessToken}`;

// Fetches geographic coordinates and street name for a given postcode using the Mapbox Geocoding API
export const geocodePostcode = async (postcode: string, accessToken: string) => {
    try {
        const response = await axios.get(getGeocodeUrl(postcode, accessToken));
        const feature = response.data.features[0];
        const { coordinates } = feature.geometry;
        const streetName = feature.place_name;
        return { longitude: coordinates[0], latitude: coordinates[1], streetName };
    } catch (error) {
        console.error("Error geocoding postcode:", error);
        return null;
    }
};

// Calculates the road distance between two points using the Mapbox Directions API and converts it from meters to miles
export const getRoadDistance = async (startLongitude: number, startLatitude: number, endLongitude: number, endLatitude: number, accessToken: string) => {
    try {
        const url = getDirectionsUrl(startLongitude, startLatitude, endLongitude, endLatitude, accessToken);
        const response = await axios.get(url);
        const data = response.data;
        const distanceInMiles = data.routes[0].distance * 0.000621371; // Convert meters to miles
        return distanceInMiles;
    } catch (error) {
        console.error("Error getting road distance:", error);
        return null;
    }
};

type Location = {
  location_name: string;
  street: string;
  city: string;
  county: string;
  country: string;
  postcode: string;
  telephone: string;
  longitude: number;
  latitude: number;
};

// Markers and popups for a list of locations on Mapbox map
export const setupMapWithLocations = (locations: Location[], accessToken: string, containerId: string) => {
  mapboxgl.accessToken = accessToken;

  const initialCenter: [number, number] = locations.length > 0
    ? [locations[0].longitude, locations[0].latitude]
    : [1.065309, 51.2960585]; // Default coordinates if no locations are provided

  // Create a new Mapbox map
  const map = new mapboxgl.Map({
    container: containerId,
    style: 'mapbox://styles/mapbox/streets-v12',
    center: initialCenter,
    zoom: 9,
  });

  // Add a marker and popup for each location on the map
  locations.forEach((location) => {
    new mapboxgl.Marker()
      .setLngLat([location.longitude, location.latitude])
      .setPopup(new mapboxgl.Popup({ offset: 25 }).setHTML(
        `<div>` +
          `<img src="/images/logo.png" alt="Logo" style="width: 100px; height: auto;">` +
          `<strong><h3>Garage Glide ${location.location_name}</h3></strong>` +
          `<p>${location.street}<br>${location.city}<br>${location.county}, ${location.country}<br>${location.postcode}<br>` +
          `<br>Tel: ${location.telephone}</p>` +
          `<a target="_blank" style="color: blue;" href="https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(location.street)},${encodeURIComponent(location.postcode)}"><u>Get Directions</u></a>` +
          `</div>`
      ))
      .addTo(map);
  });
};
