import { ActionFunction, redirect } from '@remix-run/node';
import { logout as staffLogout } from '~/session.server'; // Staff logout
import { logout as customerLogout, getCustomerSession } from '~/customer.server'; // Customer logout

export const action: ActionFunction = async ({ request }) => {
  const session = await getCustomerSession(request);
  if (session.has("customer_id")) {
    return customerLogout(request);
  } else {
    return staffLogout(request);
  }
};
