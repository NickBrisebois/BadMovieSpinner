export interface BadMovie {
    title: string
    link: string
    watched: boolean
    suggestedBy: string
    posterURL: string
}

export interface GetMoviesResponse {
    randomPicks: object
    watchedMovies: object
    sortedMoviesByPerson?: object
}

export interface GetMoviesRequestQueries {
    oneMoviePerPerson?: boolean
}
