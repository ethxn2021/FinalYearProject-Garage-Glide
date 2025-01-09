/* getSession retrieves a session from a cookie string */
/* commitSession creates a new cookie string */
/* destroySession deletes session data and returns a cookie string */
import bcrypt from "bcryptjs";
import { createCookieSessionStorage, redirect } from "@remix-run/node";
import { executeQuery } from "./routes/database";
import { nanoid } from "nanoid"; // Import nanoid to generate unique session IDs


type LoginForm = {
  username: string;
  password: string;
};

export async function login({ username, password }: LoginForm) {
  const query = "SELECT * FROM comp6000_06.Staff WHERE username = ?";
  const values = [username];

  try {
    const [user] = await executeQuery(query, values);
    //console.log(user);
    if (!user) {
      throw new Error("Invalid staff username or password"); // User not found
    }

    const isCorrectPassword = await bcrypt.compare(password, user.password);
   // console.log(isCorrectPassword);
    if (!isCorrectPassword) {
      throw new Error("Invalid staff username or password"); // User not found
    }

    if (!user.isActive) {
      throw new Error("Account is inactive"); // Account is not active
    }
    
    // Determine the role of the user
    const role = user.role;
    let profilePage = '';

    // Set the profile page based on the user's role
    if (role === 'Admin') {
      profilePage = '/admin/profile';
    } else if (role === 'Manager') {
      profilePage = '/manager/profile';
    } else {
      // Handle other roles or scenarios
      profilePage = '/staff/login'; 
    }

    //console.log("calling create user session")
    return await createUserSession(user.staff_id, profilePage);
  } catch (error) {
    //console.log("error");
    console.error("Login error:", error);
    throw error;
  }
}

const sessionSecret = process.env.SESSION_SECRET;
console.log("SESSION_SECRET:", sessionSecret);
if (!sessionSecret) {
  throw new Error("SESSION_SECRET must be set");
}

const storage = createCookieSessionStorage({
  cookie: {
    name: "staff_session",
    // normally you want this to be `secure: true`
    // but that doesn't work on localhost for Safari
    // https://web.dev/when-to-use-local-https/
    secure: process.env.NODE_ENV === "production",
    secrets: [sessionSecret],
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24, //24 hrs
    httpOnly: true,
  },
});

//function to create user session
export async function createUserSession(staff_id: number, redirectTo: string) {
  //console.log("i'm here");
  const session = await storage.getSession();
  session.set("staff_id", staff_id);
  //console.log({data:session.data});
  return redirect(redirectTo, {
    headers: {

      "Set-Cookie": await storage.commitSession(session),
    },
  });
}

function getUserSession(request: Request) {
  return storage.getSession(request.headers.get("Cookie"));
}

export async function getUserId(request: Request) {
  const session = await getUserSession(request);
  const userId = session.get("staff_id");
  if (!userId || typeof userId !== "number") return null;
  return userId;
}

export async function getUser(request: Request) {
  const staffId = await getUserId(request);
  if (typeof staffId !== "number") {
    return null;
  }

  try {
    const query = "SELECT staff_id, email FROM Staff WHERE staff_id = ?";
    const values = [staffId];
    const user = await executeQuery(query, values);

    if (!user || user.length === 0) {
      return null; // User not found
    }

    return { id: user[0].staff_id, email: user[0].email };
  } catch (error) {
    console.error("GetUser error:", error);
    throw logout(request);
  }
}

export async function getUserRequired(request: Request) {
  const userId = await requireUserId(request);
  try {
    const query = `SELECT * FROM Staff WHERE staff_id = ? `;
    const values = [userId];
    const [user] = await executeQuery(query, values);
    if (!user) {
      throw logout(request);
    }
    return user;
  } catch {
    throw logout(request);
  }
}
export async function userRoleCheck(request: Request, role: string) {
  const user = await getUserRequired(request);
  const has = (await user.user_roles?.roles?.name) === role;
  return { user, hasRole: has ?? false };
}
//   export async function userRoleCheck(request: Request, role: string) {
//     const user = await getUserRequired(request);
//     const has = (await user.user_roles?.roles?.name) === role;
//     return { user, hasRole: has ?? false };
//   }

export async function logout(request: Request) {
  const session = await getUserSession(request);
  return redirect("/staff/login", {
    headers: {
      "Set-Cookie": await storage.destroySession(session),
    },
  });
}

export async function requireUserId(request: Request, redirectTo: string = new URL(request.url).pathname) {
  const session = await getUserSession(request);
  const userId = session.get("staff_id");
  //console.log(userId, session.data);
  if ((!userId || typeof userId !== "number") && redirectTo !== "/staff/login") {
    const searchParams = new URLSearchParams([
      ["redirectTo", redirectTo !== "/staff/login" ? redirectTo : "/"],
      ["error", "Your session has expired, please log in again"],
    ]);
    throw redirect(`/staff/login?${searchParams}`);
  }
  return userId;
}

// Function to create a guest session
export function createGuestSession() {
  // Generate a unique session ID for the guest user
  const guestSessionId = nanoid();
  // Return the guest session ID
  return { id: guestSessionId };
}