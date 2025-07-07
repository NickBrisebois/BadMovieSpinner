export interface BadMovie {
    title: string
    link: string
    watched: boolean
    suggestedBy: string
    posterURL: string
}

export interface GetMoviesResponse {
    unwatchedMovies: BadMovie[]
    watchedMovies: BadMovie[]
    unpickedMovies: BadMovie[]
}
