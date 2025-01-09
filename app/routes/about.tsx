import { cssBundleHref } from "@remix-run/css-bundle";
import type { LinksFunction } from "@remix-run/node";
import stylesheet from "~/tailwind.css";
import aboutUs_bg from "public/images/aboutUs_bg.jpg"

import { Links, LiveReload, Meta, NavLink, Outlet, Scripts, ScrollRestoration } from "@remix-run/react";
import { ArrowTrendingUpIcon, ClockIcon, HeartIcon } from "@heroicons/react/20/solid";
import { Key, ReactElement, JSXElementConstructor, ReactNode, ReactPortal } from "react";

export const links: LinksFunction = () => [
  ...(cssBundleHref
    ? [
        { rel: "stylesheet", href: cssBundleHref },
        { rel: "stylesheet", href: stylesheet },
      ]
    : [{ rel: "stylesheet", href: stylesheet }]),
];

const cards = [
  {
    name: "Expertise and Services",
    description: (
      <>
        Our team of skilled artisans and technicians, equipped with a wealth of knowledge, ensures that every vehicle receives meticulous care and attention. Whether it's routine maintenance or intricate detailing, we pride ourselves on understanding the unique needs of each vehicle, providing
        services that go beyond expectations. In the ever-evolving landscape of automotive technology, we stand at the forefront of innovation.
      </>
    ),
    icon: <ArrowTrendingUpIcon />,
  },
  {
    name: "Our History",
    description: (
      <>
        Our company was born in 2023 with a bold vision — to revolutionize how vehicles receive top-notch care. Our founders set out to simplify garage services, making the booking process as easy as ordering pizza.
        <br />
        After tireless development, we launched our platform, becoming the go-to destination for automotive enthusiasts. From routine engine check-ups to custom detailing, we expanded our offerings, always striving for excellence.
      </>
    ),
    icon: <ClockIcon />,
  },
  {
    name: "Customer Focus",
    description: (
      <>
        As guardians of your automotive dreams, we place you at the center of everything we do. Our customer-centric approach ensures a seamless experience – from the moment you entrust us with your vehicle to the exhilarating drive that follows our expert touch. In the realm of personalized
        experiences, your voice is the guiding force. Our collaboration goes beyond services; it's about understanding your needs, dreams, and desires, translating them into a tailored automotive reality.
      </>
    ),
    icon: <HeartIcon />,
  },
];

interface Testimonial {
  [x: string]: any;
  quote: string;
  author: {
    name: string;
    position: string;
  };
}

const testimonials: Testimonial[] = [
  {
    quote: "Amazing service! The attention to detail and expertise of the team exceeded my expectations. My car has never looked better.",
    author: {
      name: "John Doe",
      position: "Happy Customer",
    },
  },
  {
    quote: "I've been a customer for years, and I'm always impressed with the professionalism and quality of service. Highly recommended!",
    author: {
      name: "Jane Smith",
      position: "Satisfied Driver",
    },
  },
  {
    quote: "Reliable and trustworthy. They have earned my trust with their consistent quality of service.",
    author: {
      name: "Sarah Foster",
      position: "Satisfied Patron",
    },
  },
  {
    quote: "The team at this garage truly cares about their customers. They go above and beyond to ensure satisfaction. I won't go anywhere else.",
    author: {
      name: "Sam Johnson",
      position: "Loyal Client",
    },
  },
  {
    quote: "They went above and beyond to ensure my car was not only repaired but also returned in a clean and polished condition. Professional, courteous, and highly skilled—AutoPro Solutions is the complete package.",
    author: {
      name: "Sam Johnson",
      position: "Loyal Client",
    },
  },
  {
    quote: "What sets them apart is not just their technical proficiency but their commitment to customer satisfaction.",
    author: {
      name: "John Ian",
      position: "Impressed customer",
    },
  },
  {
    quote: "Top-notch professionals! I've been a loyal customer for years, and their expertise never disappoints.",
    author: {
      name: "Michael Turner",
      position: "Long-time Client",
    },
  },
  {
    quote: "Prompt and efficient. The service provided was excellent, and the staff was friendly and knowledgeable.",
    author: {
      name: "Lisa Anderson",
      position: "Happy Driver",
    },
  },
  {
    quote: "Exceptional work! My car looks brand new after their detailing service. Couldn't be happier.",
    author: {
      name: "David Martinez",
      position: "Delighted Customer",
    },
  },
];

export default function About() {
  return (
    <div className="py-24 sm:py-32" style= {{backgroundImage: `url(${aboutUs_bg})`}}>
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="mt-2 text-4xl font-bold tracking-tight sm:text-6xl" style={{ color: "#112D4E" }}>
            About Us
          </h2>
          <p className="mt-6 text-lg leading-8" style={{ color: "#112D4E" }}>
            Our dedication to excellence extends to delivering high-quality, timely, and reliable services, making car maintenance a stress-free and customer-centric experience.
          </p>

          <div style={{ marginTop: "10px", fontSize: "large" }}>
            <a href="/locations" style={{ color: "#3F72AF" }}>
              View Garage Locations <span style={{ marginLeft: "5px" }}>&rarr;</span>
            </a>
          </div>
        </div>
        <div className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-6 sm:mt-20 lg:mx-0 lg:max-w-none lg:grid-cols-3 lg:gap-8 justify-center" style={{ color: "#112D4E"}}>
          {cards.map((card) => (
            <div key={card.name} className="flex gap-x-4 rounded-xl bg/5 p-6 ring-inset" style={{ backgroundColor: "#DBE2EF" }}>
              {card.icon && (
                <div className="h-10 w-10 flex-none " style={{ color: "#112D4E" }}>
                  {card.icon}
                </div>
              )}
              <div className="text-base leading-7">
                <h3 className="font-semibold text-2xl" style={{ color: "#112D4E" }}>
                  {card.name}
                </h3>
                <p className="mt-2" style={{ color: "#112D4E" }}>
                  {card.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 lg:px-8 text-center mt-10">
        <h2 className="text-4xl font-bold tracking-tight sm:text-6xl" style={{ color: "#112D4E" }}>
          Our Testimonials
        </h2>
        <p className="text-4xl font-bold tracking-tight sm:text-xl mt-6" >
          "Verified and Trusted"
        </p>
      </div>

      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto mt-16 flow-root max-w-2xl sm:mt-20 lg:mx-0 lg:max-w-none">
          <div className="-mt-8 sm:-mx-4 sm:columns-2 sm:text-[0] lg:columns-3">
            {testimonials.map((testimonial) => (
              <div key={testimonial.author.position} className="pt-8 sm:inline-block sm:w-full sm:px-4" >
                <figure className="rounded-2xl p-8 text-sm leading-6" style={{ backgroundColor: "#DBE2EF"}}>
                  <blockquote className="" style={{ color: "#112D4E" }}>
                    <p>{`“${testimonial.quote}”`}</p>
                  </blockquote>
                  <figcaption className="mt-6 flex items-center gap-x-4">
                    <div>
                      <div className="font-semibold text-gray-900">{testimonial.author.name}</div>
                      <div className="" style={{ color: "#3F72AF" }} >{`@${testimonial.author.position}`}</div>
                    </div>
                  </figcaption>
                </figure>
              </div>
            ))}
          </div>
        </div>
      </div>  
    </div>
  );
}
