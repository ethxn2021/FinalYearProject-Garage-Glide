import { useState } from "react";
import { Link } from "react-router-dom";
import emailjs from "@emailjs/browser";
import { XMarkIcon } from "@heroicons/react/20/solid";
import { Transition } from "@headlessui/react";
import { CheckCircleIcon } from "@heroicons/react/24/outline";

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}

export default function signup() {
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  const [telephone, settelephone] = useState("");
  const [telephoneError, settelephoneError] = useState("");

  const validatetelephone = (telephone: any) => {
    if (telephone.length < 10) {
      return "Telephone must be more than 10 characters";
    }
    return "";
  };

  const validateConfirmPassword = (password: any, confirmPassword: any) => {
    if (password !== confirmPassword) {
      return "Confirm password must match password";
    }
    return "";
  };

  const validatePassword = (password: any) => {
    if (password.length < 8) {
      return "Password must be more than 8 characters";
    }
    return "";
  };

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
      const response = await fetch('/db', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams(formData as any).toString(),
      });
      const result = await emailjs.sendForm("service_1r5awa7", "template_ybutzfc", form, "ifIYm02lZT5rdQsmD");
      // Clear the form
      form.reset();
      settelephone("");
      setPassword("");
      setConfirmPassword("");
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

  return (
    <div>
      <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-sm">
          <h2 className="mt-10 text-center text-2xl font-bold leading-9 tracking-tight pt-10" style={{ color: "#112D4E" }}>
            Sign up for an account
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
                    <p className="text-sm font-medium text-gray-900">Thank you for creating an account with Garage Glide!</p>
                    <p className="mt-1 text-sm text-gray-500">Please navigate to login page and enter your credentials to login.</p>
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
          <form className="space-y-6" onSubmit={sendEmail} method="POST">

            <div>
              <label htmlFor="firstName" className="block text-sm font-medium leading-6 text-gray-900" style={{ fontSize: "16px", color: "#112D4E" }}>
                First Name
              </label>
              <div className="mt-2">
                <input
                  id="firstName"
                  name="firstName"
                  type="text"
                  required
                  className="block w-full border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset sm:text-sm sm:leading-6"
                  style={{ fontSize: "16px", borderColor: "#112D4E" }}
                />
              </div>
            </div>

            {/* Last Name Input */}
            <div>
              <label htmlFor="lastName" className="block text-sm font-medium leading-6 text-gray-900" style={{ fontSize: "16px", color: "#112D4E" }}>
                Last Name
              </label>
              <div className="mt-2">
                <input
                  id="lastName"
                  name="lastName"
                  type="text"
                  required
                  className="block w-full border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset sm:text-sm sm:leading-6"
                  style={{ fontSize: "16px", borderColor: "#112D4E" }}
                />
              </div>
            </div>

            {/* Phone Number Input */}
            <div>
              <label htmlFor="telephone" className="block text-sm font-medium leading-6 text-gray-900" style={{ fontSize: "16px", color: "#112D4E" }}>
                Phone Number
              </label>
              <div className="mt-2">
                <input
                  id="telephone"
                  name="telephone"
                  type="text"
                  required
                  value={telephone}
                  onChange={(e) => settelephone(e.target.value)}
                  onBlur={() => settelephoneError(validatetelephone(telephone))}
                  className="block w-full border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset sm:text-sm sm:leading-6"
                  style={{ fontSize: "16px", borderColor: "#112D4E" }}
                />
              </div>
            </div>

            {/* Email Input */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium leading-6 text-gray-900" style={{ fontSize: "16px", color: "#112D4E" }}>
                Email address
              </label>
              <div className="mt-2">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="block w-full border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset sm:text-sm sm:leading-6"
                  style={{ fontSize: "16px", borderColor: "#112D4E" }}
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium leading-6 text-gray-900" style={{ fontSize: "16px", color: "#112D4E" }}>
                Password
              </label>
              <div className="mt-2">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onBlur={() => setPasswordError(validatePassword(password))}
                  className="block w-full border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset sm:text-sm sm:leading-6"
                />
                {passwordError && <p className="text-red-500 text-sm mt-1">{passwordError}</p>}
              </div>
            </div>

            {/* Confirm Password Input */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium leading-6 text-gray-900" style={{ fontSize: "16px", color: "#112D4E" }}>
                Confirm Password
              </label>
              <div className="mt-2">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  onBlur={() => setConfirmPasswordError(validateConfirmPassword(password, confirmPassword))}
                  className="block w-full border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset sm:text-sm sm:leading-6"
                />
                 {confirmPasswordError && <p className="text-red-500 text-sm mt-1">{confirmPasswordError}</p>}
              </div>
            </div>

            {/* Sign Up Button */}
            <div>
              <button
                type="submit"
                className="flex w-full justify-center rounded-full px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                style={{ backgroundColor: "#112D4E", fontSize: "16px" }}
              >
                Sign up
              </button>
            </div>
          </form>
          <p className="mt-10 text-center text-sm text-gray-500">
            Already have an account? 
            <Link to="/login/customer" className="font-semibold leading-6" style={{ color: "#112D4E" }}>
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
