import { json } from "@remix-run/node";

export type BadActionData<T> = {
  body: T;
  errors: { [P in keyof T]?: any };
  message: string;
};

/**
 * Creates a response object with bad action data.
 * @template T - The type of the request body.
 * @param {T} body - The request body.
 * @param {Object} errors - The errors object containing error messages for each property in the request body.
 * @param {string} message - The error message.
 * @returns {Object} - The response object with bad action data.
 */
export function badActionData<T extends object>(
  body: T,
  errors: {
    [P in keyof T]?: any;
  },
  message: string
) {
  return json({ body, errors, message });
}
