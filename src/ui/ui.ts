import { checkFullPlaySequence, checkMoveListLength } from '@/checks/moves'
import { getRawMoveInfo } from '@/data/moves'
import { sleepHelper } from '@/helpers/async'
import { scrapeAndSave } from '@/scrape/scores'

const GET_RAW_MOVE_INFO = 'getRawMoveInfo()'
const RAW_MOVE_ID_LIST = 'Raw Move ID List'

const OPTIONS = [GET_RAW_MOVE_INFO, RAW_MOVE_ID_LIST]

const addDebugControls = (dropdown: HTMLSelectElement) => {
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
    var func: () => any
    const commandArgStrs = inputDebugEval.value.split(',')

    // @ts-ignore
    const commandArgVals = commandArgStrs.map(arg => eval(arg))

    const evaluator = (func: () => any) => {return func()}

    // TODO: Refactor this switch for func creation to a new file.
    //  No need to bloat this one.
    switch(dropdown.value) {
      case GET_RAW_MOVE_INFO:
        func = () => getRawMoveInfo()
        break

      case RAW_MOVE_ID_LIST:
        func = () => getRawMoveInfo().map(rm => parseInt(rm.moveNum))
        break

      default:
        func = () => "Not Implemented"
    }

    try {
      const result = evaluator(func)
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

const addDropDownRunFunction = (): HTMLSelectElement => {
  // Dropdown for selecting which function to run
  // Pulls arguments from inputDebugEval
  const dropdownRunFunction = document.createElement('select')
  dropdownRunFunction.id = 'dropdownRunFunction'
  dropdownRunFunction.style.position = 'fixed'
  dropdownRunFunction.style.top = '90%'
  dropdownRunFunction.style.left = '26em'
  dropdownRunFunction.style.height = '2.25em'
  dropdownRunFunction.style.width = '15em'
  dropdownRunFunction.style.paddingLeft = '0.5em'

  OPTIONS.forEach(opText => {
    var option = document.createElement('option')
    option.textContent = opText
    dropdownRunFunction.appendChild(option)
  })

  document.body.appendChild(dropdownRunFunction)

  return dropdownRunFunction
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
  const dropdown = addDropDownRunFunction()
  addDebugControls(dropdown)
  
}
