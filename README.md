# bga-wingspan-scraper
Firefox extension to generate JSON output of the score history of a Wingspan
game on [Board Game Arena].

This code has been developed and tested using Firefox around v118-119.

<!-- toc -->

- [Installation](#installation)
  * [Release Version](#release-version)
  * [Latest Version](#latest-version)
- [Usage](#usage)
- [Output Data Format](#output-data-format)

<!-- tocstop -->

## Installation

You can either use a release version of the extension, or the latest version of
the code in the repo.

### Release Version 

1. Download the `.zip` file from the most recent [release].
2. Open Firefox and navigate to `about:debugging`.
3. Select "This Firefox" from the sidebar.
4. Click `Load Temporary Add-on...`.
5. Browse to and select the downloaded `.zip` file.

### Latest Version

1. Follow the [project setup] and [production build] instructions from
   `CONTRIBUTING.md`.
2. Open Firefox and navigate to `about:debugging`.
3. Select "This Firefox" from the sidebar.
4. Click `Load Temporary Add-on...`.
5. Browse to and select `build-prod/manifest.json`.


## Usage

1. Navigate to a Wingspan game replay.
   - A set of (currently crude) overlay buttons should appear at the bottom left
     of the browser window.
2. Click `Check Move List` and `Check Play Sequence` to be sure that the move
   context scraping is working as expected. Both should show popup boxes
   containing `true`
3. Click `Scrape Scores`. The script will start advancing through the game and
   scraping the scores. Once complete, it will automatically trigger download of
   the data files.

## Output Data Format

The `Scrape Scores` functionality should automatically offer for download the
scraped score data using the default download method configured in Firefox's
settings.

Two files should be downloaded: one plaintext JSON file, and one file containing
a base64-encoded string. Both files contain the same data. To read the b64 data
in Python, use `encoding='latin-1'`.

The files are named with the BGA table ID and a timestamp of when the data was
scraped:

```
<table_id>-YYYYMMDD_HHMMSS.<ext>
```

If you wish, feel free to use this [Google Colab notebook][colab notebook] to
create a plot of the game score results. Paste the contents of the `.b64` output
file into the definition for `fullData` and run the entire notebook.

*(needs schema of this JSON)*

[board game arena]: https://boardgamearena.com
[colab notebook]: https://colab.research.google.com/drive/1GiVKnavp4eZkOjkfGCuf6FaqlDpXI0U4?usp=sharing
[production build]: CONTRIBUTING.md#production-builds
[project setup]: CONTRIBUTING.md#project-setup
[release]: https://github.com/bskinn/bga-wingspan-scraper/releases
