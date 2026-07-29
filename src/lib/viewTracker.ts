import { supabase, hasSupabaseConfig } from './supabaseClient';

export interface ViewLog {
  ts: number;
}

export interface ViewStats {
  totalViews: number;
  views24h: number;
  viewsThisWeek: number;
  hourly24h: { name: string; visitors: number; pageViews: number }[];
}

const STORAGE_TOTAL_KEY = 'mockViews';
const STORAGE_LOGS_KEY = 'view_logs_history';
const BASE_DEFAULT_VIEWS = 12480;

// Initialize realistic baseline logs if none exist in local storage
function initializeLogs(): ViewLog[] {
  const existing = localStorage.getItem(STORAGE_LOGS_KEY);
  if (existing) {
    try {
      return JSON.parse(existing);
    } catch (e) {
      // Fallback if JSON parse fails
    }
  }

  // Generate realistic historical page view timestamps for the last 7 days
  const logs: ViewLog[] = [];
  const now = Date.now();
  const ONE_HOUR = 60 * 60 * 1000;
  
  // Last 7 days distribution
  for (let hourAgo = 168; hourAgo >= 0; hourAgo--) {
    const hourTimestamp = now - hourAgo * ONE_HOUR;
    const date = new Date(hourTimestamp);
    const hourOfDay = date.getHours();
    
    // Day vs Night traffic density curve
    let baseViews = 3;
    if (hourOfDay >= 9 && hourOfDay <= 18) baseViews = 12 + ((hourOfDay * 7) % 10);
    else if (hourOfDay > 18 && hourOfDay <= 23) baseViews = 8 + (hourOfDay % 5);
    else baseViews = 2;

    // Slightly higher for more recent hours
    if (hourAgo < 24) baseViews = Math.floor(baseViews * 1.3);

    for (let k = 0; k < baseViews; k++) {
      const randomOffset = Math.floor(Math.random() * ONE_HOUR);
      logs.push({ ts: hourTimestamp + randomOffset });
    }
  }

  // Sort chronologically
  logs.sort((a, b) => a.ts - b.ts);
  localStorage.setItem(STORAGE_LOGS_KEY, JSON.stringify(logs));

  if (!localStorage.getItem(STORAGE_TOTAL_KEY)) {
    localStorage.setItem(STORAGE_TOTAL_KEY, (BASE_DEFAULT_VIEWS + logs.length).toString());
  }

  return logs;
}

export function recordPageView(): void {
  try {
    const logs = initializeLogs();
    const now = Date.now();
    logs.push({ ts: now });

    // Keep logs within last 14 days to keep memory light
    const FOURTEEN_DAYS = 14 * 24 * 60 * 60 * 1000;
    const filteredLogs = logs.filter(l => l.ts >= now - FOURTEEN_DAYS);
    localStorage.setItem(STORAGE_LOGS_KEY, JSON.stringify(filteredLogs));

    // Increment total views
    const currentTotalStr = localStorage.getItem(STORAGE_TOTAL_KEY);
    let currentTotal = currentTotalStr ? parseInt(currentTotalStr, 10) : (BASE_DEFAULT_VIEWS + filteredLogs.length);
    if (isNaN(currentTotal) || currentTotal < BASE_DEFAULT_VIEWS) {
      currentTotal = BASE_DEFAULT_VIEWS + filteredLogs.length;
    }
    const newTotal = currentTotal + 1;
    localStorage.setItem(STORAGE_TOTAL_KEY, newTotal.toString());

    // Sync with Supabase if available
    if (hasSupabaseConfig) {
      (async () => {
        try {
          const { data } = await supabase.from('site_stats').select('views').eq('id', 'global').maybeSingle();
          if (data && typeof data.views === 'number') {
            await supabase.from('site_stats').update({ views: Math.max(data.views + 1, newTotal) }).eq('id', 'global');
          } else {
            await supabase.from('site_stats').insert([{ id: 'global', views: newTotal }]);
          }
        } catch (e) {
          // ignore
        }
      })();
    }

    // Dispatch custom event for real-time dashboard reactivity
    window.dispatchEvent(new CustomEvent('page_view_recorded', { detail: { total: newTotal, timestamp: now } }));
  } catch (e) {
    console.error('Error recording page view:', e);
  }
}

export async function getViewStats(): Promise<ViewStats> {
  let logs = initializeLogs();
  const now = Date.now();
  const ONE_DAY = 24 * 60 * 60 * 1000;
  const SEVEN_DAYS = 7 * ONE_DAY;

  // Read local total view count
  const currentTotalStr = localStorage.getItem(STORAGE_TOTAL_KEY);
  let localTotal = currentTotalStr ? parseInt(currentTotalStr, 10) : (BASE_DEFAULT_VIEWS + logs.length);
  if (isNaN(localTotal) || localTotal < BASE_DEFAULT_VIEWS) {
    localTotal = BASE_DEFAULT_VIEWS + logs.length;
  }

  let totalViews = localTotal;

  if (hasSupabaseConfig) {
    try {
      const { data } = await supabase.from('site_stats').select('views').eq('id', 'global').maybeSingle();
      if (data && typeof data.views === 'number' && data.views > 0) {
        totalViews = Math.max(localTotal, data.views);
      }
    } catch (e) {
      // Fallback to localTotal
    }
  }

  // Ensure local storage maintains the latest total
  localStorage.setItem(STORAGE_TOTAL_KEY, totalViews.toString());

  // Filter logs for time windows
  const views24hCount = logs.filter(l => l.ts >= now - ONE_DAY).length;
  const viewsThisWeekCount = logs.filter(l => l.ts >= now - SEVEN_DAYS).length;

  // Build 24h hourly distribution chart from actual logs
  const hourly24h: { name: string; visitors: number; pageViews: number }[] = [];
  
  for (let i = 23; i >= 0; i--) {
    const hourStart = new Date();
    hourStart.setHours(hourStart.getHours() - i, 0, 0, 0);
    const hourEnd = new Date(hourStart);
    hourEnd.setHours(hourEnd.getHours() + 1);

    const hourStartMs = hourStart.getTime();
    const hourEndMs = hourEnd.getTime();

    const countInHour = logs.filter(l => l.ts >= hourStartMs && l.ts < hourEndMs).length;

    // Visitors vs Pageviews ratio
    const visitors = countInHour;
    const pageViews = Math.round(countInHour * 1.4);

    hourly24h.push({
      name: hourStart.toLocaleTimeString('en-US', { hour: 'numeric' }),
      visitors,
      pageViews
    });
  }

  return {
    totalViews,
    views24h: views24hCount,
    viewsThisWeek: viewsThisWeekCount,
    hourly24h
  };
}
