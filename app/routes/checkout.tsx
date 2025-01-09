import React, { useState, useEffect } from "react";
import Cards, { Focused } from 'react-credit-cards-2';
import Cookies from 'js-cookie';
import { useNavigate } from 'react-router-dom';
import 'react-credit-cards-2/dist/es/styles-compiled.css';
import { addBooking, addTransaction, deleteBasketItemForCustomer, getLocationIdByName } from "~/utils/db.server";
import { getCars, getCustomerSession } from "~/customer.server";
import { ActionFunction, LoaderFunction, json, redirect } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";



export const loader: LoaderFunction = async ({ request }) => {
  const session = await getCustomerSession(request);
  const customerId = session.get("customer_id");

  
  

  return ({customerId});
}


export const action: ActionFunction = async ({ request }) => {

  const session = await getCustomerSession(request);
  const customerId = session.get("customer_id");
  const vehicleData = await getCars(customerId);
  const body = await request.formData();
  const priceValue = Number(body.get("price") ?? "");
  const centre = body.get("centre")?.toString() ?? "";
  const date = body.get("date");
  console.log(centre);
  const location = Number(await getLocationIdByName(centre)) ?? 0;
  console.log(location);

  
  const time = body.get("time")?.toString() ?? "";
  const hours = parseInt(time.slice(0, 2), 10);
  const newHours = ((hours + 2) % 24).toString().padStart(2, '0');
  const bookingEnd = newHours + time.slice(2);


  console.log(bookingEnd);



  const TransactionData = {
          booking_id: 1,
          transaction_date: new Date(),
          amount: priceValue,
          payment_method: 'Card',
          discount_id: null,
      };

  const bookingData = {
    customer_id: customerId,
    vehicle_id: vehicleData[0].vehicle_id ?? "",
    location_id: 1,
    booking_date: date ? new Date(date.toString()) : new Date(),
    booking_total: priceValue,
    booking_start: time,
    booking_end: bookingEnd,
    booking_status: 'Confirmed',
    payment_status: 'Paid',
  };
  


  try {

    const success = await deleteBasketItemForCustomer(customerId);
    const success_transaction = await addTransaction(TransactionData);
    const success_book = await addBooking(bookingData);

    if (success && success_transaction && success_book) {
      // Redirect to basket page upon successful booking
      return redirect("/orderconfirmation");
    } else {
      console.error("Basket deletion failed.");
      // Handle failure, e.g., show error message to the user
    }

    return json({ success: true, success_transaction: true, success_book: true});

  } catch (error) {
    console.error("Error deleting basket items:", error);
  }


  
  

};


export default function Checkout() {
  const customerId = useLoaderData();
  const navigate = useNavigate();



  const [billingAddress, setBillingAddress] = useState({
    addressLine1: "",
    addressLine2: "",
    city: "",
    county: "",
    country: "",
    postcode: "",
  });

        // Initialize orderSummary state
      const [orderSummary, setOrderSummary] = useState({
          subtotal: parseFloat(Cookies.get('totalPrice') || '0'),
          discount: 0,
          total: parseFloat(Cookies.get('totalPrice') || '0') // Retrieve total price from cookie
      });

  const handleChange = (e: { target: { name: any; value: any; }; }) => {
    const { name, value } = e.target;
    setBillingAddress((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmit = (e: { preventDefault: () => void; }) => {
    e.preventDefault();
  };



  const [state, setState] = useState({
    number: '',
    expiry: '',
    cvc: '',
    name: '',
    focus: '',
  });
  const [isCardDetailsFilled, setIsCardDetailsFilled] = useState(false);


  const handleInputChange = (evt) => {
    const { name, value } = evt.target;

    const validators = {
      number: (val) => /^\d{0,16}$/.test(val),
      expiry: (val) => /^\d{0,4}$/.test(val),
      cvc: (val) => /^\d{0,3}$/.test(val),
      name: (val) => /^[a-zA-Z\s]*$/.test(val), 
    };

    const isValid = validators[name] ? validators[name](value) : true;

    if (isValid) {
      setState((prev) => ({ ...prev, [name]: value }));
    }
    
  };
  const handleInputFocus = (evt) => {
    setState((prev) => ({ ...prev, focus: evt.target.name }));
  }

  const [showNotification, setShowNotification] = useState(false);

  const handleConfirmPayment = () =>{
    // Check if all the credit card details are filled
    console.log(customerId);
    if (state.number && state.name && state.expiry && state.cvc) {
      setShowNotification(true);
    } else {
      alert("Please fill out all credit card details.");
    }
  };



  return (
    <div className="flex items-center justify-center h-screen">
      {/* Billing Address Section */}
      <div className="px-4"> {/* Adjusted width and padding */}
        <form onSubmit={handleSubmit} className="border rounded shadow-md p-6">
          <h1 className="text-3xl font-bold mb-4">Billing Address</h1>
          <div className="mb-4 h-58 overflow-auto"> {/* Added height and overflow for scrolling */}
            {/* Address fields */}
            <div className="mb-4">
              <label htmlFor="addressLine1" className="block text-sm font-medium text-gray-700">
                Address Line 1 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="addressLine1"
                name="addressLine1"
                value={billingAddress.addressLine1}
                onChange={handleChange}
                required
                className="border-gray-300 mt-1 block w-full rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>

            <div className="mb-4">
              <label htmlFor="addressLine2" className="block text-sm font-medium text-gray-700">
                Address Line 2
              </label>
              <input
                type="text"
                id="addressLine2"
                name="addressLine2"
                value={billingAddress.addressLine2}
                onChange={handleChange}
                className="border-gray-300 mt-1 block w-full rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="city" className="block text-sm font-medium text-gray-700">
                  City <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="city"
                  name="city"
                  value={billingAddress.city}
                  onChange={handleChange}
                  required
                  className="border-gray-300 mt-1 block w-full rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
              <div>
                <label htmlFor="county" className="block text-sm font-medium text-gray-700">
                  County <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="county"
                  name="county"
                  value={billingAddress.county}
                  onChange={handleChange}
                  required
                  className="border-gray-300 mt-1 block w-full rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
              <div>
                <label htmlFor="country" className="block text-sm font-medium text-gray-700">
                  Country <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="country"
                  name="country"
                  value={billingAddress.country}
                  onChange={handleChange}
                  required
                  className="border-gray-300 mt-1 block w-full rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
            </div>

            <div className="mb-4">
              <label htmlFor="postcode" className="block text-sm font-medium text-gray-700">
                Postcode <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="postcode"
                name="postcode"
                value={billingAddress.postcode}
                onChange={handleChange}
                required
                className="border-gray-300 mt-1 block w-full rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
          </div>

          <div className="flex justify-between mt-4">
            <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
              Confirm
            </button>
            <button type="button" className="text-blue-500 hover:underline">
              Edit
            </button>
          </div>
        </form>
      </div>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
  <Cards
    number={state.number}
    expiry={state.expiry}
    cvc={state.cvc}
    name={state.name}
    focused={state.focus as Focused | undefined}
  />
  <form style={{ maxWidth: "400px", width: "100%" }} method="POST">
    <input
      type="number"
      name="number"
      placeholder="Card Number"
      value={state.number}
      onChange={handleInputChange}
      onFocus={handleInputFocus}
      style={{ marginBottom: "10px", padding: "10px", width: "100%" }} 
    />
    <input
      type="text"
      name="name"
      placeholder="Cardholder Name"
      value={state.name}
      onChange={handleInputChange}
      onFocus={handleInputFocus}
      style={{ marginBottom: "10px", padding: "10px", width: "100%" }}
    />
    <input
      type="number"
      name="expiry"
      placeholder="MM/YY Expiry"
      value={state.expiry}
      onChange={handleInputChange}
      onFocus={handleInputFocus}
      style={{ marginBottom: "10px", padding: "10px", width: "100%" }}
    />
    <input
      type="number"
      name="cvc"
      placeholder="CVC"
      value={state.cvc}
      onChange={handleInputChange}
      onFocus={handleInputFocus}
      style={{ marginBottom: "10px", padding: "10px", width: "100%" }}
    />


          <label htmlFor="price" className="block mb-2 text-sm text-gray-700">
            <span className="text-navy-blue-500 font-bold"></span>
            <input
              type="text"
              id="price"
              name="price"
              className="border p-2 w-full mt-1"
              value={Cookies.get('totalPrice')}
              style={{ display: 'none' }}
            />
          </label>

          <label htmlFor="centre" className="block mb-2 text-sm text-gray-700">
            <span className="text-navy-blue-500 font-bold"></span>
            <input
              type="text"
              id="centre"
              name="centre"
              className="border p-2 w-full mt-1"
              value={Cookies.get('selectedCentre')}
              style={{ display: 'none' }}
            />
          </label>

          <label htmlFor="time" className="block mb-2 text-sm text-gray-700">
            <span className="text-navy-blue-500 font-bold"></span>
            <input
              type="text"
              id="time"
              name="time"
              className="border p-2 w-full mt-1"
              value={Cookies.get('selectedTime')}
              style={{ display: 'none' }}
            />
          </label>

          <label htmlFor="date" className="block mb-2 text-sm text-gray-700">
            <span className="text-navy-blue-500 font-bold"></span>
            <input
              type="text"
              id="date"
              name="date"
              className="border p-2 w-full mt-1"
              value={Cookies.get('selectedDate')}
              style={{ display: 'none' }}
            />
          </label>

          <div className="absolute bottom-8 right-8">
            {/* onClick={handleConfirmPayment} */}
            <button type="submit" className="bg-green-500 text-white px-6 py-3 rounded-full shadow-md hover:bg-green-600 animate-pulse"  >
              Confirm Payment
            </button>
          </div>
        </form>
</div>
      {/* Order Summary Section */}
      <div className="w-1/3 pl-8 mt-10">
        <div className="border p-4 rounded-md mb-4">
          <h2 className="text-lg font-bold mb-2">Order Summary</h2>
          <p className="text-sm">Subtotal: £{orderSummary.subtotal}</p>
          <p className="text-sm">Discount: £{orderSummary.discount}</p>
          <p className="text-lg font-bold">Total: £{orderSummary.total}</p>
        </div>


      </div>
    </div>
  );
}
