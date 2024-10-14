export interface PlayerServer {
    name: string
    author: string
    author_url: string
    repository_url?: string
    endpoint_url: string,
    sizes: Set<number>
    tags: Set<number>
}

export class PlayerServerService {
    static getPlayerServers =
        fetch("https://tttm.tttm.dev/players")
            .then(response => response.json())
            .then(json => json['players'] as PlayerServer[])
}