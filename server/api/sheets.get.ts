import { GetMoviesRequestQueries } from '~/shared/types/movie'
import { BadMovieGSheet } from '../external/sheets'
import type { H3Event } from 'h3'

export default defineEventHandler(async (event: H3Event) => {
    console.log('Fetching Google Sheets data...')

    const queries = getQuery(event) as GetMoviesRequestQueries
    const oneMoviePerPerson =
        queries.oneMoviePerPerson !== undefined
            ? queries.oneMoviePerPerson.toUpperCase() == 'TRUE'
            : false

    const gSheetData = new BadMovieGSheet(import.meta.env.VITE_GOOGLE_SHEETS_ID)
    await gSheetData.loadSheetsInfo()

    return await gSheetData.getMovies(oneMoviePerPerson)
})
