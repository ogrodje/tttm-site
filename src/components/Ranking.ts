const PUBLIC_TTTM_URL: string = `${import.meta.env.PUBLIC_TTTM_URL}`;

export type TournamentID = string
export type CreatedAT = string
export type Rank = number
export type Score = number
export type ScoreRow = [TournamentID, CreatedAT, Rank, Score]

export interface Ranking {
    readonly player_server_id: string,
    readonly rank: Rank,
    readonly player: {
        readonly name: string,
        readonly author: string,
        readonly author_url: string,
        readonly endpoint_url: string,
        readonly repository_url?: string,
        readonly sizes: number[],
        readonly tags: string[],
    },
    readonly scores: ScoreRow[]
}

export class RankingEndpoint {
    static getRankings = (size: number) =>
        fetch(`${PUBLIC_TTTM_URL}/ranking/full-size-${size}`)
            .then(response => response.json() as Promise<Ranking[]>)
}