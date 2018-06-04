import axios from 'axios';
import cheerio from 'cheerio';
import {createAd, getAds} from './ads.repository';

const DOMAIN = 'https://www.seloger.com';
const SEARCH_URL = DOMAIN + '/list.htm';

function fetchAdsByPage(options = {pageNumber: 1}) {
    return axios.get(SEARCH_URL, {
        params: {
            'engine-version': 'new',
            natures: '1,2,4',
            places: '[{ci:750114}]',
            price: '400000/530000',
            projects: '2',
            qsversion: '1.0',
            rooms: '2,3',
            sort: 'd_dt_crea',
            surface: '40/NaN',
            types: '1',
            'LISTING-LISTpg': options.pageNumber
        }
    });
}

const agencyToJSON = $ => element => {
    const agencyBlock = $('.c-pa-agency a', element);

    let agency;

    if (agencyBlock.length) {
        const agencyUrl = agencyBlock.attr('href');
        const agencyId = agencyBlock.attr('href').match(/-(\d+).htm/)[1];
        agency = {
            id: agencyId,
            url: agencyUrl
        };
    } else {
        agency = {
            name: $('.c-pa-agency span', element).text()
        }
    }

    return agency;
};

const adToJSON = $ => (index, element) => {
    const id = element.attribs['data-listing-id'];
    const price = Number($('.c-pa-cprice', element).text().replace(/[^\d]+/g, ''));
    const criterion = $('.c-pa-criterion', element);
    const cover = JSON.parse($('.c-pa-imgs [data-lazy]', element).get(0).attribs['data-lazy']);
    const url = $('.c-pa-link', element).attr('href');
    const agency = agencyToJSON($)(element);

    const [rooms, bedrooms, space] = $('em', criterion)
        .map((index, element) => parseInt(element.childNodes[0].data))
        .get();

    return {
        id,
        price,
        rooms,
        bedrooms,
        space,
        url,
        cover: cover.url,
        agency
    }
};

function loadAds(page) {
    const $ = cheerio.load(page);
    const $list = $('.c-pa-list');

    const items = $list.map(adToJSON($)).get();
    const [, pageNumber, pageCount] = $('.mobile-pagination-number')
        .text().match(/(\d).*\/.*(\d)/).map(item => parseInt(item))

    return {
        items,
        pageNumber,
        pageCount
    };
}

export async function findAllAds() {
    let pageNumber = 1;
    let results;
    let items = [];
    let pageItems = [];

    const localAds = await getAds();
    const mapLocalAds = {};
    localAds.forEach(ad => mapLocalAds[ad.id] = ad);

    try {
        do {
            let {data} = await fetchAdsByPage(pageNumber);
            results = loadAds(data);

            pageItems = await Promise.all(results.items
                .map(async ad => {
                    let localAd = mapLocalAds[ad.id];

                    if (!localAd) {
                        localAd = await createAd({id: ad.id, data: {new: true}})
                    }

                    return {
                        ...ad,
                        ...localAd
                    }
                }));

            items = [...items, ...pageItems];

            pageNumber++;
        } while (results.pageNumber >= results.pageCount);
    } catch (error) {
        console.error('Error during process', error);
        throw new Error('Error during process');
    }

    return items;
}