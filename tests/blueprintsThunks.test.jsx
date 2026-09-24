import { describe, it, expect, vi, beforeEach } from 'vitest'
import { configureStore } from '@reduxjs/toolkit'

// Se reemplaza el servicio para probar los thunks sin red ni .env
vi.mock('../src/services/blueprintsService.js', () => ({
  default: {
    getAll: vi.fn(),
    getByAuthor: vi.fn(),
    getByAuthorAndName: vi.fn(),
    create: vi.fn(),
  },
}))

import service from '../src/services/blueprintsService.js'
import reducer, {
  fetchByAuthor,
  fetchBlueprint,
  createBlueprint,
} from '../src/features/blueprints/blueprintsSlice.js'

const makeStore = () => configureStore({ reducer: { blueprints: reducer } })
const house = { author: 'john', name: 'house', points: [{ x: 0, y: 0 }] }

describe('thunks de blueprints usando blueprintsService', () => {
  beforeEach(() => vi.clearAllMocks())

  it('fetchByAuthor llama al servicio y guarda los planos del autor', async () => {
    service.getByAuthor.mockResolvedValue([house])
    const store = makeStore()

    await store.dispatch(fetchByAuthor('john'))

    expect(service.getByAuthor).toHaveBeenCalledWith('john')
    expect(store.getState().blueprints.byAuthor.john).toEqual([house])
    expect(store.getState().blueprints.searchStatus).toBe('succeeded')
  })

  it('fetchByAuthor guarda el error y vacía la lista si el servicio falla', async () => {
    service.getByAuthor.mockRejectedValue(new Error('No hay blueprints para el autor nadie'))
    const store = makeStore()

    await store.dispatch(fetchByAuthor('nadie'))

    const state = store.getState().blueprints
    expect(state.searchStatus).toBe('failed')
    expect(state.searchError).toMatch(/No hay blueprints/)
    expect(state.byAuthor.nadie).toEqual([])
  })

  it('fetchBlueprint guarda el plano actual', async () => {
    service.getByAuthorAndName.mockResolvedValue(house)
    const store = makeStore()

    await store.dispatch(fetchBlueprint({ author: 'john', name: 'house' }))

    expect(service.getByAuthorAndName).toHaveBeenCalledWith('john', 'house')
    expect(store.getState().blueprints.current).toEqual(house)
  })

  it('createBlueprint llama a create y lo agrega a la lista del autor', async () => {
    const garage = { author: 'john', name: 'garage', points: [] }
    service.getByAuthor.mockResolvedValue([house])
    service.create.mockResolvedValue(garage)
    const store = makeStore()

    await store.dispatch(fetchByAuthor('john'))
    await store.dispatch(createBlueprint(garage))

    expect(service.create).toHaveBeenCalledWith(garage)
    expect(store.getState().blueprints.byAuthor.john).toEqual([house, garage])
  })
})
