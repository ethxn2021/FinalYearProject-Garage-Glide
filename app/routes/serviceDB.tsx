import { json, LoaderFunction } from "@remix-run/node";
import { executeQuery } from "./database";

export let action: LoaderFunction = async ({ request, params }) => {
  if (request.method === "GET") {
    const registrationParam = params.registration;
    
    // Check if registrationParam exists and is not empty
    if (!registrationParam) {
      return json({ error: "Registration number not provided" }, { status: 400 });
    }

    try {
      const query = `SELECT * FROM comp6000_06.Vehicle WHERE registration_number = ?`;
      const values = [registrationParam];

      const result = await executeQuery(query, values);

      if (result.length > 0) {
        return json({ vehicleDetails: result[0] });
      } else {
        return json({ error: "Vehicle not found" }, { status: 404 });
      }
    } catch (error) {
      console.error(error);
      return json({ error: "Database error" }, { status: 500 });
    }
  }

  return json({ error: "Invalid request method" }, { status: 400 });
};
