export type MessageType = "match_completed" | "game_message" | "greet";

interface BaseMessage {
    type: MessageType
    message: string
}

export interface GreetMessage extends BaseMessage {
    server_a_url: string,
    server_b_url: string,
    size: number,
    number_of_games: string
}

export interface GameMessage extends BaseMessage {
    details: {
        type: "info" | "error" | "debug",
        message: string,
        gid: string
    }
}

export type PlayerResult = {
    played: number,
    won: number,
    lost: number,
    tie: number,
    crashed: number,
    response_average_ms: number,
    response_median_ms: number,
    response_p99_ms: number,
    response_min_ms: number,
    response_max_ms: number

}

export interface MatchCompletedMessage extends BaseMessage {
    matchResult: {
        player_x_id: string,
        player_x_result: PlayerResult,
        player_o_id: string,
        player_o_result: PlayerResult
    }
}

export type Message = GreetMessage | GameMessage | MatchCompletedMessage;