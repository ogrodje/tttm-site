<script setup lang="ts">
import {type Ref, ref, onUnmounted, computed} from 'vue';
import type {MatchCompletedMessage, Message, MessageType} from "./Message.ts";
import {type PlayerServer, PlayerServerService} from "./PlayerServer.ts";

const PUBLIC_TTTM_WS_URL: string = `${import.meta.env.PUBLIC_TTTM_WS_URL}`;

interface MatchSettings {
  size: number,
  numberOfGames: number,
  serverAUrl: string,
  serverAID?: string,
  serverBUrl: string,
  serverBID?: string,
}

const defaultMatchSettings: MatchSettings = {
  size: 3,
  numberOfGames: 10,
  serverAUrl: "https://tttm-maxi.matjaz.workers.dev",
  serverBUrl: "https://tttm-tic-tac-toe.pzagor2.workers.dev"
} as MatchSettings;

function matchSettingsValidate(settings: MatchSettings): MatchSettings {
  const {numberOfGames, serverAUrl, serverBUrl} = settings
  if (numberOfGames > 50 || numberOfGames < 1) {
    throw new Error("Number must be between 1 and 50")
  }

  if (serverAUrl == "" || !serverAUrl || !serverAUrl.startsWith("http")) {
    throw new Error("Server A URL is missing")
  }

  if (serverBUrl == "" || !serverBUrl || !serverBUrl.startsWith("http")) {
    throw new Error("Server B URL is missing")
  }

  return settings
}

const matchSettingsToUrl = ({size, numberOfGames, serverAUrl, serverBUrl}: MatchSettings) => {
  const base = new URL(PUBLIC_TTTM_WS_URL);
  base.searchParams.append("number-of-games", numberOfGames.toString())
  base.searchParams.append("server-a", serverAUrl)
  base.searchParams.append("server-b", serverBUrl)
  base.searchParams.append("size", size.toString())

  return base.href
}

// State
const matchSettings: Ref<MatchSettings> = ref<MatchSettings>(defaultMatchSettings)
let websocket: WebSocket | undefined = null;
const messages = ref<Message[]>([]);

// Websockets
const canStart: () => boolean = () => !websocket;
const wsOpen = () => {
}

const wsOnMessage = (event) => {
  const message: any = JSON.parse(event.data) || {};
  if (message !== {}) messages.value = [message, ...messages.value];
}

const wsOnError = (error) => {
  console.error('WebSocket encountered an error:', error);
}

// Match start
const startMatch = () => {
  const settings = matchSettingsValidate(matchSettings.value);
  const wsUrl = matchSettingsToUrl(settings);
  if (!canStart()) return;

  messages.value = [];
  websocket = new WebSocket(wsUrl);
  websocket.onopen = wsOpen;
  websocket.onmessage = wsOnMessage;
  websocket.onerror = wsOnError;
  websocket.onclose = () => {
    websocket = null;
  }
}

onUnmounted(() => {
  if (websocket) websocket.close();
})

const result = computed<MatchCompletedMessage | undefined>(() => {
  return messages.value.find((message): message is MatchCompletedMessage => message.type == 'match_completed');
})

const playerServers = ref<PlayerServer[]>([])
PlayerServerService.getPlayerServers
    .then(servers => {
      playerServers.value = servers
      matchSettings.value.serverAID = servers
          .find(({repository_url}) => repository_url == defaultMatchSettings.serverAUrl)?.name

      matchSettings.value.serverBID = servers
          .find(({repository_url}) => repository_url == defaultMatchSettings.serverBUrl)?.name

    });

const possiblePlayerServers = computed(() => {
  return playerServers.value.filter(({sizes}) => {
    let n = parseInt(matchSettings.value.size + "", 10)
    return [...sizes].includes(n)
  })
})

const serverDDChange = () => {
  matchSettings.value.serverAUrl = possiblePlayerServers.value.find(({name}) =>
      name == matchSettings.value.serverAID
  )?.endpoint_url

  matchSettings.value.serverBUrl = possiblePlayerServers.value.find(({name}) =>
      name == matchSettings.value.serverBID
  )?.endpoint_url
}

</script>
<template>
  <div>
    <form @submit.prevent="startMatch()">
      <div class="form-group bottom-offset">
        <label for="size">Size of the game grid</label>
        <select id="size" name="size" v-model="matchSettings.size">
          <option value="3">3x3</option>
          <option value="5">5x5</option>
          <option value="7">7x7</option>
        </select>
      </div>

      <div class="form-group">
        <label for="server-a-dd">Player <span class="server-name">Server A</span></label>
        <select name="server-a-dd"
                v-model="matchSettings.serverAID"
                @change="serverDDChange">
          <option v-for="({name, author}) in possiblePlayerServers" :value="name">
            {{ name }} by {{ author }}
          </option>
        </select>
      </div>

      <div class="form-group bottom-offset">
        <label for="server-a"><i>or</i> Player <span class="server-name">Server A</span> URL</label>
        <input type="url" name="server-a" id="server-a"
               v-model="matchSettings.serverAUrl"/>
      </div>

      <div class="form-group">
        <label for="server-b-dd">Player <span class="server-name">Server B</span></label>
        <select name="server-b-dd"
                v-model="matchSettings.serverBID"
                @change="serverDDChange">
          <option v-for="({name, author}) in possiblePlayerServers" :value="name">
            {{ name }} by {{ author }}
          </option>
        </select>
      </div>

      <div class="form-group bottom-offset">
        <label for="server-b"><i>or</i> Player <span class="server-name">Server B</span> URL</label>
        <input type="url" name="server-b" id="server-b"
               v-model="matchSettings.serverBUrl"/>
      </div>
      <div class="form-group">
        <label for="number-of-games">Number of games</label>
        <input type="number"
               name="number-of-games"
               id="number-of-games"
               v-model.number="matchSettings.numberOfGames"
               min="1"
               step="1"
               max="50"/>
      </div>

      <div class="form-group">
        <button>Play!</button>
      </div>
    </form>

    <div v-if="result !== undefined" class="match-result">
      <p class="title">Match result</p>
      <table>
        <thead>
        <tr>
          <th>Player</th>
          <th>Played</th>
          <th>Won</th>
          <th>Lost</th>
          <th>Tie</th>
          <th>Crashed</th>
          <th>R. med. [ms]</th>
          <th>R. avg. [ms]</th>
          <th>R. min [ms]</th>
          <th>R. max [ms]</th>
          <th>R. p99 [ms]</th>
        </tr>
        </thead>
        <tbody>
        <tr>
          <td>{{ result.matchResult.player_x_id }}</td>
          <td>{{ result.matchResult.player_x_result.played }}</td>
          <td>{{ result.matchResult.player_x_result.won }}</td>
          <td>{{ result.matchResult.player_x_result.lost }}</td>
          <td>{{ result.matchResult.player_x_result.tie }}</td>
          <td>{{ result.matchResult.player_x_result.crashed }}</td>
          <td>{{ result.matchResult.player_x_result.response_median_ms }}</td>
          <td>{{ result.matchResult.player_x_result.response_average_ms }}</td>
          <td>{{ result.matchResult.player_x_result.response_min_ms }}</td>
          <td>{{ result.matchResult.player_x_result.response_max_ms }}</td>
          <td>{{ result.matchResult.player_x_result.response_p99_ms }}</td>
        </tr>
        <tr>
          <td>{{ result.matchResult.player_o_id }}</td>
          <td>{{ result.matchResult.player_o_result.played }}</td>
          <td>{{ result.matchResult.player_o_result.won }}</td>
          <td>{{ result.matchResult.player_o_result.lost }}</td>
          <td>{{ result.matchResult.player_o_result.tie }}</td>
          <td>{{ result.matchResult.player_o_result.crashed }}</td>
          <td>{{ result.matchResult.player_o_result.response_median_ms }}</td>
          <td>{{ result.matchResult.player_o_result.response_average_ms }}</td>
          <td>{{ result.matchResult.player_o_result.response_min_ms }}</td>
          <td>{{ result.matchResult.player_o_result.response_max_ms }}</td>
          <td>{{ result.matchResult.player_o_result.response_p99_ms }}</td>
        </tr>
        </tbody>
      </table>
    </div>

    <div class="messages-wrap" v-if="messages.length != 0">
      <p class="title">Real-time exchange</p>
      <div class="message" v-for="message in messages">{{ message.message }}</div>
    </div>
  </div>
</template>
<style lang="scss" scoped>
form {
  display: block;
  margin-bottom: 20px;
}

form .form-group.offset-left {
}

form .form-group.size-group {
  display: block;
  clear: both;
  float: none;
  border: 1px solid pink;

  .control-group {
    border: 1px solid red;
    width: 20%;
    height: 30px;
    line-height: 30px;

    label, input {
      margin: 0;
      padding: 0;
      list-style: none;
    }
  }
}

form .form-group.bottom-offset {
  margin-bottom: 20px;
}


.match-result, .messages-wrap {
  margin-bottom: 20px;

  p.title {
    font-weight: bold;
    border-left: 5px solid #ff6500;
    padding-left: 10px;
  }
}

.match-result {

}

.messages-wrap {
  .message {
    border-bottom: 1px solid #333;
    padding: 3px;

    &:last-child {
      border: none;
    }
  }
}

.server-name {
  background-color: #ff6500;
  color: white;
  font-weight: 700;
}

</style>