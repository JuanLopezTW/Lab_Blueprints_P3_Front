import { apiclient } from './apiClient.js'
import { apimock } from './apimock.js'

const blueprintsService = import.meta.env.VITE_USE_MOCK === 'true' ? apimock : apiclient

export default blueprintsService
