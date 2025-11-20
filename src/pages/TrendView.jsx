import React, { useState, useEffect, useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import { getTrendData } from '../api/data/data.api';
import { getAllendpoints } from '../api/assests/assests.api';
import TrendChart from '../components/charts/TrendChart';

const AXIS_TARGETS = ["Axial", "Vertical", "Horizontal"];
const AXIS_FILTERS = ["All", ...AXIS_TARGETS];

const normalizeAxisLabels = (axes) => {
    if (!axes) return [];
    const axisArray = Array.isArray(axes) ? axes : [axes];
    return axisArray
        .map((axis) => {
            if (typeof axis !== "string") return null;
            const cleaned = axis.trim();
            if (!cleaned) return null;
            return cleaned.charAt(0).toUpperCase() + cleaned.slice(1).toLowerCase();
        })
        .filter(Boolean);
};

const formatAxisForApi = (axes) => {
    if (!axes) return [];
    const axisArray = Array.isArray(axes) ? axes : [axes];
    return axisArray
        .map((axis) => (typeof axis === "string" ? axis.trim() : null))
        .filter(Boolean);
};

const TrendView = () => {
    const { assetId, isLoadingAssets } = useOutletContext();
    const [trendSeries, setTrendSeries] = useState([]);
    const [trendMeta, setTrendMeta] = useState(null);
    const [trendError, setTrendError] = useState("");
    const [isTrendLoading, setIsTrendLoading] = useState(false);
    const [trendRequestBase, setTrendRequestBase] = useState(null);
    const [selectedAxisFilter, setSelectedAxisFilter] = useState("All");

    const fetchTrendSeries = useCallback(async (payload, meta = {}) => {
        if (!payload.asset_id || !payload.mac_id) {
            setTrendError("Incomplete payload for trend request.");
            return;
        }

        setIsTrendLoading(true);
        setTrendError("");

        try {
            const response = await getTrendData(payload);
            if (response.error) {
                throw new Error("Unable to load trend data.");
            }

            const trendEntries =
                response?.data?.trendData ??
                response?.data?.data?.trendData ??
                (Array.isArray(response?.data) ? response.data : []);

            if (!Array.isArray(trendEntries) || !trendEntries.length) {
                throw new Error("Trend API returned no data.");
            }

            const processedEntries = trendEntries.map(entry => ({
                ...entry,
                timestamp: (Number(entry.timestamp) || 0) * 1000
            }));

            const metaAxes = normalizeAxisLabels(meta.axes);
            const payloadAxes = normalizeAxisLabels(payload.axis);
            const resolvedAxes = metaAxes.length
                ? metaAxes
                : payloadAxes.length
                    ? payloadAxes
                    : ["Axial"];

            setTrendSeries(processedEntries);
            setTrendMeta({
                axes: resolvedAxes,
                signalType: payload.signalType || meta.signalType || "velocity",
                domain: payload.domain || meta.domain || "time",
                metricKey: payload.function || meta.metricKey || "rms",
                macId: payload.mac_id,
            });
        } catch (apiError) {
            setTrendSeries([]);
            setTrendMeta(null);
            setTrendError(apiError.message || "Unable to load trend data.");
        } finally {
            setIsTrendLoading(false);
        }
    }, []);

    useEffect(() => {
        const initData = async () => {
            if (isLoadingAssets) return;

            if (!assetId) {
                setTrendError("No asset selected.");
                return;
            }

            try {
                const endpointsResponse = await getAllendpoints({
                    asset_id: [assetId],
                });

                const deviceEntries = Array.isArray(endpointsResponse?.data?.data)
                    ? endpointsResponse.data.data
                    : Array.isArray(endpointsResponse?.data)
                        ? endpointsResponse.data
                        : [];

                const endpointDetails =
                    Array.isArray(deviceEntries) && deviceEntries.length
                        ? deviceEntries[0]
                        : endpointsResponse?.data;

                const macIdentifier =
                    endpointDetails?.mac_id ??
                    endpointDetails?.macid ??
                    endpointsResponse?.data?.mac_id ??
                    null;

                const normalizeMacPrefix = (value) => {
                    if (!value) return value;
                    return value.endsWith("_") ? value : `${value}_`;
                };

                const baseMacId =
                    endpointDetails?.macind_assetid_ ??
                    endpointDetails?.macid_assetid_ ??
                    endpointDetails?.macid_assetid ??
                    normalizeMacPrefix(endpointDetails?.mac_id_asset) ??
                    normalizeMacPrefix(endpointDetails?.macid_asset) ??
                    normalizeMacPrefix(
                        macIdentifier && assetId
                            ? `${macIdentifier}_${assetId}`
                            : macIdentifier
                    );

                const measurementId =
                    endpointDetails?.id ??
                    endpointDetails?._id ??
                    endpointsResponse?.data?.id ??
                    null;

                if (!baseMacId) {
                    setTrendError("Unable to resolve endpoint MAC id for trend request.");
                    return;
                }

                const payloadMacId =
                    measurementId && baseMacId.endsWith("_")
                        ? `${baseMacId}${measurementId}`
                        : baseMacId;

                const baseTrendPayload = {
                    mac_id: payloadMacId,
                    asset_id: assetId,
                    domain: "time",
                    function: "rms",
                    signalType: "velocity",
                    fft_only: false,
                    fromDate: null,
                    toDate: null,
                };

                setTrendRequestBase(baseTrendPayload);
                setSelectedAxisFilter("All");

                await fetchTrendSeries(
                    { ...baseTrendPayload, axis: formatAxisForApi(AXIS_TARGETS) },
                    {
                        axes: AXIS_TARGETS,
                        signalType: "velocity",
                        domain: "time",
                        function: "rms",
                    }
                );
            } catch (err) {
                setTrendError("Failed to initialize data.");
            }
        };

        initData();
    }, [fetchTrendSeries, assetId, isLoadingAssets]);

    const handleAxisSelection = useCallback(
        (nextAxis) => {
            if (!trendRequestBase || nextAxis === selectedAxisFilter) return;

            const axesArray =
                nextAxis === "All" ? AXIS_TARGETS : [nextAxis];

            setSelectedAxisFilter(nextAxis);
            fetchTrendSeries(
                { ...trendRequestBase, axis: formatAxisForApi(axesArray) },
                {
                    axes: axesArray,
                    signalType: trendRequestBase.signalType,
                    domain: trendRequestBase.domain,
                    function: trendRequestBase.function,
                }
            );
        },
        [fetchTrendSeries, selectedAxisFilter, trendRequestBase]
    );

    return (
        <section className="dashboard-card dashboard-card--compact">
            <div className="dashboard-card__header">
                <div>
                    <p className="dashboard-card__eyebrow">Trend</p>
                    <h2>Velocity Trend</h2>
                </div>
                <div className="trend-axis-toggle" role="group" aria-label="Axis selection">
                    {AXIS_FILTERS.map((axisOption) => {
                        const isActive = selectedAxisFilter === axisOption;
                        return (
                            <button
                                key={axisOption}
                                type="button"
                                className={`trend-axis-toggle__btn${isActive ? " trend-axis-toggle__btn--active" : ""}`}
                                onClick={() => handleAxisSelection(axisOption)}
                                disabled={isTrendLoading || !trendRequestBase}
                            >
                                {axisOption}
                            </button>
                        );
                    })}
                </div>
                {Boolean(trendMeta?.axes?.length) && (
                    <span className="dashboard-chip">
                        {trendMeta.axes.length} axes
                    </span>
                )}
            </div>

            {isTrendLoading && <p>Loading trend data...</p>}
            {trendError && (
                <p className="form-error" role="alert">
                    {trendError}
                </p>
            )}

            {!isTrendLoading && !trendError && (
                <>
                    {trendSeries.length ? (
                        <>
                            <div className="dashboard-page__chart">
                                <TrendChart
                                    entries={trendSeries}
                                    axes={trendMeta?.axes}
                                    metric={trendMeta?.metricKey}
                                />
                            </div>


                        </>
                    ) : (
                        <p>No trend data available yet.</p>
                    )}
                </>
            )}
        </section>
    );
};

export default TrendView;
