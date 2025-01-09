import { json, redirect } from "@remix-run/node";
import * as bcrypt from "bcryptjs";
import { executeQuery } from "~/routes/database";
import { badActionData } from ".";

type StaffSignupForm = {
  firstName: string;
  lastName: string;
  username: string;
  password: string;
  role: "Admin" | "Manager";
  location: number;
};

export interface BasketItem {
  // basket_id: number;
  first_name: string;
  last_name: string;
  registration_number: string | null;
  postcode: string;
  vehicle_id: number;
  customer_id: number;
  date: Date;
  time: string;
  service_type: string;
  price: number;
  selectedCentre: string;
}
export interface GarageLocation {
  location_id: number;
  location_name: string;
  street: string;
  city: string;
  county: string;
  country: string;
  postcode: string;
  telephone: string;
}

export interface Staff {
  staff_id: number;
  username: string;
  first_name: string;
  last_name: string;
  role: "Admin" | "Manager";
  location_name: string;
  location_id: number;
}

export interface Customers {
  customer_id: number;
  first_name: string;
  last_name: string;
  email: string;
  telephone: number;
}

export interface Review {
  feedback_id: number;
  garage_reply: string;
  booking_date: Date;
  customer_rating: number;
  customer_name: string;
  service_name: string;
  customer_comment: string;
}

type ServiceRegistrationForm = {
  duration: number;
  cost: number;
  description: string;
  service_name: string;
  service_section: string;
};

export interface InventoryItems {
  item_name: string;
  item_description: string;
  stock_level: number;
  stock_threshold: number;
  //stock_status:string;
  //item_id:number;
}

export interface Services {
  service_section: string;
  service_name: string;
  cost: number;
  duration: number;
  service_id: number;
  service_section_id: number;
  section_name: string;
}

export interface Service_Sections {
  section_name: string;
  section_id: number;
}

export interface OpeningHours {
  location_id: number;
  opening_hours_id: number;
  day_of_week: string;
  open_time: number;
  close_time: number;
}

export interface Transactions {
  booking_id: number;
  transaction_date: Date;
  amount: number;
  payment_method: string;
  discount_id: null;
}

export interface Bookings {
  // booking_id: number;
  customer_id: number;
  vehicle_id: number;
  location_id: number;
  booking_date: Date;
  booking_start: string;
  booking_end: string;
  booking_status: string;
  payment_status: string;
}

export interface BookingDetails {
  Booking_Number: number;
  Customer_Name: string;
  booking_date: Date;
  booking_start: string;
  booking_end: string;
  Vehicle_Registration: string;
  Vehicle_Year: number;
  Vehicle_Make: string;
  Vehicle_Colour: string;
  Vehicle_Fuel_Type: string;
  Services_Details: string;
  Gross_Amount: string;
  Total_Amount_Paid: string;
  Discount_Applied: string;
  Net_Amount: string;
  booking_status: string;
  payment_status: string;
  Payment_Method: string;
}

/**
 * Retrieves all staff members from the database based on manager's location.
 * @returns A promise that resolves to an array of staff members.
 * @throws If there is an error while retrieving the staff members.
 */
export async function getBookingInformation(managerLocationId: number): Promise<any[]> {
  const query = `SELECT 
    f.feedback_id,
    b.booking_date,
    CONCAT(c.first_name, ' ', c.last_name) AS customer_name,
    s.service_name,
    f.customer_rating,
    f.customer_comment,
    f.garage_reply
  FROM 
    comp6000_06.Feedback f
  JOIN 
    comp6000_06.BookingServices bs ON f.booking_service_id = bs.booking_service_id
  JOIN 
    comp6000_06.Bookings b ON bs.booking_id = b.booking_id
  JOIN 
    comp6000_06.Customer c ON b.customer_id = c.customer_id
  JOIN 
    comp6000_06.Services s ON bs.service_id = s.service_id
  WHERE 
    b.location_id = ? -- Filter by the manager's location
  ORDER BY 
    (f.garage_reply IS NULL OR f.garage_reply = '') DESC, -- Empty replies first
    b.booking_date DESC, -- Then by booking date, newest first
    f.customer_rating DESC; -- High ratings first`;
  try {
    const result = await executeQuery(query, [managerLocationId]);
    return result;
  } catch (error) {
    console.error("Get bookings error:", error);
    throw error;
  }
}

/**
 * Updates the garage reply for a specific feedback entry in the database.
 * @param feedback_id The ID of the feedback entry to update.
 * @param garage_reply The new garage reply to be set.
 * @returns A promise that resolves to true if the update was successful, false otherwise.
 */
export async function updateGarageReply(feedback_id: number, garage_reply: string): Promise<boolean> {
  const query = `
    UPDATE comp6000_06.Feedback
    SET garage_reply = ?
    WHERE feedback_id = ?;
  `;

  try {
    //console.log("String");
    const result = await executeQuery(query, [garage_reply, feedback_id]);

    return true; // Assuming the update was successful
  } catch (error) {
    console.error("Update garage reply error:", error);
    return false;
  }
}

/**
 * Registers a staff member in the database.
 *
 * @param dto - The staff signup form data.
 * @returns A Promise that resolves to a success message if the registration is successful, or an error message if it fails.
 */
export async function staffSignup(dto: StaffSignupForm) {
  const hashpassword = await bcrypt.hash(dto.password, 10);
  const password = hashpassword;
  const values = [dto.firstName, dto.lastName, dto.username, password, dto.role, dto.location];
  const query = ` INSERT INTO comp6000_06.Staff (first_name, last_name, username,password, role, location_id)
        VALUES (?, ?, ?, ?, ?, ?)`;
  try {
    // Insert user data into the database
    const result = await executeQuery(query, values);

    if (result.affectedRows === 1) {
      // User registration successful
      return redirect("/manager/profile?success=You have successfully registered, please login to continue");
    } else {
      // Registration failed
      return badActionData(values, {} as any, "Registration failed");
    }
  } catch (error) {
    // Handle database errors
    console.log(error);
    return badActionData(values, {} as any, "Something went wrong, please try again later");
  }
}

/**
 * Registers a service in the database.
 *
 * @param dto - The service form data.
 * @returns A Promise that resolves to a success message if the registration is successful, or an error message if it fails.
 */

export async function registerService(dto: ServiceRegistrationForm) {
  const values = [dto.service_section, dto.service_name, dto.description, dto.cost, dto.duration];

  const query = `
    INSERT INTO comp6000_06.Services (service_section, service_name, description, cost, duration)
    VALUES (?, ?, ?, ?, ?)
  `;

  try {
    // Insert service data into the database
    const result = await executeQuery(query, values);

    if (result.affectedRows === 1) {
      // Service registration successful
      console.log("success");
      return redirect("/manager/profile?success=You have successfully registered");
    } else {
      // Registration failed
      return badActionData(dto, {} as any, "Service registration failed");
    }
  } catch (error) {
    // Handle database errors
    console.log(error);
    return badActionData(dto, {} as any, "Something went wrong, please try again later");
  }
}

/**
 * Retrieves all garage locations from the database.
 * @returns A promise that resolves to an array of GarageLocation objects.
 * @throws If there is an error while retrieving the locations.
 */
export async function getLocations(): Promise<GarageLocation[]> {
  const query = "SELECT * FROM comp6000_06.Garage_Location";
  try {
    const result = await executeQuery(query, []);
    return result;
  } catch (error) {
    console.error("Get locations error:", error);
    throw error;
  }
}

export async function getGarageOpeningHours(): Promise<OpeningHours[]> {
  const query = "SELECT * FROM comp6000_06.Garage_Opening_Hours";
  try {
    const result = await executeQuery(query, []);
    return result;
  } catch (error) {
    console.log("Get hours error:", error);
    throw error;
  }
}

/**
 * Retrieves all garage opening hours from the database.
 * @returns opening hours
 * @throws If there is an error while retrieving the opening hours.
 */
export async function getOpeningHours(): Promise<{ [key: number]: any }> {
  const query = "SELECT * FROM comp6000_06.Garage_Opening_Hours";
  try {
    const result = await executeQuery(query, []);
    const openingHoursMap = result.reduce((acc: { [key: number]: any }, current: any) => {
      const { location_id, day_of_week, open_time, close_time } = current;
      if (!acc[location_id]) {
        acc[location_id] = [];
      }
      acc[location_id].push({ day_of_week, open_time, close_time });
      return acc;
    }, {});
    return openingHoursMap;
  } catch (error) {
    console.error("Get opening hours error:", error);
    throw error;
  }
}

/**
 * Checks if a username exists in the database.
 * @param {string} username - The username to check.
 * @returns {Promise<boolean>} - A promise that resolves to true if the username exists, false otherwise.
 * @throws {Error} - If there is an error while executing the query.
 */
export async function checkIfUsernameExists(username: string) {
  const query = "SELECT * FROM comp6000_06.Staff WHERE username = ?";
  const values = [username];
  try {
    const result = await executeQuery(query, values);
    return result.length > 0;
  } catch (error) {
    console.error("Check username error:", error);
    throw error;
  }
}

//service_section, service_name, cost, duration
/**
 * Retrieves all services from the database.
 * @returns A promise that resolves to an array of services objects.
 * @throws If there is an error while retrieving the locations.
 */
export async function getServices(): Promise<Services[]> {
  const query = "SELECT service_id, service_section, service_name, cost, duration FROM comp6000_06.Services";
  try {
    const result = await executeQuery(query, []);
    return result;
  } catch (error) {
    console.error("Get services error:", error);
    throw error;
  }
}

/**
 * Retrieves all staff members from the database based on manager's location.
 * @returns A promise that resolves to an array of staff members.
 * @throws If there is an error while retrieving the staff members.
 */
export async function getStaffByManagerLocation(): Promise<Staff[]> {
  const query = `SELECT s.staff_id, s.username, s.first_name, s.last_name, s.role, gl.location_name, s.isActive 
  FROM comp6000_06.Staff s
  JOIN comp6000_06.Garage_Location gl ON s.location_id = gl.location_id`;
  try {
    const result = await executeQuery(query, []);
    return result;
  } catch (error) {
    console.error("Get locations error:", error);
    throw error;
  }
}

/**
 * Retrieves all bookings from the database.
 * @returns A promise that resolves to an array of Bookings objects.
 * @throws If there is an error while retrieving the locations.
 */
export async function getBookings(locationId: string): Promise<Bookings[]> {
  const query = `
  SELECT 
  V.registration_number,
  B.booking_id,
  GROUP_CONCAT(DISTINCT S.service_name ORDER BY S.service_name SEPARATOR ', ') AS services,
  B.booking_date,
  B.booking_start,
  B.booking_end,
  B.booking_status,
  B.location_id
FROM 
  comp6000_06.Bookings B
JOIN 
  comp6000_06.Vehicle V ON B.vehicle_id = V.vehicle_id
JOIN 
  comp6000_06.BookingServices BS ON B.booking_id = BS.booking_id
JOIN 
  comp6000_06.Services S ON BS.service_id = S.service_id
WHERE 
  B.location_id = ?
GROUP BY 
  B.booking_id, B.booking_start, B.booking_end, V.registration_number, B.location_id
ORDER BY 
  V.registration_number;`;

  try {
    const result = await executeQuery(query, [locationId]);
    return result;
  } catch (error) {
    console.error("Get bookings error:", error);
    throw error;
  }
}

/**
 * Retrieves customer info from the database.
 * @returns A promise that resolves to an array of Customers objects.
 * @throws If there is an error while retrieving the customers info.
 */
export async function getCustomer(): Promise<Customers[]> {
  const query = "SELECT customer_id, first_name, last_name, email, telephone FROM comp6000_06.Customer";
  try {
    const result = await executeQuery(query, []);
    return result;
  } catch (error) {
    console.error("Get customers error:", error);
    throw error;
  }
}

/**
 * Retrieves inventory  info from the database.
 * @returns A promise that resolves to an array of Inventory objects.
 * @throws If there is an error while retrieving the inventory info.
 */
export async function getInventoryItems(): Promise<InventoryItems[]> {
  const query = `SELECT item_name, stock_level, item_id,
  CASE
      WHEN stock_level <= 0 THEN 'Out of Stock'
      WHEN stock_level <= stock_threshold / 2 THEN 'Reorder Immediately'
      WHEN stock_level <= stock_threshold THEN 'Low Stock'
      ELSE 'Sufficient Stock'
  END AS stock_status
  FROM comp6000_06.InventoryItems
  ORDER BY stock_status ASC, stock_level`;
  try {
    const result = await executeQuery(query, []);
    return result;
  } catch (error) {
    console.error("Get inventory error:", error);
    throw error;
  }
}

/**
 * Updates the stock level of an item in the database.
 *
 * @param itemId - The ID of the item to update.
 * @param newStockLevel - The new stock level of the item.
 * @returns A Promise that resolves to a success message if the update is successful, or an error message if it fails.
 */
export async function updateStockLevel(itemId: number, additionalQuantity: number) {
  try {
    // Retrieve current stock level from the database
    const currentStockLevelQuery = `
      SELECT stock_level
      FROM comp6000_06.InventoryItems
      WHERE item_id = ?
    `;
    const currentStockLevelResult = await executeQuery(currentStockLevelQuery, [itemId]);

    if (currentStockLevelResult.length !== 1) {
      throw new Error("Item not found or multiple items found with the same ID");
    }

    const currentStockLevel = currentStockLevelResult[0].stock_level;

    // Calculate new stock level
    const newStockLevel = currentStockLevel + additionalQuantity;

    // Update stock level in the database
    const updateStockLevelQuery = `
      UPDATE comp6000_06.InventoryItems
      SET stock_level = ?
      WHERE item_id = ?
    `;
    const updateStockLevelValues = [newStockLevel, itemId];
    const updateResult = await executeQuery(updateStockLevelQuery, updateStockLevelValues);

    if (updateResult.affectedRows === 1) {
      // Stock level update successful
      return { success: true };
    } else {
      // Update failed
      throw new Error("Stock level update failed");
    }
  } catch (error) {
    // Handle database errors
    console.error("Error updating stock level:", error);
    throw new Error("Something went wrong, please try again later");
  }
}

/**
 * Registers an Inventory Item in the database.
 *
 * @param dto - The item form data.
 * @returns A Promise that resolves to a success message if the registration is successful, or an error message if it fails.
 */
export async function registerInventory(dto: InventoryItems) {
  const values = [dto.item_name, dto.item_description, dto.stock_level, dto.stock_threshold];
  const query = `
    INSERT INTO comp6000_06.InventoryItems (item_name, item_description, stock_level, stock_threshold)
    VALUES (?, ?, ?, ?)
  `;
  try {
    // Insert items  into the database
    const result = await executeQuery(query, values);

    if (result.affectedRows === 1) {
      // Item registration successful
      return redirect("/manager/profile?success=You have successfully registered");

      return { success: true };
    } else {
      // Registration failed
      return badActionData(values, {} as any, "Item registration failed");
    }
  } catch (error) {
    // Handle database errors
    console.log(error);
    return badActionData(values, {} as any, "Something went wrong, please try again later");
  }
}

/**
 * Updates customer details in the database.
 *
 * @param customerId - The ID of the customer to update.
 * @param newData - The new data to update for the customer.
 * @returns A Promise that resolves when the update is successful.
 */
export const updateCustomer = async (customerId: number, newData: Partial<Customers>) => {
  const query = `
    UPDATE comp6000_06.Customer
    SET first_name = ?, last_name = ?, email = ?, telephone = ?
    WHERE customer_id = ?;
  `;
  const values = [newData.first_name, newData.last_name, newData.email, newData.telephone, customerId];
  try {
    // Execute the query to update customer details
    await executeQuery(query, values);
  } catch (error) {
    throw error;
  }
};

export const getLocationIdByName = async (locationName: string): Promise<number | null> => {
  const query = `
    SELECT location_id
    FROM comp6000_06.Garage_Location
    WHERE location_name = ?;
  `;
  const values = [locationName];

  try {
    // Execute the query to retrieve the location_id
    const result = await executeQuery(query, values);

    // Check if the result contains any rows
    if (result.length > 0) {
      // Extract and return the location_id from the first row
      return result[0].location_id;
    } else {
      // If no rows are found, return null
      return null;
    }
  } catch (error) {
    throw error;
  }
};

/**
 * Updates staff details in the database.
 *
 * @param staffId - The ID of the staff to update.
 * @param newData - The new data to update for the staff.
 * @returns A Promise that resolves when the update is successful.
 */
export const updateStaff = async (staffId: number, newData: Partial<Staff>) => {
  const query = `
    UPDATE comp6000_06.Staff
    SET role = ?, location_id = (
      SELECT location_id
      FROM comp6000_06.Garage_Location
      WHERE location_name = ?
    )
    WHERE staff_id = ?;
  `;

  const values = [newData.role, newData.location_id, staffId];
  try {
    // Execute the query to update staff details
    await executeQuery(query, values);
  } catch (error) {
    console.log("line 510");

    throw error;
  }
};

export async function updateIsActive(staffId: number, isActive: boolean): Promise<void> {
  const query = `
    UPDATE comp6000_06.Staff
    SET isActive = ?
    WHERE staff_id = ?;
  `;
  const values = [isActive ? 1 : 0, staffId];
  try {
    await executeQuery(query, values);
  } catch (error) {
    console.log("Error updating isActive column:", error);
    throw error;
  }
}

export async function updateOpeningHours(openingHoursId: number, openTime: string | null, closeTime: string | null, isClosed: boolean): Promise<void> {
  let query: string;
  let values: any[];

  if (isClosed) {
    // If the day is 'Closed', set open_time and close_time to NULL
    query = `
      UPDATE comp6000_06.Garage_Opening_Hours
      SET open_time = NULL, close_time = NULL
      WHERE opening_hours_id = ?;
    `;
    values = [openingHoursId];
  } else {
    // Update open_time and close_time with provided values
    query = `
      UPDATE comp6000_06.Garage_Opening_Hours
      SET open_time = ?, close_time = ?
      WHERE opening_hours_id = ?;
    `;
    values = [openTime, closeTime, openingHoursId];
  }

  try {
    await executeQuery(query, values);
  } catch (error) {
    console.log("Error updating opening hours:", error);
    throw error;
  }
}

export async function getServiceSection(): Promise<Service_Sections[]> {
  const query = `SELECT
  section_id,
  section_name
FROM
  comp6000_06.Service_Sections
ORDER BY
  section_id;`;
  try {
    const result = await executeQuery(query, []);
    return result;
  } catch (error) {
    console.log("Get sections error:", error);
    throw error;
  }
}

/**
 * Retrieves booking details based on the booking ID.
 * @param bookingId The ID of the booking to retrieve details for.
 * @returns A promise that resolves to a BookingDetails object.
 * @throws If there is an error while retrieving the booking details.
 */
export async function getBookingDetails(bookingId: number): Promise<BookingDetails> {
  const query = `
  SELECT 
    B.booking_id AS Booking_Number,
    CONCAT(C.first_name, ' ', C.last_name) AS Customer_Name,
    B.booking_date,
    B.booking_start,
    B.booking_end,
    V.registration_number AS Vehicle_Registration,
    V.year AS Vehicle_Year,
    V.make AS Vehicle_Make,
    V.vehicle_colour AS Vehicle_Colour,
    V.fuel_type AS Vehicle_Fuel_Type,
    GROUP_CONCAT(CONCAT(S.service_name, ' (x', BS.quantity, ' @ £', FORMAT(S.cost, 2), ')') ORDER BY S.service_name SEPARATOR ', ') AS Services_Details,
    SUM(S.cost * BS.quantity) AS Gross_Amount,
    IF(T.amount IS NULL AND T.payment_method IS NULL, 'Pending', FORMAT(T.amount, 2)) AS Total_Amount_Paid,
    IF(T.discount_id IS NOT NULL, (SELECT FORMAT(D.discount_amount, 2) FROM comp6000_06.Discount D WHERE D.discount_id = T.discount_id), 'None') AS Discount_Applied,
    FORMAT(SUM(S.cost * BS.quantity) - IFNULL((SELECT D.discount_amount FROM comp6000_06.Discount D WHERE D.discount_id = T.discount_id), 0), 2) AS Net_Amount,
    B.booking_status,
    B.payment_status,
    CASE 
        WHEN T.amount IS NULL AND T.payment_method IS NULL THEN 'Pending'
        ELSE T.payment_method
    END AS Payment_Method
FROM 
    comp6000_06.Bookings B
INNER JOIN 
    comp6000_06.Customer C ON B.customer_id = C.customer_id
INNER JOIN 
    comp6000_06.Vehicle V ON B.vehicle_id = V.vehicle_id
INNER JOIN 
    comp6000_06.BookingServices BS ON B.booking_id = BS.booking_id
INNER JOIN 
    comp6000_06.Services S ON BS.service_id = S.service_id
LEFT JOIN 
    comp6000_06.Transactions T ON B.booking_id = T.booking_id
WHERE 
    B.booking_id = ?
GROUP BY 
    B.booking_id, C.first_name, C.last_name, B.booking_date, B.booking_start, B.booking_end, V.registration_number, V.make, T.amount, T.discount_id, B.booking_status, T.payment_method;`;

  try {
    const result = await executeQuery(query, [bookingId]);
    return result[0]; // Assuming the query returns only one row
  } catch (error) {
    console.error("Get booking details error:", error);
    throw error;
  }
}

/**
 * Retrieves calendar events for display.
 * @returns A promise that resolves to an array of events.
 * @throws If there is an error while executing the query.
 */
export async function getCalendarEvents(locationId: number): Promise<Array<{ registration_number: string; services: string; booking_start: Date; booking_end: Date; booking_status: string }>> {
  const query = `
  SELECT 
    V.registration_number,
    GROUP_CONCAT(DISTINCT S.service_name ORDER BY S.service_name SEPARATOR ', ') AS services,
    B.booking_date,
    B.booking_start,
    B.booking_end,
    B.booking_status,
    B.location_id
FROM 
    comp6000_06.Bookings B
JOIN 
    comp6000_06.Vehicle V ON B.vehicle_id = V.vehicle_id
JOIN 
    comp6000_06.BookingServices BS ON B.booking_id = BS.booking_id
JOIN 
    comp6000_06.Services S ON BS.service_id = S.service_id
WHERE 
    B.location_id = 1  -- location_id as a parameter.
GROUP BY 
    B.booking_id, B.booking_start, B.booking_end, V.registration_number, B.location_id
ORDER BY 
    V.registration_number;

  `;
  try {
    const result = await executeQuery(query, []);
    return result;
  } catch (error) {
    console.error("Get bookings error:", error);
    throw error;
  }
}

/**
 * Calculates the average customer satisfaction rating as a percentage.
 * @returns A promise that resolves to the average rating percentage.
 * @throws If there is an error while executing the query.
 */
export async function getAverageRatingPercentage(): Promise<number> {
  const query = `
    SELECT AVG(customer_rating) * 20 AS average_rating_percentage
    FROM comp6000_06.Feedback;
  `;
  try {
    const result = await executeQuery(query, []);
    if (result.length > 0 && result[0].average_rating_percentage != null) {
      return result[0].average_rating_percentage;
    }
    return 0;
  } catch (error) {
    console.error("Error fetching average rating percentage:", error);
    throw error;
  }
}

/**
 * Calculates the average customer satisfaction rating as a percentage.
 * @returns A promise that resolves to the average rating percentage.
 * @throws If there is an error while executing the query.
 */
export async function getAverageRatingPercentageCanterbury(locationId: string): Promise<number> {
  const query = `
  SELECT 
  AVG(f.customer_rating) * 20 AS average_rating_percentage
FROM 
  comp6000_06.Feedback f
JOIN 
  comp6000_06.BookingServices bs ON f.booking_service_id = bs.booking_service_id
JOIN 
  comp6000_06.Bookings b ON bs.booking_id = b.booking_id
WHERE 
  b.location_id = ?; -- ? will display the percentage of a particular location
  `;
  try {
    const result = await executeQuery(query, [locationId]);
    if (result.length > 0 && result[0].average_rating_percentage != null) {
      return result[0].average_rating_percentage; // Assuming result is an array with at least one object containing the average_rating_percentage
    }
    return 0; // Return 0 if there are no results or if the average is null
  } catch (error) {
    console.error("Error fetching average rating percentage:", error);
    throw error;
  }
}

/**
 * Retrieves all garage opening hours from the database.
 * @returns opening hours
 * @throws If there is an error while retrieving the opening hours.
 */
export async function getOpeningHoursByLocation(): Promise<{ [key: number]: any }> {
  const query = "SELECT * FROM comp6000_06.Garage_Opening_Hours WHERE location_id = ?";
  try {
    const result = await executeQuery(query, []);
    const openingHoursMap = result.reduce((acc: { [key: number]: any }, current: any) => {
      const { location_id, day_of_week, open_time, close_time } = current;
      if (!acc[location_id]) {
        acc[location_id] = [];
      }
      acc[location_id].push({ day_of_week, open_time, close_time });
      return acc;
    }, {});
    return openingHoursMap;
  } catch (error) {
    console.error("Get opening hours error:", error);
    throw error;
  }
}

export async function updateService(service_id: number, section_name: string, service_name: string, cost: number, duration: number): Promise<void> {
  if (isNaN(cost) || isNaN(duration)) {
    throw new Error("Invalid cost or duration value.");
  }
  const query = `
    UPDATE comp6000_06.Services
    JOIN comp6000_06.Service_Sections ON Services.service_section_id = Service_Sections.section_id
    SET
      Service_Sections.section_name = ?,
      Services.service_name = ?,
      Services.cost = ?,
      Services.duration = ?
    WHERE
      Services.service_id = ?;`;

  try {
    await executeQuery(query, [service_id, section_name, service_name, cost, duration]);
    console.log("Service updated successfully.");
  } catch (error) {
    console.log("Update service error:", error);
    throw error;
  }
}
/**
 * Registers a service in the database.
 *
 * @param dto - The service form data.
 * @returns A Promise that resolves to a success message if the registration is successful, or an error message if it fails.
 */
export async function addBasket(dto: BasketItem) {
  const values = [dto.first_name, dto.last_name, dto.vehicle_id, dto.customer_id, dto.registration_number, dto.postcode, dto.date, dto.time, dto.service_type, dto.price, dto.selectedCentre];

  const query = `
    INSERT INTO comp6000_06.Basket (first_name, last_name, vehicle_id, customer_id, registration_number, postcode, date, time, service_type, price, selectedCentre)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  // console.log("test");
  try {
    const result = await executeQuery(query, values);

    if (result.affectedRows === 1) {
      // Service registration successful
      // console.log("updated");
      // return redirect("/basket/success=You have successfully added a booking");

      return { success: true };
    } else {
      // Registration failed
      return badActionData(values, {} as any, "Service registration failed");
    }
  } catch (error) {
    // Handle database errors
    return badActionData(values, {} as any, "Something went wrong, please try again later");
  }
}

export async function getBasketItemsForCustomer(customerId: number) {
  const query = "SELECT * FROM Basket WHERE customer_id = ?";
  const values = [customerId];
  const rows = await executeQuery(query, values);
  return rows;
}

export async function deleteBasketItemForCustomer(customerId: number) {
  const query = "DELETE FROM Basket WHERE customer_id = ?";
  const values = [customerId];
  await executeQuery(query, values);

  return { success: true };
}

export async function addBooking(dto: Bookings) {
  const values = [dto.customer_id, dto.vehicle_id, dto.location_id, dto.booking_date, dto.booking_start, dto.booking_end, dto.booking_status, dto.payment_status];
  const query = `
    INSERT INTO comp6000_06.Bookings (customer_id, vehicle_id, location_id, booking_date, booking_start, booking_end, booking_status, payment_status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;

  try {
    // Insert service data into the database
    const result = await executeQuery(query, values);

    if (result.affectedRows === 1) {
      // Service registration successful
      return { success: true };
    } else {
      // Registration failed
      return badActionData(values, {} as any, "Add booking failed");
    }
  } catch (error) {
    // Handle database errors
    console.log(error);
    return badActionData(values, {} as any, "Something went wrong, please try again later");
  }
}

export async function addTransaction(dto: Transactions) {
  const values = [dto.booking_id, dto.transaction_date, dto.amount, dto.payment_method, dto.discount_id];

  const query = `
    INSERT INTO comp6000_06.Transactions (booking_id, transaction_date, amount, payment_method, discount_id)
    VALUES (?, ?, ?, ?, ?)
  `;

  try {
    // Insert service data into the database
    const result = await executeQuery(query, values);

    if (result.affectedRows === 1) {
      // Service registration successful
      return { success: true };
    } else {
      // Registration failed
      return badActionData(values, {} as any, "Add transaction failed");
    }
  } catch (error) {
    // Handle database errors
    console.log(error);
    return badActionData(values, {} as any, "Something went wrong, please try again later");
  }
}

export async function deleteBasketItemForCustomerRow(customerId: number, basket_id: number) {
  const query = "DELETE FROM Basket WHERE customer_id = ? AND basket_id = ?";
  const values = [customerId, basket_id];
  await executeQuery(query, values);

  return { success: true };
}

export async function getBasketId(customerId: number, date: Date, time: string, registration_number: string, service_type: string, vehicle_id: number, postcode: string, price: number, selectedCentre: string) {
  const query = "SELECT basket_id FROM Basket WHERE customer_id = ? AND date = ? AND time = ? AND registration_number = ? AND service_type = ? AND vehicle_id = ? AND postcode = ? AND price = ? AND selectedCentre = ?";
  const values = [customerId, date, time, registration_number, service_type, vehicle_id, postcode, price, selectedCentre];
  const rows = await executeQuery(query, values);
  return rows;
}

/**
 * Refund transaction
 *
 * @param booking - The booking which amount will be refund
 * @returns A promise that resolves to the refund the booked amount
 */
export async function refundTransaction(booking: BookingDetails) {
  const query = `INSERT INTO comp6000_06.Transactions (booking_id, transaction_date, amount, payment_method)
  VALUES (?, CURRENT_DATE, -ABS(?), ?);`;

  try {
    const result = await executeQuery(query, [booking.Booking_Number, booking.Total_Amount_Paid, booking.Payment_Method]);
    return result;
  } catch (error) {
    console.error("Refund transaction error:", error);
    throw error;
  }
}

/**
 * Update booking_status to 'Cancelled' and payment status to ‘Refund’
 * @param booking - The booking which status will be changed
 * @returns A promise that resolves to the status of the booking
 */
export async function updateStatusAfterCancel(booking: BookingDetails) {
  const query = `
  UPDATE comp6000_06.Bookings
  SET booking_status = 'Cancelled', payment_status = 'Refund'
  WHERE booking_id = ?;`;

  try {
    const result = await executeQuery(query, [booking.Booking_Number]);
    return result;
  } catch (error) {
    console.error("Update status error:", error);
    throw error;
  }
}

export type PaymentMethodOptions = "Cash" | "Card";

/**
 * Insert transaction
 * @param booking - The booking which amount will be insert
 * @returns A promise that resolves to the transaction
 */
export async function insertTransaction(booking: BookingDetails, paymentMethod: PaymentMethodOptions) {
  const query = `INSERT INTO comp6000_06.Transactions (booking_id, transaction_date, amount, payment_method)
  VALUES (?, CURRENT_DATE, ?, ?);`;

  try {
    const result = await executeQuery(query, [booking.Booking_Number, booking.Net_Amount, paymentMethod]);
    return result;
  } catch (error) {
    console.error("insert transaction error:", error);
    throw error;
  }
}

/**
 * Updating the booking as confirmed and decreasing stock level
 * @param booking - The booking which status will be changed
 * @returns A promise that resolves to the status of the booking
 */
export async function confirmBookingAndDeductInventory(bookingId: number) {
  const updateStatusQuery = `UPDATE comp6000_06.Bookings
  SET booking_status = 'Confirmed', payment_status = 'Paid'
  WHERE booking_id = ?;`;

  const getServicesQuery = `SELECT service_id
  FROM comp6000_06.BookingServices
  WHERE booking_id = ?;`;

  const getInventoryItemQuery = `SELECT item_id, quantity_required
  FROM comp6000_06.ServiceInventoryLink
  WHERE service_id = ?;`;

  const deductQuantityQuery = `UPDATE comp6000_06.InventoryItems
  SET stock_level = stock_level - ? WHERE item_id = ?;`;

  try {
    // update status
    await executeQuery(updateStatusQuery, [bookingId]);

    // get services associated with the booking
    const services = await executeQuery(getServicesQuery, [bookingId]);

    for (const service of services) {
      // Get required inventory items for the service
      const items = await executeQuery(getInventoryItemQuery, [service.service_id]);

      for (const item of items) {
        // Deduct the required quantity from the inventory for each item
        await executeQuery(deductQuantityQuery, [item.quantity_required, item.item_id]);
      }
    }
  } catch (error) {
    console.error("update error:", error);
    throw error;
  }
}

export interface TServiceProps {
  service_name: String;
  description: String;
  price: String;
}

export async function getServicesBySectionId(sectionId: number): Promise<TServiceProps[]> {
  const query = "SELECT service_name, description, cost FROM comp6000_06.Services WHERE service_section_id = ?;";

  try {
    const rows = await executeQuery(query, [sectionId]);

    // Assuming servicesData is an array in the same scope
    const services = rows.map((row: { service_name: any; description: any; cost: any }) => ({
      service_name: row.service_name,
      description: row.description,
      price: row.cost,
    }));

    return services;
  } catch (error) {
    console.error("Error fetching services:", error);
    throw error;
  }
}

interface CreateBookingParams {
  customer_id: string;
  vehicle_id: string;
  location_id: string;
  booking_date: string;
  booking_start: string;
  booking_end: string;
}

export async function createNewBooking(body: CreateBookingParams) {
  const { customer_id, vehicle_id, location_id, booking_date, booking_start, booking_end } = body;

  const query = `INSERT INTO comp6000_06.Bookings (customer_id, vehicle_id, location_id, booking_date, booking_start, booking_end, booking_status, payment_status) VALUES (?, ?, ?, ?, ?, ?, 'Active', 'Pending');`;

  try {
    const response = await executeQuery(query, [customer_id, vehicle_id, location_id, booking_date, booking_start, booking_end]);

    return response;
  } catch (error) {
    console.error("Error creating booking:", error);
    throw error;
  }
}

export interface CustomerResponse {
  customer_id: string;
  first_name: string;
  last_name: string;
  email: string;
  status: "Active" | "Deactivated";
}

export async function getCustomerByEmail(email: string): Promise<CustomerResponse[]> {
  const query = `
    SELECT customer_id, email, first_name, last_name,
    CASE
        WHEN isActive = 1 THEN 'Active'
        ELSE 'Deactivated'
    END AS status
    FROM comp6000_06.Customer
    WHERE email = ?;`;

  try {
    return await executeQuery(query, [email]);
  } catch (error) {
    console.error("Error fetching customer by email:", error);
    throw error;
  }
}

export async function reactivateCustomerAcc(email: string) {
  const query = `
  UPDATE comp6000_06.Customer
  SET isActive = 1
  WHERE email = ?;`;

  try {
    return await executeQuery(query, [email]);
  } catch (error) {
    console.error("Error updating customer account:", error);
    throw error;
  }
}

interface VehicleResponse {
  vehicle_id: string;
  customer_id: string;
  registration_number: string;
  vehicle_colour: string;
  make: string;
  year: string;
  fuel_type: string;
  is_Deleted: 1 | 0;
}

export async function getVehicle(registrationNo: string, customerId: string): Promise<VehicleResponse[]> {
  const query = `SELECT * FROM comp6000_06.Vehicle WHERE registration_number = ? AND customer_id = ?;`;
  const values = [registrationNo, customerId];

  try {
    return await executeQuery(query, values);
  } catch (error) {
    console.error("Error fetching vehicle", error);
    throw error;
  }
}

export async function getVehicleById(vehicle_id: string): Promise<VehicleResponse[]> {
  const query = `SELECT * FROM comp6000_06.Vehicle WHERE vehicle_id = ?;`;
  const values = [vehicle_id];

  try {
    return await executeQuery(query, values);
  } catch (error) {
    console.error("Error fetching vehicle", error);
    throw error;
  }
}

export async function insertVehicle(registrationNo: string, customerId: string, colour: string, make: string, year: number, fuelType: string, isDeleted: number) {
  const query = `INSERT INTO comp6000_06.Vehicle (customer_id, registration_number, vehicle_colour, make, year, fuel_type, is_Deleted)
  VALUES (?, ?, ?, ?, ?, ?, ?)`;
  const values = [customerId, registrationNo, colour, make, year, fuelType, isDeleted];

  try {
    return await executeQuery(query, values);
  } catch (error) {
    console.error("Error creating vehicle", error);
    throw error;
  }
}

export async function createBookingService(bookingId: number, serviceId: number, quantity: number): Promise<VehicleResponse[]> {
  const query = `INSERT INTO comp6000_06.BookingServices (booking_id, service_id, quantity)
  VALUES (?, ?, ?)`;
  const values = [bookingId, serviceId, quantity];

  try {
    return await executeQuery(query, values);
  } catch (error) {
    console.error("Error creating booking service", error);
    throw error;
  }
}
