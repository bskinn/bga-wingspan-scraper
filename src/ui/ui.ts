import { sleepHelper } from '@/helpers/async'
import { checkFullPlaySequence, checkMoveListLength } from '@/checks/moves'
import { scrapeAndSave } from '@/scrape/scores'

const addDebugControls = () => {
  // Button to trigger debug eval
  // These controls may be obsolete, since it's hard to reach into the
  // webpack this way
  const buttonDebugPrint = document.createElement('button')
  buttonDebugPrint.textContent = 'Debug Print'
  buttonDebugPrint.id = 'buttonDebugPrint'
  buttonDebugPrint.style.position = 'fixed'
  buttonDebugPrint.style.top = '95%'
  buttonDebugPrint.style.left = '13em'
  buttonDebugPrint.style.height = '2em'
  buttonDebugPrint.style.width = '8em'

  // Input field for debug expression to evaluate
  const inputDebugEval = document.createElement('input')
  inputDebugEval.id = 'inputDebugEval'
  inputDebugEval.type = 'text'
  inputDebugEval.style.position = 'fixed'
  inputDebugEval.style.top = '95%'
  inputDebugEval.style.left = '21em'
  inputDebugEval.style.height = '2em'
  inputDebugEval.style.width = '20em'
  inputDebugEval.style.paddingLeft = '0.25em'
  inputDebugEval.style.paddingRight = '0.25em'

  // Evalaute the expression in the input box when the button is clicked
  buttonDebugPrint.addEventListener('click', () => {
    try {
      const result = eval(inputDebugEval.value)
      alert(JSON.stringify(result))
    } catch (err) {
      alert(`Error: ${(err as Error).message}`)
    }
  })

  // Extra listener for the Enter keyup in the input field,
  // so we don't have to use the mouse to do the debug print
  inputDebugEval.addEventListener('keyup', function (event) {
    if (event.key == 'Enter') {
      buttonDebugPrint.click()
    }
  })

  document.body.appendChild(buttonDebugPrint)
  document.body.appendChild(inputDebugEval)
}
const addButtonScrapeScores = () => {
  // Button to start score scraping
  const buttonScrapeScores = document.createElement('button')
  buttonScrapeScores.textContent = 'Scrape Scores'
  buttonScrapeScores.id = 'buttonScrapeScores'
  buttonScrapeScores.style.position = 'fixed'
  buttonScrapeScores.style.top = '95%'
  buttonScrapeScores.style.left = '20px'
  buttonScrapeScores.style.height = '2em'
  buttonScrapeScores.style.width = '10em'
  buttonScrapeScores.addEventListener('click', async () => {
    buttonScrapeScores.disabled = true
    await scrapeAndSave()
  })
  document.body.appendChild(buttonScrapeScores)
}

const addButtonCheckPlaySeq = () => {
  // Button for checking the player sequence in the turnset move list
  const buttonCheckPlaySeq = document.createElement('button')
  buttonCheckPlaySeq.textContent = 'Check Play Sequence'
  buttonCheckPlaySeq.id = 'buttonCheckPlaySeq'
  buttonCheckPlaySeq.style.position = 'fixed'
  buttonCheckPlaySeq.style.top = '90%'
  buttonCheckPlaySeq.style.left = '11em'
  buttonCheckPlaySeq.style.height = '2em'
  buttonCheckPlaySeq.style.width = '12em'
  buttonCheckPlaySeq.addEventListener('click', () => {
    alert(checkFullPlaySequence() ? 'Check OK' : 'Check FAILED')
  })
  document.body.appendChild(buttonCheckPlaySeq)
}

const addButtonCheckMoveList = () => {
  // Button for checking the turnset move list length
  const buttonCheckMoveList = document.createElement('button')
  buttonCheckMoveList.textContent = 'Check Move List'
  buttonCheckMoveList.id = 'buttonCheckMoveList'
  buttonCheckMoveList.style.position = 'fixed'
  buttonCheckMoveList.style.top = '90%'
  buttonCheckMoveList.style.left = '10px'
  buttonCheckMoveList.style.height = '2em'
  buttonCheckMoveList.style.width = '10em'
  buttonCheckMoveList.addEventListener('click', () => {
    alert(checkMoveListLength() ? 'Check OK' : 'Check FAILED')
  })
  document.body.appendChild(buttonCheckMoveList)
}

const addButtonAwaitTest = () => {
  // Button for testing await behavior
  const buttonAwaitTest = document.createElement('button')
  buttonAwaitTest.textContent = 'Test Await'
  buttonAwaitTest.id = 'buttonAwaitTest'
  buttonAwaitTest.style.position = 'fixed'
  buttonAwaitTest.style.top = '85%'
  buttonAwaitTest.style.left = '10px'
  buttonAwaitTest.style.height = '2em'
  buttonAwaitTest.style.width = '8em'
  buttonAwaitTest.addEventListener('click', async () => {
    console.log('Start')
    await sleepHelper(5000)
    console.log('End')
  })
  document.body.appendChild(buttonAwaitTest)
}

export const buildUI = () => {
  addButtonAwaitTest()
  addButtonCheckMoveList()
  addButtonCheckPlaySeq()
  addButtonScrapeScores()
  addDebugControls()
}
