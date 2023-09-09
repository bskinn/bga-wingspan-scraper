const getIds = () => {
  var ids = []

  $$('div[class="player-name"]').forEach(s => ids.push(s.id.split("_")[2]))

  return ids
}

const getNames = () => {
  const ids = getIds()
  var names = []

  ids.forEach(s => names.push($$(`div[id$="${s}"][class="player-name"]`)[0].textContent.trim()))

  return names
}

const getScores = () => {
  const ids = getIds()
  var scores = []

  ids.forEach(s => scores.push($$(`span[id$="${s}"][class^="player_score"]`)[0].textContent.trim()))

  return scores
}

const getMoveInfo = () => {
  var moveInfo = []

  // First element is the entire match.
  // Second is the move number.
  // Third is the partial text match of the first part of the message.
  $$('div[id^="replaylogs_move_"]').forEach(s => moveInfo.push(s.textContent.match(/Move (\d+)\s*:\s*[0-9:]+\s*[AP]M(.{0,50})/)))

  return moveInfo
}

const getNamedMoves = (moveInfo) => {
  // Returns array
  // First element is the move number
  // Second element is the player name
  // Third element is the partial text match

  var names = getNames()
  //names.push('You')  // For the start-of-game discard
  var namedMoves = []

  moveInfo.forEach(mi => {
    if ( mi != null ) {
      names.forEach(n => {
        if ( mi[2].startsWith(n) ) {
          namedMoves.push([mi[1], n, mi[2]])
        }
      })
    }
  })

  return namedMoves
}

const removeUndoMoves = (namedMoves) => {
  // Strip out any moves that are pure undo notification moves
  var filteredMoves = []

  namedMoves.forEach(nm => {
    if ( !nm[2].startsWith(`${nm[1]} may undo up to this point`) ) {
      filteredMoves.push(nm)
    }
  })

  return filteredMoves
}

const getMovesList = () => {
  return removeUndoMoves(getNamedMoves(getMoveInfo()))
}

const report = () => {
  const names = getNames()
  const scores = getScores()

  console.log(`${names.join()}\n${scores.join()}`)
}
