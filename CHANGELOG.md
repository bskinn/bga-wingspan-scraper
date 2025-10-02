## CHANGELOG: bga-wingspan-scraper

### Firefox extension to scrape data from a Wingspan game replay on Board Game Arena

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/).

This project follows a `yyyy.mm.dd.n` flavor of
[Calendar Versioning](https://calver.org/). The `n` value is sequential and
serves to distinguish between multiple releases created on the same day.

### _Unreleased_

#### Added

- Add 'advance to move #' option to UI custom commands ([#74]).

#### Changed

- Rename custom-command UI button to "Run Cmd" ([#74]).

#### Fixed

- Convert replay-advance logic to tolerate missing move numbers ([#74]).
  - Now uses lookup of move numbers out of the list of available moves, instead
    of assuming `n-1`.

#### Internal

- Expand `prettier` config ([#74]).

- Relocate dev helper scripts to `scripts/` folder.

- Add CI workflow to check formatting, TOCs, Mermaid on pull.

### Features at CHANGELOG Creation

- TypeScript codebase, webpacked, manifested, and zipped. Builds to a
  single-file artifact ready to be loaded into Firefox's 'Load Temporary Add-on'
  feature.

- Set up to scrape each player's score at the end of each 'turnset' (at the
  point when the active turn returns to the player with the first-turn token
  that round).

- Automatically advances the replay through the game history in order to put the
  page into the state needed to accurately scrape the scores.

- Includes a UI for debugging during development, lightweight consistency
  checking of key data for a given replay, and kickoff of the score-scraping
  process.

[#74]: https://github.com/bskinn/bga-wingspan-scraper/pull/74
