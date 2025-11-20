import React, { useState, useRef, useEffect, useMemo } from 'react';

const VelocityChart = ({ samples, height = 320 }) => {
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
        points,
        areaPoints,
        maxValue,
        minValue,
        yRange,
        horizontalStep
    } = useMemo(() => {
        if (!samples.length || !width) return {};

        const maxValue = Math.max(...samples);
        const minValue = Math.min(...samples);
        const yRange = maxValue - minValue || 1;
        const horizontalStep = samples.length > 1 ? width / (samples.length - 1) : width;

        const points = samples
            .map((value, index) => {
                const x = index * horizontalStep;
                const normalizedValue = (value - minValue) / yRange;
                const y = height - normalizedValue * height;
                return `${x},${y}`;
            })
            .join(" ");

        const areaPoints = `${points} ${width},${height} 0,${height}`;

        return { points, areaPoints, maxValue, minValue, yRange, horizontalStep };
    }, [samples, width, height]);

    const handleMouseMove = (e) => {
        if (!width || !samples.length) return;

        const rect = containerRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;

        // Find nearest sample index
        const index = Math.round(x / horizontalStep);

        if (index >= 0 && index < samples.length) {
            const value = samples[index];
            const xPos = index * horizontalStep;

            setHoverData({
                x: xPos,
                value: value,
                index: index
            });
        }
    };

    const handleMouseLeave = () => {
        setHoverData(null);
    };

    if (!samples.length) {
        return null;
    }

    return (
        <div className="trend-chart" style={{ width: '100%', position: 'relative' }} ref={containerRef}>
            {/* Tooltip */}
            {hoverData && (
                <div
                    className="chart-tooltip"
                    style={{
                        left: Math.min(Math.max(0, hoverData.x + 15), width - 120),
                        top: 0
                    }}
                >
                    <div className="chart-tooltip__item">
                        <span
                            className="chart-tooltip__swatch"
                            style={{ backgroundColor: '#4f46e5' }}
                        />
                        <span>Velocity:</span>
                        <span>{hoverData.value.toFixed(4)}</span>
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.25rem' }}>
                        Sample: {hoverData.index}
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
                    role="img"
                    aria-label="Velocity data"
                    style={{ width: '100%', height: 'auto', display: 'block' }}
                >
                    <defs>
                        <linearGradient id="velocityGradient" x1="0" x2="0" y1="0" y2="1">
                            <stop offset="0%" stopColor="#4f46e5" stopOpacity="0.2" />
                            <stop offset="100%" stopColor="#4f46e5" stopOpacity="0" />
                        </linearGradient>
                    </defs>

                    {/* Grid Lines */}
                    {Array.from({ length: 5 }).map((_, index) => {
                        const y = (height / 4) * index;
                        return (
                            <line
                                key={`grid-${index}`}
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

                    {/* Area Fill */}
                    {areaPoints && <polygon points={areaPoints} fill="url(#velocityGradient)" />}

                    {/* Line */}
                    {points && (
                        <polyline
                            fill="none"
                            stroke="#4f46e5"
                            strokeWidth={2}
                            strokeLinejoin="round"
                            strokeLinecap="round"
                            points={points}
                        />
                    )}

                    {/* Cursor Line */}
                    {hoverData && (
                        <line
                            x1={hoverData.x}
                            x2={hoverData.x}
                            y1={0}
                            y2={height}
                            stroke="#94a3b8"
                            strokeWidth={1}
                            strokeDasharray="4 4"
                        />
                    )}

                    {/* Hover Point */}
                    {hoverData && (
                        <circle
                            cx={hoverData.x}
                            cy={height - ((hoverData.value - minValue) / yRange) * height}
                            r={5}
                            fill="#4f46e5"
                            stroke="#fff"
                            strokeWidth={2}
                        />
                    )}
                </svg>
            </div>
        </div>
    );
};

export default VelocityChart;
