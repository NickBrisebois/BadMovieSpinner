export interface BadMovie {
    title: string
    link: string
    watched: boolean
    suggestedBy: string
    posterURL: string
}

export interface GetMoviesResponse {
    randomPicks: BadMovie[]
    watchedMovies: BadMovie[]
    sortedMoviesByPerson?: Map<string, BadMovie[]>
}
