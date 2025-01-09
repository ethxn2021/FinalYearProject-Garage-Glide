import { ChevronLeftIcon } from "@heroicons/react/24/outline";
import { FetcherWithComponents, useFetcher, useLoaderData } from "@remix-run/react";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { fetchVehicleDetails } from "~/utils/api.dvla";
import { CustomerResponse, GarageLocation, Services } from "~/utils/db.server";
import SuccessBookingModal from "./SuccessBookingModal";

interface ModalProps {
  setExistingModal: Dispatch<SetStateAction<boolean>>;

  fetcher: FetcherWithComponents<any>;
}

interface LoaderDataProps {
  services: Services[];
  location: GarageLocation[];
  dvlaAccessToken: string;
}

export interface TVehicleDetails {
  make: string;
  color: string;
  registrationYear: number;
  motStatus: string;
  motExpiryDate: string;
  fuelType: string;
}

interface CustomerProps {
  email: string;
  name: string;
}

export default function ExistingCustomerModal({ setExistingModal, fetcher }: ModalProps) {
  const [confirmCustomer, setConfirmCustomer] = useState(false);
  const [confirmVRN, setConfirmVRN] = useState(false);
  const [vrn, setVRN] = useState<string>("");

  const [customer, setCustomer] = useState<CustomerProps | null>(null);
  const [vehicleDetails, setVehicleDetails] = useState<TVehicleDetails | null>(null);
  const [services, setServices] = useState<Services[]>([]);
  const [serviceId, setServiceId] = useState<number | null>(null);
  const data = useLoaderData<LoaderDataProps>();

  async function handleFetchVehicleDetails() {
    if (vrn) {
      const response = await fetchVehicleDetails(vrn, data.dvlaAccessToken);

      setVehicleDetails({
        make: response.make,
        color: response.colour,
        registrationYear: response.yearOfManufacture,
        motStatus: response.motStatus,
        motExpiryDate: response.motExpiryDate,
        fuelType: response.fuelType,
      });
    }
  }

  function handleConfirmCustomer(customer: CustomerResponse) {
    setCustomer({
      name: customer.first_name + " " + customer.last_name,
      email: customer.email,
    });
    setConfirmCustomer(true);
  }

  return (
    <>
      <div>
        {!(confirmCustomer || confirmVRN) && (
          <div className="absolute left-2 top-2">
            <button onClick={() => setExistingModal(false)}>
              <ChevronLeftIcon className="w-4 h-4" />
            </button>
          </div>
        )}

        <fetcher.Form method="post" action="/api/booking">
          {confirmVRN ? (
            <>
              <p>Name: {customer?.name}</p>
              <p>Email: {customer?.email}</p>
              <p>Vehicle: {vrn}</p>

              <div className="flex items-start gap-2 mt-4">
                <div>
                  <select
                    className="py-1 text-sm rounded-sm border-gray-300"
                    onChange={(event) => {
                      const serviceId = Number(event.target.value);
                      setServiceId(serviceId);
                    }}
                  >
                    {data?.services?.map((item, idx) => {
                      return <option value={item.service_id}>{item.service_name}</option>;
                    })}
                  </select>
                  {fetcher?.data?.error?.service && <p className="text-sm text-red-500">{fetcher?.data?.error?.service}</p>}
                </div>

                <input type="hidden" name="c-email" value={customer?.email} />
                <button
                  type="button"
                  className="bg-blue-200 py-1 px-2 rounded-md text-md"
                  onClick={() => {
                    if (!serviceId) return;
                    const service = data?.services?.find((item) => item.service_id === serviceId);

                    setServices((prev) => {
                      const findService = prev.find((item) => item.service_id === service?.service_id);
                      if (findService) return prev;
                      else return [...prev, service as Services];
                    });
                  }}
                >
                  Add
                </button>
              </div>

              <div>
                <div className="mt-4 max-h-[200px] h-full overflow-y-auto">
                  {services?.length > 0 && (
                    <table className="table border-collapse border border-gray-900 w-full">
                      <thead>
                        <tr>
                          <th className="border border-gray-900 p-2">Service</th>
                          <th className="border border-gray-900 p-2">Qty</th>
                          <th className="border border-gray-900 p-2">Cost</th>
                        </tr>
                      </thead>

                      <tbody>
                        {services?.map((item) => {
                          return (
                            <tr>
                              <td className="border border-gray-900 p-2">{item.service_name}</td>
                              <td className="border border-gray-900 p-2">1</td>
                              <td className="border border-gray-900 p-2">{item.cost}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  )}
                </div>

                {services?.length > 0 && (
                  <div className="flex justify-end">
                    <td>Total: {services.reduce((acc, item) => acc + Number(item.cost), 0).toFixed(2)}</td>
                  </div>
                )}

                <input type="hidden" name="customerId" value={fetcher?.data?.customer?.customer_id} />

                <input type="hidden" name="vrn" value={vrn} />

                <input type="hidden" name="services" value={JSON.stringify(services)} />

                <input
                  type="hidden"
                  name="vehicle-details"
                  value={JSON.stringify({
                    ...vehicleDetails,
                    registration_number: vrn,
                  })}
                />

                <div className="mt-8">
                  <h5 className="font-semibold">Select Drop-off Location and Time</h5>

                  <div className="grid grid-cols-2 gap-4 mt-3">
                    <p>Location</p>
                    <div>
                      <select className="text-sm py-1 rounded-sm border-gray-300" name="location">
                        <option value="select">Select any</option>
                        {data?.location?.map((item) => {
                          return (
                            <>
                              <option value={item.location_id + ":" + item.location_name}>{item.location_name}</option>
                            </>
                          );
                        })}
                      </select>
                      {fetcher?.data?.error?.location && <p className="text-sm text-red-500">{fetcher?.data?.error?.location}</p>}
                    </div>

                    <p>Date</p>
                    <div>
                      <input type="date" name="booking-date" className="text-sm py-1 rounded-sm border-gray-300" />
                      {fetcher?.data?.error?.date && <p className="text-sm text-red-500">{fetcher?.data?.error?.date}</p>}
                    </div>

                    <p>Time</p>
                    <div>
                      <select name="booking-time" className="text-sm py-1 rounded-sm border-gray-300">
                        <option value="select">Select any</option>
                        {["09:00 AM", "11:00 AM", "01:00 PM"].map((time, index) => (
                          <option key={index} value={time}>
                            {time}
                          </option>
                        ))}
                      </select>
                      {fetcher?.data?.error?.time && <p className="text-sm text-red-500">{fetcher?.data?.error?.time}</p>}
                    </div>
                  </div>

                  <div className="mt-4 flex justify-end">
                    <button className="bg-green-200 py-1 px-2 rounded-md text-md" type="submit" name="intent" value="booking-action">
                      Confirm
                    </button>
                  </div>
                </div>
              </div>
            </>
          ) : confirmCustomer ? (
            <div>
              <p>Name: {customer?.name}</p>
              <p>Email: {customer?.email}</p>

              <div className="mt-4 flex items-start gap-2">
                <div>
                  <input type="text" placeholder="Enter VRN" className="text-sm py-1 rounded-sm border-gray-300 focus:ring-0" onChange={(event) => setVRN(event.target.value)} />
                  {fetcher?.data?.vrn?.error && <p className="text-sm text-red-600 mt-1">{fetcher?.data?.vrn?.error}</p>}
                </div>
                <button className="bg-blue-200 py-1 px-2 rounded-md text-md" type="button" onClick={handleFetchVehicleDetails}>
                  Find
                </button>
              </div>

              {vehicleDetails && (
                <div className="mt-3">
                  <p>Make: {vehicleDetails?.make}</p>
                  <p>Colour: {vehicleDetails?.color}</p>
                  <p>Year: {vehicleDetails?.registrationYear}</p>
                  <p>Fuel Type: {vehicleDetails?.fuelType}</p>

                  <div className="flex justify-end">
                    <button type="button" className="bg-green-200 py-1 px-2 rounded-md text-md mt-5" onClick={() => setConfirmVRN(true)}>
                      Cofirm
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <>
              <div className="flex items-start gap-2">
                <div>
                  <input type="text" placeholder="Customer Email" name="customer-mail" className="text-sm py-1 rounded-sm border-gray-300 focus:ring-0" />
                  {fetcher?.data?.customer?.error && <p className="text-sm text-red-600 mt-1">{fetcher?.data?.customer?.error}</p>}
                </div>
                <button type="submit" className="bg-blue-200 py-1 px-2 rounded-md text-md" name="intent" value="customer-action">
                  Find
                </button>
              </div>

              {fetcher?.data?.customer && !fetcher?.data?.customer?.error && (
                <div className="mt-3">
                  <p>
                    Name: {fetcher?.data?.customer?.first_name} {fetcher?.data?.customer?.last_name}
                  </p>
                  <p>Status: {fetcher?.data?.customer?.status}</p>

                  <div className="mt-4 flex justify-end">
                    {fetcher?.data?.customer?.status === "Active" ? (
                      <button type="button" className="bg-green-200 py-1 px-2 rounded-md text-md" onClick={() => handleConfirmCustomer(fetcher?.data?.customer)}>
                        Cofirm
                      </button>
                    ) : (
                      <button type="submit" className="bg-green-200 py-1 px-2 rounded-md text-md" name="intent" value="reactive-action">
                        Reactivate
                      </button>
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </fetcher.Form>
      </div>
    </>
  );
}
