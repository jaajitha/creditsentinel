import { BrowserRouter, Routes, Route, Link, useNavigate, useParams } from 'react-router-dom'
import { useEffect, useState } from 'react'

const DIVYA_API_BASE = 'https://catacomb-stadium-phony.ngrok-free.dev'
const GURU_API_BASE = 'https://eff3-2409-40f0-500a-b398-c93f-f072-d790-8250.ngrok-free.app'

const apiFetch = (baseUrl, path, options = {}) => {
  const headers = {
    'ngrok-skip-browser-warning': 'true',
    ...(options.headers || {})
  }

  return fetch(`${baseUrl}${path}`, {
    ...options,
    headers
  })
}

const nav = {
  width: '210px',
  background: '#1B2A4A',
  minHeight: '100vh',
  padding: '20px'
}

const lnk = {
  display: 'block',
  color: '#D6E4F0',
  textDecoration: 'none',
  padding: '10px',
  marginBottom: '8px',
  borderRadius: '4px',
  fontSize: '14px'
}

const rc = (r) =>
  r === 'Low' ? '#1A6B3A' :
  r === 'Medium' ? '#B7791F' :
  '#C53030'

const Dashboard = () => {
  const [portfolio, setPortfolio] = useState({
    total_applications: 15000,
    high_risk_count: 2700,
    medium_risk_count: 4500,
    low_risk_count: 7800,
    avg_risk_score: 42.3
  })

  useEffect(() => {
    apiFetch(DIVYA_API_BASE, '/api/portfolio/summary')
      .then((r) => r.json())
      .then((data) => setPortfolio(data))
      .catch(() => {})
  }, [])

  return (
    <div style={{
      padding:'40px',
      flex:1,
      background:'#F4F6F9',
      minHeight:'100vh'
    }}>
      <h2 style={{ color:'#1B2A4A', marginBottom:'8px' }}>
        Dashboard
      </h2>

      <p style={{ color:'#4A5568', marginBottom:'30px' }}>
        CreditSentinel — Live Overview
      </p>

      <div style={{
        display:'flex',
        gap:'20px',
        marginBottom:'30px',
        flexWrap:'wrap'
      }}>
        {[
          {
            label:'Total Applications',
            value:portfolio.total_applications,
            color:'#1B2A4A'
          },
          {
            label:'High Risk',
            value:portfolio.high_risk_count,
            color:'#C53030'
          },
          {
            label:'Medium Risk',
            value:portfolio.medium_risk_count,
            color:'#B7791F'
          },
          {
            label:'Low Risk',
            value:portfolio.low_risk_count,
            color:'#1A6B3A'
          }
        ].map((k) => (
          <div
            key={k.label}
            style={{
              background:'white',
              padding:'24px',
              borderRadius:'8px',
              flex:1,
              minWidth:'160px',
              boxShadow:'0 2px 4px rgba(0,0,0,0.1)'
            }}
          >
            <p style={{ color:'#4A5568', fontSize:'13px', margin:'0 0 8px' }}>
              {k.label}
            </p>
            <h3 style={{ color:k.color, fontSize:'28px', margin:0, fontWeight:'bold' }}>
              {Number(k.value).toLocaleString()}
            </h3>
          </div>
        ))}
      </div>
    </div>
  )
}

const Applications = () => {
  const [applications, setApplications] = useState([])
  const navigate = useNavigate()

  useEffect(() => {
    apiFetch(DIVYA_API_BASE, '/api/applications')
      .then((r) => r.json())
      .then((data) => setApplications(data.applications || []))
      .catch(() => setApplications([]))
  }, [])

  return (
    <div style={{
      padding:'40px',
      flex:1,
      background:'#F4F6F9',
      minHeight:'100vh'
    }}>
      <h2 style={{ color:'#1B2A4A' }}>
        Loan Applications
      </h2>
      <p style={{ color:'#4A5568', marginBottom:'20px' }}>
        Showing {applications.length} applications
      </p>

      <table style={{
        width:'100%',
        borderCollapse:'collapse',
        background:'white',
        borderRadius:'8px',
        overflow:'hidden',
        boxShadow:'0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <thead>
          <tr style={{ background:'#1B2A4A' }}>
            {['App ID','Applicant','Income','Loan Amount','FOIR','Risk'].map((h) => (
              <th
                key={h}
                style={{ padding:'12px', color:'white', textAlign:'left', fontSize:'13px' }}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {applications.map((a, index) => (
            <tr
              key={a.application_id}
              onClick={() => navigate(`/application/${a.application_id}`)}
              style={{
                background:index % 2 === 0 ? '#F4F6F9' : 'white',
                borderBottom:'1px solid #E2E8F0',
                cursor:'pointer'
              }}
            >
              <td style={{ padding:'10px 12px', fontSize:'13px', color:'#4A5568' }}>{a.application_id}</td>
              <td style={{ padding:'10px 12px', fontSize:'13px' }}>{a.applicant_name}</td>
              <td style={{ padding:'10px 12px', fontSize:'13px' }}>₹{a.monthly_income.toLocaleString()}</td>
              <td style={{ padding:'10px 12px', fontSize:'13px' }}>₹{a.requested_loan_amount.toLocaleString()}</td>
              <td style={{ padding:'10px 12px', fontSize:'13px' }}>{a.foir}%</td>
              <td style={{
                padding:'10px 12px',
                fontWeight:'bold',
                fontSize:'13px',
                color:rc(a.risk_tier)
              }}>{a.risk_tier}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

const ApplicationDetail = () => {
  const { id } = useParams()
  const [application, setApplication] = useState(null)
  const [riskResult, setRiskResult] = useState(null)
  const [redFlags, setRedFlags] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchDetail() {
      try {
        const response = await apiFetch(DIVYA_API_BASE, `/api/applications/${id}`)
        const data = await response.json()
        setApplication(data)

        if (data) {
          const scoreResponse = await apiFetch(DIVYA_API_BASE, '/api/score', {
            method:'POST',
            headers:{
              'Content-Type':'application/json'
            },
            body:JSON.stringify({
              application_id:data.application_id,
              monthly_income:data.monthly_income,
              requested_loan_amount:data.requested_loan_amount,
              existing_monthly_emi:data.existing_monthly_emi || 0,
              employment_type:data.employment_type || 'Salaried',
              employment_years:data.employment_years || 1,
              foir:data.foir,
              loan_to_income_ratio:data.loan_to_income_ratio || 0.6,
              is_night_application:data.is_night_application || 0,
              cibil_score:data.cibil_score || 700,
              num_credit_inquiries_30d:data.num_credit_inquiries_30d || 0,
              has_previous_default:data.has_previous_default || 0,
              credit_utilization_pct:data.credit_utilization_pct || 40
            })
          })

          const scoreData = await scoreResponse.json()
          setRiskResult(scoreData)
        }
      } catch (err) {
        console.log(err)
      }

      setLoading(false)
    }

    fetchDetail()
  }, [id])

  useEffect(() => {
    if (!id) return
    apiFetch(GURU_API_BASE, '/api/redflags', {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify({
        application_id: id
      })
    })
    .then((r) => r.json())
    .then((data) => setRedFlags(data.flags || []))
    .catch(() => setRedFlags([]))
  }, [id])

  if (loading) {
    return (
      <div style={{ padding:'40px', flex:1 }}>
        Loading...
      </div>
    )
  }

  if (!application) {
    return (
      <div style={{ padding:'40px', flex:1 }}>
        Application not found
      </div>
    )
  }

  return (
    <div style={{
      padding:'40px',
      flex:1,
      background:'#F4F6F9',
      minHeight:'100vh'
    }}>
      <h2 style={{ color:'#1B2A4A' }}>
        Application Detail
      </h2>

      <div style={{
        background:'white',
        padding:'24px',
        borderRadius:'8px',
        marginTop:'20px',
        boxShadow:'0 2px 6px rgba(0,0,0,0.1)'
      }}>
        <h3>{application.applicant_name}</h3>

        <p><strong>Application ID:</strong> {application.application_id}</p>
        <p><strong>Income:</strong> ₹{application.monthly_income.toLocaleString()}</p>
        <p><strong>Loan Amount:</strong> ₹{application.requested_loan_amount.toLocaleString()}</p>
        <p><strong>FOIR:</strong> {application.foir}%</p>
        <p><strong>CIBIL:</strong> {application.cibil_score || 'N/A'}</p>
      </div>

      <div style={{
        background:'white',
        padding:'24px',
        borderRadius:'8px',
        marginTop:'20px',
        boxShadow:'0 2px 6px rgba(0,0,0,0.1)'
      }}>
        <h3>Risk Score</h3>

        {riskResult && (
          <>
            <h2 style={{ color:rc(riskResult.risk_tier) }}>
              {riskResult.risk_score}
            </h2>

            <p style={{
              color:rc(riskResult.risk_tier),
              fontWeight:'bold'
            }}>
              {riskResult.risk_tier} Risk
            </p>
          </>
        )}
      </div>

      <div style={{
        background:'white',
        padding:'24px',
        borderRadius:'8px',
        marginTop:'20px',
        boxShadow:'0 2px 6px rgba(0,0,0,0.1)'
      }}>
        <h3>Red Flags</h3>

        <ul>
          {redFlags.map((flag, index) => (
            <li key={index}>{flag}</li>
          ))}
        </ul>
      </div>

      <div style={{
        background:'white',
        padding:'24px',
        borderRadius:'8px',
        marginTop:'20px',
        boxShadow:'0 2px 6px rgba(0,0,0,0.1)'
      }}>
        <h3>Credit Memo</h3>

        <button
          onClick={() => alert('Memo API integration coming soon')}
          style={{
            background:'#1B2A4A',
            color:'white',
            padding:'12px 24px',
            border:'none',
            borderRadius:'6px',
            cursor:'pointer'
          }}
        >
          Generate Memo
        </button>
      </div>
    </div>
  )
}

const RiskScore = () => {
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [form] = useState({
    application_id:'APP-000001',
    monthly_income:55107,
    requested_loan_amount:390000,
    existing_monthly_emi:0,
    cibil_score:706,
    employment_years:1.0,
    foir:26.48,
    loan_to_income_ratio:0.59,
    is_night_application:0
  })

  const getScore = () => {
    setLoading(true)

    apiFetch(DIVYA_API_BASE, '/api/score', {
      method:'POST',
      headers:{
        'Content-Type':'application/json'
      },
      body:JSON.stringify(form)
    })
    .then((r) => r.json())
    .then((data) => {
      setResult(data)
      setLoading(false)
    })
    .catch(() => setLoading(false))
  }

  return (
    <div style={{ padding:'40px', flex:1, background:'#F4F6F9', minHeight:'100vh' }}>
      <h2 style={{ color:'#1B2A4A' }}>Risk Score</h2>

      <div style={{
        background:'white',
        padding:'24px',
        borderRadius:'8px',
        marginTop:'20px',
        maxWidth:'400px',
        boxShadow:'0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <p style={{ color:'#4A5568', fontSize:'13px', marginBottom:'16px' }}>
          Application ID: {form.application_id}
        </p>
        <p style={{ color:'#4A5568', fontSize:'13px' }}>
          Income: Rs {form.monthly_income.toLocaleString()}
        </p>
        <p style={{ color:'#4A5568', fontSize:'13px' }}>
          FOIR: {form.foir}%
        </p>
        <p style={{ color:'#4A5568', fontSize:'13px', marginBottom:'20px' }}>
          CIBIL: {form.cibil_score}
        </p>

        <button
          onClick={getScore}
          style={{
            background:'#1B2A4A',
            color:'white',
            padding:'10px 24px',
            border:'none',
            borderRadius:'6px',
            cursor:'pointer',
            fontSize:'14px'
          }}
        >
          {loading ? 'Scoring...' : 'Get Risk Score'}
        </button>

        {result && (
          <div style={{
            marginTop:'20px',
            padding:'16px',
            background:'#F4F6F9',
            borderRadius:'6px'
          }}>
            <p style={{ margin:'0 0 8px', fontSize:'13px', color:'#4A5568' }}>
              Risk Score
            </p>
            <h2 style={{ margin:'0 0 8px', color:rc(result.risk_tier), fontSize:'36px' }}>
              {result.risk_score}
            </h2>
            <p style={{ margin:0, fontWeight:'bold', color:rc(result.risk_tier) }}>
              {result.risk_tier} Risk
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

const Reports = () => (
  <div style={{
    padding:'40px',
    flex:1,
    background:'#F4F6F9',
    minHeight:'100vh'
  }}>
    <h2 style={{ color:'#1B2A4A' }}>Reports</h2>
    <p style={{ color:'#4A5568' }}>
      Credit memo reports will appear here in Week 2.
    </p>
  </div>
)

function App() {
  return (
    <BrowserRouter>
      <div style={{ display:'flex' }}>
        <div style={nav}>
          <h2 style={{ color:'white' }}>CreditSentinel</h2>
          <Link to="/" style={lnk}>Dashboard</Link>
          <Link to="/applications" style={lnk}>Applications</Link>
          <Link to="/risk" style={lnk}>Risk Score</Link>
          <Link to="/reports" style={lnk}>Reports</Link>
        </div>

        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/applications" element={<Applications />} />
          <Route path="/application/:id" element={<ApplicationDetail />} />
          <Route path="/risk" element={<RiskScore />} />
          <Route path="/reports" element={<Reports />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}

export default App
