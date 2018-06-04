import Koa from 'koa';
import route from 'koa-route';
import bodyParser from 'koa-bodyparser';
import cors from '@koa/cors';
import {findAllAds} from './ads.service';
import {updateAd} from './ads.repository';

const app = new Koa();

app.use(cors());
app.use(bodyParser());

app.use(route.get('/', ctx => {
    ctx.body = 'Hello world';
}));

app.use(route.get('/ads', async (ctx) => {
    console.log('route /ads')
    ctx.body = await findAllAds();
}));

app.use(route.put('/ads/:id', async (ctx, id) => {
    console.log('route /ads/' + id, ctx.request.body);

    ctx.body = await updateAd(ctx.request.body)
}));

const port = process.env.PORT || 3000;

console.log('Started at port ', port)

app.listen(port);