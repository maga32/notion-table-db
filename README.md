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

Returns an array of rows with `id` and column names as keys. Property values are flattened to text; missing values are empty strings.

Uses Notion's unofficial API, which may change.
