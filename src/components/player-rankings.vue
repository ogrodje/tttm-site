<script setup lang="ts">
import {type Ranking, RankingEndpoint} from "./Ranking.ts";
import {defineProps, ref} from 'vue';

const props = defineProps(['size'])
const sizeToName = n => `${n}x${n}`

const rawRankings = await RankingEndpoint.getRankings(props.size);
const rankings = ref<Ranking[]>(rawRankings)

const lastScoring = (ranking: Ranking) => ranking.scores[ranking.scores.length - 1];
const lastTournament = (ranking: Ranking) => lastScoring(ranking)?.[0]
const lastRank = (ranking: Ranking) => lastScoring(ranking)?.[2]
const lastScore = (ranking: Ranking) => lastScoring(ranking)?.[3]
const lastScoreDate = (ranking: Ranking) => lastScoring(ranking)?.[1]

</script>
<template>
  <h1>{{ sizeToName(props.size) }}</h1>

  <div class="rankings">
    <div v-for="(r, n) in rankings" class="ranking">
      <div class="rank" v-if="n == 0">🥇</div>
      <div class="rank" v-else-if="n == 1">🥈</div>
      <div class="rank" v-else-if="n == 2">🥉</div>
      <div class="rank" v-else>{{ r.rank }}</div>

      <div class="details">
        <div class="player_server_id">{{ r.player_server_id }}</div>
        <div class="author"><a
            target="_blank"
            v-bind:href=r.player.author_url
        >{{ r.player.author }}</a></div>
        <div class="author_url" v-if="r.player.repository_url">
          <a v-bind:href=r.player.repository_url>Source code</a>
        </div>
        <div class="score"><strong>{{ lastScore(r)?.toFixed(2) }}</strong> on {{ lastScoreDate(r) }}</div>
      </div>
    </div>
  </div>
</template>
<style lang="scss" scoped>

.rankings {
  .ranking {
    position: relative;
    padding-left: 100px;
    padding-bottom: 20px;

    .rank {
      display: inline-block;
      position: absolute;
      left: 0;
      top: 20px;
      width: 80px;
      text-align: center;
      font-size: 50px;
      line-height: 50px
    }

    .details {
      position: relative;
      line-height: 16pt;

      .player_server_id {
        font-weight: bold
      }

      .player_server_id, .author, .author_url {

      }
    }
  }
}

</style>
