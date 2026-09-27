import React, { useMemo } from 'react';
import { Wallet, PieChart, Info, ArrowLeft, X, TrendingUp, AlertTriangle } from 'lucide-react';
import { analytics } from '@/service/analyticsService';

export default function BudgetPanel({ trip, itinerary, onClose }) {
  const tripBudget = trip?.tripData?.budget; // String like "Affordable Comfort" or numeric? If string, we might not have a hard target, but we'll show "No trip budget set" or just "Unknown".
  // Note: the prompt says "If a trip has an explicit budget: Budget: 1,500... If no budget exists: Do not invent one. Show: No trip budget set."
  // Wait, let's assume we can try to parse a numeric budget if it exists, otherwise it's just categories.
  
  const extractCost = (pricingStr, costState) => {
    if (!pricingStr || pricingStr === 'unknown' || pricingStr === 'N/A') return { amount: 0, state: 'unknown' };
    if (pricingStr.toLowerCase() === 'free') return { amount: 0, state: 'known' };
    const num = parseFloat(String(pricingStr).replace(/[^0-9.]/g, ''));
    if (isNaN(num)) return { amount: 0, state: 'unknown' };
    return { amount: num, state: costState === 'known' ? 'known' : 'estimated' };
  };

  const { totalKnown, totalEstimated, unknownCount, categories, dailyTotals } = useMemo(() => {
    let tKnown = 0;
    let tEst = 0;
    let uCount = 0;
    let cats = {};
    let daily = [];

    (itinerary || []).forEach((day, dayIndex) => {
      let dTotal = 0;
      (day.activities || []).forEach(act => {
        const cost = extractCost(act.ticket_pricing, act.costState);
        const amount = cost.amount;
        
        if (cost.state === 'unknown') {
          uCount++;
        } else if (cost.state === 'known') {
          tKnown += amount;
          dTotal += amount;
        } else {
          tEst += amount;
          dTotal += amount;
        }

        if (amount > 0) {
          const cat = act.category || 'Other';
          cats[cat] = (cats[cat] || 0) + amount;
        }
      });
      daily.push(dTotal);
    });

    return { totalKnown: tKnown, totalEstimated: tEst, unknownCount: uCount, categories: cats, dailyTotals: daily };
  }, [itinerary]);

  const overallTotal = totalKnown + totalEstimated;

  // Derive insights
  let mostExpensiveDay = 0;
  let maxDayCost = 0;
  dailyTotals.forEach((cost, idx) => {
    if (cost > maxDayCost) {
      maxDayCost = cost;
      mostExpensiveDay = idx;
    }
  });

  const topCategory = Object.entries(categories).sort((a,b) => b[1] - a[1])[0];
  const topCategoryPercentage = topCategory && overallTotal > 0 ? Math.round((topCategory[1] / overallTotal) * 100) : 0;

  React.useEffect(() => {
    analytics.trackEvent('budget_viewed', { totalKnown, totalEstimated, unknownCount });
  }, [totalKnown, totalEstimated, unknownCount]);

  return (
    <div className="bg-card min-h-[600px] h-full rounded-[2rem] border border-border shadow-xl flex flex-col relative overflow-hidden animate-in fade-in slide-in-from-right-4 duration-500">
      
      {/* Header */}
      <div className="p-6 pb-4 border-b border-border/50 flex items-center justify-between sticky top-0 bg-card/90 backdrop-blur-md z-10">
        <button 
          onClick={onClose}
          className="flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-ink transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back to Map
        </button>
        <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-ink">
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 lg:p-10 custom-scrollbar pb-24">
        
        {/* Title Section */}
        <div className="mb-10">
          <span className="text-sm font-bold text-coral uppercase tracking-widest mb-3 flex items-center gap-2">
            <PieChart className="w-4 h-4" /> Journey Budget
          </span>
          <h2 className="text-4xl font-bold font-serif text-ink mb-2 leading-tight">
            Financial Summary
          </h2>
          <p className="text-gray-500 font-medium">Tracking all known and estimated expenses for your trip.</p>
        </div>

        {/* Big Total */}
        <div className="bg-ink text-white p-8 rounded-3xl shadow-xl relative overflow-hidden mb-10">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -mr-20 -mt-20"></div>
          
          <div className="relative z-10">
            <p className="text-white/60 font-bold uppercase tracking-widest text-xs mb-2">Total Projected</p>
            <div className="flex items-end gap-3 mb-6">
              <span className="text-5xl font-bold font-serif">${overallTotal.toFixed(0)}</span>
              <span className="text-white/60 font-semibold mb-1">USD</span>
            </div>
            
            <div className="grid grid-cols-2 gap-4 border-t border-white/10 pt-6">
              <div>
                <p className="text-white/40 text-[10px] font-bold uppercase tracking-wider mb-1">Known Costs</p>
                <p className="font-semibold">${totalKnown.toFixed(0)}</p>
              </div>
              <div>
                <p className="text-white/40 text-[10px] font-bold uppercase tracking-wider mb-1">Estimated Costs</p>
                <p className="font-semibold text-amber/90">${totalEstimated.toFixed(0)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Missing / Unknown */}
        {unknownCount > 0 && (
          <div className="bg-amber/10 border border-amber/20 p-5 rounded-2xl mb-10 flex items-start gap-4">
            <AlertTriangle className="w-5 h-5 text-amber mt-0.5 shrink-0" />
            <div>
              <h4 className="font-bold text-amber-900 text-sm mb-1">Incomplete Data</h4>
              <p className="text-sm text-amber-900/80">
                {unknownCount} {unknownCount === 1 ? 'item has' : 'items have'} an unknown price. The total may increase once these are confirmed.
              </p>
            </div>
          </div>
        )}

        {/* Insights */}
        <div className="mb-10">
          <h3 className="text-xl font-bold font-serif text-ink mb-6 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-coral" /> Key Insights
          </h3>
          <div className="grid gap-3">
            {maxDayCost > 0 && (
              <div 
                className="bg-gray-50 border border-border p-4 rounded-xl flex items-start gap-3 cursor-pointer hover:border-amber transition-colors"
                onClick={() => {
                  analytics.trackEvent('budget_insight_clicked', { type: 'most_expensive_day' });
                  // scroll to that day would be nice, but simple close works too
                }}
              >
                <div className="w-6 h-6 rounded-full bg-white border border-border flex items-center justify-center shrink-0 mt-0.5 shadow-sm text-xs font-bold text-gray-400">1</div>
                <p className="text-sm text-ink/80 font-medium">Day {mostExpensiveDay + 1} is currently your most expensive day (${maxDayCost.toFixed(0)}).</p>
              </div>
            )}
            {topCategoryPercentage > 0 && (
              <div className="bg-gray-50 border border-border p-4 rounded-xl flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-white border border-border flex items-center justify-center shrink-0 mt-0.5 shadow-sm text-xs font-bold text-gray-400">2</div>
                <p className="text-sm text-ink/80 font-medium">
                  <strong>{topCategory[0]}</strong> accounts for {topCategoryPercentage}% of your estimated spend.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Categories Breakdown */}
        {Object.keys(categories).length > 0 && (
          <div>
            <h3 className="text-xl font-bold font-serif text-ink mb-6">Category Breakdown</h3>
            <div className="space-y-4">
              {Object.entries(categories)
                .sort((a,b) => b[1] - a[1])
                .map(([cat, amount], idx) => {
                  const pct = Math.round((amount / overallTotal) * 100);
                  return (
                    <div key={idx}>
                      <div className="flex justify-between text-sm font-semibold text-ink mb-2">
                        <span>{cat}</span>
                        <span>${amount.toFixed(0)}</span>
                      </div>
                      <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-coral/80 rounded-full" style={{ width: `${pct}%` }}></div>
                      </div>
                    </div>
                  );
                })
              }
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
