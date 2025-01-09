import { ShieldCheckIcon } from "@heroicons/react/24/outline";
import React from "react";
import { Link } from "react-router-dom";
import { executeQuery } from "./database";
import { LoaderFunction, json } from "@remix-run/node";
import { TServiceProps, getServicesBySectionId } from "~/utils/db.server";
import { useLoaderData } from "@remix-run/react";

export interface LoaderProps {
  services: TServiceProps[];
}

export const loader: LoaderFunction = async ({ request }) => {
  const services = await getServicesBySectionId(4);

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

export default function WindscreenRepairsPage() {
  const { services } = useLoaderData<LoaderProps>();

  return (
    <div className="mt-16">
      {/* Page Content */}
      <div className="container mx-auto p-8 flex flex-col items-center justify-center">
        <h1 className="mt-2 text-4xl font-bold tracking-tight sm:text-6xl mb-9" style={{ color: "#112D4E" }}>
          Windscreen Repairs
        </h1>
        {/* Service Details */}
        {services?.map((service, index) => (
          <ServiceComponent key={index} service={service} />
        ))}

        {/* Additional Information */}
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
                      All windscreen repairs are backed by a 12-month warranty, ensuring clarity and safety on the road.
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
            Booking Windscreen Repairs
          </h2>
          <h3 className="font-bold text-2xl" style={{ color: "#3F72AF" }}>
            Why choose our Windscreen Repairs service?
          </h3>
          <p className="mt-3" style={{ color: "#112D4E" }}>
            Our Windscreen Repairs service is designed to address minor chips and cracks before they develop into larger issues. Prompt repairs ensure clear visibility, prevent further damage, and maintain the overall safety of your vehicle.
          </p>
          <div className="mt-4" style={{ borderTop: "1px solid #3F72AF" }}></div>
          <h4 className="font-bold text-2xl mt-4" style={{ color: "#3F72AF" }}>
            When to consider Windscreen Repairs
          </h4>
          <p className="mt-3" style={{ color: "#112D4E" }}>
            - Chips or cracks in the windscreen <br />
            - Impaired visibility due to damage <br />
            - Structural integrity concerns <br />- Quick and cost-effective solution
          </p>
        </div>
      </div>
    </div>
  );
}
