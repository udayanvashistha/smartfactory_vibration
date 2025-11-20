import React, { useState, useRef, useEffect, useMemo } from 'react';

const TrendChart = ({
    entries,
    axes = [],
    metric = "rms",
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
        normalizedAxes,
        axisList,
        timestampValues,
        tsMin,
        tsMax,
        tsRange,
        yMin,
        yMax,
        yRange,
        COLORS
    } = useMemo(() => {
        if (!entries.length) return {};

        const normalizedAxes = axes?.filter(
            (axisName) => typeof axisName === "string" && axisName.length
        ) ?? [];

        const axisList = normalizedAxes.length > 0
            ? normalizedAxes
            : entries.reduce((names, entry) => {
                Object.keys(entry || {}).forEach((key) => {
                    if (
                        key !== "timestamp" &&
                        typeof entry?.[key] === "object" &&
                        !names.includes(key)
                    ) {
                        names.push(key);
                    }
                });
                return names;
            }, []);

        if (!axisList.length) return {};

        const timestampValues = entries.map((entry, index) => {
            const ts = Number(entry?.timestamp);
            return Number.isFinite(ts) ? ts : index;
        });
        const tsMin = Math.min(...timestampValues);
        const tsMax = Math.max(...timestampValues);
        const tsRange = tsMax - tsMin || 1;

        const yValues = axisList.flatMap((axis) =>
            entries
                .map((entry) => {
                    const axisEntry = entry?.[axis];
                    const metricValue =
                        axisEntry && typeof axisEntry[metric] === "number"
                            ? axisEntry[metric]
                            : null;
                    return typeof metricValue === "number" ? metricValue : null;
                })
                .filter((value) => value !== null)
        );

        if (!yValues.length) return {};

        const yMin = Math.min(...yValues);
        const yMax = Math.max(...yValues);
        // Add some padding to Y range
        const yPadding = (yMax - yMin) * 0.1 || 1;
        const adjustedYMin = yMin - yPadding;
        const adjustedYMax = yMax + yPadding;
        const yRange = adjustedYMax - adjustedYMin || 1;

        const COLORS = ["#2563eb", "#dc2626", "#16a34a", "#d97706", "#14b8a6"];

        return {
            normalizedAxes,
            axisList,
            timestampValues,
            tsMin,
            tsMax,
            tsRange,
            yMin: adjustedYMin,
            yMax: adjustedYMax,
            yRange,
            COLORS
        };
    }, [entries, axes, metric]);

    if (!entries.length || !axisList?.length) {
        return <p>No trend data available.</p>;
    }

    const getXPosition = (index) => {
        if (entries.length === 1) {
            return width / 2;
        }
        return ((timestampValues[index] - tsMin) / tsRange) * width;
    };

    const paddingBottom = 30;
    const chartHeight = height - paddingBottom;

    const axisPolylines = useMemo(() => {
        const polylines = [];
        const flagged = [];

        axisList.forEach((axis, axisIndex) => {
            const color = COLORS[axisIndex % COLORS.length];
            const pointString = entries
                .map((entry, index) => {
                    const axisEntry = entry?.[axis];
                    if (!axisEntry || typeof axisEntry[metric] !== "number") {
                        return null;
                    }

                    const x = getXPosition(index);
                    const normalizedValue = (axisEntry[metric] - yMin) / yRange;
                    const y = chartHeight - normalizedValue * chartHeight;

                    if (axisEntry.flag) {
                        flagged.push({ axis, x, y, color });
                    }

                    return `${x},${y}`;
                })
                .filter(Boolean)
                .join(" ");

            if (pointString) {
                polylines.push({ axis, color, points: pointString });
            }
        });

        return { polylines, flagged };
    }, [axisList, entries, metric, width, chartHeight, yMin, yRange, COLORS, timestampValues, tsMin, tsRange]);

    const xTicks = useMemo(() => {
        if (!timestampValues.length) return [];
        const tickCount = 5;
        const ticks = [];
        const step = (timestampValues.length - 1) / (tickCount - 1);

        for (let i = 0; i < tickCount; i++) {
            const index = Math.round(i * step);
            if (index < timestampValues.length) {
                ticks.push({
                    x: getXPosition(index),
                    ts: timestampValues[index]
                });
            }
        }
        return ticks;
    }, [timestampValues, width, tsMin, tsRange]);

    const handleMouseMove = (e) => {
        if (!width || !entries.length) return;

        const rect = containerRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;

        // Find nearest timestamp index
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

        const entry = entries[closestIndex];
        const xPos = getXPosition(closestIndex);

        const tooltipData = axisList.map((axis, i) => ({
            axis,
            value: entry?.[axis]?.[metric],
            color: COLORS[i % COLORS.length]
        })).filter(item => typeof item.value === 'number');

        setHoverData({
            x: xPos,
            timestamp: entry.timestamp,
            items: tooltipData
        });
    };

    const handleMouseLeave = () => {
        setHoverData(null);
    };

    const formatDate = (ts) => {
        if (!ts) return '';
        return new Date(ts).toLocaleString();
    };

    return (
        <div className="trend-chart" style={{ width: '100%', position: 'relative' }} ref={containerRef}>
            {/* Tooltip */}
            {hoverData && (
                <div
                    className="chart-tooltip"
                    style={{
                        left: Math.min(Math.max(0, hoverData.x + 15), width - 160),
                        top: 0
                    }}
                >
                    <span className="chart-tooltip__date">{formatDate(hoverData.timestamp)}</span>
                    {hoverData.items.map((item) => (
                        <div key={item.axis} className="chart-tooltip__item">
                            <span
                                className="chart-tooltip__swatch"
                                style={{ backgroundColor: item.color }}
                            />
                            <span>{item.axis}:</span>
                            <span>{item.value.toFixed(2)}</span>
                        </div>
                    ))}
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
                    role="img"
                    aria-label="Trend data"
                    style={{ width: '100%', height: 'auto', display: 'block' }}
                >
                    {/* Grid Lines */}
                    {Array.from({ length: 5 }).map((_, index) => {
                        const y = (chartHeight / 4) * index;
                        return (
                            <line
                                key={`trend-grid-${index}`}
                                x1="0"
                                x2={width}
                                y1={y}
                                y2={y}
                                stroke="#e2e8f0"
                                strokeWidth={1}
                                strokeDasharray="4 4"
                            />
                        );
                    })}

                    {/* Trend Lines */}
                    {axisPolylines.polylines.map(({ axis, color, points }) => (
                        <React.Fragment key={axis}>
                            <polyline
                                fill="none"
                                stroke={color}
                                strokeWidth={2}
                                strokeLinejoin="round"
                                strokeLinecap="round"
                                points={points}
                            />
                            {/* Gradient fill area could be added here if needed */}
                        </React.Fragment>
                    ))}

                    {/* Flagged Points */}
                    {axisPolylines.flagged.map(({ axis, x, y, color }) => (
                        <circle
                            key={`${axis}-${x}-${y}`}
                            cx={x}
                            cy={y}
                            r={4}
                            fill={color}
                            stroke="#ffffff"
                            strokeWidth={1}
                        />
                    ))}

                    {/* X-Axis Labels */}
                    {xTicks.map((tick, i) => (
                        <text
                            key={`tick-${i}`}
                            x={tick.x}
                            y={height - 5}
                            textAnchor="middle"
                            fontSize="10"
                            fill="#64748b"
                        >
                            {new Date(tick.ts).toLocaleDateString(undefined, { month: 'numeric', day: 'numeric' })}
                            {' '}
                            {new Date(tick.ts).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                        </text>
                    ))}

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

                    {/* Hover Points */}
                    {hoverData && hoverData.items.map((item, i) => {
                        const normalizedValue = (item.value - yMin) / yRange;
                        const y = chartHeight - normalizedValue * chartHeight;
                        return (
                            <circle
                                key={`hover-${i}`}
                                cx={hoverData.x}
                                cy={y}
                                r={5}
                                fill={item.color}
                                stroke="#fff"
                                strokeWidth={2}
                            />
                        );
                    })}
                </svg>
            </div>

            <div
                className="trend-chart__legend"
                style={{ marginTop: "1rem", display: "flex", flexWrap: "wrap", justifyContent: 'center' }}
            >
                {axisPolylines.polylines.map(({ axis, color }) => (
                    <span
                        key={`legend-${axis}`}
                        className="trend-chart__legend-item"
                        style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "0.5rem",
                            marginRight: "1.5rem",
                            padding: '0.25rem 0.75rem',
                            background: '#f8fafc',
                            borderRadius: '999px',
                            border: '1px solid #e2e8f0',
                            fontSize: '0.85rem',
                            fontWeight: 500,
                            color: '#475569'
                        }}
                    >
                        <span
                            className="trend-chart__legend-swatch"
                            style={{
                                backgroundColor: color,
                            }}
                        />
                        {axis}
                    </span>
                ))}
                {!!axisPolylines.flagged.length && (
                    <span
                        className="trend-chart__legend-item"
                        style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "0.5rem",
                            padding: '0.25rem 0.75rem',
                            background: '#fffbeb',
                            borderRadius: '999px',
                            border: '1px solid #fcd34d',
                            fontSize: '0.85rem',
                            fontWeight: 500,
                            color: '#92400e'
                        }}
                    >
                        <span
                            className="trend-chart__legend-swatch"
                            style={{
                                backgroundColor: "#fbbf24",
                                border: "1px solid #92400e",
                            }}
                        />
                        Flagged reading
                    </span>
                )}
            </div>
        </div>
    );
};

export default TrendChart;
