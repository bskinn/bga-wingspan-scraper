# Architecture

This document describes the high-level architecture of this TypeScript-based
Firefox extension project. If you're trying to familiarize yourself with the
codebase, this is the place to start!

<!-- toc -->

- [High-Level Description](#high-level-description)
- [Tooling](#tooling)
- [Code Map](#code-map)
  * [Directory Structure](#directory-structure)
  * [Code Semantics](#code-semantics)

<!-- tocstop -->

## High-Level Description

...

## Tooling

- TypeScript
- Webpack
- Prettier

## Code Map

### Directory Structure

<!-- mermaid-fs-diagram -->

```mermaid
%%{init: {'theme': 'base', 'themeVariables': {'fontSize': '10px', 'lineColor': '#003812', 'primaryColor': '#E8FFE0', 'primaryTextColor': '#000', 'primaryBorderColor': '#D3F1C8'}}}%%
graph LR
  classDef dirNode fill: #136F17, stroke: #D3F1C8, color: #fff

  root --> rootFiles[consts.ts<br>dev-scores.ts<br>enums.ts<br>main.ts]
  root --> SrcChecks(checks/)
  root --> SrcData(data/)
  root --> SrcHelpers(helpers/)
  root --> SrcMappings(mappings/)
  root --> SrcScrape(scrape/)
  root --> SrcTypes(types/)
  root --> SrcUi(ui/)
  root(src/):::dirNode

  SrcChecks --> SrcChecksFiles[moves.ts]
  SrcChecks:::dirNode

  SrcData --> SrcDataFiles[bird-augs.ts<br>birds.ts<br>moves.ts<br>round-bonus-board.ts<br>scores.ts<br>table.ts]
  SrcData:::dirNode

  SrcHelpers --> SrcHelpersFiles[array.ts<br>async.ts<br>card-index.ts<br>export.ts<br>logging.ts<br>move-control.ts<br>state.ts<br>string.ts]
  SrcHelpers:::dirNode

  SrcMappings --> SrcMappingsFiles[bird-mapping.ts<br>bonus-card-mapping.ts<br>round-bonus-chip-mapping.ts]
  SrcMappings:::dirNode

  SrcScrape --> SrcScrapeFiles[scores.ts]
  SrcScrape:::dirNode

  SrcTypes --> SrcTypesFiles[types-ids.ts<br>types-score-scrape.ts]
  SrcTypes:::dirNode

  SrcUi --> SrcUiFiles[ui.ts]
  SrcUi:::dirNode

```

<!-- mermaid-fs-diagram-stop -->

### Code Semantics
