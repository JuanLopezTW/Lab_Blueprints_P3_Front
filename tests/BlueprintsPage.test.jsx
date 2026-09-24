import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Provider } from 'react-redux'
import { configureStore, createSlice } from '@reduxjs/toolkit'
import BlueprintsPage from '../src/pages/BlueprintsPage.jsx'

// Mock de thunks del slice para no requerir backend
vi.mock('../src/features/blueprints/blueprintsSlice.js', () => ({
  fetchAuthors: () => ({ type: 'blueprints/fetchAuthors' }),
  fetchByAuthor: (author) => ({ type: 'blueprints/fetchByAuthor', payload: author }),
  fetchBlueprint: (payload) => ({ type: 'blueprints/fetchBlueprint', payload }),
}))

function makeStore(preloaded) {
  const slice = createSlice({
    name: 'blueprints',
    initialState: {
      authors: [],
      byAuthor: {},
      current: null,
      status: 'idle',
      error: null,
      ...preloaded,
    },
    reducers: {},
  })
  return configureStore({ reducer: { blueprints: slice.reducer } })
}

describe('BlueprintsPage', () => {
  it('despacha fetchByAuthor al hacer click en Get blueprints', () => {
    const store = makeStore()
    const spy = vi.spyOn(store, 'dispatch')
    render(
      <Provider store={store}>
        <BlueprintsPage />
      </Provider>,
    )

    fireEvent.change(screen.getByPlaceholderText(/Autor/i), { target: { value: 'JohnConnor' } })
    fireEvent.click(screen.getByText(/Buscar planos/i))

    expect(spy).toHaveBeenCalledWith({ type: 'blueprints/fetchByAuthor', payload: 'JohnConnor' })
  })

  const renderPage = (preloaded) =>
    render(
      <Provider store={makeStore(preloaded)}>
        <BlueprintsPage />
      </Provider>,
    )

  it('muestra Cargando... mientras se busca el autor', () => {
    renderPage({ searchStatus: 'loading' })
    expect(screen.getByText(/Cargando/i)).toBeInTheDocument()
  })

  it('muestra el mensaje de error cuando la búsqueda falla', () => {
    renderPage({ searchStatus: 'failed', searchError: 'No hay blueprints para el autor nadie' })
    expect(screen.getByRole('alert')).toHaveTextContent(/No hay blueprints/)
  })

  it('muestra la tabla con nombre y número de puntos cuando hay resultados', () => {
    renderPage({
      searchStatus: 'succeeded',
      byAuthor: { john: [{ author: 'john', name: 'house', points: [{}, {}, {}, {}] }] },
    })
    fireEvent.change(screen.getByPlaceholderText(/Autor/i), { target: { value: 'john' } })
    fireEvent.click(screen.getByText(/Buscar planos/i))

    expect(screen.getByText('house')).toBeInTheDocument()
    expect(screen.getByText('4')).toBeInTheDocument()
    expect(screen.getByText(/Total de puntos: 4/i)).toBeInTheDocument()
  })
})
