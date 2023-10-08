# bga-wingspan-scraper
JS helper script to generate JSON output of the score history of a Wingspan game on BGA

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
5. Run `scrapeAndSave()`

## Firefox Extension

### How to Install


### How to Use


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