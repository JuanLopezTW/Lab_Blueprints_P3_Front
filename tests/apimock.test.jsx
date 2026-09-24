import { describe, it, expect } from 'vitest'
import { apimock } from '../src/services/apimock.js'

describe('apimock', () => {
  it('getAll devuelve todos los planos', async () => {
    const all = await apimock.getAll()
    expect(all.length).toBeGreaterThanOrEqual(3)
  })

  it('getByAuthor devuelve solo los planos del autor', async () => {
    const items = await apimock.getByAuthor('JohnConnor')
    expect(items).toHaveLength(2)
    expect(items.every((bp) => bp.author === 'JohnConnor')).toBe(true)
  })

  it('getByAuthor rechaza si el autor no existe (igual que el 404 del API real)', async () => {
    await expect(apimock.getByAuthor('nadie')).rejects.toThrow(/No hay blueprints/)
  })

  it('getByAuthorAndName devuelve el plano con sus puntos', async () => {
    const bp = await apimock.getByAuthorAndName('JohnConnor', 'house')
    expect(bp.name).toBe('house')
    expect(bp.points).toHaveLength(6)
  })

  it('getByAuthorAndName rechaza si el plano no existe', async () => {
    await expect(apimock.getByAuthorAndName('JohnConnor', 'nope')).rejects.toThrow(/no encontrado/)
  })

  it('create agrega el plano y luego se puede consultar', async () => {
    const nuevo = { author: 'TestUser', name: 'cuadro', points: [{ x: 1, y: 1 }] }
    await apimock.create(nuevo)
    const bp = await apimock.getByAuthorAndName('TestUser', 'cuadro')
    expect(bp.points).toEqual([{ x: 1, y: 1 }])
  })

  it('create rechaza si el plano ya existe', async () => {
    const dup = { author: 'TestUser2', name: 'igual', points: [] }
    await apimock.create(dup)
    await expect(apimock.create(dup)).rejects.toThrow(/ya existe/)
  })

  it('devuelve copias: modificar el resultado no altera los datos', async () => {
    const bp = await apimock.getByAuthorAndName('SarahConnor', 'zigzag')
    bp.points.length = 0
    const otra = await apimock.getByAuthorAndName('SarahConnor', 'zigzag')
    expect(otra.points.length).toBeGreaterThan(0)
  })
})
