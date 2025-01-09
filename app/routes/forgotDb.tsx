import { json, LoaderFunction } from "@remix-run/node";
import { executeQuery } from "./database";
const bcrypt = require("bcryptjs");

export let action: LoaderFunction = async ({ request }) => {
  if (request.method === "POST") {
    try {
      const formData = new URLSearchParams(await request.text());
      const email = formData.get("email");

      // Check if the email exists in the database
      const checkEmailQuery = `
        SELECT email FROM comp6000_06.Customer WHERE email = ?;
      `;

      const emailCheckResult = await executeQuery(checkEmailQuery, [email]);

      if (emailCheckResult.length === 1) {
        // Set a new password (you might want to implement a more secure method)
        const newPassword = formData.get("newPassword");

        // Hash the new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Update the user's password in the database
        const updatePasswordQuery = `
          UPDATE comp6000_06.Customer
          SET password = ?
          WHERE email = ?;
        `;

        const updatePasswordResult = await executeQuery(updatePasswordQuery, [hashedPassword, email]);

        if (updatePasswordResult.affectedRows === 1) {
          // Password reset successful
          return json({ message: "Password reset successful" }, { status: 200 });
        } else {
          // Password reset failed
          return json({ error: "Password reset failed" }, { status: 500 });
        }
      } else {
        // Email not found in the database
        return json({ error: "Email not found" }, { status: 404 });
      }
    } catch (error) {
      // Handle database errors or unexpected errors
      console.error(error);
      return json({ error: "An unexpected error occurred" }, { status: 500 });
    }
  }

  // Return an empty response for GET requests
  return json({});
};
