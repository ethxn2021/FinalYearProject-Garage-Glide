import { Link, useNavigate } from "react-router-dom";
import { ActionFunction, LoaderFunction, json } from "@remix-run/node";
import { BadActionData, badActionData } from "~/utils";
import { useActionData, useLoaderData } from "@remix-run/react";
import { GarageLocation, checkIfUsernameExists, getLocations, staffSignup } from "~/utils/db.server";
import useNotifications from "~/hooks/use-notification";
import { InputErrorMessage } from "~/components/input-error-message";

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}

export const loader: LoaderFunction = async ({ request }) => {
  let locations = await getLocations();
  return json({ locations });
};

export const action: ActionFunction = async ({ params, request }) => {
  const body = Object.fromEntries((await request.formData()).entries());
  const username = body["username"] as string;
  const password = body["password"] as string;
  const firstName = body["firstName"] as string;
  const lastName = body["lastName"] as string;
  const role = body["role"] as "Admin" | "Manager";
  const location = Number(body["location"] as string);
  let values = { username, password, firstName, lastName, role, location };

  if (!username || !password || !firstName || !lastName || !role || !location) {
    let errors = Object.entries(values).reduce((acc, [key, value]) => {
      if (!value) {
        acc[key] = `${key} is required`;
      }
      return acc;
    }, {} as Record<string, string>);

    return badActionData({ username, password, firstName, lastName, role, location }, errors, "All fields are required");
  }
  if (password.length < 8) {
    return badActionData({ username, password, firstName, lastName, role, location }, { password: "Password must be at least 8 characters" }, "Password must be at least 8 characters");
  }

  if (await checkIfUsernameExists(username)) {
    return badActionData({ username, password, firstName, lastName, location }, { username: "Username already exists" }, "Username already exists");
  }

  try {
    return await staffSignup(values);
  } catch (error) {
    return badActionData({ username, password }, {}, "Invalid username or password");
  }
};

//Changed file name from staffRegister to staff.register to match remix naming conventions
export default function StaffRegistration() {
  const validRoles: string[] = ["Admin", "Manager"];
  const loader = useLoaderData<{ locations: GarageLocation[] }>();
  const actions = useActionData<BadActionData<{ username: string; password: string; firstName: string; lastName: string; role: "Admin" | "Manager"; location: string }>>();
  useNotifications();
  return (
    <div>
      <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-sm">
          <h2 className="mt-10 text-center text-2xl font-bold leading-9 tracking-tight pt-10" style={{ color: "#112D4E" }}>
            Register a Staff
          </h2>
        </div>

        <form method="POST" className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
          <div className="space-y-6">
            {/* Username/Email Input */}
            {actions?.message && <div className="text-red-500 text-center">{actions.message}</div>}
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium leading-6 text-gray-900" style={{ fontSize: "16px", color: "#112D4E" }}>
                First Name
              </label>
              <div className="mt-2">
                <input
                  id="firstName"
                  name="firstName"
                  type="text"
                  defaultValue={actions?.body.firstName}
                  required
                  className="block w-full text-[16px] border-0 py-1.5 text-gray-900 shadow-sm ring-1 focus:ring-indigo-950 ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset sm:text-sm sm:leading-6"
                  style={{ borderColor: "#112D4E" }}
                />
              </div>
              <InputErrorMessage error={actions?.errors?.firstName} />
            </div>
            <div>
              <label htmlFor="lastName" className="block text-sm font-medium leading-6 text-gray-900" style={{ fontSize: "16px", color: "#112D4E" }}>
                Last Name
              </label>
              <div className="mt-2">
                <input
                  id="lastName"
                  name="lastName"
                  type="text"
                  defaultValue={actions?.body.lastName}
                  required
                  className="block w-full text-[16px] border-0 py-1.5 text-gray-900 shadow-sm ring-1 focus:ring-indigo-950 ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset sm:text-sm sm:leading-6"
                  style={{ borderColor: "#112D4E" }}
                />
              </div>
              <InputErrorMessage error={actions?.errors?.lastName} />
            </div>
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
              <InputErrorMessage error={actions?.errors?.username} />
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
              <InputErrorMessage error={actions?.errors?.password} />
            </div>

            <div>
              <label htmlFor="role" className="block text-sm font-medium leading-6 text-gray-900" style={{ fontSize: "16px", color: "#112D4E" }}>
                Role
              </label>
              <select id="role" name="role" required className="block w-full border-0 py-1.5 text-gray-900 shadow-sm ring-1 focus:ring-indigo-950 ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset sm:text-sm sm:leading-6">
                {validRoles.map((roleValue) => (
                  <option key={roleValue} value={roleValue}>
                    {roleValue}
                  </option>
                ))}
              </select>
              <InputErrorMessage error={actions?.errors?.role} />
            </div>

            <div>
              <label htmlFor="location" className="block text-sm font-medium leading-6 text-gray-900" style={{ fontSize: "16px", color: "#112D4E" }}>
                Location
              </label>
              <select id="location" name="location" required className="block w-full border-0 py-1.5 text-gray-900 shadow-sm ring-1 focus:ring-indigo-950 ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset sm:text-sm sm:leading-6">
                {loader.locations.map((location) => (
                  <option key={location.location_id} value={location.location_id}>
                    {location.location_name}
                  </option>
                ))}
              </select>
              <InputErrorMessage error={actions?.errors?.location} />
            </div>

            {/* Forgot Password Link */}
            <div>
              <Link to="/forgot-password" className="block text-sm font-medium leading-6 text-indigo-900" style={{ fontSize: "16px", color: "#112D4E" }}>
                Forgot your password?
              </Link>
            </div>

            {/* Sign Up Button */}
            <div>
              {/* <Link to="/staffProfile"> */}
              <input
                type="submit"
                value={"Register"}
                name="type"
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
