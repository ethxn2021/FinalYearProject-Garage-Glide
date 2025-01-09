import React, { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import { geocodePostcode, getRoadDistance } from './locationutils';
import { fetchVehicleDetails } from '~/utils/api.dvla';

interface Centre {
  name: string;
  address: string;
  city: string;
  county: string;
  country: string;
  postcode: string;
  tel: string;
}

export default function SelectCentre() {
  const [showNearbyCentres, setShowNearbyCentres] = useState<boolean>(false);
  const [selectedCentre, setSelectedCentre] = useState<Centre | null>(null);
  const [distanceToCentre, setDistanceToCentre] = useState<number | null>(null);
  const [postcode, setPostcode] = useState<string>(Cookies.get('postcode') || '');
  const [registration, setRegistration] = useState<string>(Cookies.get('registration')?.toUpperCase() || '');
  const [vehicleDetails, setVehicleDetails] = useState<{
    make: string;
    colour: string;
    yearOfManufacture: number;
    motStatus: string;
    motExpiryDate: string;
    fuelType: string;
  } | null>(null);
  const [editPostcode, setEditPostcode] = useState<boolean>(false);
  const [editRegistration, setEditRegistration] = useState<boolean>(false);
  const dvlaApiKey = 'MbSMAhpPQZ9clXCuaK1s89OheLh8ble94Yo7d3My';

  useEffect(() => {
    handleFindCentre();
    fetchVehicleDetailsAndUpdateState();
  }, []);

  useEffect(() => {
    fetchVehicleDetailsAndUpdateState();
  }, [registration]);

  const nearbyCentres: Centre[] = [
    {
      name: 'Canterbury',
      address: 'University of Kent',
      city: 'Canterbury',
      county: 'Kent',
      country: 'United Kingdom',
      postcode: 'CT2 7FN',
      tel: 'Tel: 01227 764000'
    },
    {
      name: 'Medway',
      address: 'University of Kent Medway Building',
      city: 'Chatham',
      county: 'Kent',
      country: 'United Kingdom',
      postcode: 'ME4 4AG',
      tel: 'Tel: 01227 764000'
    }
  ];

  const handleFindCentre = async () => {
    const userLocation = await geocodePostcode(postcode);

    if (!userLocation) {
      console.error('User postcode could not be geocoded');
      return;
    }

    let minDistance = Number.MAX_SAFE_INTEGER;
    let nearestCentre: Centre | null = null;

    for (const centre of nearbyCentres) {
      const centreLocation = await geocodePostcode(centre.postcode);

      if (centreLocation) {
        const distance = await getRoadDistance(
          userLocation.longitude,
          userLocation.latitude,
          centreLocation.longitude,
          centreLocation.latitude
        );
        if (distance !== null && distance < minDistance) {
          minDistance = distance;
          nearestCentre = centre;
          setDistanceToCentre(distance);
        }
      }
    }

    if (nearestCentre) {
      setSelectedCentre(nearestCentre);
    } else {
      console.error('Could not find the closest location');
    }
  };

  const fetchVehicleDetailsAndUpdateState = async () => {
    const userVehicleDetails = await fetchVehicleDetails(
      registration,
      dvlaApiKey
    );
    setVehicleDetails(userVehicleDetails);
  };

  const handleSelectCentre = async (centre: Centre | null) => {
    if (centre) {
      setSelectedCentre(centre);
      setShowNearbyCentres(false);

      const userVehicleDetails = await fetchVehicleDetails(
        registration,
        dvlaApiKey
      );
      setVehicleDetails(userVehicleDetails);

      const userLocation = await geocodePostcode(postcode);

      if (!userLocation) {
        console.error('User postcode could not be geocoded');
        return;
      }
      
      
      // Get the location of the selected centre

      const centreLocation = await geocodePostcode(centre.postcode);

      if (centreLocation) {
          // If the centre location was successfully retrieved, calculate the road distance to the centre
        const distance = await getRoadDistance(
          userLocation.longitude,
          userLocation.latitude,
          centreLocation.longitude,
          centreLocation.latitude
        );
        if (distance !== null) {
          setDistanceToCentre(distance);
        } else {
          console.error(
            'Could not calculate the distance to the selected centre'
          );
        }
      } else {
        console.error("Could not geocode the selected centre's postcode");
      }
    }
  };

   // Function to handle the confirm button click
  const handleConfirm = () => {
    if (selectedCentre) {
        // Save the postcode and registration to cookies
      Cookies.set('selectedCentre', JSON.stringify(selectedCentre.name));
    } else {
      alert('Please select a centre before confirming.');
    }
    Cookies.set('postcode', postcode);
    Cookies.set('registration', registration);
    window.location.href = `/service`;
  };

  return (
    <div className="py-24 sm:py-32">
      <div className="mx-auto max-w-2xl text-center">


        <h2 className="mb-8 text-4xl font-bold tracking-tight sm:text-6xl" style={{ color: '#112D4E' }}>
          YOUR DETAILS:
        </h2>

        <div className="mx-2">
          {editPostcode ? (
            <input
              type="text"
              value={postcode}
              onChange={(e) => setPostcode(e.target.value)}
              onBlur={() => setEditPostcode(false)}
              autoFocus
              style={{ fontSize: '20px', fontWeight: 'bold' }}
            />
          ) : (
            <>
              <span style={{ fontSize: '20px', fontWeight: 'bold' }}>{postcode}</span>
              <button style={{ color: 'blue', textDecoration: 'underline', marginLeft: '10px' }} onClick={() => setEditPostcode(true)}>Update</button>
            </>
          )}
        </div>

        <div className="mx-2 mt-4">
          {editRegistration ? (
            <input
              type="text"
              value={registration}
              onChange={(e) => setRegistration(e.target.value.toUpperCase())}
              onBlur={() => setEditRegistration(false)}
              autoFocus
              style={{ fontSize: '20px', fontWeight: 'bold' }}
            />
          ) : (
            <>
              <span style={{ fontSize: '20px', fontWeight: 'bold' }}>{registration}</span>
              <button style={{ color: 'blue', textDecoration: 'underline', marginLeft: '10px' }} onClick={() => setEditRegistration(true)}>Update</button>
            </>
          )}
        </div>
      </div>

      <div className="mx-auto my-16 grid p-6 max-w-lg grid-cols-1 gap-6 sm:mt-20 lg:mx-auto lg:max-w-none lg:grid-cols-2 lg:gap-8 justify-center">
        <div className="p-6 rounded-xl bg-blue-200 text-center">
          <h2 className="text-xl font-bold mb-2">YOUR VEHICLE DETAILS</h2>
          {vehicleDetails && (
            <>
              <p>Make: {vehicleDetails.make}</p>
              <p>Colour: {vehicleDetails.colour}</p>
              <p>Year: {vehicleDetails.yearOfManufacture}</p>
              <p>MOT Status: {vehicleDetails.motStatus}</p>
              <p>MOT Expiry: {vehicleDetails.motExpiryDate}</p>
              <p>Fuel Type: {vehicleDetails.fuelType}</p>
            </>
          )}
        </div>

        {selectedCentre && (
          <div className="p-6 rounded-xl bg-blue-200 text-center">
            <h2 className="text-xl font-bold mb-2">YOUR SELECTED CENTRE</h2>
            <div>
              <p>{selectedCentre.address}</p>
              <p>{selectedCentre.city}</p>
              <p>{selectedCentre.county}</p>
              <p>{selectedCentre.country}</p>
              <p>{selectedCentre.postcode}</p>
              <p>{selectedCentre.tel}</p>
              {distanceToCentre !== null && (
                <p>Distance: {distanceToCentre.toFixed(2)} miles</p>
              )}
            </div>
            <button
              className="text-white px-4 py-2 rounded mt-2 bg-blue-800"
              onClick={() => setShowNearbyCentres(!showNearbyCentres)}
            >
              {showNearbyCentres
                ? 'HIDE NEARBY CENTRES'
                : 'OTHER NEARBY CENTRES'}
            </button>
          </div>
        )}

        {showNearbyCentres && (
          <div className="p-6 rounded-xl bg-blue-200 text-black text-center">
            <h2 className="text-xl font-bold mb-2">OTHER NEARBY CENTRES</h2>
            {nearbyCentres.map((centre, index) => {
              if (selectedCentre && centre.name !== selectedCentre.name) {
                return (
                  <div key={index} className="p-6 rounded-xl bg-blue-200 text-center">
                    <p>{centre.address}</p>
                    <p>{centre.city}</p>
                    <p>{centre.county}</p>
                    <p>{centre.country}</p>
                    <p>{centre.postcode}</p>
                    <p>{centre.tel}</p>
                    <button
                      className="text-white px-4 py-2 rounded mt-2 bg-blue-800"
                      onClick={() => handleSelectCentre(centre)}
                    >
                      SELECT
                    </button>
                  </div>
                );
              } else {
                return null;
              }
            })}
          </div>
        )}

      </div>

      <div className="mx-auto max-w-2xl text-right">
        <button
          className="text-white px-4 py-2 rounded mt-1 bg-blue-800"
          onClick={handleConfirm}
        >
          CONFIRM
        </button>

      </div>
    </div>
  );
}
