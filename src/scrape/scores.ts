import type { TMoveId, TRawTurnId, TRoundId } from '@/types/types-ids'
import type {
  TCompleteScoreScrapeData,
  TScoreScrapeData,
  TScoreScrapeSingleScore,
} from '@/types/types-score-scrape'

import {
  BONUS_CARD_TURN_ID,
  BONUS_TURN_ID,
  DEFAULT_MOVE_WAIT_POLL,
  GAME_END_TURN_ID,
  NO_MOVE_NUM,
} from '@/consts'
import {
  getFirstTurns,
  getMoveIds,
  getMovesList,
  getRoundBonusMoves,
  getTurnsetStartMoveIds,
} from '@/data/moves'
import {
  extractBonusCardScore,
  extractRoundBonusScore,
  scrapeScoreSet,
} from '@/data/scores'
import { getColors, getNames, getTableNum, getWinner } from '@/data/table'
import { rangeArray } from '@/helpers/array'
import { waitForGameEndHelper, waitForMoveHelper } from '@/helpers/async'
import { download } from '@/helpers/export'
import { logMsg } from '@/helpers/logging'
import { advanceToGameEnd, advanceToMove } from '@/helpers/move-control'
import { calcRoundTurn } from '@/helpers/state'
import { timestampFullShort } from '@/helpers/string'

export async function scrapeAndSave() {
  // Get the main data and augment with end-scores
  const data = await getTurnsetScores()
  calcAndAddAllEndScores(data)

  // Advance to the endgame state, with detection wait
  advanceToGameEnd()
  await waitForGameEndHelper()

  // Fix the endgame scores
  correctLastTurnGlitches(data)

  const outerData: TCompleteScoreScrapeData = {
    data: data,
    table: getTableNum(),
    timestamp: timestampFullShort(),
    colors: getNames().map((n, i) => {
      return { name: n, color: getColors()[i] }
    }),
    first_turns: getFirstTurns(),
    winner: getWinner(),
  }

  download(
    `${getTableNum()}-${timestampFullShort()}.json`,
    JSON.stringify(outerData),
  )
  download(
    `${getTableNum()}-${timestampFullShort()}.b64`,
    btoa(JSON.stringify(outerData)),
  )
}

export async function getTurnsetScores(timeout_step = DEFAULT_MOVE_WAIT_POLL) {
  var moves = getTurnsetStartMoveIds(getMoveIds(getMovesList()))
  const data: Array<TScoreScrapeData> = []

  // These are the first turnsets of rounds 2-4, plus the last turnset,
  // falling right before the last round bonus and bonus card calculation
  const slowTurnsets = [9, 16, 22, 27]

  // Add in the very final move that can be advanced to with
  // move clicks
  moves.push(getRoundBonusMoves()[3].moveNum)

  // Step through each turnset and pull the scores
  for (const [idx, mi] of moves.entries()) {
    const turnset_num = (idx + 1) as TRawTurnId
    logMsg(
      `Start score retrieval for turnset ${turnset_num}, at log move ${mi}...`,
    )

    const timeout_current =
      timeout_step * (slowTurnsets.includes(turnset_num) ? 3 : 1)

    logMsg(`Wait timeout is ${timeout_current} sec.`)
    const result = await getScoreForMove(mi, timeout_current)
    data.push({
      move: mi,
      ...calcRoundTurn(idx as TRawTurnId),
      scores: result,
    })
    logMsg(`Score retrieval complete for turnset ${turnset_num}.`)
  }

  return data
}

export async function getScoreForMove(
  move_num: TMoveId,
  timeout_step = DEFAULT_MOVE_WAIT_POLL,
) {
  // Replay wait-to-complete is in seconds
  // Trigger the replay advance
  logMsg(`Advancing replay to move ${move_num}.`)
  advanceToMove(move_num)

  logMsg('Waiting for replay to advance...')
  await waitForMoveHelper(move_num, timeout_step)
  logMsg('Replay advance done.')

  return scrapeScoreSet()
}

const calcAndAddRoundEndScores = (
  scoreData: Array<TScoreScrapeData>,
  round: TRoundId,
) => {
  // Subtracting the round bonus scores from the scores at the
  // start of the next round, to get the scores prior to the
  // round bonuses, for rounds 1-3.
  // Round 4 needs special treatment because of the end of
  // game behavior; handled as part of calcAndAddGameEndScores().
  const names = getNames()

  // Scores at the start of the next round
  const nextScores = scoreData.find(
    (sd) => sd.round == `${parseInt(round) + 1}` && sd.turn == '1',
  )

  if (nextScores == null) {
    const errMsg = `Failed to find score data for round ${
      parseInt(round) + 1
    } while calculating round-end scores for round ${round}`
    alert(errMsg)
    throw errMsg
  }

  // Text of the relevant round bonus move. We subtract one since the
  // JS array object is zero-indexed.
  const bonusMove = getRoundBonusMoves()[parseInt(round) - 1]

  // Initialize the score entry object
  const newEntry = {
    move: bonusMove.moveNum,
    round: round,
    turn: BONUS_TURN_ID,
    scores: [] as Array<TScoreScrapeSingleScore>,
  }

  names.forEach((name) => {
    const nextScoreData = nextScores.scores.find((ns) => ns.name == name)

    if (nextScoreData == null) {
      const errMsg = `Failed to find score data for player '${name}' while calculating round-end scores for round ${round}`
      alert(errMsg)
      throw errMsg
    }

    const nextScore = nextScoreData.score
    const roundBonusScore = extractRoundBonusScore(name, bonusMove.fullText)

    // Calculate the math but keep the result as a string since that's
    // how everything is (for now)
    let roundEndScore = nextScore - roundBonusScore

    // Push the calculated score into the score entry object
    newEntry.scores.push({ name: name, score: roundEndScore })
  })

  // Push the new score entry object into the overall data
  scoreData.push(newEntry)
}

const calcAndAddGameEndScores = (scoreData: Array<TScoreScrapeData>) => {
  // Parse the final round-end move text for both the
  // R4 round bonuses and the bonus card bonuses
  //
  // Get the end of game move text and the names list
  const finalMoveText = getRoundBonusMoves()[3].fullText
  const names = getNames()
  const referenceScores = scoreData.find(
    (sd) => sd.round == '4' && sd.turn == BONUS_TURN_ID,
  )

  if (referenceScores == null) {
    const errMsg = `Failed to find round 4 bonus turn score info while attempting to add game-end scores`
    alert(errMsg)
    throw errMsg
  }

  logMsg(JSON.stringify(referenceScores))

  // Initialize score objects for after round bonuses and for
  // end of game score
  const roundBonusScores: TScoreScrapeData = {
    move: NO_MOVE_NUM,
    round: '4' as TRoundId,
    turn: BONUS_CARD_TURN_ID,
    scores: [] as Array<TScoreScrapeSingleScore>,
  }
  const endGameScores = {
    move: NO_MOVE_NUM,
    round: '4' as TRoundId,
    turn: GAME_END_TURN_ID,
    scores: [] as Array<TScoreScrapeSingleScore>,
  }

  names.forEach((name) => {
    // Get the relevant scores
    var roundScore = extractRoundBonusScore(name, finalMoveText)
    var cardScore = extractBonusCardScore(name, finalMoveText)
    var refScoreData = referenceScores.scores.find((rs) => rs.name == name)

    if (refScoreData == null) {
      const errMsg = `Expected player '${name}' not found in reference score data`
      alert(errMsg)
      throw errMsg
    }

    var refScore = refScoreData.score

    // Add the score entries for the current player name
    roundBonusScores.scores.push({
      name: name,
      score: refScore + roundScore,
    })
    endGameScores.scores.push({
      name: name,
      score: refScore + roundScore + cardScore,
    })
  })

  // Add the new score entries to the score data
  scoreData.push(roundBonusScores)
  scoreData.push(endGameScores)
}

export const calcAndAddAllEndScores = (scoreData: Array<TScoreScrapeData>) => {
  // scoreData should be the output from getTurnsetScores(),
  // or a simulation of it
  for (const round of rangeArray(3, 1)) {
    calcAndAddRoundEndScores(scoreData, `${round}` as TRoundId)
  }

  calcAndAddGameEndScores(scoreData)
}
// ======  FIXING ANY LAST-TURN GLITCHES  ======

export const correctLastTurnGlitches = (scoreData: Array<TScoreScrapeData>) => {
  // Assumes we've been advanced to the endgame state
  // Collect the scores
  const endGameActualData = scrapeScoreSet()

  // Pluck the end-game scores from the passed score data
  const endGameScoreData = scoreData.find(
    (sd) => sd.round == '4' && sd.turn == GAME_END_TURN_ID,
  )

  if (endGameScoreData == null) {
    const errMsg = `Game end score data not found when trying to correct last turn glitches`
    alert(errMsg)
    throw errMsg
  }

  const endGameCalcData = endGameScoreData.scores

  // Loop over the player names, calculate the difference between
  // the actual and calculated end-game scores for each player,
  // and add that difference to all of the pre-round bonus, pre-bonus card,
  // and end-game scores. This can happen if a final bit of points from the
  // last turn is included in the round-bonus move in the replay log
  // (e.g., when a bird that lays eggs in everyone's habitat is used
  // on that last turn of the game; see game 416620972)
  getNames().forEach((name) => {
    var actual = endGameActualData.find((d) => d.name == name)
    var calc = endGameCalcData.find((d) => d.name == name)

    if (actual == null) {
      const errMsg = `Score for player '${name}' not found in end-game 'actual' data`
      alert(errMsg)
      throw errMsg
    }

    if (calc == null) {
      const errMsg = `Score for player '${name}' not found in end-game 'actual' data`
      alert(errMsg)
      throw errMsg
    }

    var diff = actual.score - calc.score

    logMsg(`Endgame glitch calc for ${name}: ${diff}`)

    for (let turn_id of [BONUS_TURN_ID, BONUS_CARD_TURN_ID, GAME_END_TURN_ID]) {
      const workingScoreData = scoreData.find(
        (sd) => sd.round == '4' && sd.turn == turn_id,
      )

      if (workingScoreData == null) {
        const errMsg = `Failed to find score data for turn ID '${turn_id} while correcting possible end-game glitches`
        alert(errMsg)
        throw errMsg
      }

      const workingScores = workingScoreData.scores

      const working = workingScores.find((s) => s.name == name)

      if (working == null) {
        const errMsg = `Score for player '${name}' not found in data for turn ID '${turn_id} while correcting possible end-game glitches`
        alert(errMsg)
        throw errMsg
      }

      // Scores are Numbers now
      working.score += diff
    }
  })
}
