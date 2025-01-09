import axios from 'axios';

export const fetchVehicleDetails = async (registrationNumber: string, dvlaApiKey: string) => {
    // CORS proxy to prevent DVLA API CORS issues
    const proxyUrl = 'https://corsproxy.io/?';
    const dvlaApiUrl = `${proxyUrl}https://driver-vehicle-licensing.api.gov.uk/vehicle-enquiry/v1/vehicles`;

    try {
        // Make a POST request to the DVLA API via the CORS proxy
        const response = await axios.post(dvlaApiUrl, {
            registrationNumber: registrationNumber
        }, {
            headers: {
                'x-api-key': dvlaApiKey,
                'Content-Type': 'application/json'
            }
        });

        // Return the response data (vehicle details) from the DVLA API
        return response.data;
    } catch (error) {
        console.error('DVLA API request failed:', error);
        return null;
    }
};
