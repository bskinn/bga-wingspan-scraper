# bga-wingspan-scraper
JS helper script and nascent Firefox extension to generate JSON output
of the score history of a Wingspan game on [Board Game Arena].

This code has been developed and tested using Firefox around v118.

## Direct Use in Console

1. Navigate to a Wingspan replay page.
2. Open the Console.
3. Copy & paste the entirety of `scrape_scores.js` into the console and execute.
4. Run `checkMoveListLength()` and `checkFullPlaySequence()` and ensure both
   return `true`
   - If they don't, try:
     - Loading the replay from the perspective of a different player, and/or
     - Adjusting the value of `player_id` in the `comments=<player_id>`
       parameter in the page URL to that of a different player involved in the
       game
5. Run `scrapeAndSave()`. The script will start advancing through the game and
   scraping the scores. Once complete, it will automatically trigger download of
   the data files.

## Use Via Local Firefox Extension

### How to Install

1. Clone the repo.
2. Open Firefox and navigate to `about:debugging`
3. Select "This Firefox" from the sidebar
4. Click `Load Temporary Add-on...`
5. Browse to the repo root and select `manifest.json`
   - Though, I think any file will work, you're really picking the directory

### How to Use

1. Navigate to a Wingspan game replay
   - A set of overlay buttons should appear at the bottom left of the browser
     window
2. Click `Check Move List` and `Check Play Sequence` to be sure that the move
   context scraping is working as expected. Both should show popup boxes
   containing `true`
3. Click `Scrape Scores`. The script will start advancing through the game and
   scraping the scores. Once complete, it will automatically trigger download of
   the data files.

## Data Output

The `scrapeAndSave()` script should automatically offer for download the scraped
score data using the default download method configured in Firefox's settings.

Two files should be downloaded: one plaintext JSON file, and one file containing
a base64-encoded string. Both files contain the same data. To read the b64 data
in Python, use `encoding='latin-1'`.

The files are named with the BGA table ID and a timestamp of when the data was
scraped:

```
<table_id>-YYYYMMDD_HHMMSS.<ext>
```

*(needs schema of this JSON)*

[board game arena]: https://boardgamearena.com
