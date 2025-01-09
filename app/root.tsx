import { MagnifyingGlassIcon, MapPinIcon, ShoppingBagIcon, UserGroupIcon, UserIcon, UsersIcon } from "@heroicons/react/24/outline";
import { cssBundleHref } from "@remix-run/css-bundle";
import type { LinksFunction, LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Links, LiveReload, Meta, NavLink, Outlet, Scripts, ScrollRestoration, useLoaderData, useLocation } from "@remix-run/react";
import React, { useEffect, useRef, useState } from "react";
import { Bounce, ToastContainer } from "react-toastify";
import toastStyles from "react-toastify/dist/ReactToastify.css";
import { getUserRequired } from "~/session.server";
import stylesheet from "~/tailwind.css";
import useNotifications from "./hooks/use-notification";
import { TServiceData, servicesData } from "./routes/service";

export const links: LinksFunction = () => [
  ...(cssBundleHref
    ? [
        { rel: "stylesheet", href: cssBundleHref },
        { rel: "stylesheet", href: stylesheet },
        { rel: "stylesheet", href: toastStyles },
      ]
    : [
        { rel: "stylesheet", href: stylesheet },
        { rel: "stylesheet", href: toastStyles },
      ]),
];

export const loader: LoaderFunction = async ({ request }) => {
  try {
    const user = await getUserRequired(request);
    return json({ user });
  } catch (error) {
    // If no user is found, return a default user object or null
    return json({ user: null });
  }
};

const navigation = {
  support: [
    { name: "Contact Us", href: "/contact" },
    { name: "Services", href: "/service" },
  ],
  company: [
    { name: "About Us", href: "/about" },
    { name: "Locations", href: "/locations" },
    { name: "Account", href: "customer/profile" },
  ],
  legal: [
    { name: "FAQs", href: "/faq" },
    { name: "Terms and Conditions", href: "#" },
    { name: "Privacy Notice", href: "#" },
  ],
};

export default function App() {
  const { user } = useLoaderData();

  const searchRef = useRef<HTMLDivElement>(null);

  const [menuIsOpen, setMenuIsOpen] = useState(false);
  useNotifications();

  const location = useLocation();

  // Toggle Mobile Menu
  const navToggle = () => {
    setMenuIsOpen((prevMenuIsOpen) => !prevMenuIsOpen);
  };

  const [searchInput, setSearchInput] = useState<string>("");
  const [searchResults, setSearchResults] = useState<TServiceData[] | null>(null);
  const searchResultsRef = useRef(null); // Ref for the search results container

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (val.length === 0) {
      setSearchResults(null);
      setSearchInput("");

      return;
    }

    setSearchInput(val);

    const searchValue = val.toLowerCase();

    const filteredResults = servicesData.filter((item) => {
      const name = item.name.toLowerCase();
      const description = item.description.toLowerCase();

      return name.includes(searchValue) || description.includes(searchValue) || searchValue.includes(name) || searchValue.includes(description);
    });

    setSearchResults(filteredResults);
  };

  useEffect(() => {
    if (location.pathname) {
      setSearchResults(null);
      setSearchInput("");
    }
  }, [location.pathname]);

  useEffect(() => {
    // Add event listener to detect clicks outside the input and suggestion box
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setSearchResults(null);
        setSearchInput("");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <Meta />
        <Links />
      </head>

      <body className="flex flex-col min-h-screen" style={{ backgroundColor: "#F9F7F7" }}>
        <div className="flex flex-col min-h-screen">
          {/* Navigation Bar */}
          <nav
            className="fixed inset-x-0 px-6 py-3 flex flex-row justify-between top-0 mx-auto w-full"
            style={{
              backgroundColor: "#F9F7F7",
              borderBottom: "5px solid #112D4E",
              zIndex: "1000",
            }}
          >
            {/* Logo */}
            <div className="pt-5">{/*<img src="/images/logo.png" alt="Logo" />*/}</div>

            {/* Navigation Items */}
            <ul className={`nav flex flex-col lg:flex-row lg:space-x-8 pt-5 lg:pl-20 justify-center align-items-center w-full font-bold ${menuIsOpen ? "hidden lg:flex" : "lg:flex"}`}>
              <NavLink to={"/"} className={({ isActive }) => `${isActive ? "text-blue-800" : ""}`}>
                Home
              </NavLink>
              <NavLink to={"/about"} className={({ isActive }) => `${isActive ? "text-blue-800" : ""}`}>
                About Us
              </NavLink>
              <NavLink to={"/service"} className={({ isActive }) => `${isActive ? "text-blue-800" : ""}`}>
                Services
              </NavLink>
              <NavLink to={"/contact"} className={({ isActive }) => `${isActive ? "text-blue-800" : ""}`}>
                Contact Us
              </NavLink>
              <div className="flex-grow"></div> {/* Use for remaining space */}
              <div className="flex space-x-4 items-center">
                {/* Search Bar */}
                <div ref={searchRef}>
                  <form className="flex" ref={searchResultsRef}>
                    <input type="text" placeholder="Search" style={{ width: "200px" }} value={searchInput} onChange={handleSearch} />

                    <button style={{ backgroundColor: "#112D4E", color: "#F9F7F7" }}>
                      <MagnifyingGlassIcon className="h-6 w-6" style={{ width: "50px" }} />
                    </button>
                  </form>

                  {/* Display search results */}
                  <div>
                    {searchResults && searchResults.length > 0 && (
                      <div className="absolute mt-2 bg-white border rounded-md shadow-md w-[22rem]">
                        <ul>
                          {searchResults.map((result, index) => (
                            <li key={index} className="py-2 px-4 hover:bg-gray-200">
                              <NavLink onClick={(event) => event.stopPropagation()} to={result.link} className={({ isActive }) => `${isActive ? "text-blue-800" : ""}`}>
                                {result.name}
                              </NavLink>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <NavLink to={"/locations"} className={({ isActive }) => `${isActive ? "text-blue-800" : ""}`}>
                <div className="flex flex-col items-center">
                  <MapPinIcon className="h-6 w-6" />
                  <span style={{ fontSize: "10px", fontWeight: "lighter" }}>Locations</span>
                </div>
              </NavLink>
              {/* Conditional rendering based on user's role */}
              {user && user.role === "Admin" && (
                <NavLink to="/admin/profile" className={({ isActive }) => (isActive ? "active" : "")}>
                  <div className="flex flex-col items-center">
                    <UsersIcon className="h-6 w-6" />
                    <span style={{ fontSize: "10px", fontWeight: "lighter" }}>Account</span>
                  </div>
                </NavLink>
              )}
              {user && user.role === "Manager" && (
                <NavLink to="/manager/profile" className={({ isActive }) => (isActive ? "active" : "")}>
                  <div className="flex flex-col items-center">
                    <UserGroupIcon className="h-6 w-6" />
                    <span style={{ fontSize: "10px", fontWeight: "lighter" }}>Account</span>
                  </div>
                </NavLink>
              )}
              {!user && (
                <NavLink to="/customer/profile" className={({ isActive }) => (isActive ? "active" : "")}>
                  <div className="flex flex-col items-center">
                    <UserIcon className="h-6 w-6" />
                    <span style={{ fontSize: "10px", fontWeight: "lighter" }}>Account</span>
                  </div>
                </NavLink>
              )}
              <NavLink to={"/basket"} className={({ isActive }) => `${isActive ? "text-blue-800" : ""}`}>
                <div className="flex flex-col items-center">
                  <ShoppingBagIcon className="h-6 w-6" />
                  <span style={{ fontSize: "10px", fontWeight: "lighter" }}>Basket</span>
                </div>
              </NavLink>
            </ul>

            {/*Hamburger Button*/}
            <button onClick={navToggle} name="menu-btn" id="menu-btn" className="block hamburger lg:hidden focus:outline-none" type="button">
              <span className="hamburger-top"></span>
              <span className="hamburger-middle"></span>
              <span className="hamburger-bottom"></span>
            </button>

            {menuIsOpen && (
              <div id="menu" className="absolute hidden p-6 rounded-lg bg-darkViolet left-6 right-6 top-20 z-100">
                <div className="flex flex-col items-center justify-center w-full space-y-6 font-bold text-white rounded-sm">
                  <NavLink to="/" className="w-full text-center">
                    Home
                  </NavLink>
                  <NavLink to="/about" className="w-full text-center">
                    About
                  </NavLink>
                  <NavLink to="/service" className="w-full text-center">
                    Services
                  </NavLink>
                  <NavLink to="/contact" className="w-full text-center">
                    Contact us
                  </NavLink>
                  <NavLink to="/locations" className="w-full text-center">
                    Locations
                  </NavLink>
                  <NavLink to="customer/profile" className="w-full text-center">
                    Login/Sign Up
                  </NavLink>
                  <NavLink to="/basket" className="w-full text-center">
                    Basket
                  </NavLink>
                </div>
              </div>
            )}
          </nav>
          {/* The rest of your component */}
          <div className="flex-grow">
            <Outlet />
            <ToastContainer position="top-right" autoClose={5000} hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover theme="light" transition={Bounce} />
          </div>

          <footer
            className=" "
            aria-labelledby="footer-heading"
            style={{
              marginTop: "",
              backgroundColor: "#F9F7F7",
              borderTop: "5px solid #112D4E",
            }}
          >
            <h2 id="footer-heading" className="sr-only">
              Footer
            </h2>
            <div className="mx-auto max-w-6xl px-6 pb-8 pt-16 sm:pt-24 lg:px-8 lg:pt-32">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                <div className="mb-16 md:mb-0">
                  <h3 className="text-sm font-semibold leading-6 text-gray-900">Support</h3>
                  <ul role="list" className="mt-2 space-y-2">
                    {navigation.support.map((item) => (
                      <li key={item.name}>
                        <a href={item.href} className="text-sm leading-6 text-gray-600 hover:text-gray-900">
                          {item.name}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mb-16 md:mb-0">
                  <h3 className="text-sm font-semibold leading-6 text-gray-900">Company</h3>
                  <ul role="list" className="mt-2 space-y-2">
                    {navigation.company.map((item) => (
                      <li key={item.name}>
                        <a href={item.href} className="text-sm leading-6 text-gray-600 hover:text-gray-900">
                          {item.name}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h3 className="text-sm font-semibold leading-6 text-gray-900">Legal</h3>
                  <ul role="list" className="mt-2 space-y-2">
                    {navigation.legal.map((item) => (
                      <li key={item.name}>
                        <a href={item.href} className="text-sm leading-6 text-gray-600 hover:text-gray-900">
                          {item.name}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="">
                  <h3 className="text-sm font-semibold leading-6 text-gray-900">Subscribe to our newsletter</h3>
                  <p className="mt-2 text-sm leading-6 text-black-300">The latest news, articles, and resources, sent to your inbox weekly.</p>
                  <form className="mt-6 sm:flex sm:max-w-md">
                    <label htmlFor="email-address" className="sr-only">
                      Email address
                    </label>
                    <input
                      type="email"
                      name="email-address"
                      id="email-address"
                      autoComplete="email"
                      required
                      className="min-w-0 e border-1 px-2 py-1 w-60 bg-white/5 text-base text-black ring-1 ring-inset ring-white/10 placeholder:text-gray-500 focus:ring-2 focus:ring-inset focus:ring-indigo-900 sm:w-64 sm:text-sm sm:leading-6 xl:w-full"
                      placeholder="Enter your email"
                      style={{ borderColor: "#112D4E" }}
                    />
                    <div className="mt-4 sm:ml-4 sm:mt-0 sm:flex-shrink-0">
                      <button type="submit" className="flex w-full items-center justify-center rounded-full px-3 py-2 text-sm font-light text-white " style={{ backgroundColor: "#112D4E", fontSize: "16px" }}>
                        Subscribe
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </footer>
        </div>

        <>
          <ScrollRestoration />
          <Scripts />
          <LiveReload />
        </>
      </body>
    </html>
  );
}
