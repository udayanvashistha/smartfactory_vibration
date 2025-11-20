import { postApi } from "../base.api";

export const getLocations = async(payload)  => {
   const data = await postApi('location_master/getKPIFilterLocations/',payload)
   return data;
}

//https://app.presageinsights.ai/cmms_api/api/location_master/getChildAssetsAgainstLocation/

export const getAssets = async(payload) => {
    const data = await postApi('location_master/getChildAssetsAgainstLocation/',payload)
    return data
}


//getAllEndPoints/
export const getAllendpoints = async(payload) => {
    const data = await postApi('getAllEndPoints/',payload)
    return data;
}