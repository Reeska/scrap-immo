import Koa from 'koa';
import route from 'koa-route';
import bodyParser from 'koa-bodyparser';
import cors from '@koa/cors';
import {apiLoadAds, findAllAds} from './services/seloger.service';
import {updateAd} from './services/ads.repository';
import {findAllAnnounces, getAnnounces} from './services/pap.service';

const app = new Koa();

app.use(cors());
app.use(bodyParser());

app.use(route.get('/', ctx => {
    ctx.body = 'Hello world';
}));

app.use(route.get('/seloger', async (ctx) => {
    console.log('route /ads')
    ctx.body = await apiLoadAds();
}));

app.use(route.get('/pap', async (ctx) => {
    console.log('route /pap')
    ctx.body = await getAnnounces();
}));

app.use(route.get('/ads', async (ctx) => {
    console.log('route /ads')
    const pap = await findAllAnnounces();
    const seloger = await findAllAds();
    ctx.body = [...seloger, ...pap];
}));

app.use(route.put('/ads/:id', async (ctx, id) => {
    console.log('route /ads/' + id, ctx.request.body);

    ctx.body = await updateAd(ctx.request.body)
}));

const port = process.env.PORT || 3000;

console.log('Started at port ', port)

app.listen(port);