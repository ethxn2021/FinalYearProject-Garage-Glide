import Cookies from "js-cookie";
import { useEffect, useState } from "react";

export interface TServiceData {
  id: number;
  name: string;
  link: string;
  description: string;
}

export const servicesData = [
  {
    id: 1,
    name: "Car Servicing",
    link: "/CarServicing",
    description: "Ensure the optimal performance and longevity of your vehicle with our comprehensive car servicing. Our skilled technicians perform thorough maintenance to keep your car in top condition.",
  },
  {
    id: 2,
    name: "MOT",
    link: "/MOT",
    description: "Our MOT tests guarantee that your vehicle meets the necessary safety and environmental standards. Stay compliant and roadworthy with our reliable MOT services.",
  },
  {
    id: 3,
    name: "Tires Fix And Replacements",
    link: "/TiresFixAndReplacements",
    description: "From tire repairs to replacements, our service ensures your vehicle's safety and performance on the road. We address issues promptly and provide quality tire solutions.",
  },
  {
    id: 4,
    name: "Windscreen Repairs",
    link: "/WindscreenRepairs",
    description: "Trust us for effective windscreen repairs. Our technicians address chips and cracks, ensuring clear visibility and maintaining the structural integrity of your vehicle.",
  },
  {
    id: 5,
    name: "Oil and Brake Repairs",
    link: "/OilandBrakeRepairs",
    description: "Keep your vehicle's essential systems in check with our oil and brake repair services. We address issues promptly, ensuring smooth operation and safety on the road.",
  },
  {
    id: 6,
    name: "Battery Change",
    link: "/BatteryChange",
    description: "When it's time for a new battery, rely on our expert technicians for a seamless replacement. We provide reliable battery change services to keep your vehicle powered.",
  },
  {
    id: 7,
    name: "Diagnostic Check",
    link: "/DiagnosticCheck",
    description: "Our comprehensive diagnostic checks identify potential issues within your vehicle's systems. Stay proactive in addressing problems and ensure peak performance.",
  },
  {
    id: 8,
    name: "Engine TuneUps",
    link: "/EngineTuneUps",
    description: "Enhance your vehicle's performance with our engine tune-up services. Our skilled technicians optimize engine components to improve efficiency and reliability.",
  },
];

export default function ServicesPage() {
  const [postcode, setPostcode] = useState("");
  const [registration, setRegistration] = useState("");

  useEffect(() => {
    const selectedPostcode = Cookies.get("postcode");
    const selectedRegistration = Cookies.get("registration");

    if (selectedPostcode && selectedRegistration) {
      setPostcode(selectedPostcode);
      setRegistration(selectedRegistration);
    }
  }, []);

  return (
    <div className="py-24 sm:py-32 mx-auto">
      <div className="mx-auto max-w-2xl text-center">
        <h1 className="mt-2 text-4xl font-bold tracking-tight sm:text-6xl" style={{ color: "#112D4E" }}>
          Services
        </h1>
      </div>

      {/* Print postcode and registration number */}
      <div className="mx-auto my-16 grid p-6 max-w-lg grid-cols-1 gap-6 sm:mt-20 lg:mx-auto lg:max-w-none lg:grid-cols-2 lg:gap-8 justify-center" style={{ color: "#112D4E" }}>
        {/* Selected Centre */}
        <div className="p-6 rounded-xl bg/3 text-center" style={{ backgroundColor: "#DBE2EF" }}>
          <h2 className="text-xl font-bold mb-2">YOUR DETAILS:</h2>

          {/* Display postcode and registration */}
          <p className="" style={{ color: "#3F72AF" }}>
            Postcode: {postcode}
          </p>
          <p className="" style={{ color: "#3F72AF" }}>
            Registration: {registration}
          </p>
        </div>
      </div>

      {/* Text under the banner */}
      <div
        className="grid-container display-grid text-center p-4 grid pl-4 pr-4 md:pl-8 md:pr-8 pt-20"
        style={{
          textAlign: "center",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: "20px",
          color: "#112D4E",
        }}
      >
        {servicesData.map((service) => (
          <div key={service.id} className="p-4 flex flex-col items-center mt-4 service-card">
            {/* Use Link to navigate to the CarServicing page with parameters */}
            <a href={service.link} className="hover flex flex-col items-center">
              <p className="font-bold text-lg mt-2">{service.name}</p>
              <p className="font-8 text-sm">{service.description}</p>
            </a>

            {/* <Link to={`/${service.name.replace(/\s+/g, "")}?`} className="hover flex flex-col items-center">
              <p className="font-bold text-lg mt-2">{service.name}</p>
              <p className="font-8 text-sm">{service.description}</p>
            </Link> */}
          </div>
        ))}

        {/* CSS for hover effect */}
        <style>
          {`
  .hover:hover {
    color: #3F72AF !important;
    text-transform: uppercase;
    background: #ffffff;
    padding: 20px;
    border: 4px solid #3F72AF !important;
    border-radius: 6px;
    display: inline-block;
    transition: all 0.3s ease 0s;
  }
  .service-card {
    border: 2px solid #112D4E;
    transition: all 0.3s ease 0s;
  }
  .service-icon {
    width: 70px;
    height: 70px;
  }
`}
        </style>
      </div>

      {/* Environmental Initiatives */}
      <div className="container mx-auto p-8 justify-center">
        <h2 className="mt-5 text-5xl font-bold tracking-tight sm:text-5xl text-center justify-center" style={{ color: "#112D4E" }}>
          Environmental Initiatives
        </h2>
        <p className="mt-3 mx-auto font-semibold max-w-2xl text-center" style={{ color: "#5F6F52", textAlign: "center" }}>
          We are committed to minimizing our environmental impact and contributing to a sustainable future. Our eco-friendly practices and environmentally conscious products aim to provide not only exceptional service but also a greener and cleaner automotive experience.
        </p>

        <h3 className="font-bold text-2xl mt-4" style={{ color: "#3A4D39" }}>
          Our Practices
        </h3>
        <ul className="bullet mt-2" style={{ color: "#5F6F52" }}>
          <li>
            <span className="font-bold">Recycling Program:</span> We actively participate in recycling programs to responsibly manage and reduce waste generated during our operations.
          </li>
          <li>
            <span className="font-bold">Energy Efficiency:</span> Our facility is equipped with energy-efficient systems and practices to minimize energy consumption.
          </li>
          <li>
            <span className="font-bold">Wate Conservation:</span> We implement water-saving measures to reduce consumption and promote responsible water usage.
          </li>
        </ul>

        <div className="mt-4" style={{ borderTop: "1px solid #3A4D39" }}></div>

        <h4 className="font-bold text-2xl mt-4" style={{ color: "#3A4D39" }}>
          Eco-Friendly Products
        </h4>
        <ul className="bullet mt-2" style={{ color: "#5F6F52" }}>
          <li>
            <span className="font-bold">Biodegradble Cleaning Products:</span> We use biodegradable and environmentally friendly cleaning products to minimize harm to the environment.
          </li>
          <li>
            <span className="font-bold">Green Lubricants and Fluids:</span> Our commitment to sustainability extends to the products we use, including eco-friendly lubricants and fluids.
          </li>
        </ul>

        <div className="mt-4" style={{ borderTop: "1px solid #3A4D39" }}></div>

        <h5 className="font-bold text-2xl mt-4" style={{ color: "#3A4D39" }}>
          Going Green Together
        </h5>
        <p className="mt-2 mx-auto" style={{ color: "#5F6F52" }}>
          By choosing Us, you're not just investing in premium automotive services, you're supporting a business dedicated to making environmentally conscious choices. Join us in our commitment to a greener future.
        </p>
        <style>
          {`
            ul.bullet{
           list-style-type: circle;
            }
         `}
        </style>
      </div>
    </div>
  );
}
