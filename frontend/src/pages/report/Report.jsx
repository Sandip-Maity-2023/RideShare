import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Report.css";

const Report = () => {
  const navigate = useNavigate();

  // Loading and Error States
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Dynamic Data States
  const [metrics, setMetrics] = useState({
    totalFuelCost: "Rs. 0 L",
    fleetRoi: "0%",
    utilizationRate: "0%",
  });

  const [fuelEfficiencyData, setFuelEfficiencyData] = useState([]);
  const [costliestVehiclesData, setCostliestVehiclesData] = useState([]);
  const [financialSummary, setFinancialSummary] = useState([]);

  // Fetch report data from database backend
  useEffect(() => {
    let isMounted = true;

    const fetchReportData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Pointing directly to full URL or proxies relative URL safely
        const backendUrl =
          process.env.NODE_ENV === "production"
            ? "/api/reports"
            : "http://localhost:5000/api/reports";

        const response = await fetch(backendUrl, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        });

        // Ensure returned payload is actual JSON before attempting .json() parse
        const contentType = response.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
          throw new Error(
            "Server returned invalid response (HTML/Text instead of JSON). Verify backend API server is running."
          );
        }

        if (!response.ok) {
          throw new Error(`Server returned status ${response.status}`);
        }

        const data = await response.json();

        if (isMounted) {
          // Fallback guard checks in case properties are missing from API
          if (data && data.metrics) setMetrics(data.metrics);
          if (data && Array.isArray(data.fuelEfficiency)) {
            setFuelEfficiencyData(data.fuelEfficiency);
          }
          if (data && Array.isArray(data.costliestVehicles)) {
            setCostliestVehiclesData(data.costliestVehicles);
          }
          if (data && Array.isArray(data.financialSummary)) {
            setFinancialSummary(data.financialSummary);
          }
        }
      } catch (err) {
        console.error("Error loading report data:", err);
        if (isMounted) {
          setError(
            err.message || "Unable to load report data from the database."
          );
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchReportData();

    return () => {
      isMounted = false;
    };
  }, []);

  // Helper calculations for dynamic SVG Bar Chart scaling
  const maxVehicleCost = costliestVehiclesData.reduce(
    (max, item) => Math.max(max, item.cost || 0),
    1
  );

  if (loading) {
    return (
      <div className="report-page loading-container">
        <div className="loading-spinner">Loading database metrics...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="report-page error-container">
        <div className="error-message">{error}</div>
        <button className="retry-btn" onClick={() => window.location.reload()}>
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="report-page">
      {/* Sidebar */}
      <aside className="report-sidebar">
        <h2 className="sidebar-title">Report</h2>
      </aside>

      {/* Main Content Area */}
      <main className="report-main-content">
        {/* Header Navigation */}
        <div className="report-header">
          <span className="back-link" onClick={() => navigate(-1)}>
            &lt; Report
          </span>
        </div>

        {/* Top Metric Cards */}
        <div className="metrics-row">
          <div className="metric-card">
            <span className="metric-title">Total Fuel Cost</span>
            <div className="metric-value">{metrics.totalFuelCost}</div>
          </div>

          <div className="metric-card">
            <span className="metric-title">Fleet ROI</span>
            <div className="metric-value positive">{metrics.fleetRoi}</div>
          </div>

          <div className="metric-card">
            <span className="metric-title">Utilization Rate</span>
            <div className="metric-value">{metrics.utilizationRate}</div>
          </div>
        </div>

        {/* Analytics Charts Row */}
        <div className="charts-row">
          {/* Fuel Efficiency Trend Chart */}
          <div className="chart-card">
            <h3 className="chart-title">Fuel Efficiency Trend (km/L)</h3>
            <div className="chart-container">
              <svg className="line-chart-svg" viewBox="0 0 400 180">
                {/* Y-Axis Grid Lines & Labels */}
                <line x1="40" y1="20" x2="380" y2="20" stroke="#cbd5e1" strokeDasharray="4" />
                <text x="10" y="24" className="chart-label">180</text>

                <line x1="40" y1="60" x2="380" y2="60" stroke="#cbd5e1" strokeDasharray="4" />
                <text x="10" y="64" className="chart-label">80</text>

                <line x1="40" y1="100" x2="380" y2="100" stroke="#cbd5e1" strokeDasharray="4" />
                <text x="10" y="104" className="chart-label">60</text>

                <line x1="40" y1="140" x2="380" y2="140" stroke="#cbd5e1" strokeDasharray="4" />
                <text x="10" y="144" className="chart-label">15</text>

                {/* Dynamically Generated Trend Line & Data Points */}
                {fuelEfficiencyData.length > 0 && (
                  <>
                    <polyline
                      fill="none"
                      stroke="#0284c7"
                      strokeWidth="3"
                      points={fuelEfficiencyData
                        .map((item, index) => {
                          const x =
                            50 +
                            index *
                              (300 / Math.max(fuelEfficiencyData.length - 1, 1));
                          // Maps val (0-200) to SVG Y (150-20)
                          const y = 150 - ((item.val || 0) / 200) * 130;
                          return `${x},${y}`;
                        })
                        .join(" ")}
                    />
                    {fuelEfficiencyData.map((item, index) => {
                      const x =
                        50 +
                        index *
                          (300 / Math.max(fuelEfficiencyData.length - 1, 1));
                      const y = 150 - ((item.val || 0) / 200) * 130;
                      return (
                        <g key={item.id || index}>
                          <circle cx={x} cy={y} r="4" fill="#0284c7" />
                          <text
                            x={x}
                            y="170"
                            className="chart-label"
                            textAnchor="middle"
                          >
                            {item.label}
                          </text>
                        </g>
                      );
                    })}
                  </>
                )}
              </svg>
            </div>
          </div>

          {/* Top 5 Costliest Vehicles Bar Chart */}
          <div className="chart-card">
            <h3 className="chart-title">Top 5 Costliest Vehicles</h3>
            <div className="chart-container">
              <svg className="bar-chart-svg" viewBox="0 0 380 180">
                {/* Y Axis Grid lines */}
                <line x1="30" y1="20" x2="360" y2="20" stroke="#cbd5e1" strokeDasharray="4" />
                <text x="5" y="24" className="chart-label">100</text>

                <line x1="30" y1="70" x2="360" y2="70" stroke="#cbd5e1" strokeDasharray="4" />
                <text x="5" y="74" className="chart-label">80</text>

                <line x1="30" y1="120" x2="360" y2="120" stroke="#cbd5e1" strokeDasharray="4" />
                <text x="5" y="124" className="chart-label">45</text>

                {/* Dynamically Generated Vehicle Bars */}
                {costliestVehiclesData.slice(0, 5).map((vehicle, index) => {
                  const x = 50 + index * 60;
                  const barHeight = Math.min(
                    120,
                    ((vehicle.cost || 0) / maxVehicleCost) * 120
                  );
                  const y = 150 - barHeight;

                  return (
                    <g key={vehicle.id || index}>
                      <rect
                        x={x}
                        y={y}
                        width="28"
                        height={Math.max(barHeight, 4)}
                        fill="#0284c7"
                        rx="3"
                      />
                      <text
                        x={x + 14}
                        y="165"
                        className="chart-label"
                        textAnchor="middle"
                      >
                        {vehicle.name}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>
          </div>
        </div>

        {/* Financial Summary Table */}
        <div className="financial-summary-section">
          <div className="section-badge">Financial Summary of Month</div>
          <div className="table-responsive">
            <table className="financial-table">
              <thead>
                <tr>
                  <th>Month</th>
                  <th>Revenue</th>
                  <th>Fuel Cost</th>
                  <th>Maintenance</th>
                  <th>Net Profit</th>
                </tr>
              </thead>
              <tbody>
                {financialSummary.length > 0 ? (
                  financialSummary.map((row, index) => (
                    <tr key={row.id || index}>
                      <td>{row.month}</td>
                      <td>{row.revenue}</td>
                      <td>{row.fuelCost}</td>
                      <td>{row.maintenance}</td>
                      <td className="profit-text">{row.netProfit}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" style={{ textAlign: "center" }}>
                      No financial records found in database.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Report;