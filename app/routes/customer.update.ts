import { ActionFunction, json } from "@remix-run/node";
import { updateCustomerName, updateCustomerEmail, updateCustomerPassword, verifyCustomerPassword , requireCustomerLogin } from "~/customer.server";
import bcrypt from "bcryptjs";

export const action: ActionFunction = async ({ request }) => {
  const customerId = await requireCustomerLogin(request);
  if (!customerId) {
    return json({ success: false, error: "User not logged in" }, { status: 401 });
  }

  const formData = await request.formData();
  const firstName = formData.get("firstName");
  const lastName = formData.get("lastName");
  const email = formData.get("email");
  const currentPassword = formData.get("currentPassword");
  const newPassword = formData.get("newPassword");

  // Handling password update
  if (typeof currentPassword === "string" && typeof newPassword === "string" && currentPassword && newPassword) {
    // Verify current password
    const passwordIsValid = await verifyCustomerPassword({ customerId, password: currentPassword });
    if (!passwordIsValid) {
      return json({ success: false, error: "Invalid current password" }, { status: 403 });
    }

    // Hash new password
    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(newPassword, salt);

    // Update password in the database
    const updateResult = await updateCustomerPassword({ customerId, passwordHash: hashedPassword });
    if (!updateResult.success) {
      return json({ success: false, error: updateResult.error }, { status: 500 });
    }

    // If password update is successful, return early
    return json({ success: true });
  }

  // Handling name update
  if (typeof firstName === "string" && typeof lastName === "string" && firstName && lastName) {
    const updateResult = await updateCustomerName({ customerId, firstName, lastName });
    if (!updateResult.success) {
      return json({ success: false, error: updateResult.error }, { status: 500 });
    }
    return json({ success: true });
  }

  // Handling email update
  if (typeof email === "string" && email) {
    const updateResult = await updateCustomerEmail({ customerId, email });
    if (!updateResult.success) {
      return json({ success: false, error: updateResult.error }, { status: 500 });
    }
    return json({ success: true });
  }

  return json({ success: false, error: "Invalid input" }, { status: 400 });
};
