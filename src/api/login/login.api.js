import { getApi, postApi } from "../base.api";

export const Login =async(payload) => {
  const data = await postApi('users/login',payload);
  return data;
} 


export const getUserDetails = async(id) => {
  const data = await postApi('users/get_user_details',id)
  return data
}