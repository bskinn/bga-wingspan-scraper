const { program } = require('commander')
const fs = require('fs')

manifest = JSON.parse(fs.readFileSync('manifest_template.json'))

program
  .argument('<dest>', 'Directory to render the manifest')
  .argument('[prefix]', 'Directory prefix for built .js location', '.')
  .action((dest, prefix) => {
    manifest.content_scripts[0].js.push(`${prefix}/wingspan.js`)
    fs.mkdirSync('build-dev', { recursive: true })
    fs.writeFileSync(`${dest}/manifest.json`, JSON.stringify(manifest, null, 2))
  })

program.parse()
