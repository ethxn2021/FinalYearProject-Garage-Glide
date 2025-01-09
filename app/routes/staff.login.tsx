import { Link, useNavigate } from "react-router-dom";
import { ActionFunction, json } from "@remix-run/node";
import { login } from "~/session.server";
import { BadActionData, badActionData } from "~/utils";
import { useActionData } from "@remix-run/react";
import useNotifications from "~/hooks/use-notification";

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}

export const action: ActionFunction = async ({ params, request }) => {
  const body = Object.fromEntries((await request.formData()).entries());
  const username = body["username"] as string;
  const password = body["password"] as string;
  console.log(username, password);
  try {
    return await login({ username, password });
  } catch (error) {
    console.log("something went wrong");
    return badActionData({ username, password }, {}, "Invalid username or password");
  }
};
//Changed file name from staffLogin to staff.login to match remix naming conventions
export default function StaffLogin() {
  const actions = useActionData<BadActionData<{ username: string; password: string }>>();
  useNotifications();
  return (
    <div>
      <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-sm">
          <h2 className="mt-10 text-center text-2xl font-bold leading-9 tracking-tight pt-10" style={{ color: "#112D4E" }}>
            Sign in to your staff account
          </h2>
        </div>

        <form method="POST" className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
          <div className="space-y-6">
            {/* Username/Email Input */}
            {actions?.message && <div className="text-red-500 text-center">{actions.message}</div>}
            <div>
              <label htmlFor="username" className="block text-sm font-medium leading-6 text-gray-900" style={{ fontSize: "16px", color: "#112D4E" }}>
                Username
              </label>
              <div className="mt-2">
                <input
                  id="username"
                  name="username"
                  type="text"
                  defaultValue={actions?.body.username}
                  required
                  className="block w-full text-[16px] border-0 py-1.5 text-gray-900 shadow-sm ring-1 focus:ring-indigo-950 ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset sm:text-sm sm:leading-6"
                  style={{ borderColor: "#112D4E" }}
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
                  defaultValue={actions?.body.password}
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  className="block w-full border-0 py-1.5 text-gray-900 shadow-sm ring-1 focus:ring-indigo-950 ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset sm:text-sm sm:leading-6"
                />
              </div>
            </div>

            {/* Forgot Password Link */}
            <div>
              <Link to="/forgot-password" className="block text-sm font-medium leading-6 text-indigo-900" style={{ fontSize: "16px", color: "#112D4E" }}>
                Forgot your password?
              </Link>
            </div>

            {/* Log In Button */}
            <div>
              <input
                type="submit"
                value={"Login"}
                name="type"
                className="flex w-full justify-center rounded-full px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-950"
                style={{ backgroundColor: "#112D4E", fontSize: "16px" }}
              />
              <Link to="/manager/profile"></Link>
            </div>
          </div>

          <br></br>
          {/* Go back to customer login page */}
          <p className="mt-4 text-center text-sm text-gray-500">
            <Link to="/login/customer" className="font-semibold leading-6 pr-1" style={{ color: "#112D4E" }}>
              Click here
            </Link>
            to go back to customer login
          </p>
        </form>
      </div>
    </div>
  );
}
