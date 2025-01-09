import React, { ChangeEvent, SetStateAction, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Breadcrumbs from './breadcrumbs';

export default function WindscreenRepairService() {
  const [registration, setRegistration] = useState("");
  const [postCode, setPostCode] = useState("");
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const breadcrumbPaths = [
    { label: 'Services', url: '/service' },
    { label: 'Oil and Brake Repairs', url: '/oilAndBrakeRepairs' },
    { label: 'Premium Oil and Brake Service', url: '/premiumOil' },
  ];

  const handleRegistrationChange = (e: ChangeEvent<HTMLInputElement>) => {
    setRegistration(e.target.value);
  };

  const handlePostCodeChange = (e: ChangeEvent<HTMLInputElement>) => {
    setPostCode(e.target.value);
  };

  const handleDateChange = (date: SetStateAction<Date | null>) => {
    setSelectedDate(date);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Handle form submission logic here
  };

  return (
    <div className="flex items-center justify-center h-screen">

      {/* Breadcrumbs */}
      <div className="fixed inset-x-0 px-6 py-3 flex flex-row justify-between mx-auto w-full top-28 pl-18">
        <Breadcrumbs paths={breadcrumbPaths} />
      </div>

      {/* Windscreen Repair Service Content */}
      <div className="mt-16 max-w-md p-6 bg-white rounded shadow-md mx-auto">
        {/* Header */}
        <h1 className="text-3xl font-bold mb-4 text-center" style = {{color:"#112D4E"}}>Premium Oil and Brake Service</h1>

        {/* Image */}
        <img
          src="/images/windscreen-repair.png" // Replace with the actual path 
          alt="Service Image"
          className="mx-auto mb-4 rounded-lg"
          style={{ maxWidth: "150px", height: "auto" }}
        />

        {/* Service Details */}
        <p>
          <span className="font-bold" style = {{color:"#112D4E"}}>Starting from £99.99*</span>
        </p>
        <p style = {{color:"#3F72AF"}}>*Prices vary by location and vehicle. Add your details below to get your personalized price</p>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-4">
          {/* Registration Input */}
          <label htmlFor="registration" className="block mb-2 text-sm " style={{ color: "#112D4E" }}>
            <span className="text-navy-blue-500 font-bold">Vehicle Registration:</span>
            <input type="text" id="registration" name="registration" className="border p-2 w-full mt-1" placeholder="Enter Vehicle Registration" onChange={handleRegistrationChange} />
          </label>

          {/* Post Code Input */}
          <label htmlFor="postCode" className="block mb-2 text-sm " style={{ color: "#112D4E" }}>
            <span className="text-navy-blue-500 font-bold">Post Code:</span>
            <input type="text" id="postCode" name="postCode" className="border p-2 w-full mt-1" placeholder="Enter Post Code" onChange={handlePostCodeChange} />
          </label>

          {/* Calendar */}
          {registration && postCode && (
            <div className="mb-4">
              <label className="block mb-2 text-sm " style={{ color: "#112D4E" }}>
                <span className="text-navy-blue-500 font-bold">Select Repair Date:</span>
                <DatePicker selected={selectedDate} onChange={handleDateChange} dateFormat="dd/MM/yyyy" />
              </label>
            </div>
          )}

          {/* Book Now Button */}
          <button
            type="submit"
            className={`bg-blue-900 text-white px-4 py-2 rounded hover:bg-blue-700 ${!(selectedDate && registration && postCode) ? "opacity-50 cursor-not-allowed" : ""}`}
            disabled={!(selectedDate && registration && postCode)}
          >
            Book Now
          </button>
        </form>
      </div>
    </div>
  );
}
