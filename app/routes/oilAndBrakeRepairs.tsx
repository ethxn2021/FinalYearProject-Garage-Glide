import { ShieldCheckIcon } from "@heroicons/react/24/outline";
import { LoaderFunction, json } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { getServicesBySectionId } from "~/utils/db.server";
import { LoaderProps } from "./windscreenRepairs";

export const loader: LoaderFunction = async ({ request }) => {
  const services = await getServicesBySectionId(5);

  return json({ services });
};

const shield = [
  {
    href: "#",
    description: "12-month warranty",
    icon: <ShieldCheckIcon className="h-20 w-20 mt-8" style={{ color: "#112D4E" }} />,
  },
];

const ServiceComponent = ({ service }: any) => (
  <div className="p-4 border rounded-md">
    <h2 className="text-xl font-bold mb-2">{service.service_name}</h2>
    <p>{service.description}</p>
    <p className="" style={{ color: "#3F72AF" }}>
      Book with an MOT and save £14.99
    </p>
    <p className="text-2xl font-bold">{service.price}</p>
    <div className="flex items-center mt-2">
      <span className="text-gray-500 mr-1">{service.views} views today</span>
      <svg className="w-4 h-4 fill-current text-blue-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
        <path d="M0 0h24v24H0z" fill="none" />
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17h2v2h-2zm0-14h2v10h-2z" />
      </svg>
    </div>
    <button className="text-white px-4 py-2 rounded mt-2" style={{ backgroundColor: "#112D4E" }}>
      <Link to={typeof service.service_name === "string" ? `/${service.service_name.toLowerCase().replace(/\s+/g, "")}` : "#"}>View Details</Link>
    </button>
  </div>
);

export default function OilAndBrakeService() {
  const { services } = useLoaderData<LoaderProps>();

  return (
    <div className="mt-16">
      {/* Page Content */}
      <div className="container mx-auto p-8 flex flex-col items-center justify-center">
        <h1 className="mt-2 text-4xl font-bold tracking-tight sm:text-6xl mb-9" style={{ color: "#112D4E" }}>
          Oil and Brake Repairs
        </h1>
        {/* Servicing Type */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services?.map((service, index) => (
            <ServiceComponent key={index} service={service} />
          ))}
        </div>

        {/* Shield Icon and Warranty Information */}
        <div id="navigation">
          <ul>
            {shield.map((item, index) => (
              <li key={index}>
                <a href={item.href}>
                  <div className="flex flex-col items-center">
                    <span>{item.icon}</span>
                    <p className="font-bold text-2xl" style={{ color: "#112D4E" }}>
                      {item.description}
                    </p>
                    <p className="text-s" style={{ color: "#3F72AF", textAlign: "justify" }}>
                      All repairs are backed by a 12-month warranty, providing you with full assurance and peace of mind.
                    </p>
                  </div>
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Booking Information */}
        <div className="container mx-auto p-8 justify-center">
          <h2 className="mt-5 text-5xl font-bold tracking-tight sm:text-5xl text-center justify-center" style={{ color: "#112D4E" }}>
            Booking an Oil and Brake Service
          </h2>
          {/* Additional Information about Oil and Brake Service */}
          <h3 className="font-bold text-2xl mt-5" style={{ color: "#3F72AF" }}>
            What's included in the Oil and Brake Service?
          </h3>
          <p className="mt-3" style={{ color: "#112D4E" }}>
            Our comprehensive Oil and Brake Service includes a thorough inspection of your vehicle's braking system, replacement of brake pads if needed, and an oil change using high-quality lubricants. This service ensures your vehicle's essential systems are in optimal condition.
          </p>
          <div className="mt-4" style={{ borderTop: "1px solid #3F72AF" }}></div>
          <h4 className="font-bold text-2xl mt-4" style={{ color: "#3F72AF" }}>
            {" "}
            When should I book an Oil and Brake Service?
          </h4>
          <p className="mt-3" style={{ color: "#112D4E" }}>
            We recommend booking an Oil and Brake Service every 6 months or 6,000 miles to ensure your vehicle's safety and performance. Regular maintenance of these critical components is essential for a smooth and safe driving experience.
          </p>
          <div className="mt-4" style={{ borderTop: "1px solid #3F72AF" }}></div>
          <h5 className="font-bold text-2xl mt-4" style={{ color: "#3F72AF" }}>
            {" "}
            How long does an Oil and Brake Service take?
          </h5>
          <p className="mt-3" style={{ color: "#112D4E" }}>
            An Oil and Brake Service typically takes about 1 to 2 hours, depending on the complexity and any additional repairs that may be required. Our skilled technicians work efficiently to get you back on the road with confidence.
          </p>
        </div>
      </div>
    </div>
  );
}
