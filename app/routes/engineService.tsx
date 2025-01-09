import { addBasket } from "~/utils/db.server";
import { ActionFunction, LoaderFunction, json, redirect } from "@remix-run/node";
import { badActionData } from "~/utils";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { ChangeEvent, useEffect, useState } from "react";
import Cookies from "js-cookie";
import { getCustomerDetails, requireCustomerLogin } from "~/customer.server";
import { getengineservice } from "./data";


export const loader: LoaderFunction = async ({ request }) => {
  let data = await getengineservice();
  return { data };
};
type Service = { service_name: string; price: string };


export const action: ActionFunction = async ({ request }) => {


  const body = await request.formData();
  const timeValue = body.get("time")?.toString();
  const postcodeValue = body.get("postcode")?.toString();
  const centre = body.get("selectedCentre")?.toString();
  const regValue = body.get("registration")?.toString();
  const dateValue = body.get("date")?.toString();

  try {
     // Get the form data from the request

    const customerId = await requireCustomerLogin(request);
    const customerDetails = await getCustomerDetails(customerId);

    console.log(customerDetails);

    const basketData = {
      first_name: customerDetails.first_name, 
      last_name: customerDetails.last_name,
      vehicle_id: 1, 
      customer_id: customerId, 
      registration_number: regValue ?? "",
      postcode: postcodeValue ?? "",
      date: new Date(dateValue ?? ""),
      time: timeValue ?? "",
      service_type: "Engine Service", 
      price: 129.99, 
      selectedCentre: centre ?? "", 
    };

    const success = await addBasket(basketData);

    if (success) {
      return redirect("/basket");
    } else {
      console.error("Booking insertion failed.");
    }

    return json({ success: true });
  } catch (error) {
    console.log("error inputting basket item");
    return redirect("/login/customer");
  }
};
export default function EngineService() {
  const [registration, setRegistration] = useState(Cookies.get('registration') || '');
  const [selectedPostcode, setPostcode] = useState(Cookies.get('postcode') || '');
  const [selectedCentre, setSelectedCentre] = useState(Cookies.get('selectedCentre') || '');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [editMode, setEditMode] = useState(false);

  const breadcrumbPaths = [
    { label: 'Services', url: '/service' },
    { label: 'Engine Tune-Ups', url: '/engineTuneUps' },
    { label: 'Engine Tune-Up Service', url: '/engineService' },
  ];
  
  const handleRegistrationChange = (e: ChangeEvent<HTMLInputElement>) => {
    setRegistration(e.target.value);
  };

  const handlePostCodeChange = (e: ChangeEvent<HTMLInputElement>) => {
    setPostcode(e.target.value);
  };

  const handleDateChange = (date: Date | null) => {
    setSelectedDate(date);
    Cookies.set('selectedDate', date?.toISOString() ?? '');
  };

  const handleTimeChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setSelectedTime(e.target.value);
    Cookies.set('selectedTime', e.target.value);
  };
  

  const filterPastDates = (date: Date) => {
    return date.getTime() >= new Date().getTime();
  };

  const isWeekend = (date: Date) => {
    const day = date.getDay();
    return day === 0 || day === 6;
  };


  const timeOptions = () => {
    if (selectedDate && isWeekend(selectedDate)) {
      return ["10:00", "12:00", "14:00"];
    } else {
      return ["09:00", "11:00", "13:00", "15:00", "17:00"];
    }
  };
  

return (
<><div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
<div className="absolute top-5 right-5">
  <div className="relative">
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-8 w-8 cursor-pointer"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9 7a3 3 0 100-6 3 3 0 000 6zM21 21a2 2 0 01-2 2H5a2 2 0 01-2-2v-2h14a7 7 0 017 7h2v-2zm-2 0V12h3V7a5 5 0 00-5-5H4a2 2 0 00-2 2v11a5 5 0 007 4.472" />
    </svg>
  </div>
</div>

</div><div className="flex items-center justify-center h-screen">
  <div className="fixed inset-x-0 px-6 py-3 flex flex-row justify-between mx-auto w-full top-28 pl-18">
  </div>

  <div className="mt-16 max-w-md p-6 bg-white rounded shadow-md mx-auto">
    <h1 className="text-3xl font-bold mb-4 text-center">Engine Service</h1>

    <p>
      <span className="font-bold">From £129.99*</span>
    </p>
    <p>
      <span className="font-bold" style={{ color: "#3F72AF" }}>
        Book with an MOT and save £14.99
      </span>
    </p>
    <p>*Prices vary by location and vehicle. Add your details below to get your personalized price</p>

  <form className="mt-4" method="POST">
    <label htmlFor="registration" className="block mb-2 text-sm text-gray-700">
      <span className="text-navy-blue-500 font-bold">Registration:</span>
      <input
        type="text"
        id="registration"
        name="registration"
        className="border p-2 w-full mt-1"
        value={Cookies.get('registration')}
        onChange={handleRegistrationChange}

      />
    </label>



      <label htmlFor="postcode" className="block mb-2 text-sm text-gray-700">
        <span className="text-navy-blue-500 font-bold">Postcode:</span>
        <input
        type = "text"
          id="postcode"
          name="postcode"
          className="border p-2 w-full mt-1"
          value={Cookies.get('postcode')}
          onChange={handlePostCodeChange}
    
        />
      </label>
      

      <label className="block mb-2 text-sm text-gray-700">
        <span className="text-navy-blue-500 font-bold">Select Date:</span>
        <DatePicker
        id = "date"
          name = "date"
          selected={selectedDate}
          onChange={handleDateChange}
          dateFormat="yyyy-MM-dd"
          filterDate={filterPastDates} />
      </label>

      <label htmlFor="time" className="block mb-2 text-sm text-gray-700">
        <span className="text-navy-blue-500 font-bold">Select Time:</span>
        <select
          id="time"
          name="time"
          className="border p-2 w-full mt-1"
          value={selectedTime}
          onChange={handleTimeChange}
        >
          <option value="" disabled>Select a time</option>
          {timeOptions().map((time, index) => (
            <option key={index} value={time}>{time}</option>
          ))}
        </select>
      </label>

      <label htmlFor="selecetdCentre" className="block mb-2 text-sm text-gray-700">
        <span className="text-navy-blue-500 font-bold"></span>
        <input
        type = "text"
          id="selectedCentre"
          name="selectedCentre"
          className="border p-2 w-full mt-1"
          value={Cookies.get('selectedCentre')}
          style={{ display: 'none' }} 
        />
      </label>

      <input
        type="submit"
        value="Book Now"
        className={`bg-blue-900 text-white px-4 py-2 rounded hover:bg-blue-700 ${!(selectedDate && registration && selectedPostcode && selectedTime) || editMode ? "opacity-50 cursor-not-allowed" : ""}`}
        style={{ backgroundColor: "#112D4E", fontSize: "12px" }} />

    </form>
  </div>
</div></>


)
} 