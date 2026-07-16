import { useState, useMemo } from "react";
import { auth } from "../firebase";
import { rankVendorResults } from "../utils/rankVendorResults";
import { Wallet } from "lucide-react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

const FUNCTION_URL =
  import.meta.env.VITE_PRICE_FUNCTION_URL ||
  "http://127.0.0.1:5001/wandergen---ai-travel-planner/us-central1/priceAggregator";

const BUDGET_OPTIONS = ["Low-Cost", "Affordable Comfort", "Luxury"];

export default function ComparePrices() {
  // Search inputs
  const [destination, setDestination] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const handleSearch = async (e) => {
    const value = e.target.value;
    setDestination(value);

    if (value.length > 2) {
      try {
        const res = await fetch(
          `https://api.locationiq.com/v1/autocomplete.php?key=pk.eb1ca2dd56903301b770e16676fe0560&q=${value}&limit=5&format=json`
        );
        const data = await res.json();
        setSearchResults(data);
      } catch (error) {
        console.error("Error fetching autocomplete data:", error);
      }
    } else {
      setSearchResults([]);
    }
  };

  // Preference toggles (for client-side re-ranking)
  const [budget, setBudget] = useState("Affordable Comfort");
  const [prefersRefundable, setPrefersRefundable] = useState(false);
  const [ecoConscious, setEcoConscious] = useState(false);

  // Results state
  const [rawResults, setRawResults] = useState([]);
  const [insights, setInsights] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Category filter state
  const [activeCategory, setActiveCategory] = useState("All");

  // Re-rank on the client whenever prefs change (instant, no API call)
  const results = useMemo(() => {
    if (rawResults.length === 0) return [];
    
    let filtered = rawResults;
    if (activeCategory !== "All") {
      filtered = rawResults.filter((r) => r.type === activeCategory);
    }
    
    return rankVendorResults(filtered, { budget, prefersRefundable, ecoConscious });
  }, [rawResults, budget, prefersRefundable, ecoConscious, activeCategory]);

  const handleCompare = async () => {
    if (!destination || !startDate || !endDate) {
      setError("Please fill in destination and both dates.");
      return;
    }
    setError("");
    setLoading(true);

    try {
      const groqApiKey = import.meta.env.VITE_GROQ_API_KEY;

      const res = await fetch(`${FUNCTION_URL}/compare`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          destination,
          dates: { start: startDate, end: endDate },
          groqApiKey,
          preferences: {
            userId: auth.currentUser?.uid || "anon",
            budget,
            prefersRefundable,
            ecoConscious,
          },
        }),
      });

      if (!res.ok) throw new Error(`Server error ${res.status}`);
      const data = await res.json();
      setRawResults(data.results || []);
      setInsights(data.insights || "");
    } catch (err) {
      console.error("Compare error:", err);
      setError("Failed to fetch prices. Is the function running?");
    } finally {
      setLoading(false);
    }
  };

  // ── Chart data ───────────────────────────────
  const chartData = {
    labels: results.map((r) => r.vendor),
    datasets: [
      {
        label: "Price (USD)",
        data: results.map((r) => r.price),
        backgroundColor: ["#7AB9B3", "#FD9C7E", "#6a9f9c", "#f4845f"],
        borderRadius: 8,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx) => `$${ctx.raw} USD`,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: false,
        ticks: { callback: (v) => `$${v}` },
      },
    },
  };

  // ── Best match badge ─────────────────────────
  const bestVendor = results.length > 0 ? results[0] : null;

  return (
    <div className="sm:px-20 md:px-32 lg:px-56 xl:px-10 px-10 pt-32 pb-16 min-h-screen max-w-7xl mx-auto">
      {/* ── Header ─────────────────────────────── */}
      <div className="text-center glass p-8 rounded-[30px] shadow-lg border-white/50">
        <h2 className="font-serif font-bold text-4xl text-holiday-dark flex items-center justify-center gap-3 drop-shadow-sm">
          Compare Prices <Wallet className="w-8 h-8 text-holiday-coral" />
        </h2>
        <p className="mt-3 font-serif text-holiday-dark opacity-80 text-[18px]">
          See prices from multiple vendors, ranked for <em>you</em>.
        </p>
      </div>

      {/* ── Search Form ────────────────────────── */}
      <div className="mt-12 flex flex-col md:flex-row gap-6 justify-center items-end flex-wrap glass p-10 rounded-3xl shadow-xl border-white/50">
        <div className="relative">
          <label className="block text-sm font-semibold text-holiday-dark mb-2 font-serif uppercase tracking-wider">Destination</label>
          <input
            className="px-4 py-3 border-2 border-gray-200 bg-white rounded-xl w-64 focus:outline-none focus:border-holiday-teal font-serif shadow-sm transition-colors text-holiday-dark"
            placeholder="e.g. Tokyo"
            value={destination}
            onChange={handleSearch}
          />
          {searchResults.length > 0 && (
            <ul className="absolute z-10 w-full bg-white border border-gray-200 rounded-xl mt-1 max-h-48 overflow-y-auto shadow-2xl">
              {searchResults.map((place, index) => (
                <li
                  key={`${place.place_id}-${index}`}
                  onClick={() => {
                    setSelectedPlace(place);
                    setDestination(place.display_name);
                    setSearchResults([]);
                  }}
                  className="p-3 cursor-pointer hover:bg-holiday-sand text-sm font-serif text-left truncate transition-colors border-b border-gray-50 last:border-0"
                >
                  {place.display_name}
                </li>
              ))}
            </ul>
          )}
        </div>
        <div>
          <label className="block text-sm font-semibold text-holiday-dark mb-2 font-serif uppercase tracking-wider">Start Date</label>
          <input
            type="date"
            className="px-4 py-3 border-2 border-gray-200 bg-white rounded-xl focus:outline-none focus:border-holiday-teal font-serif shadow-sm transition-colors text-holiday-dark"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-holiday-dark mb-2 font-serif uppercase tracking-wider">End Date</label>
          <input
            type="date"
            className="px-4 py-3 border-2 border-gray-200 bg-white rounded-xl focus:outline-none focus:border-holiday-teal font-serif shadow-sm transition-colors text-holiday-dark"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>
        <button
          onClick={handleCompare}
          disabled={loading}
          className="px-10 py-3 bg-holiday-teal text-white font-bold rounded-xl
                     hover:bg-[#5aa196] shadow-md hover:shadow-xl transition-all duration-300 disabled:opacity-50"
        >
          {loading ? "Searching…" : "Compare"}
        </button>
      </div>

      {/* ── Error message ──────────────────────── */}
      {error && (
        <p className="mt-4 text-red-500 text-center font-serif">{error}</p>
      )}

      {/* ── LLM Travel Insights ──────────────────── */}
      {insights && (
        <div className="mt-12 glass p-8 rounded-3xl shadow-lg border-white/50 max-w-4xl mx-auto">
          <h3 className="font-serif text-2xl font-bold text-holiday-dark mb-4 flex items-center gap-2 drop-shadow-sm">
            ✨ AI Expert Insights
          </h3>
          <p className="font-serif text-holiday-dark opacity-90 leading-relaxed text-base md:text-lg">
            {insights}
          </p>
        </div>
      )}

      {/* ── Category Toggles ───────────────────── */}
      {rawResults.length > 0 && (
        <div className="mt-12 flex justify-center gap-4 flex-wrap">
          {["All", "Flight", "Hotel", "Ticket"].map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-8 py-3 rounded-full font-serif font-bold transition-all duration-300 shadow-md ${
                activeCategory === cat
                  ? "bg-holiday-coral text-white scale-105"
                  : "glass text-holiday-dark hover:border-holiday-coral hover:text-holiday-coral"
              }`}
            >
              {cat === "All" ? "🌍 All" : cat === "Flight" ? "✈️ Flights" : cat === "Hotel" ? "🏨 Hotels" : "🎟️ Tickets"}
            </button>
          ))}
        </div>
      )}

      {/* ── Preference Toggles (re-rank instantly) */}
      {rawResults.length > 0 && (
        <div className="mt-8 flex flex-col md:flex-row gap-6 justify-center items-center
                        glass rounded-2xl p-6 shadow-md max-w-4xl mx-auto border-white/50">
          <span className="font-serif font-bold text-holiday-dark">
            Personalise results:
          </span>

          {/* Budget tier */}
          <div className="flex gap-2 bg-white/40 p-1 rounded-full border border-white/50">
            {BUDGET_OPTIONS.map((opt) => (
              <button
                key={opt}
                onClick={() => setBudget(opt)}
                className={`px-4 py-2 rounded-full text-sm font-serif font-semibold transition-colors
                  ${budget === opt
                    ? "bg-holiday-teal text-white shadow-md"
                    : "text-holiday-dark opacity-70 hover:opacity-100"
                  }`}
              >
                {opt}
              </button>
            ))}
          </div>

          {/* Refundable toggle */}
          <label className="flex items-center gap-2 cursor-pointer font-serif font-semibold text-holiday-dark text-sm">
            <input
              type="checkbox"
              checked={prefersRefundable}
              onChange={(e) => setPrefersRefundable(e.target.checked)}
              className="accent-holiday-teal w-4 h-4"
            />
            Prefer refundable
          </label>

          {/* Eco toggle */}
          <label className="flex items-center gap-2 cursor-pointer font-serif font-semibold text-holiday-dark text-sm">
            <input
              type="checkbox"
              checked={ecoConscious}
              onChange={(e) => setEcoConscious(e.target.checked)}
              className="accent-holiday-teal w-4 h-4"
            />
            🌿 Eco-friendly
          </label>
        </div>
      )}

      {/* ── Best Match Banner ──────────────────── */}
      {bestVendor && (
        <div className="mt-8 mx-auto max-w-2xl bg-gradient-to-r from-holiday-teal to-[#5ca8a1]
                        text-white rounded-3xl p-6 shadow-2xl text-center border-2 border-white/20">
          <p className="text-sm font-serif font-bold uppercase tracking-wider opacity-90">🏆 Best match for you</p>
          <p className="text-3xl font-serif font-bold mt-2 drop-shadow-sm">
            {bestVendor.vendor} — ${bestVendor.price} USD
          </p>
          <p className="text-base mt-2 font-serif opacity-90">
            Score: {bestVendor.score} · ⭐ {bestVendor.rating} ·{" "}
            {bestVendor.refundable ? "Refundable ✅" : "Non-refundable"} ·{" "}
            {bestVendor.co2Kg} kg CO₂
          </p>
        </div>
      )}

      {/* ── Results Table ──────────────────────── */}
      {results.length > 0 && (
        <div className="mt-12 overflow-x-auto glass p-6 rounded-3xl shadow-xl border-white/50">
          <table className="w-full mx-auto border-collapse">
            <thead className="text-holiday-dark font-serif text-lg border-b-2 border-white/50">
              <tr>
                <th className="px-6 py-4 text-left font-bold">Rank</th>
                <th className="px-6 py-4 text-left font-bold">Type</th>
                <th className="px-6 py-4 text-left font-bold">Vendor</th>
                <th className="px-6 py-4 text-left font-bold">Price</th>
                <th className="px-6 py-4 text-left font-bold">Score</th>
                <th className="px-6 py-4 text-left font-bold">Rating</th>
                <th className="px-6 py-4 text-left font-bold">Refundable</th>
                <th className="px-6 py-4 text-left font-bold">CO₂</th>
                <th className="px-6 py-4 text-left font-bold">Link</th>
              </tr>
            </thead>
            <tbody>
              {results.map((r, i) => (
                <tr
                  key={i}
                  className={`border-b border-white/30 transition-colors hover:bg-white/40 ${
                    i === 0 ? "bg-white/60 font-semibold" : ""
                  }`}
                >
                  <td className="px-6 py-4 font-bold font-serif text-holiday-dark">
                    {i === 0 ? "🏆" : `#${i + 1}`}
                  </td>
                  <td className="px-6 py-4 font-semibold font-serif text-holiday-dark/70">
                    {r.type === "Hotel" ? "🏨 Hotel" : r.type === "Ticket" ? "🎟️ Ticket" : "✈️ Flight"}
                  </td>
                  <td className="px-6 py-4 font-bold font-serif text-holiday-dark">{r.vendor}</td>
                  <td className="px-6 py-4 font-serif text-holiday-teal font-bold">${r.price}</td>
                  <td className="px-6 py-4 font-serif">
                    <span className="bg-holiday-teal text-white text-xs px-3 py-1.5 rounded-full font-bold shadow-sm">
                      {r.score}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-serif text-holiday-dark/80">⭐ {r.rating}</td>
                  <td className="px-6 py-4 font-serif">
                    {r.refundable ? "✅" : "❌"}
                  </td>
                  <td className="px-6 py-4 font-serif text-holiday-dark/80">{r.co2Kg} kg</td>
                  <td className="px-6 py-4">
                    <a
                      href={r.link}
                      target="_blank"
                      rel="noreferrer"
                      className="text-white bg-holiday-coral px-4 py-2 rounded-full font-bold text-sm shadow-md hover:bg-[#e68a66] hover:shadow-lg transition-all"
                    >
                      Book →
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Price Chart ────────────────────────── */}
      {results.length > 0 && (
        <div className="mt-16 max-w-2xl mx-auto glass p-8 rounded-3xl shadow-xl border-white/50">
          <h3 className="font-serif text-2xl font-bold mb-6 text-center text-holiday-dark drop-shadow-sm">
            Price Comparison Chart
          </h3>
          <Bar data={chartData} options={chartOptions} />
        </div>
      )}
    </div>
  );
}
