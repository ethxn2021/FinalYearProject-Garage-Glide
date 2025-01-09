import { redirect, createCookieSessionStorage } from "@remix-run/node";
import bcrypt from "bcryptjs";
import { executeQuery } from "./routes/database"; // Adjust the import path as necessary

const sessionSecret = process.env.SESSION_SECRET;
if (!sessionSecret) {
  throw new Error("SESSION_SECRET must be set");
}

const storage = createCookieSessionStorage({
  cookie: {
    name: "customer_session",
    secure: process.env.NODE_ENV === "production",
    secrets: [sessionSecret],
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24, // 24 hours
    httpOnly: true,
  },
});

// Utility function to create a session for a customer
export async function createCustomerSession(customerId: number, redirectTo: string) {
  const session = await storage.getSession();
  session.set("customer_id", customerId);
  return redirect(redirectTo, {
    headers: {
      "Set-Cookie": await storage.commitSession(session),
    },
  });
}

// Function to log in a customer
export async function customerLogin({ email, password }: { email: string; password: string }) {
  const query = "SELECT * FROM comp6000_06.Customer WHERE email = ?";
  const values = [email];

  try {
    const [customer] = await executeQuery(query, values);
    if (!customer) {
      throw new Error("Invalid email or password");
    }

    const isCorrectPassword = await bcrypt.compare(password, customer.password);
    if (!isCorrectPassword) {
      throw new Error("Invalid email or password");
    }

    return await createCustomerSession(customer.customer_id, '/customer/profile');
  } catch (error) {
    console.error("Customer login error:", error);
    throw error;
  }
}

//Function to create a guest session for users that haven't logged in
export async function createGuestSession(guestId: number, redirectTo: string) {
  const session = await storage.getSession();
  session.set("guestId", guestId);
  return redirect(redirectTo, {
    headers: {
      "Set-Cookie": await storage.commitSession(session),
    },
  });
}

// Function to retrieve a customer's session
export async function getCustomerSession(request: Request) {
  return storage.getSession(request.headers.get("Cookie"));
}

// Function to require a customer login for a route
export async function requireCustomerLogin(request: Request) {
  const session = await getCustomerSession(request);
  const customerId = session.get("customer_id");
  if (!customerId) {
    throw redirect("/login/customer");
  }
  return customerId;
}

// Function to log out a customer
export async function logout(request: Request) {
  const session = await getCustomerSession(request);
  return redirect("/login/customer", {
    headers: {
      "Set-Cookie": await storage.destroySession(session),
    },
  });
}

// Function to get customer details by customer ID
export async function getCustomerDetails(customerId: number) {
    const query = "SELECT * FROM comp6000_06.Customer WHERE customer_id = ?";
    const values = [customerId];
    try {
      const [customer] = await executeQuery(query, values);
      return customer; // returns the customer's first name, last name, and email
    } catch (error) {
      console.error("Error fetching customer details:", error);
      return null;
    }
  }
  
// Function to update customer's name
export async function updateCustomerName({ customerId, firstName, lastName }: { customerId: number; firstName: string; lastName: string }) {
  const query = "UPDATE comp6000_06.Customer SET first_name = ?, last_name = ? WHERE customer_id = ?";
  const values = [firstName, lastName, customerId];

  try {
    await executeQuery(query, values);
    return { success: true };
  } catch (error) {
    console.error("Error updating customer name:", error);
    return { success: false, error };
  }
}

// Function to update customer's email
export async function updateCustomerEmail({ customerId, email }: { customerId: number; email: string }) {
  const query = "UPDATE comp6000_06.Customer SET email = ? WHERE customer_id = ?";
  const values = [email, customerId];

  try {
    await executeQuery(query, values);
    return { success: true };
  } catch (error) {
    console.error("Error updating customer email:", error);
    return { success: false, error };
  }
}

//Update customer password
export async function updateCustomerPassword({ customerId, passwordHash }: { customerId: number; passwordHash: string }): Promise<{ success: boolean; error?: string }> {
    const query = "UPDATE comp6000_06.Customer SET password = ? WHERE customer_id = ?";
    const values = [passwordHash, customerId];

    try {
        const result = await executeQuery(query, values);
        
        if (result.affectedRows === 1) {
            return { success: true };
        } else {
            return { success: false, error: "Failed to update the password." };
        }
    } catch (error) {
        console.error("Error updating customer password:", error);
        return { success: false, error: "Database error during password update." };
    }
}

// Verify if the password entered is correct
export async function verifyCustomerPassword({ customerId, password }: { customerId: number; password: string }): Promise<boolean> {
  const query = "SELECT password FROM comp6000_06.Customer WHERE customer_id = ?";
  try {
    const result = await executeQuery(query, [customerId]);
    if (result.length > 0) {
      const passwordHash = result[0].password;
      return bcrypt.compareSync(password, passwordHash);
    }
    return false;
  } catch (error) {
    console.error("Error verifying customer password:", error);
    return false;
  }
}


export async function addCarToDatabase(carData) {
  const query = 'INSERT INTO comp6000_06.Vehicle (customer_id,year, registration_number, make, vehicle_colour, fuel_type ) VALUES ( ?,?, ?, ?, ?,?) ';
  const values = [
   carData.customer_id,
    carData.year,
    carData.registration_number,
    carData.make,
    carData.vehicle_colour,
    carData.fuel_type,
    
  ];

  try {
    await executeQuery(query, values);

  } catch (error) {
    console.error('Error adding car to the database:', error);
    throw error;
  }
}
export async function getBooking(customer_id) {
  let Bookings = [];
  const query = `
    SELECT 
        b.booking_id,
        v.registration_number,
        v.make,
        GROUP_CONCAT(s.service_name SEPARATOR ', ') AS services,
        gl.location_name,
        b.booking_date,
        b.booking_start,
        b.booking_status
    FROM 
        comp6000_06.Bookings AS b
    JOIN 
        comp6000_06.Vehicle AS v ON b.vehicle_id = v.vehicle_id
    JOIN 
        comp6000_06.BookingServices AS bs ON b.booking_id = bs.booking_id
    JOIN 
        comp6000_06.Services AS s ON bs.service_id = s.service_id
    JOIN 
        comp6000_06.Garage_Location AS gl ON b.location_id = gl.location_id
    WHERE 
        b.booking_status = 'Active'
        AND b.customer_id =${customer_id}
            GROUP BY 
        b.booking_id, v.registration_number, v.make, gl.location_name, b.booking_date, b.booking_start, b.booking_status
    ORDER BY 
        b.booking_date;
  `;
  const values = [customer_id];
  try {
      const rows = await executeQuery(query, values);
    Bookings = rows.map((row) => ({
      booking_id: row.booking_id,
      registration_number: row.registration_number,
      make: row.make,
      services: row.services,
      location_name: row.location_name,
      booking_date: row.booking_date,
      booking_start: row.booking_start,
      booking_status: row.booking_status
    }));
    return Bookings;
  } catch (error) {
    console.error('Error fetching bookings:', error);
    throw error;
  }
}
export async function getPastBookings(customer_id){

const query = `  SELECT 
b.booking_id,
v.registration_number,
v.make,
GROUP_CONCAT(s.service_name SEPARATOR ', ') AS services,
gl.location_name,
b.booking_date,
b.booking_start,
b.booking_status
FROM 
comp6000_06.Bookings AS b
JOIN 
comp6000_06.Vehicle AS v ON b.vehicle_id = v.vehicle_id
JOIN 
comp6000_06.BookingServices AS bs ON b.booking_id = bs.booking_id
JOIN 
comp6000_06.Services AS s ON bs.service_id = s.service_id
JOIN 
comp6000_06.Garage_Location AS gl ON b.location_id = gl.location_id
WHERE 
b.booking_status IN ('Confirmed', 'Cancelled')
AND b.customer_id = ${customer_id} 
GROUP BY 
b.booking_id, v.registration_number, v.make, gl.location_name, b.booking_date, b.booking_start
ORDER BY 
b.booking_date;
`;

let Bookings = [];
const values = [customer_id];
try {
    const rows = await executeQuery(query, values);
  Bookings = rows.map((row) => ({
    booking_id: row.booking_id,
    registration_number: row.registration_number,
    make: row.make,
    services: row.services,
    location_name: row.location_name,
    booking_date: row.booking_date,
    booking_start: row.booking_start,
    booking_status: row.booking_status
  }));
  return Bookings;
} catch (error) {
  console.error('Error fetching bookings:', error);
  throw error;
}

}
export async function getCars(customer_id: number) {
  const query = "SELECT * FROM comp6000_06.Vehicle WHERE customer_id = ?";
  let car = await executeQuery(query, [customer_id]);
  car= car.filter((car) => car.is_Deleted == 0);
  let cars = car.map((car) => ({  
    vehicle_id: car.vehicle_id,
    year: car.year,
    registration_number: car.registration_number,
    make: car.make,
    vehicle_colour: car.vehicle_colour,
    fuel_type: car.fuel_type
  }));
  return cars;

}
export async function deleteVehicle(vehicle_id: number) {

const Query = "UPDATE comp6000_06.Vehicle SET is_Deleted = TRUE WHERE vehicle_id = ?; ";
var values = [vehicle_id];
try {
  await executeQuery(Query, values);
    
} catch (error) { 
  console.error('Error deleting vehicle:', error);
  throw error;
  
}
  
}

export async function getBookingId(customer_id: number) {
  const query = "SELECT booking_id FROM comp6000_06.Bookings WHERE customer_id = ?";
  const values = [customer_id];
  try {
    const bookings = await executeQuery(query, values);
    return bookings;
  } catch (error) {
    console.error("Error fetching booking ID:", error);
    return null;
  }
}
export async function cancelBooking(booking_id: number) {
  const query = "UPDATE comp6000_06.Bookings SET booking_status = 'Cancelled', payment_status = 'Refund' WHERE booking_id = ?;";
  const values = [booking_id];
  try {
    await executeQuery(query, values);
  } catch (error) {
    console.error("Error cancelling booking:", error);
    throw error;
  }
}
export async function refundBooking(booking_id: number) {
  const query = "INSERT INTO comp6000_06.Transactions (booking_id, transaction_date, amount, payment_method) VALUES (?, CURRENT_DATE, -ABS(?), ?);";
  const values = [booking_id , 404, 'Card'  ];
  try {
    await executeQuery(query, values);
  } catch (error) {
    console.error("Error refunding booking:", error);
    throw error;
  }
}