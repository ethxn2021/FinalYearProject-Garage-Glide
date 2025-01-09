import { useFetcher } from "@remix-run/react";
import moment from "moment";
import { useEffect, useState } from "react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "react-datepicker/dist/react-datepicker.css"; // date picker styles
import { BookingDetails } from "~/utils/db.server";
import AddNewBookingModal from "./modals/AddNewBookingModal";
import SuccessBookingModal from "./modals/SuccessBookingModal";

export const bookingTimeOptions = ["9:00 AM", "9:30 AM", "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM", "12:00 PM", "12:30 PM", "13:00 PM", "13:30 PM", "14:00 PM", "14:30 PM", "15:00 PM", "15:30 PM", "16:00 PM"];

interface Event {
  title: string;
  start: Date;
  end: Date;
  booking_status: string;
  booking_id: number;
  details: BookingDetails;
}

interface BookingResponse {
  booking_id: number;
  registration_number: string;
  services: string;
  booking_date: number;
  booking_start: number;
  booking_end: number;
  booking_status: string;
  location_id: number;
  details: BookingDetails;
}

export default function BookingManagement({ bookings }: { bookings: BookingResponse[] }) {
  const [events, setEvents] = useState<Event[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [booking, setBooking] = useState<Event | null>(null);
  const [cancelBooking, setCancelBooking] = useState(false);
  const [confirmBooking, setConfirmBooking] = useState(false);
  const [paymentMethodModal, setPaymentMethodModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"Cash" | "Card">("Cash");
  const localizer = momentLocalizer(moment);
  const bookingFormFetcher = useFetcher();

  const [successModal, setSuccessModal] = useState(false);

  const newBookingFetcher = useFetcher();

  useEffect(() => {
    if (newBookingFetcher?.data?.isCreated === true) {
      setShowForm(false);
      setSuccessModal(true);
    }
  }, [newBookingFetcher.data]);

  const handleAddBooking = () => {
    setShowForm(true);
    //console.log("New Booking button clicked!");
  };

  const handleEventClick = async (event: Event) => {
    if (event) {
      setBooking(event);
    }
  };

  async function handleConfirmBooking(booking: Event) {
    if (booking?.details?.payment_status !== "Paid") {
      setPaymentMethodModal(true);
    }

    return;
  }

  // useEffect hook to fetch and transform bookings into events
  useEffect(() => {
    const fetchAndTransformBookings = async () => {
      try {
        // Check if bookings data is available
        if (!bookings || bookings.length === 0) {
          console.log("No bookings data available.");
          return; // Exit early if no data is available
        }

        // Transform booking data into events
        const eventsData = bookings.map((booking: BookingResponse) => {
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
            booking_id: booking.booking_id,
            details: booking.details,
          };
        });

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

  useEffect(() => {
    if (bookingFormFetcher?.data?.ok === true) {
      setCancelBooking(false);
      setConfirmBooking(false);
      setPaymentMethodModal(false);
      setBooking(null);
    }
  }, [bookingFormFetcher.data]);

  return (
    <div>
      <h2 className="text-3xl font-semibold leading-7 text-gray-900">Bookings</h2>

      <dl className="mt-6 space-y-6 divide-y divide-gray-100 border-t border-gray-200 text-sm leading-6">
        <div className="calendar-container" style={{ height: 500 }}>
          <Calendar
            localizer={localizer}
            events={events}
            startAccessor={(event) => new Date(event.start)} // Accessor for the start time
            endAccessor={(event) => new Date(event.end)} // Accessor for the end time
            defaultView="month" // Set the default view to month
            eventPropGetter={(event) => {
              const style = {
                backgroundColor: event.booking_status === "Active" ? "blue" : event.booking_status === "Confirmed" ? "green" : event.booking_status === "Cancelled" ? "red" : "grey", // Set background color based on booking status
                color: "#fff", // Text color
                borderRadius: "25px", // Border radius
                padding: "5px 10px", // Padding
                boxShadow: "0 2px 4px rgba(0,0,0,0.2)", // Box shadow
              };
              return {
                style,
              };
            }}
            onSelectEvent={handleEventClick} // Handle event click
          />

          <div className="flex items-center gap-6">
            <button onClick={handleAddBooking} className=" hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-md mb-4" style={{ backgroundColor: "#112D4E", marginTop: "1rem" }}>
              Add New Booking
            </button>
          </div>
        </div>

        <div>
          {booking && (
            <div>
              <div className="fixed top-0 left-0 w-full h-full bg-gray-900 bg-opacity-50 flex justify-center items-center z-50">
                <div className="bg-white rounded shadow-lg mt-32 max-w-sm w-full relative">
                  <div className="px-4 py-3">
                    <p>Booking Number: {booking?.booking_id}</p>
                    <p>Customer: {booking?.details.Customer_Name}</p>
                  </div>

                  <button
                    className="absolute top-0 right-0 border border-red-400 bg-red-300 w-7 h-7 flex items-center justify-center"
                    onClick={() => {
                      setBooking(null);
                    }}
                  >
                    <span>X</span>
                  </button>

                  <div className="flex items-center justify-around border-t-2 border-b-2 border-gray-900 py-1 mb-3">
                    <p>Date: {moment(booking?.details.booking_date).format("DD/MM/YYYY")}</p>
                    <p>
                      Time: {moment(booking?.start).format("HH:mm")} to {moment(booking?.end).format("HH:mm")}
                    </p>
                  </div>

                  <div className="px-4">
                    <p>{booking?.details?.Vehicle_Registration}</p>
                    <p>
                      {booking?.details?.Vehicle_Make} {booking?.details?.Vehicle_Colour}
                    </p>
                  </div>

                  <div className="px-4 mt-4 max-h-[200px] h-full overflow-y-auto">
                    <table className="table border-collapse border border-gray-900 w-full">
                      <thead>
                        <tr>
                          <th className="border border-gray-900 p-2">Service</th>
                          <th className="border border-gray-900 p-2">Qty</th>
                          <th className="border border-gray-900 p-2">Cost</th>
                        </tr>
                      </thead>

                      <tbody>
                        {booking?.details?.Services_Details?.split(", ")?.map((item) => {
                          const [serviceName, _] = item.split(" (x");
                          const [quantity, price] = _.split(" @ ");

                          return (
                            <tr>
                              <td className="border border-gray-900 p-2">{serviceName}</td>
                              <td className="border border-gray-900 p-2">{quantity}</td>
                              <td className="border border-gray-900 p-2">{price?.slice(0, -1)}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  <div className="px-4 mt-4">
                    <h4>Payment:</h4>
                    <div className="grid grid-cols-2">
                      <p>Status: {booking?.details?.payment_status}</p>
                      <p>Gross: {booking?.details?.Gross_Amount}</p>
                      <p>Method: {booking?.details?.Payment_Method}</p>
                      <p>Discount: {booking?.details?.Discount_Applied}</p>
                      <p>Amount: {booking?.details?.Total_Amount_Paid}</p>
                      <p>Net Amount: {booking?.details?.Net_Amount}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-around my-5">
                    <button
                      className="border border-red-600 px-5 py-1 rounded"
                      onClick={() => {
                        setCancelBooking(true);
                      }}
                    >
                      Cancel
                    </button>
                    <button
                      className="bg-blue-300 px-5 py-1 rounded"
                      onClick={() => {
                        setConfirmBooking(true);
                      }}
                    >
                      Confirm
                    </button>
                  </div>
                </div>
              </div>

              {cancelBooking && (
                <div className="fixed top-0 left-0 w-full h-full bg-gray-900 bg-opacity-50 flex justify-center items-center z-50">
                  <div className="bg-white rounded shadow-lg mt-32 max-w-xs w-full relative">
                    <button
                      className="absolute top-0 right-0 border border-red-400 bg-red-300 w-7 h-7 flex items-center justify-center"
                      onClick={() => {
                        setCancelBooking(false);
                      }}
                    >
                      <span>X</span>
                    </button>

                    <bookingFormFetcher.Form method="post" action="/api/booking">
                      <div className="p-5 mt-6">
                        <p className="text-center font-semibold max-w-[9.5rem] mx-auto">Are you sure you want to cancel the booking?</p>
                        <div className="flex items-center justify-center gap-6 my-5">
                          <input type="hidden" name="booking-id" value={booking.booking_id} />
                          <button className="border border-red-600 px-5 py-1 rounded" type="submit" name="intent" value="cancel-booking">
                            Yes
                          </button>
                          <button
                            type="button"
                            className="bg-blue-300 px-5 py-1 rounded"
                            onClick={() => {
                              setCancelBooking(false);
                            }}
                          >
                            No
                          </button>
                        </div>
                      </div>
                    </bookingFormFetcher.Form>
                  </div>
                </div>
              )}

              {confirmBooking && (
                <div className="fixed top-0 left-0 w-full h-full bg-gray-900 bg-opacity-50 flex justify-center items-center z-50">
                  <div className="bg-white rounded shadow-lg mt-32 max-w-xs w-full relative">
                    <button
                      className="absolute top-0 right-0 border border-red-400 bg-red-300 w-7 h-7 flex items-center justify-center"
                      onClick={() => {
                        setConfirmBooking(false);
                      }}
                    >
                      <span>X</span>
                    </button>

                    <bookingFormFetcher.Form action="/api/booking" method="post">
                      <div className="p-5 mt-6">
                        <p className="text-center font-semibold max-w-[10rem] mx-auto">Are you sure you want to confirm the booking?</p>
                        <input type="hidden" name="booking-id" value={booking.booking_id} />

                        <input type="hidden" name="payment-method" value={paymentMethod} />
                        <div className="flex items-center justify-center gap-6 my-5">
                          <button type={booking?.details?.payment_status === "Paid" ? "submit" : "button"} onClick={() => handleConfirmBooking(booking)} className="border border-red-600 px-5 py-1 rounded" name="intent" value="confirm-booking">
                            Yes
                          </button>
                          <button
                            className="bg-blue-300 px-5 py-1 rounded"
                            type="button"
                            onClick={() => {
                              setConfirmBooking(false);
                            }}
                          >
                            No
                          </button>
                        </div>
                      </div>
                    </bookingFormFetcher.Form>
                  </div>
                </div>
              )}

              {paymentMethodModal && (
                <div className="fixed top-0 left-0 w-full h-full bg-gray-900 bg-opacity-50 flex justify-center items-center z-50">
                  <div className="bg-white rounded shadow-lg mt-32 max-w-xs w-full">
                    <div className="p-5 mt-6">
                      <p className="text-center font-semibold max-w-[9.5rem] mx-auto">Please select payment method</p>

                      <bookingFormFetcher.Form action="/api/booking" method="post">
                        <input type="hidden" name="booking-id" value={booking.booking_id} />

                        <input type="hidden" name="payment-method" value={paymentMethod} />

                        <div className="flex items-center justify-center gap-6 my-5">
                          <button
                            className={`border border-blue-600 px-5 py-1 rounded ${paymentMethod === "Cash" ? "bg-blue-600 text-white" : ""}`}
                            onClick={() => {
                              setPaymentMethod("Cash");
                            }}
                          >
                            Cash
                          </button>

                          <button
                            className={`border border-lime-600 px-5 py-1 rounded ${paymentMethod === "Card" ? "bg-lime-600 text-white" : ""}`}
                            onClick={() => {
                              setPaymentMethod("Card");
                            }}
                          >
                            Card
                          </button>
                        </div>

                        <div className="mt-3 flex justify-center">
                          <button className="bg-blue-300 px-5 py-1 rounded" type="submit" name="intent" value="confirm-payment">
                            Confirm
                          </button>
                        </div>
                      </bookingFormFetcher.Form>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {successModal && <SuccessBookingModal setSuccessModal={setSuccessModal} booking={newBookingFetcher?.data?.booking} />}

        {showForm && <AddNewBookingModal setShowForm={setShowForm} newBookingFetcher={newBookingFetcher} />}
      </dl>
    </div>
  );
}
