import { LoaderFunction, json, redirect } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { getCustomerSession } from "~/customer.server";
import { getBasketItemsForCustomer } from "~/utils/db.server";
import { useNavigate } from 'react-router-dom';
import Cookies from "js-cookie";


export const loader: LoaderFunction = async ({ request }) => {
    const session = await getCustomerSession(request);
    const customerId = session.get("customer_id");

    let basketItems = await getBasketItemsForCustomer(customerId);

    return json({ basketItems });
}

type BasketItem = {
    first_name: string;
    last_name: string;
    registration_number: string | null;
    postcode: string;
    vehicle_id: number;
    customer_id: number;
    date: Date;
    time: string;
    service_type: string;
    price: number;
    selectedCentre: 'Medway' | 'Canterbury';
};

export default function Basket() {
    const { basketItems } = useLoaderData();

    const total = basketItems.reduce((sum: number, item: { price: number; }) => sum + Number(item.price), 0);
    const navigate = useNavigate();
    Cookies.set('totalPrice', total);

    return (
        <div>
            <div>
                <h2 className="text-3xl font-semibold leading-7 text-gray-900">Basket</h2>
                <dl className="mt-6 space-y-6 divide-y divide-gray-100 border-t border-gray-200 text-sm leading-6"></dl>
                <div className="pt-6 sm:flex">
                    <dt className="font-bold text-gray-900 sm:w-64 sm:flex-none sm:pr-6 text-2xl">Revenue</dt>
                </div>
                <div className="pt-6 sm:flex">
                    <dt className=" text-gray-900 sm:w-64 sm:flex-none sm:pr-6 font-bold text-2xl"> Basket</dt>
                </div>
                <div className="sm:flex" style={{ maxHeight: '500px', overflowY: 'auto' }}>
                    <table className="min-w-full">
                        <thead className="" style={{ backgroundColor: "#DBE2EF" }}>
                            <tr style={{ color: "#112D4E" }}>
                                <th scope="col" className="px-2 py-3 text-left text-xs font-medium uppercase tracking-wider">
                                    Registration Number:
                                </th>
                                <th scope="col" className="px-2 py-3 text-left text-xs font-medium uppercase tracking-wider">
                                    Postcode:
                                </th>
                                <th scope="col" className="px-2 py-3 text-left text-xs font-medium uppercase tracking-wider">
                                    Date:
                                </th>
                                <th scope="col" className="px-2 py-3 text-left text-xs font-medium uppercase tracking-wider">
                                    Time:
                                </th>
                                <th scope="col" className="px-2 py-3 text-left text-xs font-medium uppercase tracking-wider">
                                    Service Type:
                                </th>
                                <th scope="col" className="px-2 py-3 text-left text-xs font-medium uppercase tracking-wider">
                                    Price:
                                </th>
                                <th scope="col" className="px-2 py-3 text-left text-xs font-medium uppercase tracking-wider">
                                    Selected Centre:
                                </th>

                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {basketItems.map((basketItem: BasketItem) => (
                                <tr className="border-t border-gray-200 hover:bg-gray-100 cursor-pointer" onClick={() => { }}>
                                    <td className="px-2 py-4 whitespace-nowrap">{basketItem.registration_number}</td>
                                    <td className="px-2 py-4 whitespace-nowrap">{basketItem.postcode}</td>
                                    <td className="px-2 py-4 whitespace-nowrap">{new Date(basketItem.date).toISOString().slice(0, 10)}</td>
                                    <td className="px-2 py-4 whitespace-nowrap">{basketItem.time}</td>
                                    <td className="px-2 py-4 whitespace-nowrap">{basketItem.service_type}</td>
                                    <td className="px-2 py-4 whitespace-nowrap">{basketItem.price}</td>
                                    <td className="px-2 py-4 whitespace-nowrap">{basketItem.selectedCentre}</td>

                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            <div className="flex justify-end mt-4">
                            <div className="bg-gray-100 p-4 rounded-full w-40">
                                <div className="text-xs font-medium text-gray-700 mb-2">Order Summary</div>
                                <div className="text-xs text-gray-500">Subtotal: £{total}</div>
                                <div className="text-xs text-gray-500 mb-2">Total Price: £{total}</div>
                                <div className="border-b border-gray-200 mb-2"></div>
                                <button
                                    onClick={() => navigate("/service")}
                                    className="text-xs font-medium bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 mr-2"
                                >
                                    Add More Services
                                </button>
                                <button
                                    onClick={() => {
                                        navigate("/checkout", {
                                            state: { 
                                            total: total,
                                            }
                                        });
                                    }}
                                    className="text-xs font-medium bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                                >
                                    Checkout
                                </button>

                            </div>
                        </div>
        </div>
    );
}

