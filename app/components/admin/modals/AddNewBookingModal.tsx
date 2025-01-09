import { Dispatch, SetStateAction, useEffect, useState } from "react";
import ExistingCustomerModal from "./ExistingCustomerModal";
import { FetcherWithComponents, useFetcher, useLocation } from "@remix-run/react";

interface ModalProps {
  setShowForm: Dispatch<SetStateAction<boolean>>;
  newBookingFetcher: FetcherWithComponents<any>;
}

export default function AddNewBookingModal({ setShowForm, newBookingFetcher }: ModalProps) {
  const [existingCustomerModal, setExistingCustomerModal] = useState(false);

  const { pathname } = useLocation();

  // Todo: create booking for new customer
  const [newCustomerModal, setNewCustomerModal] = useState(false);

  return (
    <>
      <div className="fixed top-0 left-0 w-full h-full bg-gray-900 bg-opacity-50 flex justify-center items-center z-50">
        <div className="bg-white rounded shadow-lg mt-32 max-w-sm w-full p-8 relative">
          <button
            className="absolute top-0 right-0 border border-red-400 bg-red-300 w-7 h-7 flex items-center justify-center"
            onClick={() => {
              setShowForm(false);
              newBookingFetcher.load(pathname);
            }}
          >
            <span>X</span>
          </button>

          <h2 className="text-lg font-semibold mb-4">Add New Booking</h2>

          {existingCustomerModal ? (
            <ExistingCustomerModal setExistingModal={setExistingCustomerModal} fetcher={newBookingFetcher} />
          ) : newCustomerModal ? (
            <></>
          ) : (
            <div className="flex items-center gap-4 mt-5">
              <button type="button" className="bg-blue-200 py-2 px-4 rounded-md text-md" onClick={() => setExistingCustomerModal(true)}>
                Existing Customer
              </button>
              <button type="button" className="bg-green-200 py-2 px-4 rounded-md text-md">
                New Customer
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
