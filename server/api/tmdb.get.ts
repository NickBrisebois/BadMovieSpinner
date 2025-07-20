export default defineEventHandler(async (event) => {
    console.log('Getting movie details from TMDB...')

    const queries = getQuery(event) as GetTMDBDetailsRequestQueries

    console.log(queries)
})
