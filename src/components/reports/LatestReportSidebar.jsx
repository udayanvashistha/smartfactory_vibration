import React, { useState, useEffect } from "react";
import {
  getLatestReport,
  getAssetsCardkpi,
  getHealthHistory,
} from "../../api/data/data.api";
import HealthTrendChart from "../charts/HealthTrendChart";

const LatestReportSidebar = ({ assetId }) => {
  const [report, setReport] = useState(null);
  const [kpiData, setKpiData] = useState(null);
  const [healthHistory, setHealthHistory] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!assetId) return;

      setLoading(true);
      setError(null);
      try {
        // Fetch Latest Report
        const reportResponse = await getLatestReport({ asset_id: assetId });
        const reportData = reportResponse?.data;

        if (reportData?.result === 1 && reportData?.message) {
          setReport(reportData.message);
        } else {
          setReport(null);
        }

        // Fetch KPI Data
        const endpointId = localStorage.getItem("endpointId");
        if (endpointId) {
          const kpiResponse = await getAssetsCardkpi({
            asset_id: assetId,
            endpoint_id: endpointId,
          });

          const kpiResult = kpiResponse?.data || kpiResponse;

          if (kpiResult && kpiResult.cards) {
            setKpiData(kpiResult);
          } else {
            setKpiData(null);
          }
        }

        // Fetch Health History
        const healthResponse = await getHealthHistory({
          asset_id: assetId,
          start_date: null,
          end_date: null,
        });

        const healthResult = healthResponse?.data?.data || healthResponse?.data;
        if (
          healthResult &&
          healthResult.timeStamp &&
          healthResult.assetStatus
        ) {
          setHealthHistory(healthResult);
        } else {
          setHealthHistory(null);
        }
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load data.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [assetId]);

  if (!assetId) return null;

  if (loading) return <p>Loading data...</p>;
  if (error) return <p className="form-error">{error}</p>;
  if (!report && !kpiData && !healthHistory)
    return (
      <p style={{ color: "#64748b", fontStyle: "italic" }}>
        No data found for this asset.
      </p>
    );

  return (
    <div
      className="latest-report-container"
      style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}
    >
      {/* Report Cards */}
      {report && (
        <div
          className="latest-report-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: "1.5rem",
          }}
        >
          {/* Observations Card */}
          <div
            className="dashboard-card dashboard-card--compact"
            style={{ borderTop: "4px solid #4f46e5" }}
          >
            <div
              className="dashboard-card__header"
              style={{ marginBottom: "1rem" }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.75rem",
                }}
              >
                <div
                  style={{
                    width: "32px",
                    height: "32px",
                    borderRadius: "50%",
                    background: "#eef2ff",
                    color: "#4f46e5",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "1.1rem",
                  }}
                >
                  ⓘ
                </div>
                <h2
                  className="dashboard-card__title"
                  style={{
                    fontSize: "1.1rem",
                    fontWeight: 600,
                    color: "#1e293b",
                    margin: 0,
                  }}
                >
                  Observations
                </h2>
              </div>
            </div>
            <p
              style={{
                fontSize: "0.95rem",
                lineHeight: "1.6",
                color: "#475569",
                margin: 0,
              }}
            >
              {report.Observations || "No observations available."}
            </p>
          </div>

          {/* Recommendations Card */}
          <div
            className="dashboard-card dashboard-card--compact"
            style={{ borderTop: "4px solid #10b981" }}
          >
            <div
              className="dashboard-card__header"
              style={{ marginBottom: "1rem" }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.75rem",
                }}
              >
                <div
                  style={{
                    width: "32px",
                    height: "32px",
                    borderRadius: "50%",
                    background: "#ecfdf5",
                    color: "#10b981",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "1.1rem",
                  }}
                >
                  ✓
                </div>
                <h2
                  className="dashboard-card__title"
                  style={{
                    fontSize: "1.1rem",
                    fontWeight: 600,
                    color: "#1e293b",
                    margin: 0,
                  }}
                >
                  Recommendations
                </h2>
              </div>
            </div>
            <p
              style={{
                fontSize: "0.95rem",
                lineHeight: "1.6",
                color: "#475569",
                margin: 0,
              }}
            >
              {report.Recommendations || "No recommendations available."}
            </p>
          </div>

          {/* Fault Analysis Card */}
          <div
            className="dashboard-card dashboard-card--compact"
            style={{ borderTop: "4px solid #ef4444" }}
          >
            <div
              className="dashboard-card__header"
              style={{ marginBottom: "1rem" }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.75rem",
                }}
              >
                <div
                  style={{
                    width: "32px",
                    height: "32px",
                    borderRadius: "50%",
                    background: "#fef2f2",
                    color: "#ef4444",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "1.1rem",
                  }}
                >
                  ⚠
                </div>
                <h2
                  className="dashboard-card__title"
                  style={{
                    fontSize: "1.1rem",
                    fontWeight: 600,
                    color: "#1e293b",
                    margin: 0,
                  }}
                >
                  Fault Detected
                </h2>
              </div>
              <span
                style={{
                  background: "#ef4444",
                  color: "#fff",
                  padding: "0.2rem 0.6rem",
                  borderRadius: "999px",
                  fontSize: "0.8rem",
                  fontWeight: 600,
                }}
              >
                {report.faultData
                  ? report.faultData.filter((f) => f.value > 1).length
                  : 0}
              </span>
            </div>

            {report.faultData && report.faultData.length > 0 ? (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.85rem",
                }}
              >
                {report.faultData
                  .filter((f) => f.value > 1)
                  .map((fault, index) => (
                    <div
                      key={index}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        fontSize: "0.9rem",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "0.5rem",
                        }}
                      >
                        {fault.value > 0 && (
                          <span
                            style={{ color: "#ef4444", fontSize: "0.8rem" }}
                          >
                            ⚠
                          </span>
                        )}
                        <span
                          style={{
                            color: fault.value > 0 ? "#1e293b" : "#94a3b8",
                            fontWeight: fault.value > 0 ? 500 : 400,
                          }}
                        >
                          {fault.name}
                        </span>
                      </div>
                      <div style={{ display: "flex", gap: "2px" }}>
                        {[1, 2, 3, 4].map((level) => (
                          <div
                            key={level}
                            style={{
                              width: "6px",
                              height: "12px",
                              borderRadius: "2px",
                              backgroundColor:
                                level <= fault.value
                                  ? fault.value > 5
                                    ? "#ef4444"
                                    : fault.value > 2
                                    ? "#f59e0b"
                                    : "#eab308"
                                  : "#e2e8f0",
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <p style={{ color: "#64748b", fontStyle: "italic" }}>
                No fault data available.
              </p>
            )}
          </div>
        </div>
      )}

      {/* Health History Graph */}
      {healthHistory && (
        <div className="dashboard-card">
          <div className="dashboard-card__header">
            <div>
              <p className="dashboard-card__eyebrow">Asset Health</p>
            </div>
            {healthHistory.assetHealth && (
              <span
                className={`dashboard-chip ${
                  healthHistory.assetHealth === "Healthy"
                    ? "dashboard-chip--success"
                    : "dashboard-chip--warning"
                }`}
              >
                Current: {healthHistory.assetHealth}
              </span>
            )}
          </div>
          <div className="dashboard-page__chart">
            <HealthTrendChart
              dates={healthHistory.timeStamp}
              statuses={healthHistory.assetStatus}
            />
          </div>
        </div>
      )}

      {/* KPI List */}
      {kpiData && kpiData.cards && (
        <div className="dashboard-card dashboard-card--compact">
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "1rem",
            }}
          >
            {kpiData.cards.map((card, index) => {
              const isVelocity = card.signal_type.toLowerCase() === "velocity";
              const bgColor = isVelocity ? "#f0fdf4" : "#f5f3ff"; // Light green for Velocity, Light purple for Acceleration
              const valueColor =
                card.values.value_change < 0
                  ? "#16a34a"
                  : card.values.value_change > 0
                  ? "#dc2626"
                  : "#4b5563";

              return (
                <div
                  key={index}
                  style={{
                    backgroundColor: bgColor,
                    borderRadius: "0.75rem",
                    padding: "1.25rem",
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "0.5rem",
                    }}
                  >
                    {/* Header */}
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                        color: "#1e293b",
                        fontWeight: 600,
                        fontSize: "1rem",
                      }}
                    >
                      <span style={{ fontSize: "1.2rem" }}>
                        {isVelocity ? "📉" : "—"}
                      </span>
                      <span style={{ textTransform: "capitalize" }}>
                        {card.signal_type} | {card.stat_func.toUpperCase()} |{" "}
                        {card.axis}
                      </span>
                    </div>

                    {/* Value and Change */}
                    <div
                      style={{
                        display: "flex",
                        alignItems: "baseline",
                        gap: "0.5rem",
                      }}
                    >
                      <span
                        style={{
                          fontSize: "1.25rem",
                          fontWeight: 700,
                          color: valueColor,
                        }}
                      >
                        {card.values.value_change} %
                      </span>
                      <span style={{ fontSize: "0.9rem", color: "#64748b" }}>
                        {card.values.value_change < 0
                          ? "Less than previous day average."
                          : card.values.value_change > 0
                          ? "More than previous day average."
                          : "No change than previous day average."}
                      </span>
                    </div>

                    {/* Mean Value Change */}
                    <div
                      style={{
                        fontSize: "0.9rem",
                        color: "#475569",
                        fontWeight: 500,
                      }}
                    >
                      Mean value change:{" "}
                      <span style={{ fontWeight: 700 }}>
                        {card.values.previous}
                      </span>{" "}
                      →{" "}
                      <span style={{ fontWeight: 700 }}>
                        {card.values.latest}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default LatestReportSidebar;
