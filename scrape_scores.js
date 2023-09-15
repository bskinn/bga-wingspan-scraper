// ======  CONSTANTS  ======
BONUS_TURN_ID = 'B'
BONUS_CARD_TURN_ID = 'C'
GAME_END_TURN_ID = 'G'

// ======  DEV HELPERS  ======

devRoundStartScores = [
  {
    move: '67',
    round: '2',
    turn: '1',
    scores: [
      {
        name: 'Brian Skinn',
        score: '5',
      },
      {
        name: 'xïkmd',
        score: '19',
      },
      {
        name: 'KrissiMay',
        score: '12',
      },
    ],
  },
  {
    move: '120',
    round: '3',
    turn: '1',
    scores: [
      {
        name: 'Brian Skinn',
        score: '17',
      },
      {
        name: 'xïkmd',
        score: '32',
      },
      {
        name: 'KrissiMay',
        score: '25',
      },
    ],
  },
  {
    move: '185',
    round: '4',
    turn: '1',
    scores: [
      {
        name: 'Brian Skinn',
        score: '48',
      },
      {
        name: 'xïkmd',
        score: '42',
      },
      {
        name: 'KrissiMay',
        score: '32',
      },
    ],
  },
  {
    move: '232',
    round: '4',
    turn: 'B',
    scores: [
      { name: 'Brian Skinn', score: '68' },
      { name: 'xïkmd', score: '65' },
      { name: 'KrissiMay', score: '52' },
    ],
  },
]

// ======  PROXY HANDLERS  ======

const createArrayCycleProxy = (arr) => {
  return new Proxy(arr, {
    get: (target, prop) => {
      return target[prop % arr.length]
    },
  })
}

// ======  UTILITY FUNCTIONS  ======
const logMsg = (msg) => {
  const now = new Date()
  const hours = now.getHours()
  const mins = now.getMinutes()
  const secs = now.getSeconds()

  const tstamp = `${hours < 10 ? '0' + hours : hours}:${
    mins < 10 ? '0' + mins : mins
  }:${secs < 10 ? '0' + secs : secs}`

  console.log(`SCORE SCRAPE [${tstamp}]: ${msg}`)
}

const rangeArray = (len) => {
  return [...Array(len).keys()]
}

const tableNum = () => {
  return window.location.search.match(/[?&]table=(\d+)(&|$)/)[1]
}

const extractRoundBonusScore = (name, text) => {
  return text.match(new RegExp(`${name}.+?scor[^\\s]+\\s+(\\d+)\\s+point`))[1]
}

const calcRoundTurn = (raw_turn) => {
  // raw_turn is zero-indexed
  // The output round and in-round turn are one-indexed
  if (raw_turn <= 7) {
    return { round: '1', turn: `${raw_turn + 1}` }
  } else if (raw_turn <= 14) {
    return { round: '2', turn: `${raw_turn - 7}` }
  } else if (raw_turn <= 20) {
    return { round: '3', turn: `${raw_turn - 14}` }
  } else if (raw_turn <= 25) {
    return { round: '4', turn: `${raw_turn - 20}` }
  } else if (raw_turn == 26) {
    return { round: '4', turn: BONUS_TURN_ID }
  } else {
    throw new Error('Raw turn index out of bounds')
  }
}

// ======  MOVE STATE CONTROL  ======

const advanceToMove = (move_num) => {
  $$(`div[id="replaylogs_move_${move_num}"]`)[0].click()
}

const advanceToGameEnd = () => {
  $$('a[id="archive_end_game"]')[0].click()
  $$('a[id="go_to_game_end_slow"]')[0].click()
}

// ======  DATA EXPORT  ======

// From https://stackoverflow.com/a/18197341/4376000
function download(filename, text) {
  var element = document.createElement('a')
  element.setAttribute(
    'href',
    'data:text/plain;charset=utf-8,' + encodeURIComponent(text),
  )
  element.setAttribute('download', filename)

  element.style.display = 'none'
  document.body.appendChild(element)

  element.click()

  document.body.removeChild(element)
}

// ======  ASYNC HELPERS  ======

const sleepHelper = (ms) => {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

const waitForMoveHelper = (move_num, timeout_step = 1) => {
  // We're waiting for the previous move's class to be viewed.
  // We use a nonzero default on the timeout_step so that it doesn't spam
  // the system if accidentally called without a timeout while
  // developing/debugging.

  const watched_move_num = `${parseInt(move_num) - 1}`

  logMsg(`Watching move ${watched_move_num}.`)

  function finisher(resolve) {
    resolve()
  }

  function waiter(resolve) {
    const checkDivs = $$(
      `div[id="replaylogs_move_${watched_move_num}"][class~="viewed"]`,
    )

    if (checkDivs.length < 1) {
      logMsg('Waiting...')
      setTimeout(() => waiter(resolve), 1000 * timeout_step)
    } else {
      logMsg(
        'Move reached, waiting one more time to ensure animation is complete...',
      )
      setTimeout(() => finisher(resolve), 1000 * timeout_step)
    }
  }

  return new Promise((resolve) => waiter(resolve))
}

// ======  BASIC DATA RETRIEVAL FUNCTIONS  ======

const getIds = () => {
  var ids = []

  $$('div[class="player-name"]').forEach((s) => ids.push(s.id.split('_')[2]))

  return ids
}

const getNames = () => {
  const ids = getIds()
  var names = []

  ids.forEach((s) =>
    names.push(
      $$(`div[id$="${s}"][class="player-name"]`)[0].textContent.trim(),
    ),
  )

  return names
}

const numPlayers = () => {
  return getNames().length
}

const getScores = () => {
  const ids = getIds()
  var scores = []

  ids.forEach((s) =>
    scores.push(
      $$(`span[id$="${s}"][class^="player_score"]`)[0].textContent.trim(),
    ),
  )

  return scores
}

// ======  MOVE RETRIEVAL AND PROCESSING  ======

const getMoveInfo = () => {
  var moveInfo = []

  // First element is the entire match.
  // Second is the move number.
  // Third, if present, is the date.
  // Fourth is the full text of the move message.
  $$('div[id^="replaylogs_move_"]').forEach((s) =>
    moveInfo.push(
      s.textContent.match(
        /Move (\d+)\s+:([0-9]+\/[0-9]+\/[0-9]+\s*)?[0-9:]+\s*[AP]M(.+)/,
      ),
    ),
  )

  return moveInfo
}

const getNamedMoves = (moveInfo) => {
  // Returns object
  // move: Move number
  // name: Player name
  // msg: Log message
  // text: Full text match

  var names = getNames()
  var namedMoves = []

  moveInfo.forEach((mi) => {
    if (mi != null) {
      names.forEach((n) => {
        if (mi[3].startsWith(n)) {
          namedMoves.push({ move: mi[1], name: n, msg: mi[3], text: mi[0] })
        }
      })
    }
  })

  return namedMoves
}

const removeUndoMoves = (namedMoves) => {
  // Strip out any moves that are pure undo notification moves
  var filteredMoves = []

  namedMoves.forEach((nm) => {
    if (!nm.msg.startsWith(`${nm.name} may undo up to this point`)) {
      filteredMoves.push(nm)
    }
  })

  return filteredMoves
}

const removeRepeatMoves = (namedMoves) => {
  // Pass the moves list through after undos are stripped out
  // Skip the first move entirely, it will be the discard move
  //
  var filteredMoves = [namedMoves[1]]

  for (let i = 2; i < namedMoves.length; i++) {
    if (namedMoves[i].name != namedMoves[i - 1].name) {
      filteredMoves.push(namedMoves[i])
    }
  }

  return filteredMoves
}

const getMovesList = () => {
  // This is the fully prepared moves list that most functions
  // should work with
  return removeRepeatMoves(removeUndoMoves(getNamedMoves(getMoveInfo())))
}

const getMoveIds = (movesList) => {
  var moveIds = movesList.map((m) => m.move)
  return moveIds.sort((a, b) => {
    return Math.sign(parseInt(a) - parseInt(b))
  })
}

const getTurnsetStartMoveIds = (moveIds) => {
  return rangeArray(26).map((i) => {
    return moveIds[i * 3]
  })
}

const getPlayOrderProxy = (movesList) => {
  return createArrayCycleProxy(
    movesList.slice(0, getNames().length).map((m) => m.name),
  )
}

// ======  ROUND BONUS HANDLING  ======

const getRoundBonusMoves = () => {
  // Returns object
  // move: Move number
  // name: Player name
  // text: Full text match

  var bonusMoves = []

  getMoveInfo().forEach((mi) => {
    if (mi != null) {
      if (mi[3].includes('Action cubes are returned')) {
        bonusMoves.push({ move: mi[1], name: 'RoundBonus', text: mi[0] })
      }
    }
  })

  return bonusMoves
}

const calcAndAddRoundEndScores = (scoreData, round) => {
  // Subtracting the round bonus scores from the scores at the
  // start of the next round, to get the scores prior to the
  // round bonuses, for rounds 1-3.
  // Round 4 needs special treatment because of the end of
  // game behavior.

  const names = getNames()

  // Scores at the start of the next round
  const nextScores = scoreData.find(
    (obj) => obj.round == round + 1 && obj.turn == 1,
  )

  // Text of the relevant round bonus move. We subtract one since the
  // JS array object is zero-indexed.
  const bonusMove = getRoundBonusMoves()[round - 1]

  // Initialize the score entry object
  const newEntry = {
    move: bonusMove.move,
    round: `${round}`,
    turn: BONUS_TURN_ID,
    scores: [],
  }

  names.forEach((name) => {
    console.log(name)
    let nextScore = nextScores.scores.find((obj) => obj.name == name).score
    let roundBonusScore = extractRoundBonusScore(name, bonusMove.text)

    // Calculate the math but keep the result as a string since that's
    // how everything is (for now)
    let roundEndScore = `${parseInt(nextScore) - parseInt(roundBonusScore)}`

    // Push the calculated score into the score entry object
    newEntry.scores.push({ name: name, score: roundEndScore })
  })

  // Push the new score entry object into the overall data
  scoreData.push(newEntry)
}

const calcAndAddGameEndScores = (scoreData) => {
  // RESUME
  // Pull the round bonus scores out of the final round bonus text.
  // If all has gone well, the turnset code will have also added
  // the "G" game-end scores to the scoreData, in which case
  // we can calculate the round bonus points from the text,
  // and then find the bonus card points from
  // (end game - 4th "B" value) = (round bonus + bonus card)
  // So:
  // Bonus card = (end game - 4th "B" - round bonus)
  //
  // TODO: Need to add a comment somewhere about how the 'round bonus' calc is different for round 4, vs rounds 1-3
}

const calcAndAddAllEndScores = (scoreData) => {
  // scoreData should be the output from getTurnsetScores(),
  // or a simulation of it
  for (const round of [1, 2, 3]) {
    calcAndAddRoundEndScores(scoreData, round)
  }
}

// ======  STATE VALIDATION ======

const checkMoveListLength = () => {
  return getMovesList().length == numPlayers() * 26
}

const checkFullPlaySequence = () => {
  // Check to see whether the sequence of moves identified by
  // getMovesList() contains the players in the sequence as
  // expected by the actual game progression (advancement of
  // first player each round, etc.)

  const actualMoves = getMovesList()
  const actualPlayerSequence = actualMoves.map((m) => m.name)
  const numPlayers = getNames().length
  const orderProxy = getPlayOrderProxy(actualMoves)

  // This assembles the expected move sequence based on the core player
  // order determined by getPlayOrderProxy()
  var expectedPlayerSequence = []
  for (let round_num = 1; round_num <= 4; round_num++) {
    expectedPlayerSequence = expectedPlayerSequence.concat(
      rangeArray((9 - round_num) * numPlayers).map(
        (i) => orderProxy[i + round_num - 1],
      ),
    )
  }

  // Now we check whether expected matches actual
  return expectedPlayerSequence.every((n, i) => {
    return n == actualPlayerSequence[i]
  })
}

// ======  PROCESSING SCORES  ======

const scrapeResults = () => {
  const results = { scores: getScores(), names: getNames() }
  return results.names.map((n, i) => {
    return { name: n, score: results.scores[i] }
  })
}

async function getScoreForMove(move_num, timeout_step = 8) {
  // Replay wait-to-complete is in seconds

  // Trigger the replay advance
  logMsg(`Advancing replay to move ${move_num}.`)
  advanceToMove(move_num)

  logMsg('Waiting for replay to advance...')
  await waitForMoveHelper(move_num, timeout_step)
  logMsg('Replay advance done.')

  return scrapeResults()
}

async function getTurnsetScores(timeout_step = 8) {
  var moves = getTurnsetStartMoveIds(getMoveIds(getMovesList()))
  const data = []

  // Add in the very final move that can be advanced to with
  // move clicks
  moves.push(getRoundBonusMoves()[3].move)

  // Need to pack the moves with the indices
  iterable = moves.map((m, i) => {
    return [m, i]
  })

  for (const [m, i] of iterable) {
    var turnset_num = parseInt(i) + 1
    logMsg(
      `Start score retrieval for turnset ${turnset_num}, at log move ${m}...`,
    )
    result = await getScoreForMove(m)
    data.push({
      move: m,
      ...calcRoundTurn(i),
      scores: result,
    })
    logMsg(`Score retrieval complete for turnset ${turnset_num}.`)
  }

  // Move fully to the end of the game
  // The move we need to wait for completion here will (or should...)
  // be the same as the move used for the last-round bonus move
  // content. The helper auto decrements to get the watched move, so we
  // have to increment it here when passed.
  // TODO: DEAL WITH THE SCORE SCRAPE HAPPENING WHILE THE FINAL COUNT IS STILL GOING
  const endGameMove = `${parseInt(getRoundBonusMoves()[3].move) + 1}`
  logMsg('Advancing to game end...')
  advanceToGameEnd()
  await waitForMoveHelper(endGameMove, timeout_step)
  logMsg('Reached game end.')

  data.push({
    move: endGameMove,
    round: '4',
    turn: GAME_END_TURN_ID,
    scores: scrapeResults(),
  })

  return data
}

// ======  PUBLIC API  ======

const report = () => {
  const names = getNames()
  const scores = getScores()

  console.log(`${names.join()}\n${scores.join()}`)
}
