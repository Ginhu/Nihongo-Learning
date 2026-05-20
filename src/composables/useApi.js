import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
  timeout: 10000,
})

if (!import.meta.env.VITE_API_URL) {
  console.warn('[api] VITE_API_URL is not set — requests will use relative URLs')
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    try {
      if (error.response?.status === 401) {
        const { default: router } = await import('@/router')
        if (router.currentRoute.value.path !== '/login') {
          router.push('/login')
        }
      }
    } catch (interceptorError) {
      return Promise.reject(interceptorError)
    }
    return Promise.reject(error)
  }
)

export default api
