// import { program } from 'commander'
import * as fs from 'fs'

type TDirName = string
type TFileName = string
type TDirContents = { dirs: Array<TDirName>; files: Array<TFileName> }
type TDirTreeNode = {
  dirName: TDirName
  nodeName: string
  parents: Array<TDirName>
  subdirs: Array<TDirTreeNode>
  files: Array<TFileName>
}
type TNodeShapeDelims = { open: string; close: string }

enum E_NodeShapes {
  Square = 'square',
  Rounded = 'rounded',
}

const FONT_SIZE = 10
const LINE_COLOR = '#003812'
const FILES_FILL_COLOR = '#E8FFE0'
const FILES_TEXT_COLOR = '#000'
const FILES_BORDER_COLOR = '#D3F1C8'
const DIR_FILL_COLOR = '#136F17'
const DIR_TEXT_COLOR = '#fff'
const DIR_BORDER_COLOR = '#D3F1C8'
const DIR_NODE_NAME = 'dirNode'
const FILES_NODE_SUFFIX = 'Files'
const INDENT_WIDTH = 2

const MARKER_STRING_START = '<!-- mermaid-fs-diagram -->'
const MARKER_STRING_STOP = '<!-- mermaid-fs-diagram-stop -->'
const MARKER_REGEX_START = new RegExp(`^${MARKER_STRING_START}$`, 'm')
const MARKER_REGEX_STOP = new RegExp(`^${MARKER_STRING_STOP}$`, 'm')
const MARKER_REGEX_SPAN = new RegExp(
  `${MARKER_STRING_START}[\\w\\W]+?${MARKER_STRING_STOP}`,
)

const NODE_SHAPES: { [key in E_NodeShapes]: TNodeShapeDelims } = {
  [E_NodeShapes.Square]: { open: '[', close: ']' },
  [E_NodeShapes.Rounded]: { open: '(', close: ')' },
}

const SRC_OPEN_LINE = '```mermaid'
const SRC_CLOSE_LINE = '```'

const THEME_SETTINGS = `%%{init: {'theme': 'base', 'themeVariables': {'fontSize': '${FONT_SIZE}px', 'lineColor': '${LINE_COLOR}', 'primaryColor': '${FILES_FILL_COLOR}', 'primaryTextColor': '${FILES_TEXT_COLOR}', 'primaryBorderColor': '${FILES_BORDER_COLOR}'}}}%%`

const DIR_NODE_DEF = `classDef ${DIR_NODE_NAME} fill: ${DIR_FILL_COLOR}, stroke: ${DIR_BORDER_COLOR}, color: ${DIR_TEXT_COLOR}`

// Given a directory, grab the lists of files and directories in it
const getDirContents = (dirPath: string): TDirContents => {
  const files: Array<TFileName> = []
  const dirs: Array<TDirName> = []

  // TODO: Include/exclude logic based on Regex matching of BOTH directory
  // and filename. E.g., `include` and `exclude` are arrays of objects
  // with 'dir' and 'file' regexes. Where both match, the include/exclude
  // are applied. Perhaps make `include` override `exclude`?

  fs.readdirSync(dirPath).forEach((entry: string) => {
    const stat = fs.lstatSync(`${dirPath}/${entry}`)
    if (stat.isFile()) {
      files.push(entry)
    } else if (stat.isDirectory()) {
      dirs.push(entry)
    } // For now, ignore anything that's not a dir or a file
  })

  return { dirs: dirs, files: files }
}

const buildDirTree = (
  dirName: TDirName,
  parents: Array<TDirName> = [],
): TDirTreeNode => {
  // Recursive function to walk a directory tree and store directory and
  // file information
  const pathArray = [...parents, dirName]
  const fullPath = pathArray.join('/')

  const dirContents = getDirContents(fullPath)

  console.log(`Traversing ${fullPath}...`)

  return {
    parents: parents,
    dirName: dirName,
    nodeName:
      parents.length == 0
        ? 'root'
        : pathArray
            .map((dir) => dir.replace(/[^0-9a-z]/gi, ''))
            .map((dir) => dir[0].toUpperCase() + dir.slice(1))
            .join(''),
    files: dirContents.files,
    subdirs: dirContents.dirs.map((dir) => buildDirTree(dir, pathArray)),
  }
}

const assembleNodeSource = (node: TDirTreeNode): Array<string> => {
  var sourceArray: Array<string> = []

  const parentString =
    node.parents.length > 0 ? `${node.parents.join('/')}/` : ''

  console.log(`Generating ${parentString}${node.dirName}...`)

  // Files node first, if there are any
  if (node.files.length > 0) {
    // In case there's a subdir that's using our suffix
    var suffix = FILES_NODE_SUFFIX
    while (node.subdirs.map((sd) => sd.dirName).includes(suffix)) {
      suffix += 'x'
    }

    const filesList = node.files.join('<br>')

    sourceArray.push(
      `${node.nodeName} --> ${node.nodeName}${suffix}${
        NODE_SHAPES[E_NodeShapes.Square].open
      }${filesList}${NODE_SHAPES[E_NodeShapes.Square].close}`,
    )
  }

  // Then link to subdir nodes
  // We're not recursing into these here; just creating the links in the source
  node.subdirs.forEach((sd) => {
    sourceArray.push(
      `${node.nodeName} --> ${sd.nodeName}${
        NODE_SHAPES[E_NodeShapes.Rounded].open
      }${sd.dirName}/${NODE_SHAPES[E_NodeShapes.Rounded].close}`,
    )
  })

  // Then assign the directory-node class
  // If this is the _true_ root node, we have to name it here
  if (node.parents.length == 0) {
    sourceArray.push(
      `${node.nodeName}${NODE_SHAPES[E_NodeShapes.Rounded].open}${
        node.dirName
      }/${NODE_SHAPES[E_NodeShapes.Rounded].close}:::${DIR_NODE_NAME}`,
    )
  } else {
    sourceArray.push(`${node.nodeName}:::${DIR_NODE_NAME}`)
  }

  return sourceArray
}

const assembleAllNodeSources = (root: TDirTreeNode): Array<Array<string>> => {
  const sourcesArray: Array<Array<string>> = []

  sourcesArray.push(assembleNodeSource(root))

  root.subdirs.forEach((sd) => {
    sourcesArray.push(...assembleAllNodeSources(sd))
  })

  return sourcesArray
}

const composeMermaidSource = (sourcesArray: Array<Array<string>>): string => {
  // Initialize the list of source lines
  const mermaidSourceLines = [
    SRC_OPEN_LINE,
    THEME_SETTINGS,
    'graph LR',
    ' '.repeat(INDENT_WIDTH) + `${DIR_NODE_DEF}`,
    '',
  ]

  sourcesArray.forEach((arr, index) => {
    console.log(`Rendering block ${index}...`)

    arr.forEach((line) => {
      mermaidSourceLines.push(' '.repeat(INDENT_WIDTH) + line)
    })
    mermaidSourceLines.push('')
  })

  mermaidSourceLines.push(SRC_CLOSE_LINE)

  return mermaidSourceLines.join('\n')
}

const injectMermaidSource = (
  inputSource: string,
  mermaidSource: string,
): string => {
  const startMarkerIndex = inputSource.search(MARKER_REGEX_START)
  const stopMarkerIndex = inputSource.search(MARKER_REGEX_STOP)

  if (startMarkerIndex < 0) {
    throw `Diagram start marker not found! (${MARKER_STRING_START})`
  }

  const injectedSource = `${MARKER_STRING_START}\n\n${mermaidSource}\n\n${MARKER_STRING_STOP}`

  if (stopMarkerIndex < 0) {
    // We replace the lone start marker with the start marker, the source,
    // and the stop marker
    return inputSource.replace(MARKER_REGEX_START, injectedSource)
  } else {
    // We replace the content between the start and stop markers with the
    // source
    return inputSource.replace(MARKER_REGEX_SPAN, injectedSource)
  }
}

export const renderDirs = (
  // For testing
  rootNode: TDirTreeNode,
  showFiles: boolean = true,
  indentStep: number = 2,
): void => {
  renderDirsInternal(rootNode, showFiles, 0, indentStep)
}

export const renderDirsInternal = (
  rootNode: TDirTreeNode,
  showFiles: boolean,
  indent: number = 0,
  indentStep: number = 2,
): void => {
  const newIndent = indent + indentStep

  console.log(
    ' '.repeat(indent) + rootNode.dirName + '/' + `  (${rootNode.nodeName})`,
  )

  if (showFiles) {
    rootNode.files.forEach((f) => console.log(' '.repeat(newIndent) + '- ' + f))
  }

  rootNode.subdirs.forEach((sd) => {
    renderDirsInternal(sd, showFiles, newIndent, indentStep)
  })
}

const updateArchFile = (): void => {
  process.stdout.write('Loading ARCHITECTURE.md...')
  const archSource = fs.readFileSync('ARCHITECTURE.md').toString()
  console.log('OK\n')

  const mermaidSource = composeMermaidSource(
    assembleAllNodeSources(buildDirTree('src')),
  )

  process.stdout.write('\nWriting new ARCHITECTURE.md...')
  fs.writeFileSync(
    'ARCHITECTURE.md',
    injectMermaidSource(archSource, mermaidSource),
  )
  console.log('OK')
}

updateArchFile()
