import { cancellationPolicy, cautionPolicy, idPolicy } from "./policies";

/** FAQ content, grouped. Rendered on /faq with FAQPage schema markup. */
export const faqGroups: { id: string; title: string; items: { q: string; a: string }[] }[] = [
  {
    id: "booking",
    title: "Booking & payment",
    items: [
      { q: "How much is the caution fee?", a: `It depends on the apartment (shown on each listing) and ranges from ₦100,000 to ₦500,000. ${cautionPolicy}` },
      { q: "What is your cancellation policy?", a: cancellationPolicy.join(" ") },
      { q: "How can I pay?", a: "By card, bank or USSD through Paystack or Flutterwave, or by direct bank transfer. Bank transfers hold your dates for 12 hours. International cards are accepted." },
      { q: "Do you offer discounts for longer stays?", a: "Yes. Stays of 7 nights or more are discounted automatically, and stays of 28 nights or more receive our monthly rate. The discount shows in your price breakdown before you pay." },
    ],
  },
  {
    id: "stay",
    title: "During your stay",
    items: [
      { q: "What ID do I need?", a: idPolicy },
      { q: "Can I host a party or event?", a: "Parties and events are not allowed without written approval. Small gatherings, shoots and celebrations can often be arranged in our larger homes for an additional fee and deposit. Please ask before booking." },
      { q: "Is there 24/7 power?", a: "Yes. Every residence has grid power backed by inverters and a generator, so you never sit in the dark. Fuel is included in your rate." },
      { q: "Can I check in early or check out late?", a: "Standard check-in is from 14:00 and check-out by 12:00. Early check-in and late check-out are free when the apartment is free; otherwise we can hold your luggage or offer a half-day rate." },
      { q: "Is the apartment cleaned during my stay?", a: "Housekeeping visits daily (except Sundays) with fresh towels; linen is changed every three days or on request." },
      { q: "When do I get the exact address?", a: "For the privacy and security of our guests and neighbours, the exact address and access instructions are shared 24 hours before check-in." },
    ],
  },
  {
    id: "cars",
    title: "Car rental",
    items: [
      { q: "Can I rent a car without booking an apartment?", a: "Yes. Every car can be booked on its own, by the hour, day or week." },
      { q: "What are the rules for self-drive?", a: "Drivers must be 25 or older and have held a full licence for at least three years. A refundable deposit applies, and the car must be returned with a full tank." },
      { q: "How do chauffeur hours work?", a: "A chauffeur day covers up to 12 hours within Lagos. Fuel is included. Extra hours are billed at the car's hourly rate. Hourly hire has a 4-hour minimum." },
      { q: "How does airport pickup work?", a: "Add your flight number at checkout. Your chauffeur tracks the flight, waits in arrivals at Murtala Muhammed International Airport with a name board and helps with luggage. Delays cost nothing extra." },
      { q: "Can I travel outside Lagos?", a: "Trips outside Lagos State are possible with a chauffeur by prior arrangement. Self-drive cars must stay within Lagos." },
    ],
  },
];
