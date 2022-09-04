const koa = require('koa');
const serve = require('koa-static');
import { handler as ssrHandler } from './dist/server/entry.mjs';

const app = koa();
// app.use(express.static('dist/client/'));
app.use(serve('dist/client/', {}));
app.use(ssrHandler);

app.listen(3001);
