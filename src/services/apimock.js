const db = [
  {
    author: 'JohnConnor',
    name: 'house',
    points: [
      { x: 40, y: 300 },
      { x: 40, y: 160 },
      { x: 120, y: 90 },
      { x: 200, y: 160 },
      { x: 200, y: 300 },
      { x: 40, y: 300 },
    ],
  },
  {
    author: 'JohnConnor',
    name: 'triangle',
    points: [
      { x: 260, y: 300 },
      { x: 360, y: 120 },
      { x: 460, y: 300 },
      { x: 260, y: 300 },
    ],
  },
  {
    author: 'SarahConnor',
    name: 'zigzag',
    points: [
      { x: 30, y: 250 },
      { x: 110, y: 100 },
      { x: 190, y: 250 },
      { x: 270, y: 100 },
      { x: 350, y: 250 },
    ],
  },
]

const clone = (v) => JSON.parse(JSON.stringify(v))
const delay = (value, ms = 150) => new Promise((resolve) => setTimeout(() => resolve(value), ms))

export const apimock = {
  getAll() {
    return delay(clone(db))
  },

  getByAuthor(author) {
    const items = db.filter((bp) => bp.author === author)
    if (!items.length) {
      return Promise.reject(new Error(`No hay blueprints para el autor ${author}`))
    }
    return delay(clone(items))
  },

  getByAuthorAndName(author, name) {
    const bp = db.find((b) => b.author === author && b.name === name)
    if (!bp) {
      return Promise.reject(new Error(`Blueprint ${author}/${name} no encontrado`))
    }
    return delay(clone(bp))
  },

  create(blueprint) {
    if (db.some((b) => b.author === blueprint.author && b.name === blueprint.name)) {
      return Promise.reject(new Error('El blueprint ya existe'))
    }
    db.push(clone(blueprint))
    return delay(clone(blueprint))
  },
}

export default apimock
