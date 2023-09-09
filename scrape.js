var ids = []
$$('div[class="player-name"]').forEach(s => ids.push(s.id.split("_")[2]))

const getNames = () => {
  var names = []

  ids.forEach(s => names.push($$(`div[id$="${s}"][class="player-name"]`)[0].textContent.trim()))

  return names
}

const getScores = () => {
  var scores = []

  ids.forEach(s => scores.push($$(`span[id$="${s}"][class^="player_score"]`)[0].textContent.trim()))

  return scores
}

const getMoveInfo = () => {
  var moveInfo = []

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
