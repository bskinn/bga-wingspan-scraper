const { program } = require('commander')
const fs = require('fs')

type TDirName = string
type TFileName = string
type TDirContents = { dirs: Array<TDirName>; files: Array<TFileName> }
type TDirTreeNode = {
  dirName: TDirName
  parents: Array<TDirName>
  subdirs: Array<TDirTreeNode>
  files: Array<TFileName>
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

const NODE_SHAPES = {
  square: ['[', ']'],
  rounded: ['(', ')'],
}

const SRC_OPEN_LINE = '```mermaid'
const SRC_CLOSE_LINE = '```'

const THEME_SETTINGS = `%%{init: {'theme': 'base', 'themeVariables': {'fontSize': '${FONT_SIZE}px', 'lineColor': '${LINE_COLOR}', 'primaryColor': '${FILES_FILL_COLOR}', 'primaryTextColor': '${FILES_TEXT_COLOR}', 'primaryBorderColor': '${FILES_BORDER_COLOR}'}}}%%`

const DIR_NODE_DEF = `classDef ${DIR_NODE_NAME} fill: ${DIR_FILL_COLOR}, stroke: ${DIR_BORDER_COLOR}, color: ${DIR_TEXT_COLOR}`

// Initialize the list of source lines
var mermaidSrcLines = [
  SRC_OPEN_LINE,
  THEME_SETTINGS,
  'graph LR',
  `  ${DIR_NODE_DEF}`,
]

// Given a directory, grab the lists of files and directories in it
const getDirContents = (dirPath: string): TDirContents => {
  const files: Array<TFileName> = []
  const dirs: Array<TDirName> = []

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

  return {
    parents: parents,
    dirName: dirName,
    files: dirContents.files,
    subdirs: dirContents.dirs.map((dir) => buildDirTree(dir, pathArray)),
  }
}

const renderDirs = (
  rootNode: TDirTreeNode,
  indent: number = 0,
  indentStep: number = 2,
): void => {
  const newIndent = indent + indentStep

  console.log(' '.repeat(indent) + rootNode.dirName + '/')
  rootNode.files.forEach((f) => console.log(' '.repeat(newIndent) + '- ' + f))
  rootNode.subdirs.forEach((sd) => {
    renderDirs(sd, newIndent, indentStep)
  })
}

renderDirs(buildDirTree('src'))
