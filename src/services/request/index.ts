import un, { type UnConfig } from '@uni-helper/uni-network'
import { getHttpUrl, showToast } from '@/utils'
import { Loading } from './loading'

export * from './helper'

/**
 * @see 文档：https://uni-network.netlify.app/
 */
export const instance = un.create({
  // TODO h5 需要添加代理，根据业务需求自行判断环境后处理
  baseUrl: getHttpUrl(),
  /**
   * TODO 由于小程序兼容性问题，统一请求方式 POST，根据业务需求在请求中传递 config 修改
   * 例如：request('', {}, {
   *     method: 'GET',
   *   })
   */
  method: 'POST',
  headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' },
  data: {},
  // 默认展示全局 loading
  loading: true,
})
const loading = new Loading()

// 请求拦截器
instance.interceptors.request.use((config) => {
  loading.show(config.loading);
  (config.headers || {}).Authorization = `Bearer eyJhbGciOiJSUzI1NiIsImtpZCI6Ikg4Y2NyZHE4aGdUaHp1S3V0elM4cEEiLCJ0eXAiOiJhdCtqd3QifQ.eyJuYmYiOjE3NTMyNzA2ODIsImV4cCI6MTc4NDgwNjY4MiwiaXNzIjoiaHR0cDovLzE3Mi4xNi4wLjIwNDozMDEwIiwiYXVkIjpbIkJhY2tlbmRBZG1pbkFwcEdhdGV3YXkiLCJDYWxsQ2VudGVyU2VydmljZSIsIkNoYXJnZVNlcnZpY2UiLCJDb2NrcGl0U2VydmljZSIsIkRhdGFEZWxpdmVyeVN5c3RlbVNlcnZpY2UiLCJEYXRhUmVwb3J0U2VydmVyIiwiRE1BU2VydmljZSIsIkVxdWlwbWVudFNlcnZpY2UiLCJGaWxlU2VydmljZSIsIkdhdGhlciIsIkdJU1NlcnZpY2UiLCJJZGVudGl0eVNlcnZpY2UiLCJJbnRlcm5hbEdhdGV3YXkiLCJNYXRlcmlhbEFQSSIsIk1lc3NhZ2VTZXJ2aWNlIiwiT0FTZXJ2aWNlIiwiUGxhdGZvcm1TZXJ2aWNlIiwiUmVwb3J0U2VydmljZSIsIldlQ2hhdFNlcnZpY2UiLCJXb3JrZmxvd1NlcnZpY2UiXSwiY2xpZW50X2lkIjoicGxhdGZvcm0tdnVlIiwic3ViIjoiM2EwODY2OGMtMGRiNy1mZGRhLTE5M2QtZGNiNGNlZGZlNmQwIiwiYXV0aF90aW1lIjoxNzUzMjcwNjgyLCJpZHAiOiJsb2NhbCIsInJvbGUiOlsiSW5zcGVjdGlvbiIsIkludGVybmV0IiwidmlkZW9qaWFueGluZyIsInZpZGVvZG9uZ2JhIl0sIm9yZ2FuaXplQ29kZSI6IjAwMjAwNSIsIm9yZ2FuaXplSWQiOiIzYTA2OGVmOC05MjJjLWIyOTEtM2M0Ny1mMzM3ZjMzYzVlZTkiLCJhcmVhQ29kZSI6IjQ1MTMwMiIsImNvbmN1cnJlbnRMb2dpbiI6IjJkNmEwMWNhZmExYzQxNTY5ZWMyYjgyZjdmMTI4ZjdkIiwicHJlZmVycmVkX3VzZXJuYW1lIjoicHVqaW5naHVhbiIsIm5hbWUiOiJwdWppbmdodWFuIiwiZW1haWwiOiIxNjcyMTU3ODAzMTAyQHRlc3QuY29tIiwiZW1haWxfdmVyaWZpZWQiOmZhbHNlLCJwaG9uZV9udW1iZXIiOiIxNTI4MTcxNjMwNyIsInBob25lX251bWJlcl92ZXJpZmllZCI6ZmFsc2UsInNjb3BlIjpbImFkZHJlc3MiLCJlbWFpbCIsIm9wZW5pZCIsInBob25lIiwicHJvZmlsZSIsInJvbGUiLCJCYWNrZW5kQWRtaW5BcHBHYXRld2F5IiwiQ2FsbENlbnRlclNlcnZpY2UiLCJDaGFyZ2VTZXJ2aWNlIiwiQ29ja3BpdFNlcnZpY2UiLCJEYXRhRGVsaXZlcnlTeXN0ZW1TZXJ2aWNlIiwiRGF0YVJlcG9ydFNlcnZlciIsIkRNQVNlcnZpY2UiLCJFcXVpcG1lbnRTZXJ2aWNlIiwiRmlsZVNlcnZpY2UiLCJHYXRoZXIiLCJHSVNTZXJ2aWNlIiwiSWRlbnRpdHlTZXJ2aWNlIiwiSW50ZXJuYWxHYXRld2F5IiwiTWF0ZXJpYWxBUEkiLCJNZXNzYWdlU2VydmljZSIsIk9BU2VydmljZSIsIlBsYXRmb3JtU2VydmljZSIsIlJlcG9ydFNlcnZpY2UiLCJXZUNoYXRTZXJ2aWNlIiwiV29ya2Zsb3dTZXJ2aWNlIl0sImFtciI6WyJwd2QiXX0.TUizg01-b9_QjjH0idjaSCHuqxo01pzF5Ceoh5dyrAqR6VmXSFzAzHpU0fByqmE-ZXNkOSSI1AQZ83q3wk1cmdnNYkkLz2Gz4W3VBBNPPSTgit-kjhSfu0npD84v2l12Fcnty-kQDwRdX1na2jQ6B4ZM70iuK7wOLN_K2HCxG9fQBS7nVtW_GVAuAgsbP3XkvUMTBbWHYPWrOboYBjw-OzA8cVxM_6Pr1-J9P9qONzt2gxzAboy34d4IALtmLdb81oHasFBvtp36thHdSuKDRSIAibb_sp7oCk8xZkSbrXKJ7glB4r3ZVbm6_KoV-70PGoWTDmjugE2le-NY8BgV2w`
  return config
})

instance.interceptors.response.use((response: any) => {
  const { errno } = response
  if (errno) {
    showToast({
      title: '服务器出错，请稍后再试。',
    })
    loading.hide(true)
    return Promise.reject(response)
  }
  loading.hide(response.config.loading)
  return response.data
  // TODO 返回数据根据业务需求修改
  /* const { code, data, msg } = response.data
  if (code === 1)
    return data

  showToast({
    title: msg,
  })
  handleError(response)
  return Promise.reject(response.data) */
}, (error) => {
  loading.hide(error.config.loading)
  return Promise.reject(error)
})

type RequestData = Record<string, any>

/**
 * 预设的请求数据类型和响应数据类型
 * 泛型内数据类型：<响应数据类型, 请求数据类型>，可不传，默认为 <Record<string, any>, Record<string, any>>
 */
export async function request<T, D = RequestData>(
  url: string,
  data?: D,
  config?: UnConfig<T, D>,
) {
  return instance.request<T, D, T>({ url, data, ...config })
}

export function upload<T, D = RequestData>(
  url: string,
  data?: D,
  config?: UnConfig<T, D>,
) {
  return instance.upload({
    url,
    data,
    ...config,
  })
}
