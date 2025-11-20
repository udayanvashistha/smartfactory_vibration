import { postProcessorApi } from "../base.api";

export const getAllendpoints = async(payload) => {
    const data = await postProcessorApi('getAllEndPoints/',payload)
    return data;
}
