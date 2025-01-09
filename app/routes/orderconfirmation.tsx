import { useEffect, useState } from 'react';
import Cookies from 'js-cookie';


export default function OrderConfirmation() {
    // Initialize state variables to hold order details
    const [selectedCentre, setSelectedCentre] = useState<any | null>(null);
    const [selectedDate, setSelectedDate] = useState<string | undefined>('');
    const [selectedTime, setSelectedTime] = useState<string | undefined>('');
    const [registration, setRegistration] = useState<string | undefined>('');

    // Retrieve order details from cookies
    useEffect(() => {
        setSelectedCentre(JSON.parse(Cookies.get('selectedCentre') || '{}'));
        setSelectedDate(Cookies.get('selectedDate') || '');
        setSelectedTime(Cookies.get('selectedTime') || '');
        setRegistration(Cookies.get('registration') || '');

        Cookies.set('totalPrice', '0');
        Cookies.set('selectedCentre', '{}');
        Cookies.set('selectedDate', '');
        Cookies.set('selectedTime', '');
        Cookies.set('registration', '');
        Cookies.set('postcode', '');
    }, []);

    return (
<form className="mt-4" method="POST" encType="multipart/form-data">

        <div className="mx-auto max-w-7xl pt-16 lg:px-8">
            <main className="px-4 py-16 sm:px-6 lg:flex-auto lg:px-0 lg:py-20">
                <div className="mx-auto max-w-2xl space-y-16 sm:space-y-20 lg:mx-0 lg:max-w-none">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="border rounded-md p-8">
                            <h1 className="text-3xl font-bold mb-4">Order Confirmation</h1>
                            <div>
                                <p className="text-lg font-semibold mb-2">Thank you for your order!</p>
                                <p>Your order details have been successfully confirmed.</p>
                            </div>

                            <label htmlFor="date" className="block mb-2 text-sm text-gray-700">
                                <span className="text-navy-blue-500 font-bold"></span>
                                <input
                                    type="text"
                                    id="date"
                                    name="date"
                                    className="border p-2 w-full mt-1"
                                    value={Cookies.get('selectedDate')}
                                    style={{ display: 'none' }} 
                                />
                            </label>

                            <label htmlFor="price" className="block mb-2 text-sm text-gray-700">
                                <span className="text-navy-blue-500 font-bold"></span>
                                <input
                                    type="submit"
                                    id="price"
                                    name="price"
                                    className="border p-2 w-full mt-1"
                                    value={Cookies.get('totalPrice')}
                                    style={{ display: 'none' }} 
                                />
                            </label>
                           
                        </div>
                    </div>
                </div>
            </main>
        </div>
        </form>
    );
}






