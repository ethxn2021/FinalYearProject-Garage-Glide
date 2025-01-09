import { ActionFunction, LoaderFunction, json } from "@remix-run/node";
import { BadActionData, badActionData } from "~/utils";
import { useActionData, useLoaderData } from "@remix-run/react";
import { registerService, getServices } from "~/utils/db.server";
import useNotifications from "~/hooks/use-notification";
import { InputErrorMessage } from "~/components/input-error-message";
import { JSXElementConstructor, Key, ReactElement, ReactNode, useState } from "react";
import { CognitoSync } from "aws-sdk";

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}

interface Service {
  service_section: string;
  section_name: string;
  service_id:number;
}
interface FormData {
  service_name: string;
  description: string;
  cost: number;
  duration: number;
  service_section: string;
  service_id:number;
}
export const loader: LoaderFunction = async ({ request }) => {
  let serviceSection = await getServices();
  return { serviceSection };
};

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  
  const service_name = formData.get("service_name")?.toString().trim();
  const description = formData.get("description")?.toString().trim();
  const cost = parseFloat(formData.get("cost")?.toString().trim() || "0"); 
  const duration = parseInt(formData.get("duration")?.toString().trim() || "0", 10); 
  const service_section = formData.get("service_section")?.toString().trim();
  const serviceId = formData.get("service_id");
  if (typeof service_name === "string" && typeof description === "string" && typeof service_section === "string") {
    let values = {service_section,service_name, description,cost, duration};

    try{
      console.log("success!");
      return await registerService(values);
    }catch(error){
      console.log("no");
      return badActionData({ service_section,service_name, description,cost, duration }, {}, "Invalid username or password");

    }
  }


};

export default function RegisterService() {
  const { serviceSection } = useLoaderData();
  const [newSection, setNewSection] = useState("");
  const actions = useActionData<BadActionData<FormData>>();
  const [selectedServiceSection, setSelectedServiceSection] = useState<{ section_name: string; service_section_id: number } | null>(null);

  useNotifications();

  return (
    <div>
      <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-sm">
          <h2 className="mt-20 text-center text-3xl font-bold leading-9 tracking-tight pt-10" style={{ color: "#112D4E" }}>
            Register a New Service
          </h2>
        </div>

        <form method="POST" className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
          <div className="space-y-6">
            {/* Service Section Dropdown */}
            <div>
              <label htmlFor="service_section" className="block text-sm font-medium leading-6 text-gray-900" style={{ fontSize: "16px", color: "#112D4E" }}>
                Service Section
              </label>
              <select
                id="service_section"
                name="service_section"
                required
                value={newSection}
                onChange={(e) => {
                  const selectedIndex = e.target.selectedIndex;
                  setSelectedServiceSection(serviceSection[selectedIndex]);
                  setNewSection(e.target.value);
                }}
                className="block w-full border-0 py-1.5 text-gray-900 shadow-sm ring-1 focus:ring-indigo-950 ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset sm:text-sm sm:leading-6"
              >
                <option value="">Select Service Section</option>
                {/* Iterate over services and populate dropdown */}
                {serviceSection.map((service: Service, index) => (
                  <option key={index} value={service.section_name}>
                    {service.section_name}
                  </option>
                ))}
              </select>
            </div>
            <input id="service_id" name="service_id" type="hidden" value={selectedServiceSection?.service_id ?? ''} />

            {/* Textboxes for service name, description, cost, and duration */}
            <div>
              <label htmlFor="service_name" className="block text-sm font-medium leading-6 text-gray-900" style={{ fontSize: "16px", color: "#112D4E" }}>
                Service Name
              </label>
              <input id="service_name" name="service_name" type="text" required className="block w-full border-0 py-1.5 text-gray-900 shadow-sm ring-1 focus:ring-indigo-950 ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset sm:text-sm sm:leading-6" />
            </div>
            <div>
              <label htmlFor="description" className="block text-sm font-medium leading-6 text-gray-900" style={{ fontSize: "16px", color: "#112D4E" }}>
                Description
              </label>
              <textarea id="description" name="description" required className="block w-full border-0 py-1.5 text-gray-900 shadow-sm ring-1 focus:ring-indigo-950 ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset sm:text-sm sm:leading-6"></textarea>
            </div>
            <div>
              <label htmlFor="cost" className="block text-sm font-medium leading-6 text-gray-900" style={{ fontSize: "16px", color: "#112D4E" }}>
                Cost
              </label>
              <input id="cost" name="cost" type="number" min="0" step="0.01" required className="block w-full border-0 py-1.5 text-gray-900 shadow-sm ring-1 focus:ring-indigo-950 ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset sm:text-sm sm:leading-6" />
            </div>
            <div>
              <label htmlFor="duration" className="block text-sm font-medium leading-6 text-gray-900" style={{ fontSize: "16px", color: "#112D4E" }}>
                Duration (Estimated Hours)
              </label>
              <input id="duration" name="duration" type="number" min="0" required className="block w-full border-0 py-1.5 text-gray-900 shadow-sm ring-1 focus:ring-indigo-950 ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset sm:text-sm sm:leading-6" />
            </div>
            <div>
              <input
                type="submit"
                value="Register Service"
                className="flex w-full justify-center rounded-full px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-950"
                style={{ backgroundColor: "#112D4E", fontSize: "16px" }}
              />
            </div>
          </div>
          <br></br>
        </form>
      </div>
    </div>
  );
}
