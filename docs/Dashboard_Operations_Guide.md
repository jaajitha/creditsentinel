# Dashboard Operations Guide

## 1. Dashboard Architecture
The Credit Sentinel Dashboard is a React-based single-page application (SPA) that interfaces with a RESTful backend API. 
Currently, the system is designed to consume data from the Applications API and History API. Due to an ongoing backend issue regarding the `analyst_name` field (hardcoded values), the architecture supports a seamless toggle to a local mock data layer (`src/api/config.js` -> `USE_MOCK: true`) to ensure uninterrupted frontend operations and testing. The frontend leverages `recharts` for data visualization and `html2canvas`/`jspdf` for report generation.

## 2. User Filtering Workflows
The dashboard offers robust, multi-dimensional filtering to help operations teams slice and dice the data efficiently:
* **Analyst Filter:** Dynamically updates metrics, charts, and application lists based on the selected analyst (e.g., "Divya", "Guru Prasad", "Yuva Teja").
* **Status & Risk Filters:** Users can filter by Decision Status (Approved, Rejected, Under Review) via the Pie Chart or dropdowns, and by Risk Score (Low, Medium, High) via the Bar Chart.
* **Search & Date Filters:** Text-based search by applicant name and temporal filtering by date range (from/to dates).

## 3. Multi-level Drill-down
The application list allows users to drill down into specific applications to view their decision history.
* **Workflow:** User identifies an application in the table -> Clicks the application -> Triggers a fetch to the History API (`/api/applications/{id}/history`).
* **Audit Trail View:** Displays individual audit records including the specific decision, the analyst's notes, timestamp, and processing latency.

## 4. Report Export (PNG, CSV, PDF)
The dashboard supports exporting the current view for reporting purposes.
* **PNG Export:** Utilizes `html2canvas` to capture the DOM element containing the charts (`#charts-section`) and downloads it as an image file. 
* **CSV/PDF Export:** Extracts the currently filtered list of applications and generates a downloadable file with all relevant metrics.

## 5. Performance Baseline
* **Target Load Time:** 2.2s on Render.
* **Latency Monitoring:** The dashboard continuously tracks API latency, calculating p50, p95, and p99 percentiles. An automatic alert is triggered if the average latency exceeds 2000ms. 

## 6. Troubleshooting Guide
* **Issue: Slow Dashboard Load or High Latency Alerts**
  * *Cause:* Backend API degradation or database locking.
  * *Solution:* Check the Latency Percentiles (p95, p99). If persistently high, temporarily toggle `USE_MOCK = true` in `api/config.js` and notify the backend team.
* **Issue: Missing Data or Incorrect Analyst Names**
  * *Cause:* The backend API is currently returning a hardcoded analyst name (e.g., "DIVYA" / "DIVA"). 
  * *Solution:* Ensure the frontend is set to use the mock data layer which accurately reflects multiple analyst profiles until the backend patch is deployed.
* **Issue: Filters Not Applying**
  * *Cause:* Conflicting filter states (e.g., date range excludes all current applications).
  * *Solution:* Clear all filters (set Status, Risk, Analyst to "All" and clear the search box) and re-apply them one by one.

## 7. Production Deployment Checklist
- [ ] Verify environment variables (`REACT_APP_API_URL`, etc.) point to production URLs.
- [ ] Confirm backend team has deployed the fix for the `analyst_name` hardcoding issue.
- [ ] Set `USE_MOCK: false` in `src/api/config.js`.
- [ ] Run `npm run build` and ensure no compilation errors or linter warnings.
- [ ] Deploy the build artifact to Render.
- [ ] Run smoke tests on the live Render URL (verify login, load times, filtering, and export functionality).
- [ ] Verify latency metrics remain under the 2.2s threshold under standard load.

*Timeline: 2 hours (Monday)*
