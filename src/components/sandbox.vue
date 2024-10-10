<script setup lang="ts">
import {type Ref, ref, onMounted, onUnmounted, computed} from 'vue';
import type {MatchCompletedMessage, Message, MessageType} from "./Message.ts";

const PUBLIC_TTTM_WS_URL: string = `${import.meta.env.PUBLIC_TTTM_WS_URL}`;

interface MatchSettings {
  numberOfGames: number,
  serverAUrl: string,
  serverBUrl: string,
}

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

const matchSettingsToUrl = ({numberOfGames, serverAUrl, serverBUrl}: MatchSettings) => {
  const base = new URL(PUBLIC_TTTM_WS_URL);
  base.searchParams.append("number-of-games", numberOfGames.toString())
  base.searchParams.append("server-a", serverAUrl)
  base.searchParams.append("server-b", serverBUrl)
  return base.href
}

const defaultServerAUrl: string = "http://tttm-randy.ogrodje.si"
const defaultServerBUrl: string = "https://tttm-maxi.matjaz.workers.dev"

const matchSettings: Ref<MatchSettings> = ref<MatchSettings>({
  numberOfGames: 10,
  serverAUrl: defaultServerAUrl,
  serverBUrl: defaultServerBUrl
})

let websocket: WebSocket | undefined = null;

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

const messages = ref<Message[]>([]);

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

onMounted(() => {
});

onUnmounted(() => {
  if (websocket) websocket.close();
})

const result = computed<MatchCompletedMessage | undefined>(() => {
  return messages.value.find((message): message is MatchCompletedMessage => message.type == 'match_completed');
})

</script>
<template>
  <div>
    <form @submit.prevent="startMatch()">
      <div class="form-group">
        <label for="server-a">Player Server A URL</label>
        <input type="url" name="server-a" id="server-a"
               v-model="matchSettings.serverAUrl"/>
      </div>
      <div class="form-group">
        <label for="server-b">Player Server B URL</label>
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
      <div class="message" v-for="message in messages">
        {{ message.type }} - {{ message.message }}
      </div>
    </div>
  </div>
</template>
<style lang="scss" scoped>
form {
  display: block;
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
</style>