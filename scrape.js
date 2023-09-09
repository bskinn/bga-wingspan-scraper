const report = () => {

var ids = []
$$('div[class="player-name"]').forEach(s => ids.push(s.id.split("_")[2]))

var names = []
ids.forEach(s => names.push($$(`div[id$="${s}"][class="player-name"]`)[0].textContent.trim()))

var scores = []
ids.forEach(s => scores.push($$(`span[id$="${s}"][class^="player_score"]`)[0].textContent.trim()))

console.log(`${names.join()}\n${scores.join()}`)

}


