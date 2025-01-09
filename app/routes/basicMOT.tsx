import React, { ChangeEvent, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useLocation } from "@remix-run/react";
import Cookies from "js-cookie";

export default function BasicMOT() {
  const location = useLocation();

  const [registration, setRegistration] = useState<string>(
    Cookies.get("selectedRegistration") || ""
  );
  const [postCode, setPostCode] = useState<string>(
    Cookies.get("selectedPostcode") || ""
  );
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<Date | null>(null);

  const handleRegistrationChange = (e: ChangeEvent<HTMLInputElement>) => {
    setRegistration(e.target.value);
  };

  const handlePostCodeChange = (e: ChangeEvent<HTMLInputElement>) => {
    setPostCode(e.target.value);
  };

  const handleDateChange = (date: Date | null) => {
    setSelectedDate(date);
  };

  const handleTimeChange = (time: Date | null) => {
    setSelectedTime(time);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
  };

  return (
    <div className="flex items-center justify-center h-screen">
      <div className="mt-16 max-w-md p-6 bg-white rounded shadow-md mx-auto">
        <form onSubmit={handleSubmit} className="mt-4">
          {/* Registration Input */}
          <label htmlFor="registration" className="block mb-2 text-sm text-gray-700">
            <span className="text-navy-blue-500 font-bold">Registration:</span>
            <input
              type="text"
              id="registration"
              name="registration"
              className="border p-2 w-full mt-1"
              placeholder="Enter Registration"
              value={registration}
              onChange={handleRegistrationChange}
            />
          </label>

          {/* Post Code Input */}
          <label htmlFor="postCode" className="block mb-2 text-sm text-gray-700">
            <span className="text-navy-blue-500 font-bold">Post Code:</span>
            <input
              type="text"
              id="postCode"
              name="postCode"
              className="border p-2 w-full mt-1"
              placeholder="Enter Post Code"
              value={postCode}
              onChange={handlePostCodeChange}
            />
          </label>

          {/* Date and Time Pickers */}
          <div className="mb-4">
            <label className="block mb-2 text-sm text-gray-700">
              <span className="text-navy-blue-500 font-bold">Select Date:</span>
              <DatePicker
                selected={selectedDate}
                onChange={handleDateChange}
                dateFormat="dd/MM/yyyy"
                minDate={new Date()}
                className="border p-2 mt-1"
              />
            </label>
          </div>
          <div className="mb-4">
            <label className="block mb-2 text-sm text-gray-700">
              <span className="text-navy-blue-500 font-bold">Select Time:</span>
              <input
                type="time"
                className="border p-2 mt-1"
                value={selectedTime ? selectedTime.toTimeString().slice(0, 5) : ""}
                onChange={(e) => handleTimeChange(new Date(`2000-01-01T${e.target.value}:00Z`))}
              />
            </label>
          </div>

          {/* Book Now Button */}
          <button
            type="submit"
            className={`bg-blue-900 text-white px-4 py-2 rounded hover:bg-blue-700 ${
              !(selectedDate && selectedTime && registration && postCode) ? "opacity-50 cursor-not-allowed" : ""
            }`}
            disabled={!(selectedDate && selectedTime && registration && postCode)}
          >
            Book Now
          </button>
        </form>
      </div>
    </div>
  );
}
