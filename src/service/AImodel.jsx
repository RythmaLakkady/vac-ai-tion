<<<<<<< HEAD
const {
    GoogleGenerativeAI,
    HarmCategory,
    HarmBlockThreshold,
} = await import("@google/generative-ai");

console.log(GoogleGenerativeAI);
const apiKey = import.meta.env.VITE_GOOGLE_GEMINI_AI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);



const model = genAI.getGenerativeModel({
    model: "gemini-2.0-flash-exp",
});

const generationConfig = {
    temperature: 1,
    topP: 0.95,
    topK: 40,
    maxOutputTokens: 8192,
    responseMimeType: "application/json",
};

export const chatSession = model.startChat({
    generationConfig,
    history: [
        {
            role: "user",
            parts: [
                { text: "Generate a 3-day travel itinerary for a couple traveling to Las Vegas, with a budget-friendly plan (Cheap budget). Provide details on hotel options, including the hotel name, address, price, image, geo-coordinates, rating, and description. Additionally, suggest an itinerary for each of the 3 days with the following details for each place:\n\nPlace Name\nPlace Details (e.g., short description or what to expect)\nPlace Image URI (link to a relevant image)\nGeo Coordinates\nTicket Pricing\nRating (e.g., user reviews or stars)\nTime Travel (duration to reach from previous location)\nThe itinerary should cover the best time to visit each location. The output should be in JSON format" },
            ],
        },
        {
            role: "model",
            parts: [
                { text: "```json\n{\n  \"trip_name\": \"Budget-Friendly Las Vegas Getaway for Couples\",\n  \"duration\": \"3 Days\",\n  \"budget\": \"Cheap\",\n  \"travelers\": \"Couple\",\n    \"hotel_options\": [\n    {\n        \"hotel_name\": \"Circus Circus Hotel & Casino\",\n        \"address\": \"2880 S Las Vegas Blvd, Las Vegas, NV 89109\",\n        \"price\": \"Approx. $40 - $80 per night\",\n      \"image\": \"https://media-cdn.tripadvisor.com/media/photo-s/1c/22/38/25/circus-circus-hotel-casino.jpg\",\n        \"geo_coordinates\": {\n            \"latitude\": 36.138891,\n            \"longitude\": -115.166558\n        },\n        \"rating\": \"3.5 stars\",\n        \"description\": \"A classic Vegas hotel with a circus theme, offering affordable rooms and family-friendly entertainment. While not luxurious, it provides a budget-friendly option on the Strip.\"\n    },\n    {\n        \"hotel_name\": \"Excalibur Hotel & Casino\",\n        \"address\": \"3850 S Las Vegas Blvd, Las Vegas, NV 89109\",\n        \"price\": \"Approx. $50 - $90 per night\",\n        \"image\": \"https://media-cdn.tripadvisor.com/media/photo-s/16/4b/34/2b/excalibur-hotel-casino.jpg\",\n        \"geo_coordinates\": {\n            \"latitude\": 36.098800,\n            \"longitude\": -115.173650\n        },\n        \"rating\": \"3.8 stars\",\n        \"description\": \"A castle-themed hotel with affordable rates and basic amenities. Located at the southern end of the Strip, it's a fun option with plenty of dining and entertainment choices.\"\n    },\n         {\n            \"hotel_name\": \"Linq Hotel + Experience\",\n            \"address\": \"3535 S Las Vegas Blvd, Las Vegas, NV 89109\",\n            \"price\": \"Approx. $60 - $120 per night\",\n             \"image\": \"https://media-cdn.tripadvisor.com/media/photo-s/1c/22/8b/74/linq-hotel-casino.jpg\",\n            \"geo_coordinates\": {\n              \"latitude\": 36.116712,\n              \"longitude\": -115.170605\n            },\n              \"rating\": \"4.0 stars\",\n            \"description\": \"A modern and trendy option on the strip. While slightly higher in price, it offers a central location and proximity to the LINQ Promenade. Can find deals online to fit a lower budget.\"\n          }\n   ],\n  \"itinerary\": {\n    \"day1\": {\n      \"theme\": \"Exploring the Southern Strip\",\n      \"activities\": [\n        {\n          \"place_name\": \"Welcome to Fabulous Las Vegas Sign\",\n          \"place_details\": \"A must-see iconic sign. Take photos and enjoy the Vegas vibe.\",\n          \"place_image\": \"https://upload.wikimedia.org/wikipedia/commons/thumb/0/02/Las_Vegas_Welcome_Sign_Night.jpg/800px-Las_Vegas_Welcome_Sign_Night.jpg\",\n          \"geo_coordinates\": {\n            \"latitude\": 36.082742,\n            \"longitude\": -115.172340\n          },\n          \"ticket_pricing\": \"Free\",\n          \"rating\": \"4.5 stars\",\n          \"time_travel\": \"10 mins (from Excalibur)\"\n        },\n        {\n            \"place_name\": \"Bellagio Conservatory & Botanical Gardens\",\n            \"place_details\": \"Stunning seasonal floral displays in a beautiful setting.\",\n            \"place_image\": \"https://media.cntraveler.com/photos/5a8ae715176c1d3873c5718e/16:9/w_2560%2Cc_limit/Bellagio-Botanical-Gardens-GettyImages-912809958.jpg\",\n            \"geo_coordinates\": {\n              \"latitude\": 36.112543,\n              \"longitude\": -115.173959\n              },\n             \"ticket_pricing\": \"Free\",\n             \"rating\": \"4.7 stars\",\n             \"time_travel\": \"15 mins (from the sign)\"\n        },\n        {\n          \"place_name\": \"Fountains of Bellagio\",\n          \"place_details\": \"Spectacular water show with music, best viewed at dusk/night.\",\n           \"place_image\": \"https://www.travelandleisure.com/thmb/K1aLd1lB8LdE6_0Wj5b72v_Lw_8=/1500x0/filters:no_upscale():max_bytes(150000):strip_icc()/fountains-bellagio-LASVEGAS0123-a3018f10f7f44042b163d9711462b45e.jpg\",\n          \"geo_coordinates\": {\n            \"latitude\": 36.112685,\n            \"longitude\": -115.173331\n          },\n          \"ticket_pricing\": \"Free\",\n          \"rating\": \"4.8 stars\",\n          \"time_travel\": \"2 mins (from Bellagio Conservatory)\"\n        },\n        {\n          \"place_name\": \"M&M's World\",\n          \"place_details\": \"A colorful, multi-story store with fun M&M merchandise.\",\n          \"place_image\": \"https://media-cdn.tripadvisor.com/media/photo-s/12/55/f1/f9/mm-s-world.jpg\",\n           \"geo_coordinates\": {\n             \"latitude\": 36.108596,\n             \"longitude\": -115.171387\n             },\n           \"ticket_pricing\": \"Free Entry, Purchases Optional\",\n           \"rating\": \"4.2 stars\",\n           \"time_travel\": \"10 mins (from Bellagio Fountains)\"\n         }\n      ],\n      \"best_time\": \"Afternoon to Evening\"\n    },\n    \"day2\": {\n      \"theme\": \"Exploring Central & Fremont Street\",\n      \"activities\": [\n          {\n              \"place_name\": \"LINQ Promenade\",\n              \"place_details\": \"A pedestrian shopping and entertainment district with restaurants, shops, and the High Roller observation wheel.\",\n            \"place_image\":\"https://media-cdn.tripadvisor.com/media/photo-s/17/69/46/7f/linq-promenade.jpg\",\n              \"geo_coordinates\": {\n                  \"latitude\": 36.116999,\n                  \"longitude\": -115.169863\n              },\n            \"ticket_pricing\":\"Free Entry\",\n             \"rating\":\"4.4 stars\",\n            \"time_travel\":\"15 mins (from the hotel, if staying at the LINQ or 15 mins from Circus Circus)\"\n          },\n        {\n          \"place_name\": \"Fremont Street Experience\",\n          \"place_details\": \"A pedestrian mall with a giant video screen canopy, live music, and street performers.\",\n          \"place_image\": \"https://media.cntraveler.com/photos/58a22701948589f6c1944408/16:9/w_2560%2Cc_limit/GettyImages-451040228.jpg\",\n          \"geo_coordinates\": {\n            \"latitude\": 36.169846,\n            \"longitude\": -115.140039\n          },\n          \"ticket_pricing\": \"Free\",\n          \"rating\": \"4.5 stars\",\n          \"time_travel\": \"20 mins (from LINQ)\"\n        },\n        {\n          \"place_name\": \"Container Park\",\n          \"place_details\": \"A unique outdoor shopping and entertainment venue built from shipping containers.\",\n           \"place_image\":\"https://www.reviewjournal.com/wp-content/uploads/2016/07/6998314_web1_CONTAINER-PARK-JUL19-16_001.jpg\",\n          \"geo_coordinates\": {\n            \"latitude\": 36.167656,\n            \"longitude\": -115.141237\n          },\n          \"ticket_pricing\": \"Free Entry\",\n          \"rating\": \"4.3 stars\",\n          \"time_travel\": \"5 mins (from Fremont Street)\"\n        },\n                {\n                  \"place_name\": \"Downtown Murals\",\n                  \"place_details\": \"Enjoy a self-guided tour of the vibrant murals and street art in the downtown area.\",\n                 \"place_image\":\"https://www.lasvegasnevada.gov/getattachment/40a1c140-f89f-447c-9029-441418d07998/Murals-Downtown-Las-Vegas_1.aspx\",\n                  \"geo_coordinates\": {\n                    \"latitude\": 36.167716,\n                    \"longitude\": -115.147214\n                  },\n                  \"ticket_pricing\": \"Free\",\n                  \"rating\": \"4.6 stars\",\n                    \"time_travel\": \"5 min walk (from container park) \"\n                }\n      ],\n        \"best_time\": \"Evening for Fremont, Daytime for exploring\"\n    },\n    \"day3\": {\n      \"theme\": \"Relaxing & Departure\",\n      \"activities\": [\n        {\n          \"place_name\": \"Red Rock Canyon National Conservation Area\",\n          \"place_details\": \"Scenic desert landscapes, hiking trails (short hikes available), and a 13-mile scenic drive.\",\n          \"place_image\": \"https://upload.wikimedia.org/wikipedia/commons/thumb/a/a1/Red_Rock_Canyon.jpg/800px-Red_Rock_Canyon.jpg\",\n          \"geo_coordinates\": {\n            \"latitude\": 36.146349,\n            \"longitude\": -115.415332\n          },\n          \"ticket_pricing\": \"$15 per vehicle\",\n          \"rating\": \"4.8 stars\",\n          \"time_travel\": \"30 min drive (from the Strip) \",\n             \"notes\": \"If you don't have a car, you can skip this and explore more of the strip or other parks. You can also use a taxi or rideshare which may be costly.\"\n        },\n           {\n             \"place_name\": \"Pool Day at Hotel\",\n              \"place_details\": \"Relax by the pool, enjoy the sun, and unwind. \",\n               \"place_image\":\"https://www.mgmresorts.com/content/dam/MGM/mgmresorts/property/mgm-grand/amenities/pool/MGM-pool.jpg\",\n               \"geo_coordinates\": {\n                 \"latitude\": 36.1022,\n                 \"longitude\": -115.1755\n               },\n               \"ticket_pricing\": \"Free if staying at the hotel\",\n              \"rating\": \"4.5 stars\",\n               \"time_travel\": \"Stay at your hotel\"\n           },\n        {\n          \"place_name\": \"Las Vegas Strip\",\n           \"place_details\": \"Explore the iconic Las Vegas Strip. Wander through casinos, shops, and attractions before you leave.\",\n            \"place_image\": \"https://media.cntraveler.com/photos/5f7d5f5b53d2a96f8c460ddf/16:9/w_2560%2Cc_limit/las-vegas-strip-GettyImages-103079147.jpg\",\n           \"geo_coordinates\": {\n              \"latitude\": 36.114707,\n              \"longitude\": -115.172843\n           },\n           \"ticket_pricing\": \"Free\",\n           \"rating\": \"4.6 stars\",\n           \"time_travel\": \"10 min (from the hotel or depending on location)\"\n        }\n      ],\n      \"best_time\": \"Morning to Afternoon\"\n    }\n  }\n}\n```" }
            ],
        }
    ]
});
=======
import OpenAI from 'openai';

const apiKey = import.meta.env.VITE_GROQ_API_KEY;
const client = new OpenAI({ 
  apiKey, 
  baseURL: 'https://api.groq.com/openai/v1',
  dangerouslyAllowBrowser: true 
});

const systemPrompt = `You are a travel planning assistant that generates detailed travel itineraries in JSON format.`;

export const chatSession = {
  async sendMessage(prompt) {
    const response = await client.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      max_tokens: 5000,
      response_format: { type: "json_object" },
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt }
      ]
    });
    const text = response.choices[0].message.content;
    return { response: { text: () => text } };
  }
};
>>>>>>> c46005a (Initialize WanderGen trip planner)
