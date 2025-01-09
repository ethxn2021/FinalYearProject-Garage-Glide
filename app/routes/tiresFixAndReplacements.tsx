import { WrenchIcon } from "@heroicons/react/24/outline";
import { Link, useLoaderData } from "@remix-run/react";
import React from "react";
import { executeQuery } from "./database";
import { LoaderFunction, json } from "@remix-run/node";
import { getServicesBySectionId } from "~/utils/db.server";
import { LoaderProps } from "./windscreenRepairs";

export const loader: LoaderFunction = async ({ request }) => {
  const services = await getServicesBySectionId(3);

  return json({ services });
};

const tires = [
  {
    href: "#",
    description: "Tires Fix And Replacements",
    icon: <WrenchIcon className="h-20 w-20 mt-8" style={{ color: "#112D4E" }} />,
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

export default function TiresFixAndReplacements() {
  const { services } = useLoaderData<LoaderProps>();

  return (
    <div className="mt-16">
      {/* Page Content */}
      <div className="container mx-auto p-8 flex flex-col items-center justify-center">
        <h1 className="mt-2 text-4xl font-bold tracking-tight sm:text-6xl mb-9" style={{ color: "#112D4E" }}>
          Tire Fix and Replacement
        </h1>
        {/* Service Options */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Service Details */}
          {services?.map((service, index) => (
            <ServiceComponent service={service} key={index} />
          ))}
        </div>

        {/* Warranty Information */}
        <div id="warranty">
          <ul>
            {tires.map((item, index) => (
              <li key={index}>
                <a href={item.href}>
                  <div className="flex flex-col items-center">
                    <span>{item.icon}</span>
                    <p className="font-bold text-2xl" style={{ color: "#112D4E" }}>
                      {item.description}
                    </p>
                    <p className="text-s" style={{ color: "#3F72AF", textAlign: "justify" }}>
                      All tire fixes and replacements are backed by a satisfaction guarantee, providing you with peace of mind.
                    </p>
                  </div>
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Booking Information */}
        <div className="container mx-auto p-8 justify-center">
          {/* Booking Section Content */}
          {/* ... (Similar to the MOT booking section) */}
        </div>
      </div>
    </div>
  );
}
