// ======  PROXY HANDLERS  ======

const createArrayCycleProxy = (arr) => {
  return new Proxy(arr, {
    get: (target, prop) => {
      return target[prop % arr.length]
    },
  })
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
  // text: Full text match

  var names = getNames()
  var namedMoves = []

  moveInfo.forEach((mi) => {
    if (mi != null) {
      names.forEach((n) => {
        if (mi[3].startsWith(n)) {
          namedMoves.push({ move: mi[1], name: n, text: mi[0] })
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
    if (!nm.text.startsWith(`${nm.name} may undo up to this point`)) {
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
  return removeRepeatMoves(removeUndoMoves(getNamedMoves(getMoveInfo())))
}

const getMoveIds = (movesList) => {
  var moveIds = movesList.map((m) => m.move)
  return moveIds.sort((a, b) => {
    return Math.sign(parseInt(a) - parseInt(b))
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

// ======  PUBLIC API  ======

const report = () => {
  const names = getNames()
  const scores = getScores()

  console.log(`${names.join()}\n${scores.join()}`)
}
