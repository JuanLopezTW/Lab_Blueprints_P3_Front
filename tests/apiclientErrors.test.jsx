import { describe, it, expect, beforeEach } from 'vitest'
import { AxiosError } from 'axios'
import api, { apiclient } from '../src/services/apiClient.js'
import { apimock } from '../src/services/apimock.js'

// Se reemplaza el adaptador de Axios para simular respuestas del backend
// (los interceptores sí se ejecutan, igual que con el API real).
const respondWith = (status, data = null) => {
  api.defaults.adapter = async (config) => {
    if (status === 200) return { status, data, config, headers: {}, statusText: 'OK' }
    throw new AxiosError('Request failed', 'ERR_BAD_REQUEST', config, {}, { status, data, config })
  }
}

describe('apiclient: mensajes de error', () => {
  beforeEach(() => localStorage.clear())

  it('getByAuthor con 404 da el mismo mensaje que apimock', async () => {
    respondWith(404, { code: 404, message: 'No blueprints for author: nadie', data: null })
    const real = await apiclient.getByAuthor('nadie').catch((e) => e.message)
    const mock = await apimock.getByAuthor('nadie').catch((e) => e.message)
    expect(real).toBe(mock)
  })

  it('getByAuthorAndName con 404 da el mismo mensaje que apimock', async () => {
    respondWith(404, { code: 404, message: 'not found', data: null })
    const real = await apiclient.getByAuthorAndName('a', 'b').catch((e) => e.message)
    const mock = await apimock.getByAuthorAndName('a', 'b').catch((e) => e.message)
    expect(real).toBe(mock)
  })

  it('401 muestra que hay que iniciar sesión y borra el token', async () => {
    localStorage.setItem('token', 'viejo')
    respondWith(401)
    await expect(apiclient.getByAuthor('john')).rejects.toThrow(/iniciar sesión/)
    expect(localStorage.getItem('token')).toBeNull()
  })

  it('403 muestra que faltan permisos', async () => {
    respondWith(403)
    await expect(apiclient.create({})).rejects.toThrow(/permisos/)
  })

  it('sin respuesta del servidor muestra que no se pudo conectar', async () => {
    api.defaults.adapter = async (config) => {
      throw new AxiosError('Network Error', 'ERR_NETWORK', config)
    }
    await expect(apiclient.getAll()).rejects.toThrow(/No se pudo conectar/)
  })

  it('con respuesta correcta devuelve solo data.data', async () => {
    respondWith(200, { code: 200, message: 'ok', data: [{ author: 'john', name: 'house' }] })
    expect(await apiclient.getByAuthor('john')).toEqual([{ author: 'john', name: 'house' }])
  })
})
