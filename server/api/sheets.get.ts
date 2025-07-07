import { BadMovieGSheet } from '../external/sheets'

export default defineEventHandler(async (event: any) => {
    console.log('Fetching Google Sheets data...')

    const gSheetData = new BadMovieGSheet(import.meta.env.VITE_GOOGLE_SHEETS_ID)
    await gSheetData.loadSheetsInfo()

    return await gSheetData.getMovies()
})
