import { postApi, postProcessorApi } from "../base.api";

export const getVelocityData = async (payload) => {
  const response = await postProcessorApi("get_velocity_data/", payload);
  return response;
};

export const getAccelerationData = async (payload) => {
  const response = await postProcessorApi('get_acceleration_data/', payload);
  return response
}

export const getTrendData = async (payload) => {
  const response = await postProcessorApi('get_function_trend_data/', payload);
  return response;
}
//https://processor.presageinsights.ai/api/get_temp/
export const getTempData = async (payload) => {
  const response = await postProcessorApi('get_temp/', payload);
  return response;
}

//https://processor.presageinsights.ai/api/get_asset_card_kpi/
export const getAssetsCardkpi = async (payload) => {
  const data = await postProcessorApi('get_asset_card_kpi/', payload);
  return data
}

//https://app.presageinsights.ai/cmms_api/api/assets-reports/getLatestReport

export const getLatestReport = async (payload) => {
  const response = await postApi('assets-reports/getLatestReport/', payload);
  return response;
}

//https://processor.presageinsights.ai/api/single_asset_health_history/
export const getHealthHistory = async (payload) => {
  const response = await postProcessorApi('single_asset_health_history/', payload);
  return response;
}