import React, { useState } from 'react';
import { LoaderFunction, json } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import { geocodePostcode, getRoadDistance } from '~/utils/api.mapbox';
import { fetchVehicleDetails as fetchVehicleDetailsAPI } from '~/utils/api.dvla';

export const loader: LoaderFunction = async () => {
    const mapboxAccessToken = process.env.MAPBOX_ACCESS_TOKEN;
    const dvlaAccessToken = process.env.DVLA_ACCESS_TOKEN;
    return json({ mapboxAccessToken, dvlaAccessToken });
};

export default function Test() {
    const [userPostcode, setUserPostcode] = useState<string>('');
    const [closestLocation, setClosestLocation] = useState<string>('');
    const [distanceToClosest, setDistanceToClosest] = useState<number>(0);
    const [userStreet, setUserStreet] = useState<string>('');
    const [closestStreet, setClosestStreet] = useState<string>('');
    const { mapboxAccessToken, dvlaAccessToken } = useLoaderData();
    const [vehicleReg, setVehicleReg] = useState<string>('');
    const [vehicleDetails, setVehicleDetails] = useState<{
        make: string,
        color: string,
        registrationYear: number,
        motStatus: string,
        motExpiryDate: string,
        fuelType: string
    } | null>(null);

    const fetchVehicleDetails = async () => {
        try {
            const data = await fetchVehicleDetailsAPI(vehicleReg, dvlaAccessToken);
            if (data.error) {
                console.error("Error fetching vehicle details:", data.error);
            } else {
                setVehicleDetails({
                    make: data.make,
                    color: data.colour,
                    registrationYear: data.yearOfManufacture,
                    motStatus: data.motStatus,
                    motExpiryDate: data.motExpiryDate,
                    fuelType: data.fuelType
                });
            }
        } catch (error) {
            console.error("Fetching vehicle details failed:", error);
        }
    };

    const findClosestLocation = async () => {
        const predefinedPostcodes = ['CT2 7NZ', 'ME4 4AG'];
        const userLocation = await geocodePostcode(userPostcode, mapboxAccessToken);

        if (!userLocation) {
            console.error("User postcode could not be geocoded");
            return;
        }

        setUserStreet(userLocation.streetName);

        let closest = null;
        let closestStreetName = '';
        let minDistance = Infinity;

        for (const postcode of predefinedPostcodes) {
            const location = await geocodePostcode(postcode, mapboxAccessToken);
            if (location && userLocation) {
                const distance = await getRoadDistance(userLocation.longitude, userLocation.latitude, location.longitude, location.latitude, mapboxAccessToken);
                if (distance !== null && distance < minDistance) {
                    minDistance = distance;
                    closest = postcode;
                    closestStreetName = location.streetName;
                }
            }
        }

        if (closest) {
            setClosestLocation(closest);
            setDistanceToClosest(minDistance);
            setClosestStreet(closestStreetName);
        } else {
            console.error("Could not find the closest location");
            setClosestLocation("Not found");
            setDistanceToClosest(0);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center h-screen">
            <h1 className="text-2xl font-semibold mb-2">Enter Your Postcode</h1>
            <input
                type="text"
                value={userPostcode}
                onChange={(e) => setUserPostcode(e.target.value)}
                placeholder="Your Postcode"
                className="text-center border-2 border-gray-300 rounded-lg p-2 mb-4"
            />
            <button
                onClick={findClosestLocation}
                type="submit"
                className="text-white font-bold py-2 px-4 rounded"
                style={{ backgroundColor: "#112D4E", fontSize: "16px" }}
            >
                Submit
            </button>

            <h1 className="text-2xl font-semibold mb-2 mt-6">Enter Vehicle Registration Number</h1>
            <input
                type="text"
                value={vehicleReg}
                onChange={(e) => setVehicleReg(e.target.value)}
                placeholder="Vehicle Registration Number"
                className="text-center border-2 border-gray-300 rounded-lg p-2 mb-4"
            />
            <button
                onClick={fetchVehicleDetails}
                type="submit"
                className="text-white font-bold py-2 px-4 rounded"
                style={{ backgroundColor: "#112D4E", fontSize: "16px" }}
            >
                Submit
            </button>

            {closestLocation && (
                <div>
                    <p className="mt-4">Your Location: {userStreet} ({userPostcode})</p>
                    <p>Closest Location: {closestStreet} ({closestLocation}) - {distanceToClosest.toFixed(2)} miles away</p>
                </div>
            )}

            {vehicleDetails && (
                <div>
                    <p>Make: {vehicleDetails.make}</p>
                    <p>Colour: {vehicleDetails.color}</p>
                    <p>Year: {vehicleDetails.registrationYear}</p>
                    <p>MOT Status: {vehicleDetails.motStatus}</p>
                    <p>MOT Expiry: {vehicleDetails.motExpiryDate}</p>
                    <p>Fuel Type: {vehicleDetails.fuelType}</p>
                </div>
            )}
        </div>
    );
}
