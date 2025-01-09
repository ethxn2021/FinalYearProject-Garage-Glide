import { ActionFunction, LoaderFunction, json } from "@remix-run/node";
import { BadActionData, badActionData } from "~/utils";
import { useActionData, useLoaderData } from "@remix-run/react";
import { registerInventory } from "~/utils/db.server";
import useNotifications from "~/hooks/use-notification";
import { InputErrorMessage } from "~/components/input-error-message";
import { useState } from "react";

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}

export const action: ActionFunction = async ({ request }) => {
  const body = Object.fromEntries((await request.formData()).entries());
  const item_name = body["item_name"] as string;
  const item_description = body["item_description"] as string;
  const stock_level = parseInt(body["stock_level"] as string);
  const stock_threshold = parseInt(body["stock_threshold"] as string);
  let values = { item_name, item_description, stock_level, stock_threshold };

  // Validate form data
  if (!item_name || !item_description || isNaN(stock_level) || isNaN(stock_threshold)) {
    let errors = Object.entries(values).reduce((acc, [key, value]) => {
      if (!value) {
        acc[key] = `${key} is required`;
      }
      return acc;
    }, {} as Record<string, string>);

    return badActionData({ item_name, item_description, stock_level, stock_threshold }, errors, "All fields are required");
  }
  try {
    return await registerInventory(values);
  } catch (error) {
    return badActionData({ item_name, item_description }, {}, "Please try again");
  }
};

export default function RegisterService() {
  const [newSection, setNewSection] = useState("");
  const actions = useActionData<BadActionData<{ item_name: string; item_description: string; stock_level: number; stock_threshold: number }>>();

  useNotifications();

  return (
    <div>
      <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-sm">
          <h2 className="mt-20 text-center text-3xl font-bold leading-9 tracking-tight pt-10" style={{ color: "#112D4E" }}>
            Register a New Inventory Item
          </h2>
        </div>

        <form method="POST" className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
          <div className="space-y-6">
            {/* Textboxes for service name, description, cost, and duration */}
            <div>
              <label htmlFor="item_name" className="block text-sm font-medium leading-6 text-gray-900" style={{ fontSize: "16px", color: "#112D4E" }}>
                Item Name
              </label>
              <input id="item_name" name="item_name" type="text" required className="block w-full border-0 py-1.5 text-gray-900 shadow-sm ring-1 focus:ring-indigo-950 ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset sm:text-sm sm:leading-6" />
            </div>
            <div>
              <label htmlFor="description" className="block text-sm font-medium leading-6 text-gray-900" style={{ fontSize: "16px", color: "#112D4E" }}>
                Item Description
              </label>
              <textarea id="description" name="item_description" required className="block w-full border-0 py-1.5 text-gray-900 shadow-sm ring-1 focus:ring-indigo-950 ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset sm:text-sm sm:leading-6"></textarea>
            </div>
            <div>
              <label htmlFor="stock_level" className="block text-sm font-medium leading-6 text-gray-900" style={{ fontSize: "16px", color: "#112D4E" }}>
                Stock Level
              </label>
              <input id="stock_level" name="stock_level" type="number" min="0" step="1" required className="block w-full border-0 py-1.5 text-gray-900 shadow-sm ring-1 focus:ring-indigo-950 ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset sm:text-sm sm:leading-6" />
            </div>
            <div>
              <label htmlFor="stock_threshold" className="block text-sm font-medium leading-6 text-gray-900" style={{ fontSize: "16px", color: "#112D4E" }}>
                Stock Threshold
              </label>
              <input id="stock_threshold" name="stock_threshold" type="number" min="0" step="1" required className="block w-full border-0 py-1.5 text-gray-900 shadow-sm ring-1 focus:ring-indigo-950 ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset sm:text-sm sm:leading-6" />
            </div>
            <div>
              <input
                type="submit"
                value={"Register Item"}
                className="flex w-full justify-center rounded-full px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-950"
                style={{ backgroundColor: "#112D4E", fontSize: "16px" }}
              />
            </div>
          </div>
          <br />
        </form>
      </div>
    </div>
  );
}
