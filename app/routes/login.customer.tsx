import { Link, useNavigate } from "react-router-dom";
import { UserGroupIcon } from "@heroicons/react/24/outline";
import { json, ActionFunction} from "@remix-run/node";
import {useActionData, Form} from "@remix-run/react"
import { customerLogin } from "~/customer.server"; 

// Action function to handle form submission
export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const email = formData.get("email");
  const password = formData.get("password");

  if (typeof email === "string" && typeof password === "string") {
    try {
      return await customerLogin({ email, password });
    } catch (error) {
      console.error("Login error:", error);
      return json({ error: "Invalid email or password" }, { status: 400 });
    }
  } else {
    return json({ error: "Email and password must be provided" }, { status: 400 });
  }
};

function CustomerLogin() {
  const actionData = useActionData();

  return (
    <div>
      <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-sm">
          <h2 className="mt-10 text-center text-2xl font-bold leading-9 tracking-tight pt-10" style={{ color: "#112D4E" }}>
            Sign in to your account
          </h2>
        </div>

        <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
          <Form method="post" className="space-y-6">
            {/* Email Input */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium leading-6 text-gray-900" style={{ fontSize: "16px", color: "#112D4E" }}>
                Email
              </label>
              <div className="mt-2">
                <input
                  id="email"
                  name="email"
                  type="email" // Use type="email" for better validation
                  required
                  className="block w-full border-0 py-1.5 text-gray-900 shadow-sm ring-1 focus:ring-indigo-950 ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset sm:text-sm sm:leading-6"
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
                  autoComplete="current-password"
                  required
                  className="block w-full border-0 py-1.5 text-gray-900 shadow-sm ring-1 focus:ring-indigo-950 ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset sm:text-sm sm:leading-6"
                />
              </div>
            </div>

            {actionData?.error && <p className="text-red-500">{actionData.error}</p>}

            {/* Forgot Password Link */}
            <div>
              <Link to="/forgotPassword" className="block text-sm font-medium leading-6 text-indigo-900" style={{ fontSize: "16px", color: "#112D4E" }}>
                Forgot your password?
              </Link>
            </div>

            {/* Log In Button */}
            <div>
              <button
                type="submit"
                className="flex w-full justify-center rounded-full px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-950"
                style={{ backgroundColor: "#112D4E", fontSize: "16px" }}
              >
                Sign in
              </button>
            </div>
          </Form>

          {/* Additional Links */}
          <p className="mt-6 text-center text-sm text-gray-500">
            Don't have an account?{" "}
            <Link to="/signup" className="font-semibold leading-6" style={{ color: "#112D4E" }}>
              Sign Up
            </Link>
          </p>

          <p className="mt-6 text-center text-sm text-gray-500">
            <Link to="/staff/login" className="font-semibold leading-6" style={{ color: "#112D4E" }}>
              <div className="flex flex-col items-center">
                <UserGroupIcon className="h-6 w-6" />
                <span style={{ fontSize: "10px", fontWeight: "lighter" }}>Staff Login</span>
              </div>
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default CustomerLogin;
