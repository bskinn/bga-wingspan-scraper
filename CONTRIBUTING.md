# Welcome!

Thanks for your interest in contributing to the BGA Wingspan Scraper Firefox
extension! The aim of this document is to provide the information you need to
get started smoothly on a contribution.

If you have any questions, please drop me a line on Twitter/X ([@btskinn]) or
Fosstodon ([@btskinn@fosstodon.org]) or open an [issue].

<!-- toc -->

- [Project Stack](#project-stack)
- [Project Setup](#project-setup)
- [Working with git](#working-with-git)
- [Building](#building)
  * [Dev Builds](#dev-builds)
  * [Production Builds](#production-builds)
- [Testing](#testing)
- [CHANGELOG](#changelog)
- [License](#license)

<!-- tocstop -->

## Project Stack

This is a TypeScript codebase set up with Prettier auto-formatting, which builds
to a single-file `.js` module via Webpack. For more detailed information on the
project architecture, see [`ARCHITECTURE.md`][arch].

## Project Setup

Before starting work on this project, you'll need to install a current version
of Node.js, either using a system package manager or by
[downloading an installer].

Start by forking the repo and cloning locally:

```bash
$ git clone https://github.com/{you}/bga-wingspan-scraper
```

Then, install the dependencies:

```bash
$ npm install
```

## Working with git

There's no way I can fit a whole git tutorial in here, so this just highlights a
couple of key functionalities you'll need.

First, always hack on a bugfix or feature in a new branch:

```
$ git checkout -b description-of-change
```

This makes it a lot simpler to get your repo fork up to date after `main`
receives further commits.

To bring your fork's `main` up to date, you first need to add the main repo as a
new git remote (one-time task):

```
$ git remote add upstream https://github.com/bskinn/bga-wingspan-scraper
```

Then, any time you need to refresh the fork's `main`:

```
$ git fetch --all
$ git checkout main
$ git merge upstream/main   # (should merge without incident)
$ git push                  # (should push to your fork without incident)
```

## Building

### Dev Builds

_(builds with source maps to allow in-browser debugging)_

### Production Builds

_(builds to mostly(?) minified source for smaller package size)_

## Testing

No automated tests are currently set up in the repo. In part, this is because
the only real source of truth is scraping a Wingspan game that we've manually
checked, and seeing if the data matches what we got before. _Maybe_ at some
point this will be worth fully automating, but it seems unlikely.

In the meantime, we do have some manually checked datasets available for the
score-scraping functionality (but not yet the total game scraping functionality)
that can be used for consistency testing:

1. Look for a dataset in either `/data` or `/olddata_yyyymmdd` that has a `-ts-`
   or a `-ref-` in the middle of it.
   - The `tablenum` for that dataset is the first number in the filename
2. Scrape the game at `https://boardgamearena.com/table?table=${tablenum}`.
3. Open this [score output checker Google Colab notebook][checker colab]
4. Paste the contents of the reference `.b64` data file into the definition for
   `all_data1`.
5. Paste the contents of the newly-scraped `.b64` data file into the definition
   for `all_data2`.
6. Run the entire notebook.

If the score scraping is consistent, the notebook should report that the table
IDs for the two datasets are the same, and that no data mismatch was found.

## CHANGELOG

The project
[`CHANGELOG`](https://github.com/bskinn/bga-wingspan-scraper/blob/main/CHANGELOG.md)
should be updated for the majority of contributions. No tooling is in place for
automated collation of news items into `CHANGELOG`; all changes should be
documented manually, directly in the `CHANGELOG`. Please follow the format
currently in use.

Any PR that touches the project code _must_ include a `CHANGELOG` entry. Other
changes of note (packaging/build tooling, test/lint tooling/plugins, tool
settings, etc.) may also warrant a `CHANGELOG` bullet, depending on the
situation. When in doubt, ask!

## License

All code and documentation contributions will respectively take on the MIT
License and CC BY 4.0 license of the project at large.

[@btskinn]: https://twitter.com/btskinn
[@btskinn@fosstodon.org]: https://fosstodon.org/@btskinn
[arch]: ARCHITECTURE.md
[checker colab]: https://colab.research.google.com/drive/1zS8b31zubwhNxfEV8egb_qrQIpfkRkd6?usp=sharing
[downloading an installer]: https://nodejs.org/en/download
[issue]: https://github.com/bskinn/sphobjinv/issues
