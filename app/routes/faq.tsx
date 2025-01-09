import { Disclosure } from "@headlessui/react";
import { MinusSmallIcon, PlusSmallIcon } from "@heroicons/react/24/outline";

const faqs = [
  {
    question: "When is it time for an oil change?",
    answer: "We recommend an oil change every 3,000 to 5,000 miles, but check your vehicle's manual for specific intervals.",
  },
  {
    question: "How often should I replace my car's air filter?",
    answer: "Generally, every 12,000 to 15,000 miles, but it depends on driving conditions. Inspect it regularly and replace if dirty.",
  },
  {
    question: "What are the signs of brake problems?",
    answer: "Watch for squeaking, grinding, or a soft brake pedal. If you notice any issues, get your brakes inspected promptly.",
  },
  {
    question: "Do I need winter tires in colder climates?",
    answer: "Yes, winter tires provide better traction in icy and snowy conditions, improving overall safety during winter.",
  },
  {
    question: "When should I replace my car's timing belt?",
    answer: "Typically, every 60,000 to 100,000 miles, but refer to your car's manual for the manufacturer's recommended interval.",
  },
  {
    question: "What's included in a standard vehicle tune-up?",
    answer: "A tune-up involves inspecting and replacing spark plugs, checking ignition systems, and ensuring overall engine performance.",
  },
];

export default function Example() {
  return (
    <div>
      <div className="mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:px-8 lg:py-40">
        <div className="mx-auto max-w-4xl divide-y text-center" style={{ color: "#112D4E" }}>
          <h2 className="mt-2 text-4xl font-bold tracking-tight sm:text-6xl" style={{ color: "#112D4E" }}>
            Frequently asked questions
          </h2>
          <dl className="mt-10 space-y-6 divide-y" style={{ color: "#3F72AF" }}>
            {faqs.map((faq) => (
              <Disclosure as="div" key={faq.question} className="pt-6">
                {({ open }) => (
                  <>
                    <dt>
                      <Disclosure.Button className="flex w-full items-start justify-between text-left">
                        <span className="text-base font-semibold leading-7" style={{color: "#112D4E" }}>{faq.question}</span>
                        <span className="ml-6 flex h-7 items-center">{open ? <MinusSmallIcon className="h-6 w-6" aria-hidden="true" style={{ color: "#3F72AF" }}/> : <PlusSmallIcon className="h-6 w-6" aria-hidden="true" />}</span>
                      </Disclosure.Button>
                    </dt>
                    <Disclosure.Panel as="dd" className="mt-2 pr-12">
                      <p className="text-base leading-7" style={{ color: "#112D4E" }} >{faq.answer}</p>
                    </Disclosure.Panel>
                  </>
                )}
              </Disclosure>
            ))}
          </dl>
        </div>
      </div>
    </div>
  );
}
