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
  $$('div[id^="replaylogs_move_"]').forEach(s => moveInfo.push(s.textContent.match(/Move (\d+)\s*[0-9:]+\s*[AP]M(.{30})/)))

  return moveInfo
}

const getNamedMoves = (moveInfo) => {
  const names = getNames()


}

const report = () => {
  const names = getNames()
  const scores = getScores()

  console.log(`${names.join()}\n${scores.join()}`)
}
