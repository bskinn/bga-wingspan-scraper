// ======  BASIC DATA RETRIEVAL FUNCTIONS  ======

let getIds = () => {
  // var ids = []

  // $$('div[class="player-name"]').forEach((s) => ids.push(s.id.split('_')[2]))

  // return ids

  return $$('div[class="player-name"]').map((div) => div.id.split('_')[2])
}

let getNames = () => {
  const ids = getIds()
  var names = []

  ids.forEach((s) =>
    names.push(
      $$(`div[id$="${s}"][class="player-name"]`)[0].textContent.trim(),
    ),
  )

  return names
}
