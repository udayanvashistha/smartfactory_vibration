import React, { useState, useEffect, useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import { getTempData } from '../api/data/data.api';
import { getAllendpoints } from '../api/assests/assests.api';
import TrendChart from '../components/charts/TrendChart';

const TemperatureView = () => {
    const { assetId, isLoadingAssets } = useOutletContext();
    const [tempSeries, setTempSeries] = useState([]);
    const [tempMeta, setTempMeta] = useState(null);
    const [tempError, setTempError] = useState("");
    const [isTempLoading, setIsTempLoading] = useState(false);

    const fetchTempSeries = useCallback(async (payload) => {
        if (!payload.assetId || !payload.mac_id) {
            setTempError("Incomplete payload for temperature request.");
            return;
        }

        setIsTempLoading(true);
        setTempError("");

        try {
            const response = await getTempData(payload);
            if (response.error) {
                throw new Error("Unable to load temperature data.");
            }

            const data = response?.data?.data?.[0] ?? response?.data?.[0] ?? {};
            const timestamps = data.timestamp || [];
            // Assuming the key is 'temperature' or similar, finding the first array that isn't timestamp or mac_id
            const valueKey = Object.keys(data).find(key =>
                key !== 'timestamp' && key !== 'mac_id' && Array.isArray(data[key])
            ) || 'temperature';

            const values = data[valueKey] || [];

            if (!timestamps.length || !values.length) {
                throw new Error("Temperature API returned no data.");
            }

            // Transform parallel arrays to array of objects for TrendChart
            // TrendChart expects: { timestamp, AxisName: { metric: value } }
            const transformedData = timestamps.map((ts, index) => ({
                timestamp: ts * 1000,
                Temperature: { value: values[index] }
            }));

            setTempSeries(transformedData);
            setTempMeta({
                axes: ["Temperature"],
                signalType: "temperature",
                domain: "time",
                metricKey: "value",
                macId: payload.mac_id,
            });
        } catch (apiError) {
            setTempSeries([]);
            setTempMeta(null);
            setTempError(apiError.message || "Unable to load temperature data.");
        } finally {
            setIsTempLoading(false);
        }
    }, []);

    useEffect(() => {
        const initData = async () => {
            if (isLoadingAssets) return;

            if (!assetId) {
                setTempError("No asset selected.");
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
                    setTempError("Unable to resolve endpoint MAC id for temperature request.");
                    return;
                }

                const payloadMacId =
                    measurementId && baseMacId.endsWith("_")
                        ? `${baseMacId}${measurementId}`
                        : baseMacId;

                const tempPayload = {
                    mac_id: payloadMacId,
                    assetId: assetId,
                    fromDate: null,
                    toDate: null,
                    is_linked: false
                };

                await fetchTempSeries(tempPayload);
            } catch (err) {
                setTempError("Failed to initialize data.");
            }
        };

        initData();
    }, [fetchTempSeries, assetId, isLoadingAssets]);

    return (
        <section className="dashboard-card dashboard-card--compact">
            <div className="dashboard-card__header">
                <div>
                    <p className="dashboard-card__eyebrow">Temperature</p>
                    <h2>Temperature Trend</h2>
                </div>
            </div>

            {isTempLoading && <p>Loading temperature data...</p>}
            {tempError && (
                <p className="form-error" role="alert">
                    {tempError}
                </p>
            )}

            {!isTempLoading && !tempError && (
                <>
                    {tempSeries.length ? (
                        <>
                            <div className="dashboard-page__chart">
                                <TrendChart
                                    entries={tempSeries}
                                    axes={tempMeta?.axes}
                                    metric={tempMeta?.metricKey}
                                />
                            </div>


                        </>
                    ) : (
                        <p>No temperature data available yet.</p>
                    )}
                </>
            )}
        </section>
    );
};

export default TemperatureView;
