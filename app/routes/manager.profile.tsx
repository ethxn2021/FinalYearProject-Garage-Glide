//Manager profile

import { ArrowLeftOnRectangleIcon, BriefcaseIcon, ChatBubbleLeftRightIcon, CreditCardIcon, InformationCircleIcon, PlusIcon, UserCircleIcon, UserPlusIcon, UsersIcon } from "@heroicons/react/24/outline";
import { ActionFunction, LoaderFunction, json } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { ChangeEvent, useState } from "react";
import useNotifications from "~/hooks/use-notification";
import { getUserRequired } from "~/session.server";
import { getAverageRatingPercentage, getAverageRatingPercentageCanterbury, getBookingInformation, getInventoryItems, getLocationIdByName, getLocations, getServices, getStaffByManagerLocation, updateGarageReply, updateIsActive, updateStaff, updateStockLevel } from "~/utils/db.server";

import SatisfactionProgressBar from "./SatisfactionProgressBar"; // Adjust the import path as necessary
import SatisfactionProgressBar2 from "./SatisfactionProgressBar2"; // Adjust the import path as necessary

import Calendar from "./Calendar"; // Adjust the path as necessary

const nav = [
  { name: "User Information", href: "#", icon: UserCircleIcon },
  // { name: "Contact Information", href: "#", icon: PhoneIcon },
  { name: "Garage Information", href: "#", icon: InformationCircleIcon },
  { name: "Staff Management", href: "#", icon: UsersIcon },
  { name: "Booking Management", href: "#", icon: CreditCardIcon },
  { name: "Business Management", href: "#", icon: BriefcaseIcon },
  { name: "Feedbacks", href: "#", icon: ChatBubbleLeftRightIcon },
];

export const loader: LoaderFunction = async ({ request }) => {
  let user = await getUserRequired(request);
  let managerLocationId = user.location_id;
  let staff = await getStaffByManagerLocation();
  let locations = await getLocations();
  let inventory = await getInventoryItems();
  let booking = await getBookingInformation(managerLocationId);
  let services = await getServices();

  const location = locations.find((item) => item.location_id === user.location_id);

  // Fetch average rating percentage
  const averageRatingPercentage = await getAverageRatingPercentage();

  const averageRatingPercentage2 = await getAverageRatingPercentageCanterbury(managerLocationId);

  delete user.password;
  return {
    user,
    staff,
    locations,
    city: location?.location_name,
    inventory,
    services,
    booking,
    averageRatingPercentage,
    averageRatingPercentage2,
  };
};

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const feedbackId = formData.get("feedbackId");
  const garageReply = formData.get("garageReply");
  const staffId = formData.get("staff_id");
  const role = formData.get("role");
  const locationName = formData.get("location_name");
  const quantity = formData.get("quantity");
  const selectedItem = formData.get("item_id");

  if (selectedItem && quantity !== null) {
    try {
      // Convert `selectedItem` and `quantity` to numbers
      const selectedItemNumber = Number(selectedItem);
      const quantityNumber = Number(quantity);

      if (isNaN(selectedItemNumber) || isNaN(quantityNumber)) {
        throw new Error("Invalid item or quantity");
      }
      // Pass the values directly to `updateStockLevel`
      await updateStockLevel(selectedItemNumber, quantityNumber);
      return json({ success: true }, { status: 200 });
    } catch (error) {
      console.error("Error:", error);
      return json({ error }, { status: 500 });
    }
  }

  if (typeof staffId === "string" && typeof role === "string" && typeof locationName === "string") {
    try {
      const locationId = await getLocationIdByName(locationName);
      if (!locationId) {
        throw new Error("Location not found");
      }
      const newData = {
        role: role as "Admin" | "Manager",
        location_id: locationId,
      };

      await updateStaff(Number(staffId), newData);
      return json({ ok: true });
    } catch (error) {
      console.log("Error updating staff:", error);
      return json({ ok: false, error: "Failed to update staff" }, { status: 500 });
    }
  }

  if (typeof feedbackId === "string" && typeof garageReply === "string") {
    const success = await updateGarageReply(parseInt(feedbackId), garageReply);
    return json({ success });
  }
  return json({ error: "Invalid input" }, { status: 400 });
};

type Service = {
  service_section: string;
  service_name: string;
  cost: number;
  duration: number;
  service_id: number;
};
type StaffMember = {
  staff_id: number;
  username: string;
  first_name: string;
  last_name: string;
  role: "Admin" | "Manager";
  location_name: string;
  isActive: number;
  location_id: number;
};
type GarageName = {
  location_id: number;
  location_name: string;
  street: string;
  city: string;
  county: string;
  country: string;
  postcode: string;
  telephone: string;
};
type InventoryItems = {
  stock_status: string;
  item_id: number;
  item_name: string;
  item_description: string;
  stock_level: number;
  stock_threshold: number;
};

interface Services {
  name: string;
}

type BookingInfo = {
  feedback_id: number;
  booking_date: Date;
  customer_name: string;
  service_name: string;
  customer_rating: number;
  customer_comment: string;
  garage_reply: string;
};
type Review = {
  feedback_id: number;
  garage_reply: string;
  booking_date: Date;
  customer_rating: number;
  customer_name: string;
  service_name: string;
  customer_comment: string;
};

// Add the RatingStars component definition
const RatingStars = ({ rating }: any) => {
  const filledStars = Array(rating).fill("★");
  const emptyStars = Array(5 - rating).fill("☆");
  return <span style={{ color: "#FFD700" }}>{filledStars.concat(emptyStars).join("")}</span>;
};

// Changed file name from staffProfile to staff.profile to match the naming convention
export default function ManagerProfile() {
  const notify = () => "Successfully Updated Stock!";
  useNotifications();
  const { user, staff, locations, city, inventory, services, booking, averageRatingPercentage, averageRatingPercentage2 } = useLoaderData();
  const [bookings, setBookings] = useState(booking); // Initialize bookings state with loader data
  const [currentSection, setCurrentSection] = useState("User Information");
  const [selectedLocation, setSelectedLocation] = useState(""); // State to track selected location
  const [selectedReview, setSelectedReview] = useState<BookingInfo | null>(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [reply, setReply] = useState(""); // Define the reply state variable
  const [editingStaff, setEditingStaff] = useState<StaffMember | null>(null);
  const [quantity, setQuantity] = useState<number>(0);

  const handleQuantityChange = (e: ChangeEvent<HTMLInputElement>) => {
    setQuantity(parseInt(e.target.value));
  };

  // Function to handle section change
  const handleSectionChange = (sectionName: string) => {
    setCurrentSection(sectionName);
    setSelectedLocation(""); // Reset selected location when changing section
  };

  // Function to handle view staff button click
  const handleViewStaff = (locationName: string) => {
    setSelectedLocation(locationName);
  };

  function classNames(...classes: string[]) {
    return classes.filter(Boolean).join(" ");
  }

  const handleRowClick = (review: Review) => {
    setSelectedReview(review);
    setIsPopupOpen(true);
  };

  const satisfactionPercentage = averageRatingPercentage || 35; // Default to 35 if averageRatingPercentage is not available
  // Log satisfactionPercentage
  console.log("Satisfaction Percentage:", satisfactionPercentage);

  const satisfactionPercentage2 = averageRatingPercentage2 || 35; // Default to 35 if averageRatingPercentage is not available
  // Log satisfactionPercentage
  console.log("Satisfaction Percentage:", satisfactionPercentage2);

  //Password Editing
  const [isEditingPassword, setIsEditingPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");

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
          setCurrentPassword("");
          setPassword("");
          setConfirmPassword("");
          setPasswordError("");
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
      setPasswordError("");
    }
  };

  // Function to handle deactivate button
  async function handleDeactivate(staffId: number): Promise<void> {
    try {
      await updateIsActive(staffId, false);
      console.log("successful");
    } catch (error) {
      console.log("error");
    }
  }

  // Function to handle reactivate button
  async function handleReactivate(staffId: number): Promise<void> {
    try {
      // Call the updateIsActive function to reactivate the staff member
      await updateIsActive(staffId, true);
      console.log("Staff member reactivated successfully.");
    } catch (error) {
      console.log("Error reactivating staff member:", error);
    }
  }

  const handleEditStaff = (staffMember: StaffMember) => {
    setEditingStaff(staffMember);
  };

  const validRoles: string[] = ["Admin", "Manager"];

  const handleSelectChange = (e: ChangeEvent<HTMLSelectElement>) => {
    if (editingStaff) {
      // Update the editingStaff state with the new value
      setEditingStaff((prevStaff) => ({
        ...prevStaff!,
        [e.target.name]: e.target.value,
      }));
    }
  };

  const [editingInventory, setEditingInventory] = useState<InventoryItems | null>(null);
  const handleEditInventory = (inventoryItems: InventoryItems) => {
    setEditingInventory(inventoryItems);
  };

  const [editingService, setEditingService] = useState<Service | null>(null);
  const handleEditServices = (services: Service) => {
    setEditingService(services);
  };

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
            {/* User Information */}
            {currentSection === "User Information" && (
              <div>
                <h2 className="text-3xl font-semibold leading-7 text-gray-900">Profile</h2>
                <dl className="mt-6 space-y-6 divide-y divide-gray-100 border-t border-gray-200 text-sm leading-6">
                  <div className="pt-6 sm:flex">
                    <dt className="font-medium text-gray-900 sm:w-64 sm:flex-none sm:pr-6">Username</dt>
                    <dd className="mt-1 flex justify-between gap-x-6 sm:mt-0 sm:flex-auto">
                      <div className="text-gray-900">{user.username}</div>
                      {/* <button type="button" className="font-semibold text-indigo-900 hover:text-indigo-900">
                        Update
                      </button> */}
                    </dd>
                  </div>
                  <div className="pt-6 sm:flex">
                    <dt className="font-medium text-gray-900 sm:w-64 sm:flex-none sm:pr-6">Full Name</dt>
                    <dd className="mt-1 flex justify-between gap-x-6 sm:mt-0 sm:flex-auto">
                      <div className="text-gray-900">
                        {user.first_name} {user.last_name}
                      </div>
                    </dd>
                  </div>
                  <div className="pt-6 sm:flex">
                    <dt className="font-medium text-gray-900 sm:w-64 sm:flex-none sm:pr-6">Password</dt>
                    <dd className="mt-1 flex justify-between gap-x-6 sm:mt-0 sm:flex-auto">
                      {isEditingPassword ? (
                        <>
                          <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} placeholder="Current Password" className="text-gray-900 mr-2" />
                          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="New Password" className="text-gray-900 mr-2" />
                          <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Confirm New Password" className="text-gray-900" />
                          {passwordError && <div className="text-red-500">{passwordError}</div>}
                        </>
                      ) : (
                        <div className="text-gray-900">[Password Hidden]</div>
                      )}
                      <button onClick={toggleEditPassword} className="font-semibold text-indigo-900 hover:text-indigo-900">
                        {isEditingPassword ? "Save" : "Update"}
                      </button>
                    </dd>
                  </div>
                </dl>
              </div>
            )}

            {/* Garage Information setup */}
            {currentSection === "Garage Information" && (
              <div>
                <h2 className="text-3xl font-semibold leading-7 text-gray-900">Garage Information</h2>
                <dl className="mt-6 space-y-6 divide-y divide-gray-100 border-t border-gray-200 text-sm leading-6">
                  {/* Filter the garage based on selected location */}
                  {locations
                    .filter((garage: GarageName) => garage.location_id === user.location_id)
                    .map((garage: GarageName) => (
                      <div key={garage.location_id}>
                        <div className="pt-6 sm:flex">
                          <dt className="font-medium text-gray-900 sm:w-64 sm:flex-none sm:pr-6">Garage Name</dt>
                          <dd className="mt-1 flex justify-between gap-x-6 sm:mt-0 sm:flex-auto">
                            <div className="text-gray-900">{garage.location_name}</div>
                            {/*  <button type="button" className="font-semibold text-indigo-900 hover:text-indigo-900">
                              Update
                            </button> */}
                          </dd>
                        </div>
                        <div className="pt-6 sm:flex">
                          <dt className="font-medium text-gray-900 sm:w-64 sm:flex-none sm:pr-6">Garage Address</dt>
                          <dd className="mt-1 flex justify-between gap-x-6 sm:mt-0 sm:flex-auto">
                            <div className="text-gray-900">
                              {garage.street}, {garage.city}, {garage.county}, {garage.country}, {garage.postcode}
                            </div>
                            {/* <button type="button" className="font-semibold text-indigo-900 hover:text-indigo-900">
                              Update
                            </button> */}
                          </dd>
                        </div>
                        <div className="pt-6 sm:flex">
                          <dt className="font-medium text-gray-900 sm:w-64 sm:flex-none sm:pr-6">Garage Telephone Number</dt>
                          <dd className="mt-1 flex justify-between gap-x-6 sm:mt-0 sm:flex-auto">
                            <div className="text-gray-900">{garage.telephone}</div>
                            {/* <button type="button" className="font-semibold text-indigo-900 hover:text-indigo-900">
                              Update
                            </button> */}
                          </dd>
                        </div>
                      </div>
                    ))}
                </dl>
              </div>
            )}

            {/* Staff Management setup */}
            {currentSection === "Staff Management" && (
              <div>
                <h2 className="text-3xl font-semibold leading-7 text-gray-900">Staff Management</h2>

                {/* Create new Staff Account */}
                <div className="text-right justify-end">
                  <Link to="/staff/register" className="mt-5 font-semibold text-indigo-900 hover:text-indigo-900 underline flex">
                    <UserPlusIcon className="h-6 w-6" />
                    Add New Staff
                  </Link>
                  {/* View Location Staff buttons */}
                  <button onClick={() => handleViewStaff("Medway")} className="px-3 py-1.5 text-white rounded-full text-sm font-semibold leading-6" style={{ backgroundColor: "#112D4E", fontSize: "16px" }}>
                    View Medway Staff{" "}
                  </button>
                  <button onClick={() => handleViewStaff("Canterbury")} className="px-3 py-1.5 text-white rounded-full ml-5 text-sm font-semibold leading-6" style={{ backgroundColor: "#112D4E", fontSize: "16px" }}>
                    View Canterbury Staff
                  </button>
                </div>
                <dl className="mt-6 space-y-6 divide-y divide-gray-100 border-t border-gray-200 text-sm leading-6">
                  <div className="pt-6 sm:flex">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="" style={{ backgroundColor: "#DBE2EF" }}>
                        <tr style={{ color: "#112D4E" }}>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium  uppercase tracking-wider">
                            ID
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                            Username
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium  uppercase tracking-wider">
                            First Name
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium  uppercase tracking-wider">
                            Last Name
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                            Role
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium  uppercase tracking-wider">
                            Location
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium  uppercase tracking-wider">
                            Active
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {staff
                          .filter((staffMember: StaffMember) => selectedLocation === "" || staffMember.location_name === selectedLocation) // Filter staff based on selected location
                          .map((staffMember: StaffMember) => (
                            <tr key={staffMember.staff_id} onClick={() => handleEditStaff(staffMember)} className="hover:bg-gray-100 cursor-pointer">
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{staffMember.staff_id}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{staffMember.username}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{staffMember.first_name}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{staffMember.last_name}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{staffMember.role}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{staffMember.location_name}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{staffMember.isActive ? "Yes" : "No"}</td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </dl>
              </div>
            )}
            {/* Modal for Editing Staff */}
            {editingStaff && (
              <div className="fixed z-10 inset-0 overflow-y-auto">
                <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                  <div className="fixed inset-0 transition-opacity" aria-hidden="true">
                    <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
                  </div>
                  <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">
                    &#8203;
                  </span>
                  <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full" role="dialog" aria-modal="true" aria-labelledby="modal-headline">
                    <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                      <div className="sm:flex sm:items-start">
                        <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                          <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-headline">
                            Edit Staff
                          </h3>
                          <div className="mt-5">
                            <form method="post">
                              <div className="mt-4">
                                <label htmlFor="staff_id" className="block text-sm font-medium text-gray-700">
                                  Staff ID: {editingStaff.staff_id}
                                </label>
                                <br></br>
                                <input type="hidden" name="staff_id" value={editingStaff.staff_id} />

                                <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                                  Role
                                </label>
                                <select
                                  id="role"
                                  name="role"
                                  required
                                  className="block w-full border-0 py-1.5 text-gray-900 shadow-sm ring-1 focus:ring-indigo-950 ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset sm:text-sm sm:leading-6"
                                  value={editingStaff?.role || ""}
                                  onChange={handleSelectChange}
                                >
                                  {validRoles.map((roleValue) => (
                                    <option key={roleValue} value={roleValue}>
                                      {roleValue}
                                    </option>
                                  ))}
                                </select>

                                <label htmlFor="location_name" className="block text-sm font-medium text-gray-700" style={{ fontSize: "16px", color: "#112D4E" }}>
                                  Location
                                </label>
                                <select id="location_name" name="location_name" value={editingStaff?.location_name || ""} onChange={handleSelectChange} required className="mt-1 focus:ring-indigo-900 focus:border-indigo-900 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md">
                                  {locations.map((location: GarageName) => (
                                    <option key={location.location_id}>{location.location_name}</option>
                                  ))}
                                </select>

                                <button onClick={() => handleDeactivate(editingStaff.staff_id)} className="bg-red-600 text-white rounded-full leading-6 px-2 mt-4" style={{}}>
                                  Deactivate Account
                                </button>
                                <button onClick={() => handleReactivate(editingStaff.staff_id)} className="bg-green-600 text-white rounded-full leading-6 px-2 mt-4 ml-4" style={{}}>
                                  Reactivate Account
                                </button>
                              </div>

                              <div className=" px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                                <button type="submit" className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 text-base font-medium text-white sm:ml-3 sm:w-auto sm:text-sm" style={{ backgroundColor: "#112D4E" }}>
                                  Save
                                </button>
                                <button onClick={() => setEditingStaff(null)} type="button" className="mt-3 w-full inline-flex justify-center rounded-md border bg-red-600 border-red-900 shadow-sm px-4 py-2 text-base font-medium text-white sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm">
                                  Cancel
                                </button>
                              </div>
                            </form>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Booking Management setup */}
            {currentSection === "Booking Management" && (
              <div>
                <h2 className="text-3xl font-semibold leading-7 text-gray-900">Bookings</h2>

                <dl className="mt-6 space-y-6 divide-y divide-gray-100 border-t border-gray-200 text-sm leading-6">
                  <div className="pt-6 sm:flex">
                    <dt className="font-medium text-gray-900 sm:w-64 sm:flex-none sm:pr-6">Appointment Calendar</dt>
                    <dd className="mt-1 flex justify-between gap-x-6 sm:mt-0 sm:flex-auto">
                      {/* Render the Calendar component here */}
                      <Calendar />
                      <button type="button" className="font-semibold text-indigo-900 hover:text-indigo-900">
                        {/*Add a button here if needed */}
                      </button>
                    </dd>
                  </div>
                </dl>
              </div>
            )}

            {/* Business Management setup */}
            {currentSection === "Business Management" && (
              <div>
                <h2 className="text-3xl font-semibold leading-7 text-gray-900">Business Management</h2>
                <dl className="mt-6 space-y-6 divide-y divide-gray-100 border-t border-gray-200 text-sm leading-6">
                  <div className="pt-6 sm:flex">
                    <dt className="font-bold text-gray-900 sm:w-64 sm:flex-none sm:pr-6 text-2xl">Revenue</dt>
                  </div>
                  <div className="pt-6 sm:flex">
                    <dt className=" text-gray-900 sm:w-64 sm:flex-none sm:pr-6 font-bold text-2xl"> Edit Opening times</dt>
                  </div>
                  <div className="pt-6 sm:flex">
                    <dt className="font-bold text-gray-900 sm:w-64 sm:flex-none sm:pr-6 text-2xl">Services and Operation</dt>
                    <Link to="/register/service" className="mt-5 font-semibold text-indigo-900 hover:text-indigo-900 underline flex">
                      <PlusIcon className="h-6 w-6" />
                      Add New Service
                    </Link>
                  </div>

                  <div className="sm:flex">
                    <table className="min-w-full">
                      <thead className="" style={{ backgroundColor: "#DBE2EF" }}>
                        <tr style={{ color: "#112D4E" }}>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                            Service Section
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                            Service Name
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                            Cost
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                            Duration
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {services.map((service: Service) => (
                          <tr className="border-t border-gray-200 hover:bg-gray-100 cursor-pointer" onClick={() => handleEditServices(services)}>
                            <td className="px-6 py-4 whitespace-nowrap">{service.service_section}</td>
                            <td className="px-6 py-4 whitespace-nowrap">{service.service_name}</td>
                            <td className="px-6 py-4 whitespace-nowrap">{service.cost}</td>
                            <td className="px-6 py-4 whitespace-nowrap">{service.duration}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {/* Modal */}
                    {editingService && (
                      <div className="fixed z-10 inset-0 overflow-y-auto">
                        <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                          <div className="fixed inset-0 transition-opacity" aria-hidden="true">
                            <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
                          </div>
                          <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">
                            &#8203;
                          </span>
                          <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full" role="dialog" aria-modal="true" aria-labelledby="modal-headline">
                            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                              <div className="sm:flex sm:items-start">
                                <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                                  <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-headline">
                                    Edit Service
                                  </h3>
                                  <div className="mt-5">
                                    <form method="post">
                                      <div className="mt-4">
                                        <label htmlFor="service_id" className="block text-sm font-medium text-gray-700">
                                          Service ID: {editingService.service_id}
                                        </label>
                                        <br />
                                        <input type="hidden" name="service_id" value="" />
                                        <label
                                          htmlFor="itemName"
                                          className="block text-sm font-medium leading-6 text-gray-900"
                                          style={{
                                            fontSize: "16px",
                                            color: "#112D4E",
                                          }}
                                        >
                                          Service to Edit : {editingService.service_section}
                                        </label>

                                        <div>
                                          <label
                                            htmlFor="section_name"
                                            className="block text-sm font-medium text-gray-700"
                                            style={{
                                              fontSize: "16px",
                                              color: "#112D4E",
                                            }}
                                          >
                                            Service Section
                                          </label>
                                          <select id="section_name" name="section_name" value={editingService?.service_section || ""} onChange={handleSelectChange} required className="mt-1 focus:ring-indigo-900 focus:border-indigo-900 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md">
                                            {services.map((service: Service) => (
                                              <option key={service.service_id}>{service.service_section}</option>
                                            ))}
                                          </select>
                                        </div>

                                        <div>
                                          <label
                                            htmlFor="service_name"
                                            className="block text-sm font-medium leading-6 text-gray-900"
                                            style={{
                                              fontSize: "16px",
                                              color: "#112D4E",
                                            }}
                                          >
                                            Service Name
                                          </label>
                                          <input id="service_name" name="service_name" type="text" required className="block w-full border-0 py-1.5 text-gray-900 shadow-sm ring-1 focus:ring-indigo-950 ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset sm:text-sm sm:leading-6" />
                                        </div>
                                        <div>
                                          <label
                                            htmlFor="cost"
                                            className="block text-sm font-medium leading-6 text-gray-900"
                                            style={{
                                              fontSize: "16px",
                                              color: "#112D4E",
                                            }}
                                          >
                                            Cost
                                          </label>
                                          <input
                                            id="cost"
                                            name="cost"
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            required
                                            className="block w-full border-0 py-1.5 text-gray-900 shadow-sm ring-1 focus:ring-indigo-950 ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset sm:text-sm sm:leading-6"
                                          />
                                        </div>
                                        <div>
                                          <label
                                            htmlFor="duration"
                                            className="block text-sm font-medium leading-6 text-gray-900"
                                            style={{
                                              fontSize: "16px",
                                              color: "#112D4E",
                                            }}
                                          >
                                            Duration (Estimated Hours)
                                          </label>
                                          <input id="duration" name="duration" type="number" min="0" required className="block w-full border-0 py-1.5 text-gray-900 shadow-sm ring-1 focus:ring-indigo-950 ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset sm:text-sm sm:leading-6" />
                                        </div>
                                      </div>
                                      <div className=" px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                                        <button type="submit" className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 text-base font-medium text-white sm:ml-3 sm:w-auto sm:text-sm" style={{ backgroundColor: "#112D4E" }}>
                                          Save
                                        </button>
                                        <button onClick={() => setEditingService(null)} type="button" className="mt-3 w-full inline-flex justify-center rounded-md border bg-red-600 border-red-900 shadow-sm px-4 py-2 text-base font-medium text-white sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm">
                                          Cancel
                                        </button>
                                      </div>
                                    </form>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="pt-6 sm:flex">
                    <dt className=" text-gray-900 sm:w-64 sm:flex-none sm:pr-6 font-bold text-2xl">Inventory</dt>
                    <Link to="/register/inventory" className="mt-5 font-semibold text-indigo-900 hover:text-indigo-900 underline flex">
                      <PlusIcon className="h-6 w-6" />
                      Add New Inventory
                    </Link>
                  </div>
                  <div className=" sm:flex">
                    <table className="min-w-full">
                      <thead className="" style={{ backgroundColor: "#DBE2EF" }}>
                        <tr style={{ color: "#112D4E" }}>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                            Item Name
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                            Stock Level
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                            Stock Status
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {inventory.map((item: InventoryItems) => (
                          <tr key={item.item_id} className="border-gray-200 hover:bg-gray-100 cursor-pointer" onClick={() => handleEditInventory(item)}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.item_name}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.stock_level}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.stock_status}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </dl>

                {/* Modal */}
                {editingInventory && (
                  <div className="fixed z-10 inset-0 overflow-y-auto">
                    <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                      <div className="fixed inset-0 transition-opacity" aria-hidden="true">
                        <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
                      </div>
                      <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">
                        &#8203;
                      </span>
                      <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full" role="dialog" aria-modal="true" aria-labelledby="modal-headline">
                        <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                          <div className="sm:flex sm:items-start">
                            <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                              <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-headline">
                                Update Stock Level
                              </h3>
                              <div className="mt-5">
                                <form method="post">
                                  <div className="mt-4">
                                    <label htmlFor="item_id" className="block text-sm font-medium text-gray-700">
                                      Inventory ID: {editingInventory.item_id}
                                    </label>
                                    <br />
                                    <input type="hidden" name="item_id" value={editingInventory.item_id} />
                                    <label
                                      htmlFor="itemName"
                                      className="block text-sm font-medium leading-6 text-gray-900"
                                      style={{
                                        fontSize: "16px",
                                        color: "#112D4E",
                                      }}
                                    >
                                      Item to Stock Up : {editingInventory.item_name}
                                    </label>
                                    <div>
                                      <label
                                        htmlFor="quantity"
                                        className="block text-sm mt-4 font-medium leading-6 text-gray-900"
                                        style={{
                                          fontSize: "16px",
                                          color: "#112D4E",
                                        }}
                                      >
                                        Quantity to Stock
                                      </label>
                                      <input
                                        id="quantity"
                                        value={quantity}
                                        onChange={handleQuantityChange}
                                        name="quantity"
                                        type="number"
                                        min="1"
                                        step="1"
                                        required
                                        className="block w-full border-0 py-1.5 text-gray-900 shadow-sm ring-1 focus:ring-indigo-950 ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset sm:text-sm sm:leading-6"
                                      />
                                    </div>
                                  </div>
                                  <div className=" px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                                    <button type="submit" className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 text-base font-medium text-white sm:ml-3 sm:w-auto sm:text-sm" style={{ backgroundColor: "#112D4E" }}>
                                      Save
                                    </button>
                                    <button onClick={() => setEditingInventory(null)} type="button" className="mt-3 w-full inline-flex justify-center rounded-md border bg-red-600 border-red-900 shadow-sm px-4 py-2 text-base font-medium text-white sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm">
                                      Cancel
                                    </button>
                                  </div>
                                </form>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Feedbacks setup */}
            {currentSection === "Feedbacks" && (
              <div>
                <h2 className="text-3xl font-semibold leading-7 text-gray-900">Feedbacks</h2>

                <div>
                  <h2
                    style={{
                      textAlign: "center",
                      marginBottom: "20px",
                      fontSize: "24px", // Increases the font size
                      fontWeight: "600", // Makes the font a bit bolder than normal but not too bold
                      textShadow: "1px 1px 2px rgba(0,0,0,0.1)", // A subtle shadow for depth
                      letterSpacing: "0.05em", // Optional: increases spacing between letters slightly
                      padding: "10px 0", // Optional: adds some padding above and below the text
                    }}
                  >
                    Customer Satisfaction
                  </h2>

                  <div
                    className="satisfaction-bars-container"
                    style={{
                      display: "flex",
                      justifyContent: "space-around", // or 'space-between' depending on the spacing you prefer
                      alignItems: "center",
                      flexWrap: "wrap", // ensures responsiveness
                      gap: "20px", // Adds space between the progress bars if needed
                    }}
                  >
                    <SatisfactionProgressBar satisfactionPercentage={satisfactionPercentage} />
                    <SatisfactionProgressBar2 newPercentage={satisfactionPercentage2} city={city} />
                  </div>
                </div>

                <dl className="mt-6 space-y-6 divide-y divide-gray-100 border-t border-gray-200 text-sm leading-6">
                  <div className="pt-6 sm:flex">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="" style={{ backgroundColor: "#DBE2EF" }}>
                        <tr style={{ color: "#112D4E" }}>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium  uppercase tracking-wider">
                            Date
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium  uppercase tracking-wider">
                            Feedback ID
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                            Customer Name
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium  uppercase tracking-wider">
                            Service Provided
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium  uppercase tracking-wider">
                            Customer Rating
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                            Customer Comments
                          </th>

                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                            Garage Reply
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {booking.map((bookingInfo: BookingInfo) => (
                          <tr
                            key={bookingInfo.customer_comment}
                            onClick={() => handleRowClick(bookingInfo)}
                            className="hover:bg-gray-100 cursor-pointer" // Apply hover effect and cursor pointer
                          >
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(bookingInfo.booking_date).toLocaleDateString()}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{bookingInfo.feedback_id}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{bookingInfo.customer_name}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{bookingInfo.service_name}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{bookingInfo.customer_rating}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              <div className="overflow-x-hidden text-xs max-w-[200px]">{bookingInfo.customer_comment}</div>
                            </td>

                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              <div className="overflow-x-hidden text-xs max-w-[200px]">{bookingInfo.garage_reply}</div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </dl>

                {isPopupOpen && selectedReview && (
                  <div
                    style={{
                      position: "fixed",
                      top: 0,
                      left: 0,
                      width: "100%",
                      height: "100%",
                      backgroundColor: "rgba(0, 0, 0, 0.5)",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <form
                      method="post"
                      style={{
                        backgroundColor: "white",
                        padding: "20px",
                        borderRadius: "8px",
                        boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
                        maxWidth: "400px",
                        width: "90%",
                      }}
                    >
                      {/* Displaying details of the selected review */}
                      <div>
                        {/* Display customer rating as stars */}
                        <div>
                          <RatingStars rating={selectedReview.customer_rating} />
                        </div>

                        {/* Aligning customer name to the left and service details to the center */}
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "flex-start",
                            alignItems: "center",
                            marginBottom: "10px",
                          }}
                        >
                          <span>
                            <strong>{selectedReview.customer_name}</strong>
                          </span>
                          <div style={{ flex: 1, textAlign: "center" }}>
                            <span>
                              {selectedReview.service_name} | {new Date(selectedReview.booking_date).toLocaleDateString()}
                            </span>
                          </div>
                        </div>

                        <p>{selectedReview.customer_comment}</p>
                      </div>

                      {/* Hidden Input for feedbackId */}
                      <input type="hidden" name="feedbackId" value={selectedReview.feedback_id} />

                      <textarea
                        name="garageReply"
                        placeholder="Enter your reply..."
                        value={reply}
                        onChange={(e) => setReply(e.target.value)}
                        style={{
                          width: "100%", // This will make the textarea to fill the width of its parent
                          maxWidth: "600px", // Ensure this matches the maxWidth of the form
                          height: "100px",
                          marginBottom: "10px",
                          padding: "8px",
                          border: "1px solid #ccc",
                          borderRadius: "4px",
                          resize: "vertical",
                        }}
                      />

                      <button
                        type="submit"
                        style={{
                          padding: "8px 16px",
                          backgroundColor: "#007bff",
                          color: "white",
                          border: "none",
                          borderRadius: "4px",
                          cursor: "pointer",
                          marginRight: "10px",
                        }}
                      >
                        Submit Reply
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsPopupOpen(false)}
                        style={{
                          padding: "8px 16px",
                          backgroundColor: "#6c757d",
                          color: "white",
                          border: "none",
                          borderRadius: "4px",
                          cursor: "pointer",
                        }}
                      >
                        Close
                      </button>
                    </form>
                  </div>
                )}
              </div>
            )}

            {/* <div style={{ position: "fixed", bottom: "10px", left: "10px", cursor: "pointer" }}>
              <a href="/staff/login">
                <ArrowLeftOnRectangleIcon />
                Logout
              </a>
            </div> */}
          </div>
        </main>
      </div>
    </>
  );
}
