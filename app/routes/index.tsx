import { Link, useNavigate } from "react-router-dom";
import React, { useState } from "react";
import homeBg from "public/images/home_bg.jpg";
import picture2 from "public/images/picture2.jpg";
import Cookies from 'js-cookie';  
import { geocodePostcode } from "./locationutils"; 


export default function Index() {
  const [registrationNumber, setRegistrationNumber] = useState(Cookies.get('registration') || '');  // Get registration from cookie
  const [postcode, setPostcode] = useState(Cookies.get('postcode') || '');  // Get postcode from cookie
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  const isValidPostcode = (postcode: string) => {
    // Regular expression for a UK postcode
    const postcodePattern = /^[A-Za-z]{1,2}\d{1,2}[A-Za-z]?\s?\d[A-Za-z]{2}$/;
    return postcodePattern.test(postcode);
  };

  const handleFormSubmit = async () => {
    const userLocation = await geocodePostcode(postcode);

    if (!userLocation) {
        console.error("User postcode could not be geocoded");
        return;
    }
    if (!isValidPostcode(postcode)) {
      setErrorMessage("Invalid postcode");
    } else {
      setErrorMessage('');
      // Form is valid, store values in cookies
      Cookies.set('registration', registrationNumber);
      Cookies.set('postcode', postcode);
      // Navigate to the next page
      navigate(`/selectCentre`);
    }
  };

  const formatRegistrationNumber = (input: string) => {
    // Convert to uppercase
    let formattedInput = input.toUpperCase();
    return formattedInput;
  };

  return (
    <div className="bg-contain">
      <div className="h-screen pt-20 flex justify-center items-center px-4 sm:px-6 lg:px-8" style={{ width: "100%", backgroundRepeat: "no-repeat", backgroundSize:"cover", backgroundImage: `url(${homeBg})`, backgroundAttachment: "fixed", backgroundPosition: "right"}}>
        <h1 className="text-center text-7xl font-semibold text-white">
          A REPAIR SHOP
          <br />
          YOU CAN TRUST
        </h1>
      </div>

      {/* Registration form sheet */}
      <div className="RegNumber" style={{ width: "100%", height: "5cm", backgroundColor: "#F9F7F7" }}>
        <h1 className="text-center font-semibold" style={{ color: "#112D4E", padding: "20px" }}>
          Fill in the form below and we will get
          <br />
          you started
        </h1>

        <section className="flex justify-center items-center">
          <div className="mx-2">
            <label htmlFor="registrationNumber" className="block font-extralight" style={{ fontSize: "16px" }}>
              Registration Number
            </label>
            <input type="text" id="registrationNumber" className="border-1 px-2 py-1 w-60" style={{ fontSize: "16px", borderColor: "#112D4E" }} value={formatRegistrationNumber(registrationNumber)} onChange={(e) => setRegistrationNumber(e.target.value)} />
          </div>
          <br />
          <div className="mx-2">
            <label htmlFor="postcode" className=" block font-extralight">
              Postcode
            </label>
            <input type="text" id="postcode" className="border-1 px- py-1 w-60" style={{ fontSize: "16px", borderColor: "#112D4E" }} value={postcode} onChange={(e) => setPostcode(e.target.value)} />
          </div>

          <button className="text-white font-light rounded-full px-9 py-2 ml-5 mt-5" style={{ backgroundColor: "#112D4E", fontSize: "16px" }} onClick={handleFormSubmit}>
            <Link to="#" className="block w-full h-full text-decoration-none text-inherit">
              Submit
            </Link>
          </button>
        </section>

        {errorMessage && (
          <p className="text-red-500 text-center mt-2" style={{ fontSize: "14px" }}>
            {errorMessage}
          </p>
        )}
      </div>

      {/* Picture */}
      <div className="picture flex justify-center items-center bg-fixed" style={{ height: "7cm", marginTop: "40px", backgroundImage: `url(${picture2})`, backgroundSize: "cover" }}></div>

      {/* Testimonials */}
      <div className="testimonial-container" style={{ alignItems: "center", marginTop: "100px", zIndex: "1" }}>
        <div className="testimonial-text basis-1/2" style={{ flexGrow: 5 }}>
          <h2 className="testimonial text-center" style={{ fontWeight: "bold", color: "#112D4E", fontSize: "42px" }}>
            Testimonials
          </h2>
          <p className = "text-align-center"style={{ color: "#112D4E", fontSize: "16px", fontWeight: "light" }}>
            "The team there are not just skilled mechanics, but also incredibly honest and transparent. They took the time to explain the issues with my car in terms I could understand and provided a fair quote. No hidden fees, no unnecessary repairs—just quality service. My car runs smoother than
            ever!"
          </p>
          <button className="find-out-more-button text-white font-light rounded-full px-9 py-2" style={{ backgroundColor: "#112D4E", fontSize: "16px", marginTop: "20px" }}>
            <Link to="/about" className="text-decoration-none">
              Find Out More
            </Link>
          </button>
        </div>
      </div>

      {/* Contact Section */}
      <section
        className="w-full"
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          alignItems: "center",
          backgroundColor: "#112D4E",
          zIndex: "0",
          padding: "20px",
          boxSizing: "border-box",
        }}
      >
        <h1 className="text-center" style={{ fontWeight: "bold", color: "white", fontSize: "42px", marginBottom: "20px" }}>
          Are You Interested in Our Services?
        </h1>

        <button
          className="contact-us-button font-light rounded-full px-9 py-2 mt-auto"
          style={{
            backgroundColor: "#F9F7F7",
            fontSize: "16px",
            color: "#4B6078",
            zIndex: "1",
          }}
        >
          <Link to="/contact" className="text-decoration-none text-inherit">
            Contact Us
          </Link>
        </button>
      </section>

      {/* Map */}
      <div className="map mt-5"></div>
    </div>
  );
}
