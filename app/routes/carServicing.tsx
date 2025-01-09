import { LoaderFunction, json } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import React from "react";
import { TServiceProps, getServicesBySectionId } from "~/utils/db.server";
import { LoaderProps } from "./windscreenRepairs";

export const loader: LoaderFunction = async ({ request }) => {
  const services = await getServicesBySectionId(1);

  return json({ services });
};

interface TickIconProps {
  color: string;
}

const TickIcon: React.FC<TickIconProps> = ({ color }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke={color} className="w-6 h-6">
    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
  </svg>
);

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

export default function CarServicing() {
  const { services } = useLoaderData<LoaderProps>();

  return (
    <div className="mt-16">
      {/* Page  Content  */}
      <div className="container mx-auto p-8 flex flex-col items-center justify-center">
        <h1 className="mt-2 text-4xl font-bold tracking-tight sm:text-6xl mb-9" style={{ color: "#112D4E" }}>
          Car Servicing
        </h1>
        {/* Servicing Type */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services?.map((service: TServiceProps, index: number) => (
            <ServiceComponent service={service} key={index} />
          ))}
        </div>
        {/* Car Service Checklist  */}
        <div className="container mx-auto p-8">
          <h2 className="mt-2 text-5xl font-bold tracking-tight sm:text-5xl text-center justify-center" style={{ color: "#112D4E" }}>
            Car Service Checklist
          </h2>

          <table className="min-w-full bg-white border border-gray-300 shadow-md rounded mt-4">
            <thead>
              <tr>
                <th className="py-2 px-4 border-b">What We'll Replace</th>
              </tr>
            </thead>

            {/*Interim */}
            <tbody>
              <tr>
                <td className="py-2 px-4 border-b">Interim</td>
                <td className="py-2 px-4 border-b">6 months / 6,000 miles</td>
                <td className="py-2 px-4 border-b">
                  <ul className="list-disc pl-4">
                    <li>
                      Engine Oil{" "}
                      <span className="" style={{ color: "#3F72AF" }}>
                        Tick icon
                      </span>
                    </li>
                    <li>
                      Oil Filter{" "}
                      <span className="" style={{ color: "#3F72AF" }}>
                        Tick icon
                      </span>
                    </li>
                  </ul>
                </td>
              </tr>
              {/* Full */}
              <tr>
                <td className="py-2 px-4 border-b">Full</td>
                <td className="py-2 px-4 border-b">12 months / 12,000 miles</td>
                <td className="py-2 px-4 border-b">
                  <ul className="list-disc pl-4">
                    <li>
                      Engine Oil{" "}
                      <span className="" style={{ color: "#3F72AF" }}>
                        Tick icon
                      </span>
                    </li>
                    <li>
                      Oil Filter{" "}
                      <span className="" style={{ color: "#3F72AF" }}>
                        Tick icon
                      </span>
                    </li>
                    <li>
                      Air Filter - worth up to £70{" "}
                      <span className="" style={{ color: "#3F72AF" }}>
                        Tick icon
                      </span>
                    </li>
                  </ul>
                </td>
              </tr>
              {/* Major */}
              <tr>
                <td className="py-2 px-4 border-b">Major</td>
                <td className="py-2 px-4 border-b">24 months / 24,000 miles</td>
                <td className="py-2 px-4 border-b">
                  <ul className="list-disc pl-4">
                    <li>
                      Engine Oil{" "}
                      <span className="icon" style={{ color: "#3F72AF" }}>
                        <TickIcon color="#3F72AF" />
                      </span>
                    </li>
                    <li>
                      Oil Filter{" "}
                      <span className="icon" style={{ color: "#3F72AF" }}>
                        <TickIcon color="#3F72AF" />
                      </span>
                    </li>
                    <li>
                      Air Filter - worth up to £70{" "}
                      <span className="icon" style={{ color: "#3F72AF" }}>
                        <TickIcon color="#3F72AF" />
                      </span>
                    </li>
                    <li>
                      Cabin filter - worth up to £60{" "}
                      <span className="icon" style={{ color: "#3F72AF" }}>
                        <TickIcon color="#3F72AF" />
                      </span>
                    </li>
                    <li>
                      Brake Fluid - worth up to £39.99{" "}
                      <span className="icon" style={{ color: "#3F72AF" }}>
                        <TickIcon color="#3F72AF" />
                      </span>
                    </li>
                  </ul>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
