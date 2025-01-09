import { FormEventHandler, useEffect, useState } from "react";
import { ArrowLeftOnRectangleIcon, BellIcon, CreditCardIcon, CubeIcon, FingerPrintIcon, UserCircleIcon } from "@heroicons/react/24/outline";
import { Await, Form, useActionData, useLoaderData, useNavigation, useTransition, } from "@remix-run/react";
import { ActionFunction, LoaderFunction, json, redirect } from "@remix-run/node";
import { deleteVehicle, getCustomerDetails, requireCustomerLogin, addCarToDatabase, getBooking, getPastBookings, getCars, cancelBooking, refundBooking } from "~/customer.server";
import React, { createContext, useContext } from 'react';
import { fetchVehicleDetails } from "~/utils/api.dvla";
import { executeQuery } from "./database";

const nav = [
  { name: "Personal Information", href: "#", icon: UserCircleIcon },
  { name: "Contact Information", href: "#", icon: FingerPrintIcon },
  { name: "Car Details", href: "#", icon: BellIcon },
  { name: "Bookings", href: "#", icon: CubeIcon },
  { name: "Communication Preferences", href: "#", icon: CreditCardIcon },
];

let vehicleData = [
  { id: 1, year: 2022, registration: "BK23 VRN", make: "BMW", colour: "BLUE", fuel_type: "DIESEL" },
  { id: 2, year: 2024, registration: "TR18 TRX", make: "AUDI", colour: "BLACK", fuel_type: "PETROL" },

];

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}


//Implement Loader in Profile Component
export const loader: LoaderFunction = async ({ request }) => {
  const customerId = await requireCustomerLogin(request);
  if (!customerId) {
    throw new Response("Not Found", { status: 404 });
  }
  const customerDetails = await getCustomerDetails(customerId);
  const Bookings = await getBooking(customerId);
  const PastBookings = await getPastBookings(customerId);
  let cars = await getCars(customerId);

  const dvlaAccessToken = process.env.DVLA_ACCESS_TOKEN || ''; // Define dvlaAccessToken with a default value of an empty string
  return json({ customerDetails, customerId, Bookings, PastBookings, cars, dvlaAccessToken });
};


export async function action({ request }) {
  //const formData = new URLSearchParams(await request.text());
  let formData = await request.formData();
  const dvlaAccessToken = process.env.DVLA_ACCESS_TOKEN || '';
  const customerId1 = await requireCustomerLogin(request);





  let { deletebtn, ...values } = Object.fromEntries(formData.entries());

  if (deletebtn === "delete") {

    try {
      const vehicle_id = values.id;

      await deleteVehicle(vehicle_id);
    } catch (error) {
      console.error('Error deleting vehicle:', error);
      throw error;

    }

  }

  let { Cancelbtn, ...values1 } = Object.fromEntries(formData.entries());
  if (Cancelbtn === "Cancel") {

    if (values1.booking_status === "Paid") {
      const booking_id = values1.BookingId;
      await refundBooking(booking_id);

    }

    const booking_id = values1.BookingId;
    try {
      await cancelBooking(booking_id);

    } catch (error) {
      console.error('Error cancelling booking:', error);
      throw error;
    }
  }


  const data = formData.get('vehicleDetails');
  const parsedData = JSON.parse(data);


  const newCar = {
    customer_id: customerId1,
    year: parsedData.registrationYear,
    registration_number: parsedData.registration ?? '',
    make: parsedData.make ?? '',
    vehicle_colour: parsedData.color ?? '',
    fuel_type: parsedData.fuelType ?? '',
  };


  const toDo = await addCarToDatabase(newCar);



  return json({ customerId1 });


}



const BookingComponent = ({ Booking }) => (

  <tr>
    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{Booking.booking_id}</td>
    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{Booking.registration_number}</td>
    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{Booking.make}</td>
    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{Booking.services}</td>
    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{Booking.location_name}</td>
    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{Booking.booking_date}</td>
    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{Booking.booking_start}</td>
    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{Booking.booking_status}</td>
    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
      <form action="" method="post">
        <input type="hidden" name="booking_status" value={Booking.booking_status} />
        <input type="hidden" name="BookingId" value={Booking.booking_id} />
        <button type="submit" name="Cancelbtn" value={"Cancel"} className="underline font-bold" style={{ color: "#112D4E", cursor: "pointer", backgroundColor: "transparent", border: "none" }}>
          {" "}
          Cancel
        </button>
      </form>
    </td>

  </tr>
);
const BookingComponent2 = ({ Booking }) => (

  <tr>
    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{Booking.booking_id}</td>
    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{Booking.registration_number}</td>
    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{Booking.make}</td>
    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{Booking.services}</td>
    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{Booking.location_name}</td>
    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{Booking.booking_date}</td>
    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{Booking.booking_start}</td>
    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{Booking.booking_status}</td>
    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">

      <button className="underline font-bold" style={{ color: "#112D4E", cursor: "pointer", backgroundColor: "transparent", border: "none" }}>
        {" "}
        View
      </button>

    </td>

  </tr>
);





export default function Profile() {
  const { customerDetails } = useLoaderData();
  const [currentSection, setCurrentSection] = useState("Personal Information");
  // let transition = useNavigation();
  let { Bookings } = useLoaderData()
  let { customerId } = useLoaderData()
  let { PastBookings } = useLoaderData()
  const actionData = useActionData();
  let { cars } = useLoaderData();
  let { dvlaAccessToken } = useLoaderData();
  //Editing name, email
  const [isEditingName, setIsEditingName] = useState(false);
  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [firstName, setFirstName] = useState(customerDetails.first_name);
  const [lastName, setLastName] = useState(customerDetails.last_name);
  const [email, setEmail] = useState(customerDetails.email);

  //Password Editing
  const [isEditingPassword, setIsEditingPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [vehicleData, setVehicleData] = useState([
    cars
  ]);




  const handleSectionChange = (sectionName: string) => {
    setCurrentSection(sectionName);
  };

  //Update name and surname
  const toggleEditName = async () => {
    if (isEditingName) {
      // Only send the request if the user is saving the new name
      const formData = new FormData();
      formData.append("firstName", firstName);
      formData.append("lastName", lastName);

      const response = await fetch("/customer/update", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        console.log("Name updated successfully");
      } else {
        console.error("Failed to update name", result.error);
      }
    }

    setIsEditingName(!isEditingName);
  };

  //Update email
  const toggleEditEmail = async () => {
    if (isEditingEmail) {
      // Only send the request if the user is saving the new email
      const formData = new FormData();
      formData.append("email", email);

      const response = await fetch("/customer/update", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        console.log("Email updated successfully");
      } else {
        console.error("Failed to update email", result.error);
      }
    }

    setIsEditingEmail(!isEditingEmail);
  };


  //Update password
  const toggleEditPassword = async () => {
    if (isEditingPassword) {
      if (password !== confirmPassword) {
        alert("New passwords do not match.");
        return; // Stop the process if passwords do not match
      }

      const formData = new FormData();
      formData.append("currentPassword", currentPassword);
      formData.append("newPassword", password);

      try {
        const response = await fetch("/customer/update", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          const result = await response.json();
          throw new Error(result.error || "Failed to update password");
        }
        const result = await response.json();
        if (result.success) {
          console.log("Password updated successfully");
          // Reset password fields and clear errors
          setCurrentPassword('');
          setPassword('');
          setConfirmPassword('');
          setPasswordError('');
        } else {
          // Handle server-side validation failure
          throw new Error(result.error || "Password update failed");
        }
      } catch (error) {
        console.error("Error updating password:", error);
        if (error instanceof Error) {
          setPasswordError(error.message);
        } else {
          setPasswordError("An unexpected error occurred");
        }

        // Stop the process if there was an error
        return;
      }

      setIsEditingPassword(false);
    } else {
      setIsEditingPassword(true);
      setPasswordError('');
    }
  };





  const [vehicleReg, setVehicleReg] = useState<string>('');

  const fetchVehicleDetails1 = async () => {
    try {
      const data = await fetchVehicleDetails(vehicleReg, dvlaAccessToken);
      if (data.error) {
        console.error("Error fetching vehicle details:", data.error);
      } else {
        setVehicleDetails({
          registration: vehicleReg,
          make: data.make,
          color: data.colour,
          registrationYear: data.yearOfManufacture,
          motStatus: data.motStatus,
          motExpiryDate: data.motExpiryDate,
          fuelType: data.fuelType
        });

        return data

      }
    } catch (error) {
      console.error("Fetching vehicle details failed:", error);
    }
  };
  const [vehicleDetails, setVehicleDetails] = useState<{
    registration: string,
    make: string,
    color: string,
    registrationYear: number,
    motStatus: string,
    motExpiryDate: string,
    fuelType: string
  } | null>(null);




  return (
    <>
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8"></div>

      <div className="mx-auto max-w-7xl pt-16 lg:flex lg:gap-x-16 lg:px-8">
        <aside className="flex overflow-x-auto border-b border-gray-900/5 py-4 lg:block lg:w-64 lg:flex-none lg:border-0 lg:py-20">
          <nav className="flex-none px-4 sm:px-6 lg:px-0">
            <ul role="list" className="flex gap-x-5 gap-y-6 lg:flex-col">
              {nav.map((item) => (
                <li key={item.name}>
                  <a
                    href={item.href}
                    className={classNames(currentSection === item.name ? "bg-gray-50 text-indigo-900" : "text-gray-700 hover:text-indigo-900 hover:bg-gray-50", "group flex gap-x-3 rounded-md py-2 pl-2 pr-3 text-sm leading-6 font-semibold")}
                    onClick={() => handleSectionChange(item.name)}
                  >
                    <item.icon className={classNames(currentSection === item.name ? "text-indigo-900" : "text-indigo-900 group-hover:text-indigo-900", "h-6 w-6 shrink-0")} aria-hidden="true" />
                    {item.name}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex-none px-4 sm:px-6 lg:px-0 ml-6 mt-9 text-red-700 font-bold" style={{ cursor: "pointer" }}>
            <form action="/logout" method="post">
              <button type="submit" className="flex items-center">
                <ArrowLeftOnRectangleIcon className="h-7 w-7 text-red-700" />
                Logout
              </button>
            </form>
          </div>
        </aside>

        <main className="px-4 py-16 sm:px-6 lg:flex-auto lg:px-0 lg:py-20">
          <div className="mx-auto max-w-2xl space-y-16 sm:space-y-20 lg:mx-0 lg:max-w-none">
            {/* Personal Information setup */}
            {currentSection === "Personal Information" && (
              <div>
                <h2 className="text-3xl font-semibold leading-7 text-gray-900">Profile</h2>
                <dl className="mt-6 space-y-6 divide-y divide-gray-100 border-t border-gray-200 text-sm leading-6">

                  {/* Full Name */}
                  <div className="pt-6 sm:flex">
                    <dt className="font-medium text-gray-900 sm:w-64 sm:flex-none sm:pr-6">Full name</dt>
                    <dd className="mt-1 flex justify-between gap-x-6 sm:mt-0 sm:flex-auto">
                      {isEditingName ? (
                        <>
                          <input
                            type="text"
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            placeholder="First Name"
                            className="text-gray-900 mr-2"
                          />
                          <input
                            type="text"
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                            placeholder="Last Name"
                            className="text-gray-900"
                          />
                        </>
                      ) : (
                        <div className="text-gray-900">{firstName} {lastName}</div>
                      )}
                      <button onClick={toggleEditName} className="font-semibold text-indigo-900 hover:text-indigo-900">
                        {isEditingName ? 'Save' : 'Update'}
                      </button>

                    </dd>
                  </div>

                  {/* Email */}
                  <div className="pt-6 sm:flex">
                    <dt className="font-medium text-gray-900 sm:w-64 sm:flex-none sm:pr-6">Email address</dt>
                    <dd className="mt-1 flex justify-between gap-x-6 sm:mt-0 sm:flex-auto">
                      {isEditingEmail ? (
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="text-gray-900"
                        />
                      ) : (
                        <div className="text-gray-900">{email}</div>
                      )}
                      <button onClick={toggleEditEmail} className="font-semibold text-indigo-900 hover:text-indigo-900">
                        {isEditingEmail ? 'Save' : 'Update'}
                      </button>
                    </dd>
                  </div>

                  {/* Password */}
                  <div className="pt-6 sm:flex">
                    <dt className="font-medium text-gray-900 sm:w-64 sm:flex-none sm:pr-6">Password</dt>
                    <dd className="mt-1 flex justify-between gap-x-6 sm:mt-0 sm:flex-auto">
                      {isEditingPassword ? (
                        <>
                          <input
                            type="password"
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            placeholder="Current Password"
                            className="text-gray-900 mr-2"
                          />
                          <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="New Password"
                            className="text-gray-900 mr-2"
                          />
                          <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Confirm New Password"
                            className="text-gray-900"
                          />
                          {passwordError && <div className="text-red-500">{passwordError}</div>}
                        </>
                      ) : (
                        <div className="text-gray-900">[Password Hidden]</div>
                      )}
                      <button onClick={toggleEditPassword} className="font-semibold text-indigo-900 hover:text-indigo-900">
                        {isEditingPassword ? 'Save' : 'Update'}
                      </button>
                    </dd>
                  </div>



                </dl>
              </div>
            )}

            {/* Contact Information setup */}
            {currentSection === "Contact Information" && (
              <div>
                <h2 className="text-3xl font-semibold leading-7 text-gray-900">Contact Information</h2>
                <dl className="mt-6 space-y-6 divide-y divide-gray-100 border-t border-gray-200 text-sm leading-6">
                  <div className="pt-6 sm:flex">
                    <dt className="font-medium text-gray-900 sm:w-64 sm:flex-none sm:pr-6">Phone Number</dt>
                    <dd className="mt-1 flex justify-between gap-x-6 sm:mt-0 sm:flex-auto">
                      <div className="text-gray-900">{customerDetails.telephone}</div>
                      <button type="button" className="font-semibold text-indigo-900 hover:text-indigo-900">
                        Update
                      </button>
                    </dd>
                  </div>
                  <div className="pt-6 sm:flex">
                    <dt className="font-medium text-gray-900 sm:w-64 sm:flex-none sm:pr-6">Address</dt>
                    <dd className="mt-1 flex justify-between gap-x-6 sm:mt-0 sm:flex-auto">
                      <div className="text-gray-900">{customerDetails.first_line}, {customerDetails.second_line}, {customerDetails.city}, {customerDetails.county}, {customerDetails.country}, {customerDetails.postcode}</div>
                      <button type="button" className="font-semibold text-indigo-900 hover:text-indigo-900">
                        Update
                      </button>
                    </dd>
                  </div>
                </dl>

              </div>
            )}

            {/* Car Details setup */}
            {currentSection === "Car Details" && (
              <div>
                <h2 className="text-3xl font-semibold leading-7 text-gray-900">Car Details</h2>

                <dl className="mt-6 space-y-6 divide-y divide-gray-100 border-t border-gray-200 text-sm leading-6">
                  <div className="pt-3 sm:flex">
                    <dt className="font-medium text-gray-900 sm:w-64 sm:flex-none sm:pr-6">Registered Cars</dt>
                    <div className="flex flex-col items-center">
                      <h1 className="text-2xl font-semibold mb-2 mt-1">Enter Vehicle Registration Number</h1>
                      <input
                        type="text"
                        name="vehicleReg1"
                        value={vehicleReg}
                        onChange={(e) => setVehicleReg(e.target.value)}
                        placeholder="Vehicle Registration Number"
                        className="text-center border-2 border-gray-300 rounded-lg p-2 mb-4"
                      />
                      <button
                        name="vehicleDetails"
                        onClick={fetchVehicleDetails1}
                        type="submit"
                        className="text-white font-bold py-2 px-4 rounded"
                        style={{ backgroundColor: "#112D4E", fontSize: "16px" }}
                      >
                        Find
                      </button>
                      <div>
                        <form method="post" onSubmit={action as unknown as FormEventHandler<HTMLFormElement>}>
                          <input type="hidden" name="vehicleDetails" value={JSON.stringify(vehicleDetails)} />
                          <button type="submit" className="text-red font-bold py-2 px-4 rounded">Save</button>
                        </form>
                      </div>
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
                  </div>
                </dl>

                {/* Text under the banner */}
                <div className="grid-container display-grid text-center mt-1 mb-2 p-4 grid pl-4 pr-4 md:pl-8 md:pr-8 pt-20" style={{ textAlign: "center", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "10px", color: "#112D4E" }}>
                  {
                    cars.map((vehicle) => (
                      <form method="post">

                        <div key={vehicle.id} className="p-4 flex flex-col items-center mt-4 vehicle-card">
                          <p className="font-bold text-lg mt-2">{vehicle.registration}</p>
                          <p className="font-8 text-sm">{vehicle.year} {vehicle.make} {vehicle.colour}</p>
                          <p className="font-8 text-sm">Fuel Type: {vehicle.fuel_type}</p>
                          <input type="hidden" name="id" value={vehicle.vehicle_id} />
                          <button type="submit" name="deletebtn" value={"delete"} /*onClick={() => deleteCar(vehicle.vehicle_id)}*/>Delete</button>
                        </div>                         </form>

                    ))}

                  {/* CSS for hover effect */}
                  <style>
                    {`
  .hover:hover {
    color: #3F72AF !important;
    text-transform: uppercase;
    background: #ffffff;
    padding: 20px;
    border: 4px solid #3F72AF !important;
    border-radius: 6px;
    display: inline-block;
    transition: all 0.3s ease 0s;
  }
  .vehicle-card {
    border: 2px solid #112D4E;
    transition: all 0.3s ease 0s;
  }
`}
                  </style>
                </div>

              </div>
            )}

            {/* Bookings setup */}
            {currentSection === "Bookings" && (
              <div>
                <h2 className="text-3xl font-semibold leading-7 text-gray-900">Bookings</h2>

                <dl className="mt-6 space-y-6 divide-y divide-gray-100 border-t border-gray-200 text-sm leading-6">
                  <div className="pt-6">
                    <dt className="font-medium text-gray-900 sm:w-64 sm:flex-none sm:pr-6">Upcoming Bookings</dt>
                  </div>
                </dl>
                <div className="mt-6">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead style={{ backgroundColor: "#DBE2EF" }}>
                      <tr style={{ color: "#112D4E" }}>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                          Booking Number
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                          Vehicle Registration
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                          Vehicle Make
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                          Service
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                          Location
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                          Date
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                          Drop off
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                          Status
                        </th>
                        <th scope="col">
                          <span className="sr-only">Cancel</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">

                      {Bookings.map((booking, index) => (<BookingComponent key={index} Booking={booking} />))}



                    </tbody>
                  </table>
                </div>

                <dl className="mt-6 space-y-6 divide-y divide-gray-100 border-t border-gray-200 text-sm leading-6">
                  <div className="pt-6">
                    <dt className="font-medium text-gray-900 sm:w-64 sm:flex-none sm:pr-6">Past Bookings</dt>
                  </div>
                </dl>
                <div className="mt-6">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead style={{ backgroundColor: "#DBE2EF" }}>
                      <tr style={{ color: "#112D4E" }}>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                          Booking Number
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                          Vehicle Registration
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                          Vehicle Make
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                          Service
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                          Location
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                          Date
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                          Drop off
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                          Status
                        </th>
                        <th scope="col">
                          <span className="sr-only">Cancel</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">

                      {PastBookings.map((booking, index) => (<BookingComponent2 key={index} Booking={booking} />))}



                    </tbody>
                  </table>
                </div>

              </div>
            )}

            {/* Communication Preferences setup */}
            {currentSection === "Communication Preferences" && (

              <div>
                <h2 className="text-3xl font-semibold leading-7 text-gray-900">Communication Preferences</h2>
                <dl className="mt-6 space-y-6 divide-y divide-gray-100 border-t border-gray-200 text-sm leading-6">
                  <div className="pt-6 sm:flex">
                    <dt className="font-medium text-gray-900 sm:w-64 sm:flex-none sm:pr-6">Notification Preferences</dt>
                    <dd className="mt-1 flex justify-between gap-x-6 sm:mt-0 sm:flex-auto">
                      <div className="text-gray-900"></div>
                      <button type="button" className="font-semibold text-indigo-900 hover:text-indigo-900">
                        Update
                      </button>
                    </dd>
                  </div>
                  <div className="pt-6 sm:flex">
                    <dt className="font-medium text-gray-900 sm:w-64 sm:flex-none sm:pr-6">Notifications for</dt>
                    <dd className="mt-1 flex flex-col sm:mt-0 sm:flex-auto">
                      <div className="flex items-center">
                        <input type="checkbox" id="appointment" name="appointment" />
                        <label htmlFor="appointment" className="ml-2 text-gray-900">Appointment</label>
                      </div>
                      <div className="flex items-center">
                        <input type="checkbox" id="reminders" name="reminders" />
                        <label htmlFor="reminders" className="ml-2 text-gray-900">Reminders</label>
                      </div>
                      <div className="flex items-center">
                        <input type="checkbox" id="promotions" name="promotions" />
                        <label htmlFor="promotions" className="ml-2 text-gray-900">Promotions</label>
                      </div>
                    </dd>
                  </div>
                </dl>
              </div>
            )}

          </div>
        </main>
      </div>
    </>
  );
}
