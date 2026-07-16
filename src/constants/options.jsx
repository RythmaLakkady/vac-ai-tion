<<<<<<< HEAD
=======
import React from 'react';
import { User, Users, Heart, Tent, Coins, Banknote, Gem } from 'lucide-react';

>>>>>>> c46005a (Initialize WanderGen trip planner)
export const SelectTravelersList = [
  {
    id: 1,
    title: "Just Me",
    desc: "Exploring the world solo, one adventure at a time.",
<<<<<<< HEAD
    icon: "🗺️",
=======
    icon: <User className="w-8 h-8 text-holiday-teal" />,
>>>>>>> c46005a (Initialize WanderGen trip planner)
    people: "1",
  },
  {
    id: 2,
    title: "Couple",
    desc: "A romantic getaway for two, creating unforgettable memories.",
<<<<<<< HEAD
    icon: "🥂",
=======
    icon: <Heart className="w-8 h-8 text-holiday-coral" />,
>>>>>>> c46005a (Initialize WanderGen trip planner)
    people: "2 people",
  },
  {
    id: 3,
    title: "Friends",
    desc: "Traveling with your besties, making every moment count.",
<<<<<<< HEAD
    icon: "🎢",
=======
    icon: <Tent className="w-8 h-8 text-holiday-teal" />,
>>>>>>> c46005a (Initialize WanderGen trip planner)
    people: "5-10 people",
  },
  {
    id: 4,
    title: "Family",
    desc: "A fun-filled trip with your loved ones, perfect for all ages.",
<<<<<<< HEAD
    icon: "👨‍👩‍👧‍👦",
=======
    icon: <Users className="w-8 h-8 text-holiday-coral" />,
>>>>>>> c46005a (Initialize WanderGen trip planner)
    people: "3-5 people",
  },
];

<<<<<<< HEAD

=======
>>>>>>> c46005a (Initialize WanderGen trip planner)
export const SelectBudgetOptions = [
  {
    id: 1,
    title: "Low-Cost",
    desc: "Maximize the fun, minimize the cost—adventure on a budget!",
<<<<<<< HEAD
    icon: "💰",
=======
    icon: <Coins className="w-10 h-10 text-holiday-teal" />,
>>>>>>> c46005a (Initialize WanderGen trip planner)
  },
  {
    id: 2,
    title: "Affordable Comfort",
    desc: "A perfect balance of affordability and comfort—travel smart, stay cozy!",
<<<<<<< HEAD
    icon: "💸",
=======
    icon: <Banknote className="w-10 h-10 text-holiday-coral" />,
>>>>>>> c46005a (Initialize WanderGen trip planner)
  },
  {
    id: 3,
    title: "Luxury",
    desc: "First-class flights, five-star stays, and nothing but the best!",
<<<<<<< HEAD
    icon: "💎",
  }
];

export const AI_PROMPT = 'Generate a {days}-day travel itinerary for {travelers} traveling to {destination}, with a budget of {budget}. Provide details on hotel options, including the hotel name, address, price, image, geo-coordinates, rating, and description. Additionally, suggest an itinerary for each of the {eachday} days with the following details for each place: Place Name, Place Details (e.g., short description or what to expect), Place Image URI (link to a relevant image), Geo Coordinates, Ticket Pricing, Rating (e.g., user reviews or stars) and Time Travel (duration to reach from previous location).The itinerary should cover the best time to visit each location. The output should be in JSON format.'
=======
    icon: <Gem className="w-10 h-10 text-holiday-teal" />,
  }
];

export const AI_PROMPT = `Generate a {days}-day travel itinerary for {travelers} traveling to {destination}, with a budget of {budget}. 

You MUST return your response as a valid JSON object matching this exact structure:
{
  "hotel_options": [
    {
      "hotel_name": "String",
      "address": "String",
      "price": "String (e.g., $150/night)",
      "rating": "String or Number",
      "image_url": "String (Valid Image URL)",
      "geo_coordinates": { "latitude": Number, "longitude": Number },
      "description": "String"
    }
  ],
  "itinerary": [
    {
      "day": Number,
      "theme": "String",
      "best_time": "String",
      "activities": [
        {
          "place_name": "String",
          "place_details": "String",
          "image_url": "String (Valid Image URL)",
          "rating": "String or Number",
          "ticket_pricing": "String",
          "time_travel": "String",
          "geo_coordinates": { "latitude": Number, "longitude": Number }
        }
      ]
    }
  ]
}

Provide 3-5 hotel options. For the itinerary, provide exactly {eachday} days, and 2-3 activities per day. Keep all descriptions extremely concise (max 1 sentence) to avoid large responses. Ensure all image URLs are real, working URLs. Return ONLY the raw JSON object, without any markdown formatting, backticks, or introductory text.`;
>>>>>>> c46005a (Initialize WanderGen trip planner)
