import React, { useState, useEffect, useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import { getAccelerationData } from '../api/data/data.api';
import { getAllendpoints } from '../api/assests/assests.api';
import VelocityChart from '../components/charts/VelocityChart';

const SpectrumView = () => {
    const { assetId, isLoadingAssets } = useOutletContext();
    const [velocitySeries, setVelocitySeries] = useState([]);
    const [velocityMeta, setVelocityMeta] = useState(null);
    const [velocityError, setVelocityError] = useState("");
    const [isVelocityLoading, setIsVelocityLoading] = useState(false);

    const fetchVelocitySeries = useCallback(async (payload, meta = {}) => {
        if (!payload.assetId || !payload.mac_id) {
            setVelocityError("Incomplete payload for velocity request.");
            return;
        }

        setIsVelocityLoading(true);
        setVelocityError("");

        try {
            const response = await getAccelerationData(payload);
            if (response.error) {
                throw new Error("Unable to load velocity data.");
            }

            const responseBody =
                response?.data?.data ??
                response?.data ??
                {};

            const axisKey = payload.axis || meta.axis || "Axial";
            const samples = responseBody?.[axisKey] ?? [];

            if (!Array.isArray(samples) || !samples.length) {
                throw new Error("Velocity API returned no samples.");
            }

            setVelocitySeries(samples);

            const measurementId = meta.measurementId ?? payload.id ?? responseBody?.id;
            if (measurementId) {
                localStorage.setItem('endpointId', measurementId);
            }

            setVelocityMeta({
                axis: axisKey,
                domain: payload.domain || meta.domain || "frequency",
                macId: meta.macId ?? payload.mac_id,
                measurementId: measurementId,
                timestamp:
                    responseBody?.timestamp ?? payload.timestamp ?? meta.timestamp ?? null,
            });
        } catch (apiError) {
            setVelocitySeries([]);
            setVelocityMeta(null);
            setVelocityError(apiError.message || "Unable to load velocity data.");
        } finally {
            setIsVelocityLoading(false);
        }
    }, []);

    useEffect(() => {
        const initData = async () => {
            if (isLoadingAssets) return;

            if (!assetId) {
                setVelocityError("No asset selected.");
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
                    setVelocityError("Unable to resolve endpoint MAC id for velocity request.");
                    return;
                }

                const axis = endpointDetails?.axis ?? "Axial";
                const domain = endpointDetails?.domain ?? "frequency";
                const timestamp =
                    endpointDetails?.timestamp ??
                    endpointsResponse?.data?.timestamp ??
                    Math.floor(Date.now() / 1000);

                const payloadMacId =
                    measurementId && baseMacId.endsWith("_")
                        ? `${baseMacId}${measurementId}`
                        : baseMacId;

                const velocityPayload = {
                    assetId: assetId,
                    axis,
                    domain,
                    mac_id: payloadMacId,
                    timestamp,
                    ...(measurementId && { id: measurementId }),
                };

                await fetchVelocitySeries(velocityPayload, {
                    macId: payloadMacId,
                    measurementId,
                    axis,
                    domain,
                    timestamp,
                });
            } catch (err) {
                setVelocityError("Failed to initialize data.");
            }
        };

        initData();
    }, [fetchVelocitySeries, assetId, isLoadingAssets]);

    const formattedTimestamp =
        velocityMeta?.timestamp && !Number.isNaN(Number(velocityMeta.timestamp))
            ? new Date(Number(velocityMeta.timestamp) * 1000).toLocaleString()
            : null;

    return (
        <section className="dashboard-card">
            <div className="dashboard-card__header">
                <div>
                    <p className="dashboard-card__eyebrow">Spectrum</p>
                    <h2>Velocity Spectrum</h2>
                </div>
                {formattedTimestamp && (
                    <span className="dashboard-chip" aria-live="polite">
                        Last sync: {formattedTimestamp}
                    </span>
                )}
            </div>

            {isVelocityLoading && <p>Loading velocity data...</p>}
            {velocityError && (
                <p className="form-error" role="alert">
                    {velocityError}
                </p>
            )}

            {!isVelocityLoading && !velocityError && (
                <>
                    {velocitySeries.length ? (
                        <>
                            <div className="dashboard-page__chart">
                                <VelocityChart samples={velocitySeries} />
                            </div>


                        </>
                    ) : (
                        <p>No velocity data available yet.</p>
                    )}
                </>
            )}
        </section>
    );
};

export default SpectrumView;
