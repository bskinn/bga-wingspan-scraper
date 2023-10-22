const fs = require('fs')
const path = require('path')

const dirPath = './dist'

const commentOutNoise = (filePath) => {
  fs.readFile(filePath, 'utf-8', (err, data) => {
    if (err) {
      console.error(err)
      return
    }

    var workData = data.replaceAll(/^import /gm, (match) => `// ${match}`)
    workData = workData.replaceAll(/^"use strict"/gm, (match) => `// ${match}`)
    workData = workData.replaceAll(
      /^exports.default =/gm,
      (match) => `// ${match}`,
    )
    workData = workData.replaceAll(
      /^Object.defineProperty/gm,
      (match) => `// ${match}`,
    )

    fs.writeFile(filePath, workData, 'utf-8', (err) => {
      if (err) {
        console.error(err)
        return
      }
    })
  })
}

fs.readdir(dirPath, (err, files) => {
  if (err) {
    console.error('Error reading directory:', err)
    return
  }

  files.forEach((file) => {
    const filePath = path.join(dirPath, file)

    if (fs.statSync(filePath).isFile()) {
      commentOutNoise(filePath)
    }
  })
})
