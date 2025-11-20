import React, { useState, useRef, useEffect, useMemo } from 'react';

const STATUS_MAP = {
    "Healthy": 1,
    "Alert": 2,
    "Critical": 3,
    "Not Defined": 0
};

const REVERSE_STATUS_MAP = {
    1: "Healthy",
    2: "Alert",
    3: "Critical",
    0: "Not Defined"
};

const STATUS_COLORS = {
    "Healthy": "#10b981", // Green
    "Alert": "#f59e0b",   // Amber
    "Critical": "#ef4444", // Red
    "Not Defined": "#94a3b8" // Gray
};

const HealthTrendChart = ({
    dates = [],
    statuses = [],
    height = 320,
}) => {
    const containerRef = useRef(null);
    const [width, setWidth] = useState(0);
    const [hoverData, setHoverData] = useState(null);

    useEffect(() => {
        if (!containerRef.current) return;

        const resizeObserver = new ResizeObserver((entries) => {
            for (const entry of entries) {
                setWidth(entry.contentRect.width);
            }
        });

        resizeObserver.observe(containerRef.current);
        return () => resizeObserver.disconnect();
    }, []);

    const {
        timestampValues,
        tsMin,
        tsMax,
        tsRange,
        points
    } = useMemo(() => {
        if (!dates.length || !statuses.length) return {};

        const timestampValues = dates.map(d => new Date(d).getTime());
        const tsMin = Math.min(...timestampValues);
        const tsMax = Math.max(...timestampValues);
        const tsRange = tsMax - tsMin || 1;

        // Map statuses to Y values (0-3)
        // We'll use a fixed Y range of 0-4 for padding

        return {
            timestampValues,
            tsMin,
            tsMax,
            tsRange,
            points: statuses.map((status, i) => ({
                x: timestampValues[i],
                y: STATUS_MAP[status] ?? 0,
                status
            }))
        };
    }, [dates, statuses]);

    if (!dates.length || !statuses.length) {
        return <p>No health history data available.</p>;
    }

    const getXPosition = (ts) => {
        if (dates.length === 1) return width / 2;
        return ((ts - tsMin) / tsRange) * width;
    };

    const paddingBottom = 30;
    const chartHeight = height - paddingBottom;
    const yRange = 4; // 0 to 3 + padding

    const polylinePoints = points.map(p => {
        const x = getXPosition(p.x);
        // Invert Y for SVG (0 at top)
        // Map 0-3 to height. 3 is highest (top), 0 is lowest (bottom)
        // Let's make 0 be at bottom, 3 at top.
        // Normalized Y: p.y / 3
        const y = chartHeight - (p.y / 3) * (chartHeight * 0.8) - (chartHeight * 0.1); // 10% padding top/bottom
        return `${x},${y}`;
    }).join(" ");

    const handleMouseMove = (e) => {
        if (!width || !points.length) return;

        const rect = containerRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;

        // Find nearest timestamp
        const hoverTs = (x / width) * tsRange + tsMin;

        let closestIndex = 0;
        let minDiff = Infinity;

        timestampValues.forEach((ts, index) => {
            const diff = Math.abs(ts - hoverTs);
            if (diff < minDiff) {
                minDiff = diff;
                closestIndex = index;
            }
        });

        const point = points[closestIndex];
        const xPos = getXPosition(point.x);
        const yPos = chartHeight - (point.y / 3) * (chartHeight * 0.8) - (chartHeight * 0.1);

        setHoverData({
            x: xPos,
            y: yPos,
            timestamp: point.x,
            status: point.status,
            color: STATUS_COLORS[point.status] ?? STATUS_COLORS["Not Defined"]
        });
    };

    const handleMouseLeave = () => {
        setHoverData(null);
    };

    return (
        <div className="trend-chart" style={{ width: '100%', position: 'relative' }} ref={containerRef}>
            {/* Tooltip */}
            {hoverData && (
                <div
                    className="chart-tooltip"
                    style={{
                        left: Math.min(Math.max(0, hoverData.x + 15), width - 160),
                        top: 0,
                        zIndex: 10
                    }}
                >
                    <span className="chart-tooltip__date">{new Date(hoverData.timestamp).toLocaleDateString()}</span>
                    <div className="chart-tooltip__item">
                        <span
                            className="chart-tooltip__swatch"
                            style={{ backgroundColor: hoverData.color }}
                        />
                        <span>Status:</span>
                        <span style={{ fontWeight: 600 }}>{hoverData.status}</span>
                    </div>
                </div>
            )}

            <div
                className="chart-container"
                style={{ width: '100%', overflow: 'hidden', cursor: 'crosshair' }}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
            >
                <svg
                    className="dashboard-page__chart-svg"
                    viewBox={`0 0 ${width} ${height}`}
                    preserveAspectRatio="none"
                    style={{ width: '100%', height: 'auto', display: 'block' }}
                >
                    {/* Y-Axis Grid & Labels */}
                    {[0, 1, 2, 3].map((val) => {
                        const y = chartHeight - (val / 3) * (chartHeight * 0.8) - (chartHeight * 0.1);
                        return (
                            <React.Fragment key={val}>
                                <line
                                    x1="0"
                                    x2={width}
                                    y1={y}
                                    y2={y}
                                    stroke="#e2e8f0"
                                    strokeWidth={1}
                                    strokeDasharray="4 4"
                                />
                                <text
                                    x="5"
                                    y={y - 5}
                                    fontSize="10"
                                    fill="#94a3b8"
                                >
                                    {REVERSE_STATUS_MAP[val]}
                                </text>
                            </React.Fragment>
                        );
                    })}

                    {/* Trend Line */}
                    <polyline
                        fill="none"
                        stroke="#6366f1"
                        strokeWidth={2}
                        strokeLinejoin="round"
                        strokeLinecap="round"
                        points={polylinePoints}
                    />

                    {/* Points */}
                    {points.map((p, i) => {
                        const x = getXPosition(p.x);
                        const y = chartHeight - (p.y / 3) * (chartHeight * 0.8) - (chartHeight * 0.1);
                        return (
                            <circle
                                key={i}
                                cx={x}
                                cy={y}
                                r={3}
                                fill={STATUS_COLORS[p.status] ?? STATUS_COLORS["Not Defined"]}
                            />
                        );
                    })}

                    {/* Cursor Line */}
                    {hoverData && (
                        <line
                            x1={hoverData.x}
                            x2={hoverData.x}
                            y1={0}
                            y2={chartHeight}
                            stroke="#94a3b8"
                            strokeWidth={1}
                            strokeDasharray="4 4"
                        />
                    )}

                    {/* Hover Point */}
                    {hoverData && (
                        <circle
                            cx={hoverData.x}
                            cy={hoverData.y}
                            r={6}
                            fill={hoverData.color}
                            stroke="#fff"
                            strokeWidth={2}
                        />
                    )}

                    {/* X-Axis Labels (Simplified) */}
                    {timestampValues.filter((_, i) => i % Math.ceil(timestampValues.length / 5) === 0).map((ts, i) => {
                        const x = getXPosition(ts);
                        return (
                            <text
                                key={i}
                                x={x}
                                y={height - 5}
                                textAnchor="middle"
                                fontSize="10"
                                fill="#64748b"
                            >
                                {new Date(ts).toLocaleDateString(undefined, { month: 'numeric', day: 'numeric' })}
                            </text>
                        );
                    })}

                </svg>
            </div>
        </div>
    );
};

export default HealthTrendChart;
