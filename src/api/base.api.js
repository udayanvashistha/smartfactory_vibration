// export const BASE_URL = 'http://localhost:3004/api/';
export const BASE_URL = `https://app.presageinsights.ai/cmms_api/api/`
export const PROCESSOR_BASE_URL = `https://processor.presageinsights.ai/api/`
export const ASSETS_BASE_URL = `https://processor.presageinsights.ai/api/`

const getToken = () => localStorage.getItem('id')
const getUserId = () => localStorage.getItem('userId')

const buildHeaders = (token, userId) => ({
  'Content-Type': 'application/json',
  ...(token && { Authorization: token }),
  ...(userId && { 'x-user-id': userId }),
})

const handleResponse = async (res) => {
  if (!res.ok) {
    let data
    try {
      data = await res.json()
    } catch {
      data = await res.text()
    }
    return { error: true, status: res.status, data }
  }
  return { error: false, data: await res.json() }
}

const request = async (path, options = {}, base = BASE_URL) => {
  const token = getToken()
  const userId = getUserId()
  const res = await fetch(`${base}${path}`, {
    ...options,
    headers: {
      ...buildHeaders(token, userId),
      ...options.headers,
    },
  })
  return handleResponse(res)
}

// -- GENERIC HELPERS --------------------------------------------------------

export const getApi = (path, base = BASE_URL) =>
  request(
    path,
    {
      method: 'GET',
    },
    base
  )

export const postApi = (path, body, base = BASE_URL) =>
  request(
    path,
    {
      method: 'POST',
      body: JSON.stringify(body),
    },
    base
  )

export const patchApi = (path, body, base = BASE_URL) =>
  request(
    path,
    {
      method: 'PATCH',
      body: JSON.stringify(body),
    },
    base
  )

export const putApi = (path, body, base = BASE_URL) =>
  request(
    path,
    {
      method: 'PUT',
      body: JSON.stringify(body),
    },
    base
  )

export const deleteApi = (path, base = BASE_URL) =>
  request(
    path,
    {
      method: 'DELETE',
    },
    base
  )

export const uploadFile = async (path, file, fields = {}, base = BASE_URL) => {
  const token = getToken()
  const userId = getUserId()
  const url = `${base}${path}`
  const formData = new FormData()

  formData.append('pdf', file)
  Object.entries(fields).forEach(([key, value]) => {
    formData.append(key, value)
  })

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      ...(token && { Authorization: token }),
      ...(userId && { 'x-user-id': userId }),
    },
    body: formData,
  })

  return handleResponse(res)
}

// -- PROCESSOR HELPERS ------------------------------------------------------

export const getProcessorApi = (path) => getApi(path, PROCESSOR_BASE_URL)
export const postProcessorApi = (path, body) =>
  postApi(path, body, PROCESSOR_BASE_URL)
export const patchProcessorApi = (path, body) =>
  patchApi(path, body, PROCESSOR_BASE_URL)
export const putProcessorApi = (path, body) =>
  putApi(path, body, PROCESSOR_BASE_URL)
export const deleteProcessorApi = (path) =>
  deleteApi(path, PROCESSOR_BASE_URL)
export const uploadFileToProcessor = (path, file, fields = {}) =>
  uploadFile(path, file, fields, PROCESSOR_BASE_URL)

export const postAssetsApi = (path, body) =>
  postApi(path, body, ASSETS_BASE_URL)
