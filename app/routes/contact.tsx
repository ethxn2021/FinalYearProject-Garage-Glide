import { useState } from "react";
import emailjs from "@emailjs/browser";
import { XMarkIcon } from "@heroicons/react/20/solid";
import { Transition } from "@headlessui/react";
import { CheckCircleIcon } from "@heroicons/react/24/outline";

export default function Contact() {
  interface FormStatus {
    submitted: boolean;
    error: string | null;
  }

  const [formStatus, setFormStatus] = useState<FormStatus>({
    submitted: false,
    error: null,
  });

  const [show, setShow] = useState(true);

  const sendEmail = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);

    try {
      // Validate the form data
      if (!validateForm(formData)) {
        return;
      }

      // If form data is valid, send email
      const result = await emailjs.sendForm("service_1r5awa7", "template_36yib84", form, "ifIYm02lZT5rdQsmD");
      console.log(result);

      // Clear the form
      form.reset();

      // Set form submission status to display "Thank you" message
      setFormStatus({
        submitted: true,
        error: null,
      });
    } catch (error) {
      console.error(error);
      setFormStatus({
        submitted: false,
        error: "An error occurred. Please try again.",
      });
    }
  };

  // Validate form data
  const validateForm = (formData: FormData): boolean => {
    const errors: { [key: string]: string } = {};

    const firstName = formData.get("firstName_from") as string;
    const lastName = formData.get("lastName_from") as string;
    const vehicleRegistration = formData.get("vehicleRegistration") as string;
    const phone = formData.get("phone_from") as string;
    const email = formData.get("email_from") as string;

    if (!firstName.trim()) {
      errors.firstName = "Please enter your first name.";
    }
    if (!lastName.trim()) {
      errors.lastName = "Please enter your last name.";
    }
    if (!vehicleRegistration.trim()) {
      errors.vehicleRegistration = "Please enter your vehicle registration.";
    }
    if (!phone.trim()) {
      errors.phone = "Please enter your phone number.";
    }
    if (!email.trim()) {
      errors.email = "Please enter your email address.";
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        errors.email = "Please enter a valid email address.";
      }
    }

    if (Object.keys(errors).length > 0) {
      const detailedError = Object.values(errors).join(" ");
      setFormStatus({
        submitted: false,
        error: "Please correct the errors in the form: " + detailedError,
      });
      return false;
    }

    return true;
  };

  return (
    <div>
      <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-sm">
          <h2 className="mt-10 text-center text-2xl font-bold leading-9 tracking-tight pt-10" style={{ color: "#112D4E" }}>
            Contact Us
          </h2>
        </div>

        {/* Notification Overlay for Success */}
        <div aria-live="assertive" className="pointer-events-none fixed inset-0 flex items-center justify-center">
          <Transition show={formStatus.submitted && show} enter="transform ease-out duration-300 transition" enterFrom="opacity-0" enterTo="opacity-100" leave="transition ease-in duration-100" leaveFrom="opacity-100" leaveTo="opacity-0">
            <div className="pointer-events-auto w-full max-w-sm overflow-hidden rounded-lg bg-white shadow-lg ring-1 ring-black ring-opacity-5">
              <div className="p-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <CheckCircleIcon className="h-5 w-5 text-green-400" aria-hidden="true" />
                  </div>
                  <div className="ml-3 w-30 flex-1 pt-0.5">
                    <p className="text-sm font-medium text-gray-900">Thank you!</p>
                    <p className="mt-1 text-sm text-gray-500">We will get back to you shortly.</p>
                  </div>
                  <div className="ml-4 flex flex-shrink-0">
                    <button
                      type="button"
                      className="inline-flex rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                      onClick={() => {
                        setShow(false);
                        setFormStatus({ submitted: false, error: null });
                      }}
                    >
                      <span className="sr-only">Close</span>
                      <XMarkIcon className="h-5 w-5" aria-hidden="true" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </Transition>
        </div>

        <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
          <form className="contact_form space-y-6" onSubmit={sendEmail} action="/contact" method="POST">
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium leading-6 text-gray-900" style={{ fontSize: "16px", color: "#112D4E" }}>
                First Name
              </label>
              <div className="mt-2">
                <input
                  id="firstName"
                  name="firstName_from"
                  type="text"
                  required
                  className="block w-full border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset sm:text-sm sm:leading-6"
                  style={{ fontSize: "16px", borderColor: "#112D4E" }}
                />
              </div>
            </div>

            <div>
              <label htmlFor="lastName" className="block text-sm font-medium leading-6 text-gray-900" style={{ fontSize: "16px", color: "#112D4E" }}>
                Last Name
              </label>
              <div className="mt-2">
                <input
                  id="lastName"
                  name="lastName_from"
                  type="text"
                  required
                  className="block w-full border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset sm:text-sm sm:leading-6"
                  style={{ fontSize: "16px", borderColor: "#112D4E" }}
                />
              </div>
            </div>

            <div>
              <label htmlFor="vehicleRegistration" className="block text-sm font-medium leading-6 text-gray-900" style={{ fontSize: "16px", color: "#112D4E" }}>
                Vehicle Registration
              </label>
              <div className="mt-2">
                <input
                  id="vehicleRegistration"
                  name="vehicleRegistration"
                  type="text"
                  pattern="[A-Za-z]{2}\d{2}\s[A-Za-z]{3}"
                  title="Please enter a valid UK vehicle registration number"
                  required
                  className="block w-full border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset sm:text-sm sm:leading-6"
                  style={{ fontSize: "16px", borderColor: "#112D4E" }}
                />
              </div>
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium leading-6 text-gray-900" style={{ fontSize: "16px", color: "#112D4E" }}>
                Phone Number
              </label>
              <div className="mt-2">
                <input
                  id="phone"
                  name="phone_from"
                  type="tel"
                  pattern="[0-9]{3}-[0-9]{3}-[0-9]{4}"
                  title="Please enter a valid phone number"
                  required
                  className="block w-full border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset sm:text-sm sm:leading-6"
                  style={{ fontSize: "16px", borderColor: "#112D4E" }}
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium leading-6 text-gray-900" style={{ fontSize: "16px", color: "#112D4E" }}>
                Email address
              </label>
              <div className="mt-2">
                <input
                  id="email"
                  name="email_from"
                  type="email"
                  autoComplete="email"
                  required
                  className="block w-full border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset sm:text-sm sm:leading-6"
                  style={{ fontSize: "16px", borderColor: "#112D4E" }}
                />
              </div>
            </div>

            <div>
              <label htmlFor="centre" className="block text-sm font-medium leading-6 text-gray-900" style={{ fontSize: "16px", color: "#112D4E" }}>
                Centre
              </label>

              <select id="centre" name="centre" required className="block w-full border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset sm:text-sm sm:leading-6" style={{ fontSize: "16px", borderColor: "#112D4E" }}>
                <option value="Canterbury">Canterbury</option>
                <option value="Medway">Medway</option>
              </select>
            </div>

            <label htmlFor="message" className="block text-sm font-medium leading-6 text-gray-900" style={{ fontSize: "16px", color: "#112D4E" }}>
              Your Message
            </label>
            <textarea style={{ borderColor: "#112D4E", fontSize: "16px" }} id="message" name="message" className="w-full" required></textarea>

            <div>
              <button
                type="submit"
                className="flex w-full justify-center rounded-full px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                style={{ backgroundColor: "#112D4E", fontSize: "16px" }}
              >
                Submit
              </button>
            </div>

            {/* Error Message */}
            {formStatus.error && (
              <p className="mt-2 text-sm text-red-600" style={{ fontSize: "14px" }}>
                {formStatus.error}
              </p>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
