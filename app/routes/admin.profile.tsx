import { Calendar, momentLocalizer } from "react-big-calendar";
import { useState, useEffect } from "react";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { Link, useLoaderData } from "@remix-run/react";
import { CreditCardIcon, UsersIcon, PhoneIcon, UserCircleIcon, ArrowLeftOnRectangleIcon, BriefcaseIcon, UserPlusIcon } from "@heroicons/react/24/outline";
import moment from "moment";
import DatePicker from "react-datepicker"; // date picker component
import "react-datepicker/dist/react-datepicker.css";
import { getUserRequired, getUser } from "~/session.server";
import { ActionFunction, LoaderFunction, json } from "@remix-run/node";
import { getBookings, getLocations, getCustomer, updateCustomer, getOpeningHours, getBookingDetails, getServices } from "~/utils/db.server";
import "react-big-calendar/lib/css/react-big-calendar.css";
import BookingManagement from "~/components/admin/BookingManagement";

const nav = [
  { name: "User Information", href: "#", icon: UserCircleIcon },
  { name: "Garage Information", href: "#", icon: BriefcaseIcon },
  { name: "Customer Management", href: "#", icon: UsersIcon },
  { name: "Booking Management", href: "#", icon: CreditCardIcon },
];
type GarageName = { location_id: number; location_name: string; street: string; city: string; county: string; country: string; postcode: string; telephone: string };
type Customer = { customer_id: number; first_name: string; last_name: string; email: string; telephone: number };
interface Booking {
  registration_number: string;
  services: string;
  booking_date: number;
  booking_start: number;
  booking_end: number;
  booking_status: string;
  location_id: number;
}

interface Event {
  id?: number;
  title: string;
  serviceType: string;
  carRegistration: string;
  start: Date;
  end: Date;
}

interface CustomEvent {
  title: string;
  serviceType: string;
  carRegistration: string;
  start: Date;
  end: Date;
}

type GarageLocation = {
  location_id: number;
  location_name: string;
  city: string;
  street: string;
  county: string;
  country: string;
  postcode: string;
  telephone: string;
  latitude: number;
  longitude: number;
  openingHours?: { day_of_week: string; open_time: string; close_time: string }[];
};

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}

export const loader: LoaderFunction = async ({ request }) => {
  let customers = await getCustomer();
  let user = await getUserRequired(request);
  let location = await getLocations();
  let openingHours = await getOpeningHours();
  const openingHoursMap = await getOpeningHours();

  // Merge opening hours into locations
  const locationsWithHours = location.map((location) => ({
    ...location,
    openingHours: openingHoursMap[location.location_id] || [],
  }));

  delete user.password;

  const dvlaAccessToken = process.env.DVLA_ACCESS_TOKEN;
  const locationId = user.location_id;
  const bookings = await getBookings(locationId);

  const modifiedBookings = [];
  for (const book of bookings) {
    const booking = await getBookingDetails(book.booking_id);
    modifiedBookings.push({ ...book, details: booking });
  }

  const services = await getServices();

  return { bookings: modifiedBookings, services, user, location, customers, openingHours, locations: locationsWithHours, dvlaAccessToken };
};

//Action function to handle form submissions
export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const customerId = formData.get("customer_id");
  const firstName = formData.get("first_name");
  const lastName = formData.get("last_name");
  const email = formData.get("email");
  const telephone = formData.get("telephone");

  if (typeof customerId === "string" && typeof firstName === "string" && typeof lastName === "string" && typeof email === "string" && !isNaN(Number(telephone))) {
    const newData = {
      first_name: firstName,
      last_name: lastName,
      email: email,
      telephone: Number(telephone),
    };

    try {
      await updateCustomer(Number(customerId), newData);
      return json({ ok: true });
    } catch (error) {
      console.error("Error updating customer:", error);
      return json({ ok: false, error: "Failed to update customer" }, { status: 500 });
    }
  } else {
    return json({ ok: false, error: "Invalid input" }, { status: 400 });
  }
};

function formatTime(time: string) {
  // Convert 'HH:MM:SS' format to 'HH:MM'
  const [hours, minutes] = time.split(":");
  return `${hours}:${minutes}`;
}

function formatOpeningHours(hours: GarageLocation["openingHours"]) {
  if (!hours || hours.length === 0) return <p>No opening hours available</p>;

  const formattedHours: JSX.Element[] = [];
  let currentGroup = [hours[0]];

  for (let i = 1; i < hours.length; i++) {
    const current = hours[i];
    const last = currentGroup[currentGroup.length - 1];

    // Check for null opening and closing times and set to "Closed"
    const currentOpenTime = current.open_time ? formatTime(current.open_time) : "Closed";
    const currentCloseTime = current.close_time ? formatTime(current.close_time) : "Closed";
    const lastOpenTime = last.open_time ? formatTime(last.open_time) : "Closed";
    const lastCloseTime = last.close_time ? formatTime(last.close_time) : "Closed";

    if (currentOpenTime === lastOpenTime && currentCloseTime === lastCloseTime) {
      currentGroup.push(current);
    } else {
      if (currentGroup.length > 1) {
        formattedHours.push(
          <p key={i}>
            {currentGroup[0].day_of_week} to {currentGroup[currentGroup.length - 1].day_of_week}: {lastOpenTime} - {lastCloseTime}
          </p>
        );
      } else {
        formattedHours.push(
          <p key={i}>
            {last.day_of_week}: {lastOpenTime === "Closed" ? "Closed" : `${lastOpenTime} - ${lastCloseTime}`}
          </p>
        );
      }
      currentGroup = [current];
    }
  }

  // Handle the last group
  if (currentGroup.length > 1) {
    const last = currentGroup[currentGroup.length - 1];
    const lastOpenTime = last.open_time ? formatTime(last.open_time) : "Closed";
    const lastCloseTime = last.close_time ? formatTime(last.close_time) : "Closed";

    formattedHours.push(
      <p key="last">
        {currentGroup[0].day_of_week} to {last.day_of_week}: {lastOpenTime} - {lastCloseTime}
      </p>
    );
  } else {
    const last = currentGroup[0];
    const lastOpenTime = last.open_time ? formatTime(last.open_time) : "Closed";
    const lastCloseTime = last.close_time ? formatTime(last.close_time) : "Closed";

    formattedHours.push(
      <p key="last-single">
        {last.day_of_week}: {lastOpenTime === "Closed" ? "Closed" : `${lastOpenTime} to ${lastCloseTime}`}
      </p>
    );
  }

  return formattedHours;
}

export default function AdminProfile() {
  const { bookings } = useLoaderData();
  const [currentSection, setCurrentSection] = useState("User Information");
  const { user, location, customers, openingHours } = useLoaderData();
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);

  const { locations } = useLoaderData<{
    locations: GarageLocation[];
  }>();

  const handleEditCustomer = (customer: Customer) => {
    setEditingCustomer(customer);
  };

  // Function to handle input change in the edit form
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (editingCustomer) {
      // Update the editingCustomer state with the new value
      setEditingCustomer((prevCustomer) => ({
        ...prevCustomer!,
        [e.target.name]: e.target.value,
      }));
    }
  };

  const handleSectionChange = (sectionName: string) => {
    setCurrentSection(sectionName);
  };

  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<{
    serviceType: string;
    carRegistration: string;
    start: Date;
    end: Date;
  } | null>(null);

  const [showForm, setShowForm] = useState(false);
  const [serviceType, setServiceType] = useState("");
  const [carRegistration, setCarRegistration] = useState("");
  const [selectedDate, setSelectedDate] = useState(null);
  const [startTime, setStartTime] = useState("9:00 AM");
  const [endTime, setEndTime] = useState("11:00 AM");

  const [modifiedServiceType, setModifiedServiceType] = useState("");
  const [modifiedCarRegistration, setModifiedCarRegistration] = useState("");
  const [isModifying, setIsModifying] = useState(false);
  const [modifiedDate, setModifiedDate] = useState(new Date());
  const [modifiedStartTime, setModifiedStartTime] = useState("9:00 AM");
  const [modifiedEndTime, setModifiedEndTime] = useState("");

  const localizer = momentLocalizer(moment);

  const handleAddBooking = () => {
    setShowForm(true);
    //console.log("New Booking button clicked!");
  };

  const handleEventClick = (event: Event) => {
    setSelectedEvent(event);
    //console.log("Selected Event:", event);
  };

  const handleModify = () => {
    setIsModifying(true);
  };

  const handleSaveModification = () => {
    const updatedEvents = events.map((event) => {
      if (selectedEvent && event.serviceType === selectedEvent.serviceType && event.start === selectedEvent.start) {
        // Create new Date for start and end times
        const modifiedStartDate = new Date(modifiedDate);
        modifiedStartDate.setHours(parseInt(modifiedStartTime.split(":")[0]), parseInt(modifiedStartTime.split(":")[1]));

        const modifiedEndDate = new Date(modifiedDate);
        modifiedEndDate.setHours(parseInt(modifiedEndTime.split(":")[0]), parseInt(modifiedEndTime.split(":")[1]));

        return {
          ...event,
          serviceType: modifiedServiceType,
          carRegistration: modifiedCarRegistration,
          title: `${modifiedServiceType} - ${modifiedCarRegistration}`,
          start: modifiedStartDate,
          end: modifiedEndDate,
        };
      }
      return event;
    });

    // Update the events array
    setEvents(updatedEvents);

    // Reset variables
    setModifiedServiceType("");
    setModifiedCarRegistration("");
    setIsModifying(false);
  };

  const handleCancelModification = () => {
    // Reset state variables
    setModifiedServiceType("");
    setModifiedCarRegistration("");
    setIsModifying(false);
  };

  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (selectedDate) {
      const newEvent = {
        title: `${serviceType} - ${carRegistration}`,
        serviceType: serviceType,
        carRegistration: carRegistration,
        start: new Date(selectedDate.setHours(parseInt(startTime.split(":")[0]), 0)),
        end: new Date(selectedDate.setHours(parseInt(endTime.split(":")[0]), 0)),
      };

      console.log("New Event:", newEvent);
      setEvents([...events, newEvent]);

      console.log(events);

      console.log("Form submitted!");
      setShowForm(false);
      setServiceType("");
      setCarRegistration("");
      setSelectedDate(null);
      setStartTime("9:00 AM");
      setEndTime("11:00 AM");
    } else {
      console.log("Selected date is null");
    }
  };

  const timeOptions = ["9:00 AM", "9:30 AM", "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM", "12:00 PM", "12:30 PM", "13:00 PM", "13:30 PM", "14:00 PM", "14:30 PM", "15:00 PM", "15:30 PM", "16:00 PM"];

  const renderTimeOptions = timeOptions.map((time, index) => (
    <option key={index} value={time}>
      {time}
    </option>
  ));

  // useEffect hook to fetch and transform bookings into events
  useEffect(() => {
    const fetchAndTransformBookings = async () => {
      try {
        // Check if bookings data is available
        if (!bookings || bookings.length === 0) {
          console.log("No bookings data available.");
          return; // Exit early if no data is available
        }

        //console.log("Fetched bookings data:", bookings);

        // Transform booking data into events
        const eventsData = bookings.map((booking: Booking) => {
          const bookingDate = new Date(booking.booking_date);
          const bookingStart = new Date(`1970-01-01T${booking.booking_start}`);
          const bookingEnd = new Date(`1970-01-01T${booking.booking_end}`);

          // Combine date and time for start and end times
          const startDate = new Date(bookingDate.getFullYear(), bookingDate.getMonth(), bookingDate.getDate(), bookingStart.getHours(), bookingStart.getMinutes());

          const endDate = new Date(bookingDate.getFullYear(), bookingDate.getMonth(), bookingDate.getDate(), bookingEnd.getHours(), bookingEnd.getMinutes());

          // Create title with booking_id, customer_id, and vehicle_id
          const title = `${booking.registration_number} - ${booking.services}`;

          return {
            title: title,
            start: startDate,
            end: endDate,
            booking_status: booking.booking_status,
          };
        });

        // console.log("Transformed Events Data:", eventsData);

        // Update state with events
        setEvents(eventsData);

        // Log to verify if events are passed to the Calendar component
        //console.log("Events passed to Calendar:", eventsData);
      } catch (error) {
        console.error("Error fetching or transforming bookings:", error);
      }
    };

    fetchAndTransformBookings();
  }, [bookings]); // Trigger useEffect whenever bookings data changes

  // Add console log to verify if events state is updated
  useEffect(() => {
    console.log("Events State:", events);
  }, [events]);

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
                        {" "}
                        {user.first_name} {user.last_name}
                      </div>
                      {/* <button type="button" className="font-semibold text-indigo-900 hover:text-indigo-900">
                        Update
                      </button> */}
                    </dd>
                  </div>
                  <div className="pt-6 sm:flex">
                    <dt className="font-medium text-gray-900 sm:w-64 sm:flex-none sm:pr-6">Password</dt>
                    <dd className="mt-1 flex justify-between gap-x-6 sm:mt-0 sm:flex-auto">
                      <div className="text-gray-900"></div>
                      <button type="button" className="font-semibold text-indigo-900 hover:text-indigo-900">
                        Update
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
                  {location
                    .filter((garage: GarageName) => garage.location_id === user.location_id)
                    .map((garage: GarageName) => (
                      <div key={garage.location_id}>
                        <div className="pt-6 sm:flex">
                          <dt className="font-medium text-gray-900 sm:w-64 sm:flex-none sm:pr-6">Garage Name</dt>
                          <dd className="mt-1 flex justify-between gap-x-6 sm:mt-0 sm:flex-auto">
                            <div className="text-gray-900">{garage.location_name}</div>
                          </dd>
                        </div>
                        <div className="pt-6 sm:flex">
                          <dt className="font-medium text-gray-900 sm:w-64 sm:flex-none sm:pr-6">Garage Address</dt>
                          <dd className="mt-1 flex justify-between gap-x-6 sm:mt-0 sm:flex-auto">
                            <div className="text-gray-900">
                              {garage.street}, {garage.city}, {garage.county}, {garage.country}, {garage.postcode}
                            </div>
                          </dd>
                        </div>
                        <div className="pt-6 sm:flex">
                          <dt className="font-medium text-gray-900 sm:w-64 sm:flex-none sm:pr-6">Garage Telephone Number</dt>
                          <dd className="mt-1 flex justify-between gap-x-6 sm:mt-0 sm:flex-auto">
                            <div className="text-gray-900">{garage.telephone}</div>
                          </dd>
                        </div>
                        <div className="pt-6 sm:flex">
                          <dt className="font-medium text-gray-900 sm:w-64 sm:flex-none sm:pr-6"> Garage Opening Hours</dt>
                          <dd className="mt-1 flex justify-between gap-x-6 sm:mt-0 sm:flex-auto">
                            <div className="text-gray-900">
                              {locations
                                .filter((location) => location.location_id === user.location_id)
                                .map((filteredLocation: GarageLocation) => (
                                  <div key={filteredLocation.location_id} className="" style={{ color: "#112D4E" }}>
                                    <p className="text-center">{formatOpeningHours(filteredLocation.openingHours)}</p>
                                  </div>
                                ))}
                            </div>
                          </dd>
                        </div>
                      </div>
                    ))}
                </dl>
              </div>
            )}

            {/* Customer Management setup */}
            {currentSection === "Customer Management" && (
              <div>
                <h2 className="text-3xl font-semibold leading-7 text-gray-900">Customer Management</h2>

                <dl className="mt-6 space-y-6 divide-y divide-gray-100 border-t border-gray-200 text-sm leading-6">
                  <Link to="/signup" className="mt-5 font-semibold text-indigo-900 hover:text-indigo-900 underline flex">
                    <UserPlusIcon className="h-6 w-6" />
                    Add New Customer
                  </Link>
                  <div className="pt-6 sm:flex">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="" style={{ backgroundColor: "#DBE2EF" }}>
                        <tr style={{ color: "#112D4E" }}>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                            Customer ID
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium  uppercase tracking-wider">
                            First Name
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium  uppercase tracking-wider">
                            Last Name
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                            Email
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium  uppercase tracking-wider">
                            Telephone
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {customers.map((customer: Customer) => (
                          <tr key={customer.customer_id} onClick={() => handleEditCustomer(customer)} className="hover:bg-gray-100 cursor-pointer">
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{customer.customer_id}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{customer.first_name}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{customer.last_name}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{customer.email}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{customer.telephone}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </dl>
              </div>
            )}

            {editingCustomer && (
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
                            Edit Customer
                          </h3>
                          <div className="mt-5">
                            <form method="post">
                              <div className="mt-4">
                                <label htmlFor="customer_id" className="block text-sm font-medium text-gray-700">
                                  Customer ID: {editingCustomer.customer_id}
                                </label>
                                <br></br>

                                <input type="hidden" name="customer_id" value={editingCustomer.customer_id} />
                                <label htmlFor="first_name" className="block text-sm font-medium text-gray-700">
                                  First Name
                                </label>
                                <input type="text" name="first_name" id="first_name" className="mt-1 focus:ring-indigo-900 focus:border-indigo-900 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md" value={editingCustomer?.first_name || ""} onChange={handleInputChange} />

                                <label htmlFor="last_name" className="block text-sm font-medium text-gray-700">
                                  Last Name
                                </label>
                                <input type="text" name="last_name" id="last_name" className="mt-1 focus:ring-indigo-900 focus:border-indigo-900 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md" value={editingCustomer?.last_name || ""} onChange={handleInputChange} />

                                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                  Email
                                </label>
                                <input type="text" name="email" id="firstemail_name" className="mt-1 focus:ring-indigo-900 focus:border-indigo-900 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md" value={editingCustomer?.email || ""} onChange={handleInputChange} />

                                <label htmlFor="telephone" className="block text-sm font-medium text-gray-700">
                                  Telephone
                                </label>
                                <input type="text" name="telephone" id="telephone" className="mt-1 focus:ring-indigo-900 focus:border-indigo-900 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md" value={editingCustomer?.telephone || ""} onChange={handleInputChange} />
                              </div>
                              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                                <button type="submit" className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 text-base font-medium text-white sm:ml-3 sm:w-auto sm:text-sm" style={{ backgroundColor: "#112D4E" }}>
                                  Save
                                </button>
                                <button onClick={() => setEditingCustomer(null)} type="button" className="mt-3 w-full inline-flex justify-center rounded-md border bg-red-600 border-red-900 shadow-sm px-4 py-2 text-base font-medium text-white sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm">
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
            {currentSection === "Booking Management" && <BookingManagement bookings={bookings} />}
          </div>
        </main>
      </div>
    </>
  );
}
