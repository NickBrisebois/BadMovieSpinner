import { GoogleSpreadsheet } from 'google-spreadsheet'
import { JWT } from 'google-auth-library'
import { BadMovie, GetMoviesResponse } from '~/shared/types/movie'
import creds from '../../gcpserviceaccountkey.json'

export class BadMovieGSheet {
    private serviceAccountAuth: JWT
    private googleDoc: GoogleSpreadsheet

    constructor(spreadsheetId: string) {
        this.serviceAccountAuth = new JWT({
            email: creds.client_email,
            key: creds.private_key,
            scopes: import.meta.env.VITE_GOOGLE_SCOPES.split(','),
        })

        this.googleDoc = new GoogleSpreadsheet(spreadsheetId, this.serviceAccountAuth)
    }

    async loadSheetsInfo(): Promise<void> {
        await this.googleDoc.loadInfo()
    }

    private async parseMoviesFromRows(rows: any[]): Promise<BadMovie[]> {
        rows = rows.filter((row) => row.get('Title') && row.get('Link'))
        const parsedMoviesPromises = rows.map(async (row) => {
            const tmdbID = this.extractTMDbIdFromURL(row.get('Link') || '')
            if (!tmdbID) {
                console.warn(`Invalid TMDb ID for movie: ${row.get('Title')}`)
                return
            }
            return {
                title: row.get('Title'),
                link: row.get('Link'),
                watched: row.get('Watched') === 'TRUE',
                suggestedBy: row.get('Suggested By'),
                posterURL: (await this.getTMDbPosterURL(tmdbID)) || null,
                description: (await this.getTMDbMovieDetails(tmdbID))?.overview || '',
            } as BadMovie
        })
        return (await Promise.all(parsedMoviesPromises)).filter((movie) => !!movie)
    }

    private sortMoviesBySuggestedBy(movies: BadMovie[]): Map<string, BadMovie[]> {
        const moviesByPerson = new Map<string, BadMovie[]>()
        for (const movie of movies) {
            if (!movie.suggestedBy) continue
            if (!moviesByPerson.has(movie.suggestedBy)) {
                moviesByPerson.set(movie.suggestedBy, [])
            }
            moviesByPerson.get(movie.suggestedBy)!.push(movie)
        }

        return moviesByPerson
    }

    private getMoviePerPerson(moviesByPerson: Map<string, BadMovie[]>): BadMovie[] {
        const randomPicks: BadMovie[] = []
        for (const person of moviesByPerson.keys()) {
            const movies = moviesByPerson.get(person)!.filter((movie) => !movie.watched)
            if (movies && movies.length > 0) {
                const randomMovie = movies[Math.floor(Math.random() * movies.length)]
                randomPicks.push(randomMovie)
            }
        }
        return randomPicks
    }

    async getMovies(oneMoviePerPerson: boolean): Promise<GetMoviesResponse> {
        await this.googleDoc.sheetsByIndex[0].loadHeaderRow(5)
        const rows = await this.googleDoc.sheetsByIndex[0].getRows({
            offset: 5,
        })
        const parsedMovies = await this.parseMoviesFromRows(rows)
        const moviesByPerson = this.sortMoviesBySuggestedBy(parsedMovies)
        const randomPicks = oneMoviePerPerson
            ? this.getMoviePerPerson(moviesByPerson)
            : parsedMovies.filter((movie) => !movie.watched)

        return {
            randomPicks: Object.fromEntries(this.sortMoviesBySuggestedBy(randomPicks)),
            watchedMovies: Object.fromEntries(
                this.sortMoviesBySuggestedBy(parsedMovies.filter((movie) => movie.watched)),
            ),
            sortedMoviesByPerson: Object.fromEntries(moviesByPerson),
        } as GetMoviesResponse
    }

    extractTMDbIdFromURL(tmdbURL: string): string | null {
        return tmdbURL.split('/').pop() || null
    }

    async getTMDbPosterURL(tmdbID: string): Promise<string | null> {
        const response = await fetch(
            `https://api.themoviedb.org/3/movie/${tmdbID}?api_key=${import.meta.env.VITE_TMDB_API_KEY}&language=en-US`,
        )
        if (!response.ok) return null

        const data = await response.json()
        return data.poster_path ? `https://image.tmdb.org/t/p/w500${data.poster_path}` : null
    }

    async getTMDbMovieDetails(tmdbID: string): Promise<null> {
        const response = await fetch(
            `https://api.themoviedb.org/3/movie/${tmdbID}?api_key=${import.meta.env.VITE_TMDB_API_KEY}&language=en-US`,
        )
        if (!response.ok) return null

        return await response.json()
    }
}
