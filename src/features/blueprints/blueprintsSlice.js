import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import blueprintsService from '../../services/blueprintsService.js'

export const fetchAuthors = createAsyncThunk('blueprints/fetchAuthors', async () => {
  const data = await blueprintsService.getAll()
  // Expecting API returns array of {author, name, points}
  const authors = [...new Set(data.map((bp) => bp.author))]
  return authors
})

export const fetchByAuthor = createAsyncThunk('blueprints/fetchByAuthor', async (author) => {
  const items = await blueprintsService.getByAuthor(author)
  return { author, items }
})

export const fetchBlueprint = createAsyncThunk(
  'blueprints/fetchBlueprint',
  async ({ author, name }) => {
    return blueprintsService.getByAuthorAndName(author, name)
  },
)

export const createBlueprint = createAsyncThunk('blueprints/createBlueprint', async (payload) => {
  return blueprintsService.create(payload)
})

const slice = createSlice({
  name: 'blueprints',
  initialState: {
    authors: [],
    byAuthor: {},
    current: null,
    status: 'idle',
    error: null,
    searchStatus: 'idle',
    searchError: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAuthors.pending, (s) => {
        s.status = 'loading'
      })
      .addCase(fetchAuthors.fulfilled, (s, a) => {
        s.status = 'succeeded'
        s.authors = a.payload
      })
      .addCase(fetchAuthors.rejected, (s, a) => {
        s.status = 'failed'
        s.error = a.error.message
      })
      .addCase(fetchByAuthor.pending, (s) => {
        s.searchStatus = 'loading'
        s.searchError = null
      })
      .addCase(fetchByAuthor.fulfilled, (s, a) => {
        s.searchStatus = 'succeeded'
        s.byAuthor[a.payload.author] = a.payload.items
      })
      .addCase(fetchByAuthor.rejected, (s, a) => {
        s.searchStatus = 'failed'
        s.searchError = a.error.message
        s.byAuthor[a.meta.arg] = []
      })
      .addCase(fetchBlueprint.fulfilled, (s, a) => {
        s.current = a.payload
      })
      .addCase(createBlueprint.fulfilled, (s, a) => {
        const bp = a.payload
        if (s.byAuthor[bp.author]) s.byAuthor[bp.author].push(bp)
      })
  },
})

export default slice.reducer
