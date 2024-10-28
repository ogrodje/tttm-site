<script setup lang="ts">
import {ref} from 'vue';

interface BuildConfig {
  size: number,
  symbol: Symbol
}

type Symbol = "X" | "O"

const defaultConfig: BuildConfig = {
  size: 3,
  symbol: "X"
}

interface Move {
  symbol: Symbol,
  row: number,
  column: number
}

const buildConfig = ref<BuildConfig>(defaultConfig);
const moves = ref<Move[]>([]);

const submitConfig = () => {

}

const clearConfig = () => {
  buildConfig.value = defaultConfig;
  moves.value = [];
}

const cellSet = (row: number, column: number) => {
  const maybeMove: Move | undefined = moves.value.find((move): move is Move => move.row === row && move.column === column);

  if (!maybeMove) {
    moves.value.push({
      row, column,
      symbol: "X"
    } as Move)
  } else if (maybeMove.symbol == "X") {
    moves.value = moves.value.map(move => {
      if (move.row == row && move.column == column) {
        move.symbol = "O"
        return move
      } else return move
    }) as Move[];
  } else if (maybeMove.symbol == "O") {
    moves.value = moves.value.filter(move =>
        !(move.row == row && move.column == column)
    ) as Move[];
  }
}

const renderCell = (row: number, column: number) => {
  return moves.value.find(move => move.row == row && move.column == column)?.symbol || "/"
}

const movesString = () => {
  return moves.value.map(move => `${move.symbol}-${move.row}-${move.column}`).join("_") || "Nothing."
}

const structPayload = () => {
  return moves.value.map(({symbol, row, column}) => `${symbol} -> (${row}, ${column})`).join(",\n") || "Nothing."
}

const movesValid = () => {
  return !(moves.value.map(({symbol, row, column}, index) => {
    if (index % 2 == 0 && symbol == "X") {
      return true
    } else return index % 2 != 0 && symbol == "O";
  }).find((value) => value === false) === undefined)
}

</script>
<template>
  <p>This tool will help you build the payload for the <code>moves</code> payload.</p>

  <form @submit.prevent="submitConfig()">
    <div class="form-group">
      <label for="size">Size of the grid</label>
      <select id="size" name="size" v-model.number="buildConfig.size">
        <option value="3">3x3</option>
        <option value="5">5x5</option>
        <option value="7">7x7</option>
      </select>
    </div>

    <div class="form-group">
      <button @click.prevent="clearConfig()">Clear</button>
    </div>
  </form>

  <div class="display-split">
    <div class="split left">
      <div class="grid" :class="{
    'grid-size-3': buildConfig.size == 3,
      'grid-size-5': buildConfig.size == 5,
        'grid-size-7': buildConfig.size == 7
  }">
        <div class="row" v-for="(_row, indexRow) in buildConfig.size" :key="indexRow">
          <div class="column" v-for="(_column, indexCol) in buildConfig.size" :key="indexCol">
            <div class="cell">
              <a class="symbol" href="" @click.prevent="cellSet(indexRow, indexCol)">
                {{ renderCell(indexRow, indexCol) }}
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="split right">
      <div class="moves" :class="{'valid': movesValid()}">
        <div class="move" v-for="(move, index) in moves">
          #{{ index }} {{ move.row }}, {{ move.column }}, {{ move.symbol }}
        </div>
      </div>
    </div>
  </div>

  <div class="moves-payload" :class="{'valid': movesValid()}">
    <h2>Moves payload</h2>
    <div>{{ movesString() }}</div>
  </div>

  <div class="struct-payload" :class="{'valid': movesValid()}">
    <h2>Struct payload</h2>
    <div>{{ structPayload() }}</div>
  </div>

</template>
<style lang="scss" scoped>
$grid-width: 420px;

.moves,
.moves-payload,
.struct-payload {
  padding: 5px;

  &.valid {
    background-color: #933b4b;
  }
}

.display-split {
  display: flex;
  margin-bottom: 20px;

  .split {
    width: 50%;
  }
}

.grid {
  display: block;
  border: 1px solid white;
  width: $grid-width;
  height: $grid-width;
  overflow: hidden;

  &.grid-size-3 {
    .column {
      width: calc($grid-width / 3);
      height: calc($grid-width / 3);
    }
  }

  &.grid-size-5 {
    .column {
      width: calc($grid-width / 5);
      height: calc($grid-width / 5);
    }
  }

  &.grid-size-7 {
    .column {
      width: calc($grid-width / 7);
      height: calc($grid-width / 7);
    }
  }

  .row {
    width: $grid-width -1px;
    display: block;
    clear: both;
    float: none;
    border-bottom: 1px solid white;
    box-sizing: border-box;

    .column {
      box-sizing: border-box;
      display: inline-block;
      border-right: 1px solid white;
      position: relative;

      .cell {
        position: relative;
        width: 100%;
        height: 100%;

        a.symbol {
          display: flex;
          justify-content: center;
          align-items: center;
          width: 100%;
          height: 100%;
          font-size: 20pt;
          text-decoration: none;

          &:hover {
            background-color: #272727;
          }
        }
      }

    }
  }
}

.moves {
  .move {
    border-bottom: 1px solid #333333;
    padding: 5px;

    &:last-child {
      border: none
    }
  }
}

</style>