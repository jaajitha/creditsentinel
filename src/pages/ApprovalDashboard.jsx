import React, { useEffect, useState } from 'react';
import { API_CONFIG } from '../api/config';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import html2canvas from 'html2canvas';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  BarChart,
Bar
} from 'recharts';

const ApprovalDashboard = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('All');
  const [riskFilter, setRiskFilter] = useState('All');

  const [searchTerm, setSearchTerm] = useState('');
  const [fromDate, setFromDate] = useState('');
const [toDate, setToDate] = useState('');
  const [history, setHistory] = useState([]);
const [selectedApp, setSelectedApp] = useState(null);
const [emailReport, setEmailReport] = useState(false);
const [emailTo, setEmailTo] = useState('');
const [latencyMs, setLatencyMs] = useState('');
const [lastUpdated, setLastUpdated] = useState(new Date());
const trendData = [
  { day: 'Mon', approvals: 12 },
  { day: 'Tue', approvals: 18 },
  { day: 'Wed', approvals: 15 },
  { day: 'Thu', approvals: 22 },
  { day: 'Fri', approvals: 20 },
  { day: 'Sat', approvals: 10 },
  { day: 'Sun', approvals: 14 }
];
 useEffect(() => {
  fetchApplications();
}, []);

  const fetchApplications = async () => {
    try {
      const response = await fetch(
        `${API_CONFIG.APPLICATIONS_API}/api/applications?limit=100&offset=0`
      );
      
      const data = await response.json();

console.log("APPLICATION DATA:", data);
console.log("APPLICATION COUNT:", data.applications?.length);

setApplications(data.applications || []);
      setLastUpdated(new Date());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  const fetchHistory = async (applicationId) => {
  try {
    const response = await fetch(
      `${API_CONFIG.APPLICATIONS_API}/api/applications/${applicationId}/history`
    );

    const data = await response.json();
    console.log("Full Response:", data);
console.log("First History Record:", data.history[0]);


console.log("HISTORY DATA:", data);

setHistory(data.history || []);
setEmailReport(data.email_report);
setEmailTo(data.email_to);
setLatencyMs(data.latency_ms);

setSelectedApp(applicationId);
  } catch (err) {
    console.error(err);
  }
};
const getLatestHistory = async (applicationId) => {
  try {
    const response = await fetch(
      `${API_CONFIG.APPLICATIONS_API}/api/applications/${applicationId}/history`
    );

    const data = await response.json();

    if (data.history && data.history.length > 0) {
      return data.history[0];
    }

    return null;
  } catch (err) {
    console.error(err);
    return null;
  }
};
  const totalApplications = applications.length;

  const approvedCount = applications.filter(
    app => app.application_status === 'Approved'
  ).length;

  const rejectedCount = applications.filter(
    app => app.application_status === 'Rejected'
  ).length;

  const reviewCount = applications.filter(
    app => app.application_status === 'Under Review'
  ).length;
  const approvalRate =
  totalApplications > 0
    ? ((approvedCount / totalApplications) * 100).toFixed(1)
    : 0;

const rejectionRate =
  totalApplications > 0
    ? ((rejectedCount / totalApplications) * 100).toFixed(1)
    : 0;

const reviewRate =
  totalApplications > 0
    ? ((reviewCount / totalApplications) * 100).toFixed(1)
    : 0;
    const approvalDropAlert = Number(approvalRate) < 40;
const rejectionSpikeAlert = Number(rejectionRate) > 25;
const latencyAlert = Number(latencyMs) > 2000;
    const pieData = [
  { name: 'Approved', value: approvedCount },
  { name: 'Rejected', value: rejectedCount },
  { name: 'Under Review', value: reviewCount }
];

const COLORS = [
  '#28a745',
  '#dc3545',
  '#ffc107'
];
const lowRiskCount = applications.filter(
  app => app.risk_tier === 'Low'
).length;

const mediumRiskCount = applications.filter(
  app => app.risk_tier === 'Medium'
).length;

const highRiskCount = applications.filter(
  app => app.risk_tier === 'High'
).length;

const riskData = [
  { risk: 'Low', count: lowRiskCount },
  { risk: 'Medium', count: mediumRiskCount },
  { risk: 'High', count: highRiskCount }
];
const latencyData = history.map((item, index) => ({
  name: `Run ${index + 1}`,
  latency: Number(item.latency_ms),
  time: new Date(item.timestamp).toLocaleTimeString()
}));
console.log("History:", history);
console.log("Latency Data:", latencyData);
 const filteredApplications = applications.filter((app) => {
  const matchesStatus =
    statusFilter === 'All' ||
    app.application_status === statusFilter;
    const matchesRisk =
  riskFilter === 'All' ||
  app.risk_tier === riskFilter;
const applicationDate = app.created_at;

const matchesFromDate =
  !fromDate || applicationDate >= fromDate;

const matchesToDate =
  !toDate || applicationDate <= toDate;
  const matchesSearch =
    app.applicant_name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());

  return (
  matchesStatus &&
  matchesSearch &&
  matchesRisk &&
  matchesFromDate &&
  matchesToDate
);
});
const exportCSV = async () => {
  const headers = [
  'Application ID',
  'Applicant Name',
  'Loan Amount',
  'Status',
  'Decision History',
  'Approval Reason'
];
  
 const rows = filteredApplications.map((app) => [
  app.application_id,
  app.applicant_name,
  app.loan_amount,
  app.application_status,
  'Available in History View',
  'Available in History View'
]);

  const csvContent =
    [headers, ...rows]
      .map((row) => row.join(','))
      .join('\n');

  const blob = new Blob(
    [csvContent],
    { type: 'text/csv;charset=utf-8;' }
  );

  const link = document.createElement('a');

  link.href = URL.createObjectURL(blob);

  link.download = 'approval_dashboard.csv';

  link.click();
};
    
const exportPNG = async () => {
  const dashboard = document.getElementById('charts-section');
console.log(document.getElementById('charts-section'));
  const canvas = await html2canvas(dashboard);

  const link = document.createElement('a');
  link.download = 'dashboard_charts.png';
  link.href = canvas.toDataURL();
  link.click();
};

const exportPDF = async () => {
  const doc = new jsPDF();
  const charts = document.getElementById('charts-section');

const canvas = await html2canvas(charts);

const chartImage = canvas.toDataURL('image/png');

  doc.setFontSize(18);
  doc.text('Loan Approval Report', 14, 20);

  doc.setFontSize(12);
  doc.text(`Total Applications: ${totalApplications}`, 14, 35);
  doc.text(`Approved: ${approvedCount}`, 14, 45);
  doc.text(`Rejected: ${rejectedCount}`, 14, 55);
  doc.text(`Under Review: ${reviewCount}`, 14, 65);
  doc.text(`Approval Rate: ${approvalRate}%`, 14, 75);
 doc.addImage(
  chartImage,
  'PNG',
  5,
  80,
  200,
  120
);
  autoTable(doc, {
   startY: 210,
    head: [[
      'Application ID',
      'Applicant',
      'Loan Amount',
      'Status',
       'Decision Date'
    ]],
    body: filteredApplications.map(app => [
      app.application_id,
      app.applicant_name,
      app.loan_amount,
      app.application_status,
      app.decision_date || '-'
    ])
  });

  doc.save('approval-report.pdf');
};
  return (
    <div style={{ padding: '24px' }}>
      <h1 style={{ marginBottom: '20px' }}>
        Loan Approval Dashboard
      </h1>
       <p style={{ color: '#666' }}>
  Last Updated: {lastUpdated.toLocaleTimeString()}
</p>
      {loading ? (
        <p>Loading dashboard...</p>
      ) : (
        <>
          <div
            style={{
              display: 'grid',
             gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: '16px',
              marginTop: '20px'
            }}
          >
            <div
              style={{
                background: '#fff',
                padding: '20px',
                borderRadius: '8px',
                boxShadow: '0 2px 6px rgba(0,0,0,0.1)'
              }}
            >
              <h3>Total Applications</h3>
              <h1>{totalApplications}</h1>
            </div>

            <div
              style={{
                background: '#fff',
                padding: '20px',
                borderRadius: '8px',
                boxShadow: '0 2px 6px rgba(0,0,0,0.1)'
              }}
            >
              <h3>Approved</h3>
<h1 style={{ color: '#28a745' }}>
  {approvedCount}
</h1>
<p>{approvalRate}%</p>
            </div>

            <div
              style={{
                background: '#fff',
                padding: '20px',
                borderRadius: '8px',
                boxShadow: '0 2px 6px rgba(0,0,0,0.1)'
              }}
            >
              <h3>Rejected</h3>
<h1 style={{ color: '#dc3545' }}>
  {rejectedCount}
</h1>
<p>{rejectionRate}%</p>
            </div>

            <div
              style={{
                background: '#fff',
                padding: '20px',
                borderRadius: '8px',
                boxShadow: '0 2px 6px rgba(0,0,0,0.1)'
              }}
            >
              <h3>Under Review</h3>
<h1 style={{ color: '#ffc107' }}>
  {reviewCount}
</h1>
<p>{reviewRate}%</p>
            </div>
             
            <div
              style={{
                background: '#fff',
                padding: '20px',
                borderRadius: '8px',
                boxShadow: '0 2px 6px rgba(0,0,0,0.1)'
              }}
            >
              <h3>Today's Decisions</h3>
              <h1 style={{ color: '#007bff' }}>
                {approvedCount + rejectedCount + reviewCount}
              </h1>
            </div>
          </div>
          <div id="charts-section">
<h2 style={{ marginTop: '40px' }}>
  Weekly Approval Trend
</h2>
{approvalDropAlert && (
  <div
    style={{
      background: '#fff3cd',
      color: '#856404',
      padding: '12px',
      borderRadius: '6px',
      marginTop: '20px',
      marginBottom: '10px',
      border: '1px solid #ffeeba'
    }}
  >
    ⚠ Alert: Approval rate below target (37%)
  </div>
)}

{rejectionSpikeAlert && (
  <div
    style={{
      background: '#f8d7da',
      color: '#721c24',
      padding: '12px',
      borderRadius: '6px',
      marginBottom: '10px',
      border: '1px solid #f5c6cb'
    }}
  >
    ⚠ Alert:  Rejection rate above target (30%)
  </div>
  
)}
{latencyAlert && (
  <div
    style={{
      background: '#ffe6e6',
      color: '#b00020',
      padding: '12px',
      borderRadius: '6px',
      marginBottom: '10px',
      border: '1px solid #ffb3b3'
    }}
  >
    ⚠ High Processing Latency Detected ({Number(latencyMs).toFixed(2)} ms)
  </div>
)}
<div
  style={{
    background: '#fff',
    padding: '20px',
    borderRadius: '8px',
    marginTop: '20px',
    marginBottom: '40px',
    boxShadow: '0 2px 6px rgba(0,0,0,0.1)'
  }}
>
  <ResponsiveContainer width={800} height={300}>
    <LineChart data={trendData}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="day" />
      <YAxis />
      <Tooltip />
      <Line
        type="monotone"
        dataKey="approvals"
      />
    </LineChart>
  </ResponsiveContainer>
</div>
         <div
  style={{
    display: 'block'
  }}
>
<h2 style={{ marginTop: '40px' }}>
  Decision Status Distribution
</h2>

<div
  style={{
    background: '#fff',
    padding: '20px',
    borderRadius: '8px',
    marginTop: '20px',
    marginBottom: '40px',
    boxShadow: '0 2px 6px rgba(0,0,0,0.1)'
  }}
>
  <ResponsiveContainer width={800} height={300}>
    <PieChart>
     <Pie
  data={pieData}
  dataKey="value"
  cx="50%"
  cy="50%"
  outerRadius={100}
  label
  onClick={(data) => setStatusFilter(data.name)}
>
        {pieData.map((entry, index) => (
          <Cell
            key={`cell-${index}`}
            fill={COLORS[index % COLORS.length]}
          />
        ))}
      </Pie>

      <Tooltip />
      <Legend />
    </PieChart>
  </ResponsiveContainer>
</div>

<h2 style={{ marginTop: '40px' }}>
  Risk Score Distribution
</h2>

<div
  style={{
    background: '#fff',
    padding: '20px',
    borderRadius: '8px',
    marginTop: '20px',
    marginBottom: '40px',
    boxShadow: '0 2px 6px rgba(0,0,0,0.1)'
  }}
>
  <ResponsiveContainer width={800} height={300}>

    <BarChart data={riskData}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="risk" />
      <YAxis />
      <Tooltip />
     <Bar
  dataKey="count"
  fill="#007bff"
  onClick={(data) => setRiskFilter(data.risk)}
/>
    </BarChart>
  </ResponsiveContainer>
</div>
</div> 
<h2 style={{ marginTop: '40px' }}>
  Latency Trend
</h2>

<div
  style={{
    background: '#fff',
    padding: '20px',
    borderRadius: '8px',
    marginTop: '20px',

    marginBottom: '40px',
    boxShadow: '0 2px 6px rgba(0,0,0,0.1)'
  }}
>
  <ResponsiveContainer width={800} height={300}>
    <LineChart data={latencyData}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="name" />
      <YAxis />
      <Tooltip />
      <Line
        type="monotone"
        dataKey="latency"
        stroke="#ff7300"
        strokeWidth={3}
      />
    </LineChart>
  </ResponsiveContainer>
</div>
 <div
  style={{
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: '20px'
  }}
>
  <h2>Applications by Status</h2>

  <div>
    <button
      aria-label="Export applications as CSV"
      onClick={exportCSV}
      style={{
        background: '#28a745',
        color: '#fff',
        border: 'none',
        padding: '10px 16px',
        borderRadius: '6px',
        cursor: 'pointer'
      }}
    >
      Export CSV
    </button>
     <button
  onClick={exportPNG}
  style={{
    background: '#007bff',
    color: '#fff',
    border: 'none',
    padding: '10px 16px',
    borderRadius: '6px',
    cursor: 'pointer',
    marginLeft: '10px'
  }}
>
  Export PNG
</button>
    <button
      aria-label="Export applications as PDF"
      onClick={exportPDF}
      style={{
        background: '#dc3545',
        color: '#fff',
        border: 'none',
        padding: '10px 16px',
        borderRadius: '6px',
        cursor: 'pointer',
        marginLeft: '10px'
      }}
    >
      Export PDF
    </button>
  </div>
</div>
  
</div>
<div
  style={{
    display: 'flex',
    gap: '10px',
    marginTop: '15px',
    marginBottom: '15px'
  }}
>

</div>
<input
  aria-label="Search applicant name"
  type="text"
  placeholder="Search applicant name..."
  value={searchTerm}
  onChange={(e) => setSearchTerm(e.target.value)}
  style={{
    padding: '10px',
    borderRadius: '6px',
    border: '1px solid #ccc',
    marginRight: '10px',
    width: '250px'
  }}
/>

<div style={{ marginTop: '15px' }}>
  <select
  aria-label="Filter applications by status"
    value={statusFilter}
    onChange={(e) => setStatusFilter(e.target.value)}
    style={{
      padding: '10px',
      borderRadius: '6px',
      border: '1px solid #ccc'
    }}
  >
    <option value="All">All Statuses</option>
    <option value="Approved">Approved</option>
    <option value="Rejected">Rejected</option>
    <option value="Under Review">Under Review</option>
  </select>
</div>
<div style={{ marginTop: '15px' }}>
  <select
    aria-label="Filter by risk score band"
    value={riskFilter}
    onChange={(e) => setRiskFilter(e.target.value)}
    style={{
      padding: '10px',
      borderRadius: '6px',
      border: '1px solid #ccc'
    }}
  >
    <option value="All">All Risk Bands</option>
    <option value="Low">Low</option>
    <option value="Medium">Medium</option>
    <option value="High">High</option>
  </select>
</div>
<div style={{ marginTop: '10px' }}>
  <label><strong>From Date</strong></label>
  <br />
  <input
    type="date"
    value={fromDate}
    onChange={(e) => setFromDate(e.target.value)}
    style={{ padding: '8px', width: '180px' }}
  />
</div>

<div style={{ marginTop: '10px' }}>
  <label><strong>To Date</strong></label>
  <br />
  <input
    type="date"
    value={toDate}
    onChange={(e) => setToDate(e.target.value)}
    style={{ padding: '8px', width: '180px' }}
  />
</div>
          <div
           style={{
  background: '#fff',
  padding: '20px',
  borderRadius: '8px',
  marginTop: '20px',
  boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
  overflowX: 'auto'
}}
          >
            <table
              style={{
  width: '100%',
  minWidth: '900px',
  borderCollapse: 'collapse'
}}
            >
              <thead>
                <tr
                  style={{
                    borderBottom: '2px solid #ddd'
                  }}
                >
                  <th style={{ padding: '10px', textAlign: 'left' }}>
                    Application ID
                  </th>

                  <th style={{ padding: '10px', textAlign: 'left' }}>
                    Applicant
                  </th>

                  <th style={{ padding: '10px', textAlign: 'left' }}>
                    Loan Amount
                  </th>

                  <th style={{ padding: '10px', textAlign: 'left' }}>
                    Status
                  </th>

                  <th style={{ padding: '10px', textAlign: 'left' }}>
                    Decision Date
                  </th>
                  <th style={{ padding: '10px', textAlign: 'left' }}>
  Actions
</th>
                </tr>
              </thead>

              <tbody>
  {filteredApplications.map((app) => (
                  <tr key={app.application_id}>
                    <td style={{ padding: '10px' }}>
                      {app.application_id}
                    </td>
                     
                    <td style={{ padding: '10px' }}>
                      {app.applicant_name}
                    </td>

                    <td style={{ padding: '10px' }}>
                      ₹{app.loan_amount.toLocaleString()}
                    </td>

                    <td
                      style={{
                        padding: '10px',
                        color:
                          app.application_status === 'Approved'
                            ? '#28a745'
                            : app.application_status === 'Rejected'
                            ? '#dc3545'
                            : '#ffc107'
                      }}
                    >
                      {app.application_status}
                    </td>
                     
                    <td style={{ padding: '10px' }}>
                      -
                    </td>
                    <td style={{ padding: '10px' }}>
  <button
  onClick={() => fetchHistory(app.application_id)}
    style={{
      padding: '6px 12px',
      border: 'none',
      borderRadius: '4px',
      background: '#007bff',
      color: '#fff',
      cursor: 'pointer'
    }}
  >
    View History
  </button>
</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {selectedApp && (
  <div style={{ marginTop: '30px' }}>
    <h3>Decision History - {selectedApp}</h3>

    {history.length === 0 ? (
      <p>No history found</p>
    ) : (
      history.map((item) => (
        <div
          key={item.audit_id}
          style={{
            border: '1px solid #ddd',
            padding: '12px',
            marginBottom: '10px',
            borderRadius: '6px'
          }}
        >
          <strong>{item.decision}</strong>

          <div>
            {new Date(item.timestamp).toLocaleString()}
          </div>
          <div><strong>Analyst:</strong> {item.analyst_name}</div>

<div><strong>Application Date:</strong> {new Date(item.application_date).toLocaleDateString()}</div>

<div><strong>Decision Date:</strong> {new Date(item.decision_date).toLocaleString()}</div>

<div><strong>Submitted At:</strong> {new Date(item.submitted_at).toLocaleDateString()}</div>

<div><strong>Email Report:</strong> {emailReport ? 'Yes' : 'No'}</div>

<div><strong>Email:</strong> {emailTo}</div>

<div><strong>Latency:</strong> {Number(latencyMs).toFixed(2)} ms</div>
          {item.notes && (
            <div>
              Notes: {item.notes}
            </div>
          )}
        </div>
      ))
    )}
  </div>
)}
          </div>
        </>
      )}
    </div>
  );
};

export default ApprovalDashboard;