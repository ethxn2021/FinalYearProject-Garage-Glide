import { json, LoaderFunction } from "@remix-run/node";
import { executeQuery } from "./database"; // Implement your database connection
const bycript = require("bcryptjs");
export let action: LoaderFunction = async ({ request }) => {
  if (request.method === "POST") {
    // Parse form data from the request
    const formData = new URLSearchParams(await request.text());

    const username = formData.get("username");
    const first_Name = formData.get("firstName");
    const last_Name = formData.get("lastName");
    const location = formData.get("centre");
    const hashpassword = await bycript.hash(formData.get("password"), 10);
    const password = hashpassword;
    const values = [first_Name, last_Name, username, password, location];
    const query = ` INSERT INTO comp6000_06.Staff (first_name, last_name, username,password, location)
        VALUES (?, ?, ?, ?, ?)`;
    try {
      // Insert user data into the database
      const result = await executeQuery(query, values);

      if (result.affectedRows === 1) {
        // User registration successful
        return json({ message: "Registration successful" }, { status: 302, headers: { Location: "/staff_login" } });
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
  return json({});
};
