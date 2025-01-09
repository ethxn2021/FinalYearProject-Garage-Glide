import { json, LoaderFunction } from "@remix-run/node";
import { executeQuery } from "./database"; 
const bycript = require("bcryptjs");
const { v4: uuidv4 } = require("uuid");

export let action: LoaderFunction = async ({ request }) => {
  if (request.method === "POST") {
    // Parse form data from the request
    const formData = new URLSearchParams(await request.text());

    const first_Name = formData.get("firstName");
    const last_Name = formData.get("lastName");
    const telephone = formData.get("telephone");
    const email = formData.get("email");
    const hashpassword = await bycript.hash(formData.get("password"), 10);
    const password = hashpassword;
    const registrationDate = new Date().toISOString().split("T")[0];
    
    const values = [first_Name, last_Name, email, telephone, password, registrationDate];
    const query = `INSERT INTO comp6000_06.Customer (first_name, last_name, email, telephone, password, registration_date)
            VALUES (?, ?, ?, ?, ?, ?)`;
         

    try {
      // Insert user data into the database
      const result = await executeQuery(query, values);

      if (result.affectedRows === 1) {
        // User registration successful
        return json({ message: "Registration successful" }, { status: 302, headers: { Location: "/login" } });
      } else {
        // Registration failed
        return json({ error: "Registration failed" }, { status: 400 });
      }
    } catch (error) {
      // Handle database errors
      console.log(error);
      return json({ error: "Database error" }, { status: 500 });
    }
  }

  // Return an empty response for GET requests
  return json({});
};


