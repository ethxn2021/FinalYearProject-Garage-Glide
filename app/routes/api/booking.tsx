import { ActionFunction, LoaderFunction, json } from "@remix-run/node";
import { TVehicleDetails } from "~/components/admin/modals/ExistingCustomerModal";
import { getDateFromTimeString, getTimeStringFromDate } from "~/libs/convertTime";
import {
  PaymentMethodOptions,
  Services,
  confirmBookingAndDeductInventory,
  createBookingService,
  createNewBooking,
  getBookingDetails,
  getCustomerByEmail,
  getVehicle,
  getVehicleById,
  insertTransaction,
  insertVehicle,
  reactivateCustomerAcc,
  refundTransaction,
  updateStatusAfterCancel,
} from "~/utils/db.server";

function isValidEmail(email: string) {
  var re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

export const loader: LoaderFunction = async ({ request }) => {
  const booking = await getBookingDetails(2);

  return json({ booking });
};

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const intent = formData.get("intent");

  if (intent === "customer-action") {
    const email = formData.get("customer-mail") as string;
    if (!email) return json({ customer: { error: "Email is required!" } });

    if (!isValidEmail(email)) return json({ customer: { error: "Invalid Email!" } });

    const customer = await getCustomerByEmail(email);
    if (customer?.length === 0) return json({ customer: { error: "Email not found!" } });

    return json({ customer: customer.find((el) => el) });
  }

  // action - confirm booking
  else if (intent === "booking-action") {
    const customerId = formData.get("customerId") as string;
    const customerEmail = formData.get("c-email") as string;

    const services_field = formData.get("services") as string;
    const location_field = formData.get("location") as string;
    const booking_date = formData.get("booking-date") as string;
    const booking_start_time = formData.get("booking-time") as string;
    const registration_number = formData.get("vrn") as string;
    const vehicle_details = formData.get("vehicle-details") as string;
    const services = JSON.parse(services_field) as Services[];
    const vehicleDetails = JSON.parse(vehicle_details) as TVehicleDetails & {
      registration_number: string;
    };
    let response = await getVehicle(registration_number, customerId);

    const _loc = location_field.split(":");
    const [locationId, locationName] = _loc;

    if (response.length === 0) {
      console.log("------- no vehicle");
      const { color, fuelType, make, registrationYear, registration_number } = vehicleDetails;

      const res = await insertVehicle(registration_number, customerId, color, make, registrationYear, fuelType, 0);

      if (res) {
        response = await getVehicleById(res?.insertId);
      }
    }

    const vehicle = response.find((el) => el);

    if (services.length === 0) return json({ error: { service: "Please select a service" } });
    if (locationId === "select") return json({ error: { location: "Please select location" } });
    if (booking_date === "") return json({ error: { date: "Please select a date" } });
    if (booking_start_time === "select") return json({ error: { time: "Please select time" } });

    const totalDuration = services.reduce((acc, item) => acc + item.duration, 0);

    // Get current date
    const bookingStartTime = getDateFromTimeString(booking_start_time);

    const bookingEndTime = new Date(bookingStartTime.getTime() + totalDuration * 3600000);

    const booking_start = getTimeStringFromDate(bookingStartTime);
    const booking_end = getTimeStringFromDate(bookingEndTime);

    const newBooking = await createNewBooking({
      booking_date: booking_date,
      booking_start: booking_start,
      booking_end: booking_end,
      customer_id: customerId,
      location_id: locationId,
      vehicle_id: vehicle?.vehicle_id as string,
    });

    if (newBooking) {
      for (const service of services) {
        await createBookingService(newBooking?.insertId, service.service_id, 1);
      }

      const booking = await getBookingDetails(newBooking?.insertId);

      return json({
        isCreated: true,
        booking: {
          ...booking,
          locationName,
          customerEmail,
        },
      });
    }

    return json(null);
  }

  // action - reactivate customer account
  else if (intent === "reactive-action") {
    const email = formData.get("customer-mail") as string;
    const updated = await reactivateCustomerAcc(email);

    if (updated.affectedRows === 1) {
      const customer = await getCustomerByEmail(email);
      if (customer?.length === 0) return json({ error: "Email not found!" });

      return json({ customer: customer.find((el) => el) });
    }

    return json(null);
  }

  // action - cancel booking
  else if (intent === "cancel-booking") {
    const bookingId = parseInt(formData.get("booking-id") as string);
    const booking = await getBookingDetails(bookingId);

    if (booking?.payment_status === "Paid") {
      try {
        const res = await refundTransaction(booking);
        console.log("------ refund", res);
      } catch (error) {
        console.log("Error refund transaction");
      }
    }

    const res = await updateStatusAfterCancel(booking);
    console.log("------ update status", res);

    return json({ ok: true });
  }

  // action - confirm booking
  else if (intent === "confirm-booking" || intent === "confirm-payment") {
    const bookingId = parseInt(formData.get("booking-id") as string);
    const paymentMethod = formData.get("payment-method");

    const booking = await getBookingDetails(bookingId);

    if (booking.payment_status === "Pending") {
      await insertTransaction(booking, paymentMethod as PaymentMethodOptions);
    }
    await confirmBookingAndDeductInventory(booking.Booking_Number);

    return json({ ok: true });
  }

  return null;
};
