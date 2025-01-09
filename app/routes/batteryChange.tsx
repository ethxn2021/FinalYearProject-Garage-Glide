import { ShieldCheckIcon } from "@heroicons/react/24/outline";
import { LoaderFunction, json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { Link } from "react-router-dom";
import { getServicesBySectionId } from "~/utils/db.server";
import { LoaderProps } from "./windscreenRepairs";

export const loader: LoaderFunction = async ({ request }) => {
  const services = await getServicesBySectionId(6);

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

export default function BatteryChangePage() {
  const { services } = useLoaderData<LoaderProps>();

  return (
    <div className="mt-16">
      {/* Page Content */}
      <div className="container mx-auto p-8 flex flex-col items-center justify-center">
        <h1 className="mt-2 text-4xl font-bold tracking-tight sm:text-6xl mb-9" style={{ color: "#112D4E" }}>
          Battery Change
        </h1>
        {/* Service Details */}
        {services?.map((service, index) => (
          <ServiceComponent service={service} key={index} />
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
                      All battery changes are backed by a 12-month warranty, ensuring reliability and peace of mind.
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
            Booking a Battery Change
          </h2>
          <h3 className="font-bold text-2xl" style={{ color: "#3F72AF" }}>
            Why choose our Battery Change service?
          </h3>
          <p className="mt-3" style={{ color: "#112D4E" }}>
            Our Battery Change service ensures that your vehicle's electrical system stays reliable and efficient. If you're experiencing issues with starting your car or notice a decline in battery performance, our technicians are here to provide a quick and effective solution.
          </p>
          <div className="mt-4" style={{ borderTop: "1px solid #3F72AF" }}></div>
          <h4 className="font-bold text-2xl mt-4" style={{ color: "#3F72AF" }}>
            Signs you may need a Battery Change
          </h4>
          <p className="mt-3" style={{ color: "#112D4E" }}>
            - Slow engine crank <br />
            - Dashboard warning light <br />
            - Issues with electrical components <br />- Old battery age (typically 3-5 years)
          </p>
        </div>
      </div>
    </div>
  );
}
