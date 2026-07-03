# Frontend Technical Documentation

## 1. React Component Hierarchy
The Credit Sentinel frontend is built using a modular component architecture:
* `App` (Root Component)
  * `ApprovalDashboard` (Main Dashboard View)
    * **Metrics Cards:** Top-level summary cards (Total, Approved, Rejected, Under Review, Today's Decisions, Analyst Stats).
    * **Charts Section:**
      * `LineChart` (Recharts) - Weekly Approval Trend.
      * `PieChart` (Recharts) - Decision Status Distribution.
      * `BarChart` (Recharts) - Risk Score Distribution.
      * `LineChart` (Recharts) - Latency Trend (7-Day Avg).
    * **Alerts Section:** Conditional rendering of alerts for approval drops, rejection spikes, and high latency.
    * **Applications Table / Drill-down View:** Displays the filtered list and individual decision histories.

## 2. State Management Approach
State is managed locally within the `ApprovalDashboard` component using React's `useState` and `useEffect` hooks. 
* **Data State:** `applications`, `history`, `allDecisions` store the core business entities.
* **Filter State:** `statusFilter`, `riskFilter`, `searchTerm`, `fromDate`, `toDate`, `analystFilter` manage the UI view.
* **UI/Meta State:** `loading`, `allDecisionsLoading`, `lastUpdated`, `simulateHighLatency` control the rendering lifecycle and user feedback.
* *Note on Prop Drilling:* Given the centralized nature of the dashboard, most state resides in the parent component. If the application scales to include multiple distinct views, a Context API or Redux approach would be recommended to prevent deep prop drilling.

## 3. API Integration Patterns
The dashboard interacts with the backend using the Fetch API with built-in resilience patterns:
* **Fallback & Error Handling:** API calls (e.g., `fetchApplications`, `fetchHistory`) are wrapped in `try...catch` blocks. If the backend fails or returns a non-200 response, the frontend gracefully catches the error, logs a warning, and immediately falls back to the mock data layer (`mockData.js`).
* **Configuration Toggle:** An `API_CONFIG.USE_MOCK` flag allows manual bypassing of the backend when it is known to be in a degraded state (e.g., the current `analyst_name` bug).
* **Caching:** Data is fetched on initial mount and cached in the local component state. Subsequent filtering is performed client-side to ensure sub-500ms responsiveness without hitting the network repeatedly.

## 4. Analytics & Tracking Implementation
The frontend calculates complex analytics on the fly:
* **Percentiles:** A custom `calculatePercentile` utility function processes latency data to generate p50, p95, and p99 metrics.
* **Trend Analysis:** The `get7DayLatencyTrend` function aggregates decisions over the past 7 days to provide a rolling average of processing latency, grouped by analyst.
* **Alerting:** Real-time Boolean flags (`approvalDropAlert`, `rejectionSpikeAlert`, `latencyAlert`) trigger UI warnings when thresholds are breached.

## 5. Mobile Responsiveness & 3G/4G Performance
* **Responsive Layouts:** The dashboard utilizes CSS Grid (`grid-template-columns: repeat(auto-fit, minmax(180px, 1fr))`) to ensure metric cards fluidly adapt to screen sizes ranging from 320px (mobile) to 1280px (desktop).
* **Responsive Charts:** The `ResponsiveContainer` component from Recharts ensures data visualizations scale appropriately without breaking the layout.
* **Network Performance:** The use of client-side filtering minimizes the number of API requests required, making the application highly performant on slower 3G/4G mobile networks once the initial data payload is loaded.

## 6. Security Considerations
* **CORS:** The backend API must be configured to accept cross-origin requests from the deployed Render frontend URL.
* **XSS Prevention:** React natively escapes string variables rendered in the JSX, mitigating Cross-Site Scripting (XSS) attacks. 
* **Header-based Data Passing:** In the absence of a formal JWT auth system for this prototype, analyst identification relies on header-based data passing. Caution is required to ensure this is replaced with a robust authentication token mechanism before processing real PII data.

## 7. Code Snippets

**API Fetch with Mock Fallback:**
```javascript
const fetchApplications = async () => {
  try {
    if (API_CONFIG.USE_MOCK) {
      setApplications(mockApplications);
      return;
    }
    const response = await fetch(`${API_CONFIG.APPLICATIONS_API}/api/applications`);
    const data = await response.json();
    setApplications(data.applications || []);
  } catch (err) {
    console.warn("Failed to fetch applications, using mock:", err);
    setApplications(mockApplications);
  } finally {
    setLoading(false);
  }
};
```

**PNG Export Implementation:**
```javascript
const exportPNG = async () => {
  const dashboard = document.getElementById('charts-section');
  const canvas = await html2canvas(dashboard);
  const link = document.createElement('a');
  link.download = 'dashboard_charts.png';
  link.href = canvas.toDataURL();
  link.click();
};
```

*Timeline: 2 hours (Tuesday)*
