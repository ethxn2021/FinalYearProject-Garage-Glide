import { Calendar, momentLocalizer } from "react-big-calendar";
import { useState, useEffect } from "react";
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { useLoaderData } from "@remix-run/react";
import moment from "moment";
import "react-datepicker/dist/react-datepicker.css"; // date picker styles
import { getUserRequired, getUser } from "~/session.server";
import { LoaderFunction } from "@remix-run/node";
import { getBookings, getLocations, getCustomer } from "~/utils/db.server";
import "react-big-calendar/lib/css/react-big-calendar.css";


// Define your event type
interface CalendarEvent {
  title: string;
  start: Date;
  end: Date;
}


type User = { staff_id: number; first_name: string; last_name: string; username: string };
type GarageName = { location_id: number; location_name: string; street: string; city: string; county: string; country: string; postcode: string; telephone: string };
type Customer = {customer_id: number; first_name:string; last_name:string; email:string; telephone:number}


function classNames(...classes: string[]) {
    return classes.filter(Boolean).join(" ");
  }

const locales = {
  'en-US': require('date-fns/locale/en-US'),
};

const localizer = momentLocalizer(moment);

export const loader: LoaderFunction = async ({ request }) => {
    try {
      // Fetch all necessary data using await for asynchronous operations
      let bookings = await getBookings();
      console.log('Fetched bookings data:', bookings);
  
      let customers = await getCustomer();
      console.log('Fetched customers data:', customers);
  
      let user = await getUserRequired(request); // Assuming this fetches the user based on the request
      console.log('Fetched user data:', user);
  
      let location = await getLocations();
      console.log('Fetched location data:', location);
  
      // Deleting sensitive information from the user object before returning it
      delete user.password; // Ensure the user object actually has a password field to delete
  
      // Returning an object with all the fetched data
      return { bookings, user, location, customers };
    } catch (error) {
      console.error('Error loading data:', error);
      // Return an empty object or handle the error as needed
      return {};
    }
  };
    

  type Booking = {
    booking_id: number;
    customer_id: number;
    vehicle_id: number;
    booking_date: number;
    booking_start: number;
    booking_end: number;
    isActive: number;
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
  

const MyCalendar: React.FC = () => {
    
    const { bookings } = useLoaderData();
    console.log("Bookings from loader: ", bookings);


    
    const [currentSection, setCurrentSection] = useState("User Information");
    const { user, location, customers } = useLoaderData();

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
  const [modifiedEndTime, setModifiedEndTime] = useState(""); // Initialize with default value if needed

  const localizer = momentLocalizer(moment);



  const handleAddBooking = () => {
    setShowForm(true);
    console.log("New Booking button clicked!");
  };

  const handleEventClick = (event: Event) => {
    setSelectedEvent(event);
    console.log("Selected Event:", event);
  };

  const handleModify = () => {
    setIsModifying(true); // modifying mode
  };

  const handleSaveModification = () => {
    console.log("Selected event:", selectedEvent);
    console.log("Modified service type:", modifiedServiceType);
    console.log("Modified car registration:", modifiedCarRegistration);
    console.log("Modified date:", modifiedDate);
    console.log("Modified end time:", modifiedEndTime);

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

    console.log("Updated events:", updatedEvents);

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
        serviceType: serviceType, // Include serviceType in event
        carRegistration: carRegistration, // Include carRegistration in event
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

  const timeOptions = ["8:00 AM", "8:30 AM","9:00 AM", "9:30 AM", "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM", "12:00 PM", "12:30 PM", "13:00 PM", "13:30 PM", "14:00 PM", "14:30 PM", "15:00 PM", "15:30 PM", "16:00 PM"];

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
  
        console.log("Fetched bookings data:", bookings);
  
        // Transform booking data into events
        const eventsData = bookings.map((booking: Booking) => {
          const bookingDate = new Date(booking.booking_date);
          const bookingStart = new Date(`1970-01-01T${booking.booking_start}`);
          const bookingEnd = new Date(`1970-01-01T${booking.booking_end}`);
  
          // Combine date and time for start and end times
          const startDate = new Date(
            bookingDate.getFullYear(),
            bookingDate.getMonth(),
            bookingDate.getDate(),
            bookingStart.getHours(),
            bookingStart.getMinutes()
          );
  
          const endDate = new Date(
            bookingDate.getFullYear(),
            bookingDate.getMonth(),
            bookingDate.getDate(),
            bookingEnd.getHours(),
            bookingEnd.getMinutes()
          );
  
          // Create title with booking_id, customer_id, and vehicle_id
          const title = `Customer ID: ${booking.customer_id}, Vehicle ID: ${booking.vehicle_id}`;
  
          return {
            title: title,
            start: startDate,
            end: endDate,
          };
        });
  
        // Log the transformed events data
        console.log("Transformed Events Data:", eventsData);
  
        // Update state with events
        setEvents(eventsData);
  
        // Log to verify if events are passed to the Calendar component
        console.log("Events passed to Calendar:", eventsData);
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
    <div className="calendar-container" style={{ height: 500 }}>


      {/* Calendar component */}
      <Calendar
                          localizer={localizer}
                          events={events}
                          startAccessor={(event) => new Date(event.start)} // Accessor for the start time
                          endAccessor={(event) => new Date(event.end)}     // Accessor for the end time
                          defaultView="month" // Set the default view to month
                          eventPropGetter={(event, start, end, isSelected) => {
                            const style = {
                              backgroundColor: "#3174ad", // Background color
                              color: "#fff", // Text color
                              borderRadius: "25px", // Border radius
                              padding: "5px 10px", // Padding
                              boxShadow: "0 2px 4px rgba(0,0,0,0.2)", // Box shadow
                            };
                            return {
                              style,
                            };
                          }}
                          onSelectEvent={handleEventClick}
                        />

{selectedEvent && (
                          <div className="event-details border border-gray-300 p-4 rounded-md shadow-md">
                            <h2 className="text-lg font-bold mb-4">Event Details</h2>
                            <p className="mb-2">
                              <span className="font-bold">Service:</span> {selectedEvent.serviceType}
                            </p>
                            <p className="mb-2">
                              <span className="font-bold">Car Registration:</span> {selectedEvent.carRegistration}
                            </p>
                            <p className="mb-2">
                              <span className="font-bold">Date:</span> {selectedEvent.start.toLocaleDateString()}
                            </p>
                            <p className="mb-2">
                              <span className="font-bold">Time:</span> {selectedEvent.start.toLocaleTimeString()} - {selectedEvent.end.toLocaleTimeString()}
                            </p>
                            <button className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-md mr-2" onClick={handleModify}>
                              Modify
                            </button>
                            <button className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-md" onClick={() => setSelectedEvent(null)}>
                              Close
                            </button>
                          </div>
                        )}


{/* Button to add new booking */}
<button
        onClick={handleAddBooking}
        className="hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-md mb-4"
        style={{ backgroundColor: '#112D4E', marginTop: '1rem' }}
      >
        Add New Booking
</button>

{/* Form for adding new booking */}
{showForm && (
        <form onSubmit={handleFormSubmit}>
          <label>
            Car Registration:
            <input type="text" name="registration" required />
          </label>
          <br />
          <label>
            Services:
            <input type="text" name="services" required />
          </label>
          <br />
          <label>
            Start Date/Time:
            <input type="datetime-local" name="startTime" required />
          </label>
          <br />
          <label>
            End Date/Time:
            <input type="datetime-local" name="endTime" required />
          </label>
          <br />
          <button type="submit">Submit Booking</button>
        </form>
      )}
    </div>
  );
};

export default MyCalendar;
