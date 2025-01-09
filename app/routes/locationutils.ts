import axios from 'axios';

// Mapbox API token
const MAPBOX_TOKEN = 'pk.eyJ1IjoicmF5aGFuLWhvc3NhaW4iLCJhIjoiY2x0OTZ2OGx4MTB4dDJscnhxOGxyc3lxbiJ9.MvGOap0tH089kGfjz8mrUA';

// Function to generate URL for geocoding a postcode
export const getGeocodeUrl = (postcode: string) => `https://api.mapbox.com/geocoding/v5/mapbox.places/${postcode}.json?access_token=${MAPBOX_TOKEN}`;

// Function to generate URL for getting directions between two points
export const getDirectionsUrl = (startLongitude: number, startLatitude: number, endLongitude: number, endLatitude: number) => 
    `https://api.mapbox.com/directions/v5/mapbox/driving/${startLongitude},${startLatitude};${endLongitude},${endLatitude}?geometries=geojson&access_token=${MAPBOX_TOKEN}`;

// Function to geocode a postcode
export const geocodePostcode = async (postcode: string) => {
    try {
        // Send GET request to Mapbox API
        const response = await axios.get(getGeocodeUrl(postcode));
        // Extract the first feature from the response
        const feature = response.data.features[0];
        // Extract the coordinates and street name from the feature
        const { coordinates } = feature.geometry;
        const streetName = feature.place_name;
        // Return the longitude, latitude, and street name
        return { longitude: coordinates[0], latitude: coordinates[1], streetName };
    } catch (error) {
        console.error("Error geocoding postcode:", error);
        return null;
    }
};

// Function to get the road distance between two points
export const getRoadDistance = async (startLongitude: number, startLatitude: number, endLongitude: number, endLatitude: number): Promise<number | null> => {
    try {
        // Generate the URL for the directions request
        const url = getDirectionsUrl(startLongitude, startLatitude, endLongitude, endLatitude);
        // Send GET request to Mapbox API
        const response = await axios.get(url);
        const data = response.data;
        // Extract the distance from the response and convert it from meters to miles
        const distanceInMiles = data.routes[0].distance * 0.000621371;
        // Return the distance in miles
        return distanceInMiles;
    } catch (error) {
        console.error("Error getting road distance:", error);
        return null;
    }
};