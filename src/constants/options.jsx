import React from 'react';
import { User, Users, Heart, Tent, Coins, Banknote, Gem } from 'lucide-react';

export const SelectTravelersList = [
  {
    id: 1,
    title: "Just Me",
    desc: "Exploring the world solo, one adventure at a time.",
    icon: <User className="w-8 h-8 text-holiday-teal" />,
    people: "1",
  },
  {
    id: 2,
    title: "Couple",
    desc: "A romantic getaway for two, creating unforgettable memories.",
    icon: <Heart className="w-8 h-8 text-holiday-coral" />,
    people: "2 people",
  },
  {
    id: 3,
    title: "Friends",
    desc: "Traveling with your besties, making every moment count.",
    icon: <Tent className="w-8 h-8 text-holiday-teal" />,
    people: "5-10 people",
  },
  {
    id: 4,
    title: "Family",
    desc: "A fun-filled trip with your loved ones, perfect for all ages.",
    icon: <Users className="w-8 h-8 text-holiday-coral" />,
    people: "3-5 people",
  },
];

export const SelectBudgetOptions = [
  {
    id: 1,
    title: "Low-Cost",
    desc: "Maximize the fun, minimize the cost—adventure on a budget!",
    icon: <Coins className="w-10 h-10 text-holiday-teal" />,
  },
  {
    id: 2,
    title: "Affordable Comfort",
    desc: "A perfect balance of affordability and comfort—travel smart, stay cozy!",
    icon: <Banknote className="w-10 h-10 text-holiday-coral" />,
  },
  {
    id: 3,
    title: "Luxury",
    desc: "First-class flights, five-star stays, and nothing but the best!",
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
