const PORT = 10712;
const ALLOWED_ORIGIN = 'https://maga32.notion.site';
const API_PATH = '/util/notion';

const http = require('node:http');
const value = record => record.value.value || record.value;

// Fetch a public database as a JSON array keyed by column names.
async function notionTable(address) {
    const url = new URL(address);
    if (url.origin !== ALLOWED_ORIGIN) throw Error('Forbidden');
    const id = url.pathname.replace(/-/g, '').match(/[a-f0-9]{32}$/i)?.[0];
    if (!id) throw Error('Missing Notion page ID.');
    const pageId = id.replace(/(.{8})(.{4})(.{4})(.{4})(.{12})/, '$1-$2-$3-$4-$5');
    const request = async (method, body) => {
        const response = await fetch(ALLOWED_ORIGIN + '/api/v3/' + method, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(body)
        });
        if (!response.ok) throw Error('Notion HTTP ' + response.status);
        const result = await response.json();
        if (result.errorId) throw Error('Notion query failed.');
        return result;
    };
    const page = await request('loadPageChunk', {pageId, limit:100, cursor:{stack:[]}, chunkNumber:0, verticalColumns:false});
    const block = value(page.recordMap.block[pageId]);
    const collectionId = block.collection_id || block.format?.collection_pointer?.id;
    if (!collectionId) throw Error('Not a database page.');
    const collection = value(page.recordMap.collection[collectionId]);
    let result, rows;
    let limit = 100;
    do {
        result = await request('queryCollection', {
            collection: {id:collection.id, spaceId:collection.space_id},
            collectionView: {id:block.view_ids[0], spaceId:collection.space_id},
            loader: {type:'reducer', reducers:{collection_group_results:{type:'results', limit}}, searchQuery:'', userTimeZone:'Asia/Seoul'}
        });
        rows = result.result.reducerResults.collection_group_results;
        limit *= 2;
    } while (rows.hasMore);
    return rows.blockIds.map(id => {
        const properties = value(result.recordMap.block[id]).properties;
        const fields = Object.entries(collection.schema).map(([key, field]) =>
            [field.name, (properties[key] || []).map(part => part[0]).join('')]);
        return {id, ...Object.fromEntries(fields)};
    });
}

// GET /util/notion?url=PUBLIC_NOTION_DATABASE_URL
http.createServer(async (req, res) => {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader('Access-Control-Allow-Origin', '*');
    const url = new URL(req.url, 'http://localhost');
    if (req.method !== 'GET' || url.pathname !== API_PATH) return res.writeHead(404).end();
    try {
        res.end(JSON.stringify(await notionTable(url.searchParams.get('url'))));
    } catch (error) {
        res.writeHead(400);
        res.end(JSON.stringify({error:error.message}));
    }
}).listen(PORT);
