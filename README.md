# Notion Table DB

Read a public Notion database as JSON. Requires Node.js; no npm install needed.

## Configuration

Edit `PORT`, `ALLOWED_ORIGIN` (allowed Notion site), and `API_PATH` at the top of `notion-table.js`.

## Run

```sh
./start.sh
./stop.sh
```

Or run directly: `node notion-table.js`.

## Request

```js
fetch('http://localhost:10712/util/notion?url=' + encodeURIComponent(notionUrl))
  .then(response => response.json());
```

Returns an array of rows with `id` and column names as keys. Rows without properties and missing fields are omitted. Numbers and checkboxes retain their types. Files and multi-select values are arrays; people and relations are ID arrays. Dates return the start date. Text, titles, selects, emails, phone numbers, and URLs are strings. Unsupported types return `"Not supported"`.

Uses Notion's unofficial API, which may change.
