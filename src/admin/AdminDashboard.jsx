import React, { useEffect, useState } from 'react';
import { db, auth } from '../firebase';
import { collection, query, getDocs, getDoc, doc, orderBy, limit } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { Line } from 'react-chartjs-2';
import { ShieldAlert, BarChart3, Users, Plane, MousePointerClick, Calendar as CalendarIcon, RefreshCw } from 'lucide-react';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

function AdminDashboard() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [timeFilter, setTimeFilter] = useState(30);

  useEffect(() => {
    const checkAdmin = async (user) => {
      if (!user) {
        setIsAdmin(false);
        setLoading(false);
        return;
      }
      try {
        const adminDoc = await getDoc(doc(db, "Admins", user.uid));
        setIsAdmin(adminDoc.exists());
        if (adminDoc.exists()) {
          fetchData(30);
        } else {
          setLoading(false);
        }
      } catch (err) {
        console.error("Admin check failed", err);
        setIsAdmin(false);
        setLoading(false);
      }
    };

    const unsub = onAuthStateChanged(auth, checkAdmin);
    return () => unsub();
  }, []);

  const fetchData = async (days) => {
    setLoading(true);
    try {
      const q = query(
        collection(db, "analytics_events"),
        orderBy("timestamp", "desc"),
        limit(5000)
      );
      const snapshot = await getDocs(q);
      const events = [];
      const now = new Date();
      const cutoff = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

      snapshot.forEach(d => {
        const data = d.data();
        if (data.timestamp && data.timestamp.toDate() >= cutoff) {
          events.push(data);
        }
      });

      calculateStats(events, days);
    } catch (err) {
      console.error("Failed to fetch analytics", err);
    }
    setLoading(false);
  };

  const calculateStats = (events, days) => {
    const uniqueUsers = new Set();
    let tripsGenerated = 0;
    let failedGenerations = 0;
    let totalLatency = 0;
    let generationCount = 0;
    let popularDestinations = {};
    let linkClicks = 0;

    const dailyVisits = {};

    events.forEach(e => {
      if (e.session_id) uniqueUsers.add(e.session_id);
      
      const dateKey = e.timestamp?.toDate().toISOString().split('T')[0];
      if (dateKey) {
        if (!dailyVisits[dateKey]) dailyVisits[dateKey] = new Set();
        dailyVisits[dateKey].add(e.session_id);
      }

      if (e.event_name === 'trip_generation_completed') {
        tripsGenerated++;
        if (e.metadata?.latencyMs) {
          totalLatency += e.metadata.latencyMs;
          generationCount++;
        }
      }
      if (e.event_name === 'trip_generation_failed') failedGenerations++;
      if (e.event_name === 'external_link_clicked') linkClicks++;
      if (e.event_name === 'destination_selected' || e.event_name === 'trip_generation_started') {
        const dest = e.metadata?.destination;
        if (dest) {
          popularDestinations[dest] = (popularDestinations[dest] || 0) + 1;
        }
      }
    });

    const sortedDestinations = Object.entries(popularDestinations)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    const sortedDates = Object.keys(dailyVisits).sort();
    const chartData = {
      labels: sortedDates,
      datasets: [
        {
          label: 'Unique Visitors',
          data: sortedDates.map(date => dailyVisits[date].size),
          borderColor: '#F59E0B',
          backgroundColor: '#F59E0B55',
          tension: 0.3
        }
      ]
    };

    setStats({
      totalVisitors: uniqueUsers.size,
      tripsGenerated,
      failedGenerations,
      avgLatency: generationCount > 0 ? Math.round(totalLatency / generationCount / 1000) : 0,
      linkClicks,
      topDestinations: sortedDestinations,
      chartData
    });
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-50"><RefreshCw className="w-10 h-10 animate-spin text-amber" /></div>;
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
        <div className="bg-white p-10 rounded-3xl shadow-xl border border-red-100 text-center max-w-md">
          <ShieldAlert className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-ink mb-2">Access Denied</h1>
          <p className="text-gray-500">You do not have permission to view this dashboard. Please contact an administrator.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 pt-32 pb-20 font-sans">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-end mb-10 gap-4">
          <div>
            <h1 className="text-4xl font-serif font-bold text-ink flex items-center gap-3">
              <BarChart3 className="w-10 h-10 text-amber" /> Analytics Dashboard
            </h1>
            <p className="text-gray-500 mt-2 text-lg">Product usage and system metrics.</p>
          </div>
          <div className="bg-white rounded-full p-1 shadow-sm border border-gray-200 inline-flex">
            {[7, 30, 90].map(days => (
              <button
                key={days}
                onClick={() => { setTimeFilter(days); fetchData(days); }}
                className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${timeFilter === days ? 'bg-ink text-white shadow-md' : 'text-gray-500 hover:bg-gray-100'}`}
              >
                {days} Days
              </button>
            ))}
          </div>
        </div>

        {stats && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
              <StatCard icon={<Users className="w-6 h-6 text-blue-500" />} label="Unique Visitors" value={stats.totalVisitors} />
              <StatCard icon={<Plane className="w-6 h-6 text-green-500" />} label="Trips Generated" value={stats.tripsGenerated} />
              <StatCard icon={<ShieldAlert className="w-6 h-6 text-red-500" />} label="Failed Gens" value={stats.failedGenerations} />
              <StatCard icon={<CalendarIcon className="w-6 h-6 text-purple-500" />} label="Avg Gen Time" value={`${stats.avgLatency}s`} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
              <div className="lg:col-span-2 bg-white rounded-[32px] p-8 shadow-sm border border-gray-100">
                <h3 className="text-xl font-bold text-ink mb-6">Traffic Overview</h3>
                <div className="h-[300px]">
                  {stats.chartData.labels.length > 0 ? (
                    <Line data={stats.chartData} options={{ responsive: true, maintainAspectRatio: false }} />
                  ) : (
                    <div className="h-full flex items-center justify-center text-gray-400">No data for this period</div>
                  )}
                </div>
              </div>

              <div className="bg-white rounded-[32px] p-8 shadow-sm border border-gray-100">
                <h3 className="text-xl font-bold text-ink mb-6 flex items-center gap-2">
                  <MousePointerClick className="w-5 h-5 text-amber" /> Top Destinations
                </h3>
                <div className="space-y-4">
                  {stats.topDestinations.length > 0 ? stats.topDestinations.map((dest, idx) => (
                    <div key={idx} className="flex justify-between items-center p-4 bg-gray-50 rounded-2xl">
                      <span className="font-bold text-ink truncate mr-4">{dest[0]}</span>
                      <span className="bg-amber/10 text-amber px-3 py-1 rounded-full font-bold text-sm">{dest[1]}</span>
                    </div>
                  )) : (
                    <div className="text-gray-400 text-center py-10">No searches yet</div>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

const StatCard = ({ icon, label, value }) => (
  <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-4">
    <div className="p-4 bg-gray-50 rounded-2xl">
      {icon}
    </div>
    <div>
      <p className="text-gray-500 text-sm font-medium mb-1">{label}</p>
      <h3 className="text-3xl font-bold text-ink">{value}</h3>
    </div>
  </div>
);

export default AdminDashboard;
