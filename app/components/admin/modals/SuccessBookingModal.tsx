import moment from "moment";
import { Dispatch, SetStateAction } from "react";
import { BookingDetails } from "~/utils/db.server";

interface ModalProps {
  booking: BookingDetails & { locationName: string; customerEmail: string };
  setSuccessModal: Dispatch<SetStateAction<boolean>>;
}

function calcServiceTotalPrice(details: string) {
  const totalPrice = details?.split(", ")?.reduce((acc, item) => {
    const [serviceName, _] = item.split(" (x");
    const [quantity, price] = _.split(" @ ");

    const _price = Number(price?.slice(1, -1));

    return acc + _price;
  }, 0);

  return totalPrice.toFixed(2);
}

function SuccessBookingModal({ booking, setSuccessModal }: ModalProps) {
  return (
    <div className="fixed top-0 left-0 w-full h-full bg-gray-900 bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded shadow-lg mt-32 max-w-sm w-full p-8 relative">
        <button
          className="absolute top-0 right-0 border border-red-400 bg-red-300 w-7 h-7 flex items-center justify-center"
          onClick={() => {
            setSuccessModal(false);
          }}
        >
          <span>X</span>
        </button>

        <h2 className="text-lg font-semibold mb-4">Confirmation</h2>

        <p>
          Successfully booked <strong>{booking?.Vehicle_Registration}</strong>{" "}
          in Garage Glide <strong>{booking?.locationName}</strong> on{" "}
          <strong>{moment(booking?.booking_date).format("DD/MM/YYYY")}</strong>{" "}
          at{" "}
          <strong>
            {moment(booking?.booking_start, "HH:mm:ss").format("hh:mm A")}
          </strong>
          .
        </p>

        <div className="mt-4">
          <p>Name: {booking?.Customer_Name}</p>
          <p>Email: {booking?.customerEmail}</p>
        </div>

        <div className="px-4 mt-4 max-h-[200px] h-full overflow-y-auto">
          <table className="table border-collapse border border-gray-900 w-full">
            <thead>
              <tr>
                <th className="border border-gray-900 p-2">Service</th>
                <th className="border border-gray-900 p-2">Qty</th>
                <th className="border border-gray-900 p-2">Cost</th>
              </tr>
            </thead>

            <tbody>
              {booking?.Services_Details?.split(", ")?.map((item) => {
                const [serviceName, _] = item.split(" (x");
                const [quantity, price] = _.split(" @ ");

                return (
                  <tr>
                    <td className="border border-gray-900 p-2">
                      {serviceName}
                    </td>
                    <td className="border border-gray-900 p-2">{quantity}</td>
                    <td className="border border-gray-900 p-2">
                      {price?.slice(0, -1)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <div className="flex justify-end">
            <td>Total: {calcServiceTotalPrice(booking?.Services_Details)}</td>
          </div>
        </div>

        <div>
          <p>Payment: {booking?.payment_status}</p>
        </div>

        <div className="flex justify-end">
          <button
            className="bg-green-200 py-1 px-2 rounded-md text-md"
            type="button"
            onClick={() => setSuccessModal(false)}
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

export default SuccessBookingModal;
