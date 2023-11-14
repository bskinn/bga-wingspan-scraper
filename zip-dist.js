const fs = require('fs')
const AdmZip = require('adm-zip')

const pkgdata = JSON.parse(fs.readFileSync('package.json').toString())

var zip = new AdmZip()
zip.addLocalFolder('build-prod')

fs.mkdirSync('./dist', {recursive: true})
zip.writeZip(`./dist/bga-wingspan-scraper-${pkgdata.version}.zip`)
