import { describe, it, expect, vi, afterEach } from 'vitest'

afterEach(() => {
  vi.unstubAllEnvs()
  vi.resetModules()
})

describe('blueprintsService', () => {
  it('usa apimock cuando VITE_USE_MOCK=true', async () => {
    vi.stubEnv('VITE_USE_MOCK', 'true')
    const { default: service } = await import('../src/services/blueprintsService.js')
    const { apimock } = await import('../src/services/apimock.js')
    expect(service).toBe(apimock)
  })

  it('usa apiclient cuando VITE_USE_MOCK=false', async () => {
    vi.stubEnv('VITE_USE_MOCK', 'false')
    const { default: service } = await import('../src/services/blueprintsService.js')
    const { apiclient } = await import('../src/services/apiClient.js')
    expect(service).toBe(apiclient)
  })

  it('apimock y apiclient exponen la misma interfaz', async () => {
    const { apimock } = await import('../src/services/apimock.js')
    const { apiclient } = await import('../src/services/apiClient.js')
    const metodos = ['getAll', 'getByAuthor', 'getByAuthorAndName', 'create']
    for (const m of metodos) {
      expect(typeof apimock[m]).toBe('function')
      expect(typeof apiclient[m]).toBe('function')
    }
  })
})
