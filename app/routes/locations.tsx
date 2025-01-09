import React, { useEffect } from 'react';
import { json, LoaderFunction } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import { getLocations, getOpeningHours } from '~/utils/db.server';
import 'mapbox-gl/dist/mapbox-gl.css';
import { setupMapWithLocations } from '~/utils/api.mapbox';

type GarageLocation = {
  location_id: number;
  location_name: string;
  city: string;
  street: string;
  county: string;
  country: string;
  postcode: string;
  telephone: string;
  latitude: number;
  longitude: number;
  openingHours?: { day_of_week: string; open_time: string; close_time: string }[];
};

export const loader: LoaderFunction = async () => {
  const locations = await getLocations();
  const openingHoursMap = await getOpeningHours();
  const mapboxAccessToken = process.env.MAPBOX_ACCESS_TOKEN;

  // Merge opening hours into locations
  const locationsWithHours = locations.map((location) => ({
    ...location,
    openingHours: openingHoursMap[location.location_id] || [],
  }));

  return json({ locations: locationsWithHours, mapboxAccessToken });
};

function formatTime(time: string) {
  // Convert 'HH:MM:SS' format to 'HH:MM'
  const [hours, minutes] = time.split(':');
  return `${hours}:${minutes}`;
}

function formatOpeningHours(hours: GarageLocation['openingHours']) {
  if (!hours || hours.length === 0) return <p>No opening hours available</p>;

  const formattedHours: JSX.Element[] = [];
  let currentGroup = [hours[0]];

  for (let i = 1; i < hours.length; i++) {
    const current = hours[i];
    const last = currentGroup[currentGroup.length - 1];

    // Check for null opening and closing times and set to "Closed"
    const currentOpenTime = current.open_time ? formatTime(current.open_time) : "Closed";
    const currentCloseTime = current.close_time ? formatTime(current.close_time) : "Closed";
    const lastOpenTime = last.open_time ? formatTime(last.open_time) : "Closed";
    const lastCloseTime = last.close_time ? formatTime(last.close_time) : "Closed";

    if (currentOpenTime === lastOpenTime && currentCloseTime === lastCloseTime) {
      currentGroup.push(current);
    } else {
      if (currentGroup.length > 1) {
        formattedHours.push(
          <p key={i}>
            {currentGroup[0].day_of_week} to {currentGroup[currentGroup.length - 1].day_of_week}: {lastOpenTime} - {lastCloseTime}
          </p>
        );
      } else {
        formattedHours.push(
          <p key={i}>
            {last.day_of_week}: {lastOpenTime === "Closed" ? "Closed" : `${lastOpenTime} - ${lastCloseTime}`}
          </p>
        );
      }
      currentGroup = [current];
    }
  }

  // Handle the last group
  if (currentGroup.length > 1) {
    const last = currentGroup[currentGroup.length - 1];
    const lastOpenTime = last.open_time ? formatTime(last.open_time) : "Closed";
    const lastCloseTime = last.close_time ? formatTime(last.close_time) : "Closed";

    formattedHours.push(
      <p key="last">
        {currentGroup[0].day_of_week} to {last.day_of_week}: {lastOpenTime} - {lastCloseTime}
      </p>
    );
  } else {
    const last = currentGroup[0];
    const lastOpenTime = last.open_time ? formatTime(last.open_time) : "Closed";
    const lastCloseTime = last.close_time ? formatTime(last.close_time) : "Closed";

    formattedHours.push(
      <p key="last-single">
        {last.day_of_week}: {lastOpenTime === "Closed" ? "Closed" : `${lastOpenTime} to ${lastCloseTime}`}
      </p>
    );
  }

  return formattedHours;
}


export default function Locations() {
  const { locations, mapboxAccessToken } = useLoaderData<{
    locations: GarageLocation[];
    mapboxAccessToken: string;
  }>();

  useEffect(() => {
    if (locations && locations.length > 0) {
      setupMapWithLocations(locations, mapboxAccessToken, 'map');
    }
  }, [locations, mapboxAccessToken]);

  return (
    <div className="py-24 sm:py-32">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="text-4xl font-bold tracking-tight sm:text-6xl">
          FIND A GARAGE NEAR YOU
        </h2>
      </div>
      <div className="mx-auto my-16 grid p-6 max-w-lg grid-cols-1 gap-6 sm:mt-20 lg:mx-auto lg:max-w-none lg:grid-cols-2 lg:gap-8 justify-center">
        {locations.map((location) => (
          <div key={location.location_id} className="p-4 rounded-xl bg/" style={{ backgroundColor: '#DBE2EF', color: '#112D4E' }}>
            <p className="text-center">
              <strong>Garage Glide {location.location_name}</strong>
              <br />
              {location.street}
              <br />
              {location.city}
              <br />
              {location.county}, {location.country}
              <br />
              {location.postcode}
              <br />
              Telephone: {location.telephone}
              <br /><br />
              <strong>Opening Hours:</strong>
              <br />
              {formatOpeningHours(location.openingHours)}
            </p>
          </div>
        ))}
      </div>
      <div style={{ width: '100%', overflow: 'hidden', height: '15cm', position: 'relative' }}>
        <div style={{ width: '60%', float: 'right', zIndex: '0' }}>
          <div id="map" style={{ width: '100%', height: '100%', position: 'absolute', top: '0', right: '0' }}></div>
        </div>
      </div>
    </div>
  );
}
