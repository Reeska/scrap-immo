import axios from 'axios';
import cheerio from 'cheerio';
import {parseString} from 'xml2js';
import {createAd, getAds} from './ads.repository';

const DOMAIN = 'https://www.seloger.com';
const SEARCH_URL = DOMAIN + '/list.htm';

const API_DOMAIN = 'http://ws.seloger.com';

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

async function loadAds(page) {
    const $ = cheerio.load(page);
    const $list = $('.c-pa-list');

    const items = $list.map(adToJSON($)).get();
    const [, pageNumber, pageCount] = $('.mobile-pagination-number')
        .text().match(/(\d).*\/.*(\d)/).map(item => parseInt(item))

    const itemsWithDetail = await Promise.all(items.map(async item => {
        const detailPage = await axios.get(item.url);

        console.log('detailPage', detailPage);

        const detail = loadAdDetail(detailPage);

        return {
            ...item,
            ...detail
        }
    }));

    return {
        items: itemsWithDetail,
        pageNumber,
        pageCount
    };
}

function loadAdDetail(page) {
    const $ = cheerio.load(page);

    const description = $('#js-descriptifBien').text();

    return {
        description
    };
}

// ci=750114&idtt=2&idtypebien=1&naturebien=1,2,4&nb_pieces=2,3&pxbtw=400000/530000&surfacebtw=40/NaN

export function apiLoadAds(options = {pageNumber: 1}) {
    return axios
        .get(API_DOMAIN + '/search.xml', {
            params: {
                ci: '750114',
                idtt: 2,
                idtypebien: 1,
                naturebien: '1,2,4',
                nb_pieces: '2,3',
                pxbtw: '400000/530000',
                surfacebtw: '40/NaN',
                'SEARCHpg': options.pageNumber
            }
        })
        .then(response => response.data)
        .then(data => new Promise(resolve => parseString(data, {explicitArray: false}, (err, result) => resolve(result))))
}

function apiLoadAdsTransformed(options = {pageNumber: 1}) {
    return apiLoadAds(options)
        .then(({recherche}) => {
            const items = recherche.annonces.annonce
                .map(ad => {
                    const cover = Array.isArray(ad.photos.photo) ? ad.photos.photo[0].stdUrl : ad.photos.photo.stdUrl;
                    const bedrooms = ad.nbChambre;

                    const tags = [];
                    const descriptif = ad.descriptif.toLowerCase();

                    if (/porte d'orléans/.test(descriptif)) { tags.push('porteOrleans'); }
                    if (/plaisance/.test(descriptif)) { tags.push('plaisance'); }
                    if (/sans ascenseur/.test(descriptif)) { tags.push('sansAscenseur'); }
                    if (/didot/.test(descriptif)) { tags.push('didot'); }
                    if (/pernety/.test(descriptif)) { tags.push('pernety'); }
                    if (/cité universitaire/.test(descriptif)) { tags.push('citéUniversitaire'); }

                    const findFloor = descriptif.match(/([^ ]+) étage/);

                    return {
                        id: ad.idAnnonce,
                        price: ad.prix,
                        rooms: ad.nbPiece,
                        floor: findFloor ? findFloor[1] : null,
                        bedrooms,
                        space: ad.surface,
                        url: ad.permaLien,
                        cover,
                        agency: ad.contact && ad.contact.nom,
                        description: ad.descriptif,
                        tags,
                        vendorUpdateDate: ad.dtFraicheur,
                        vendorCreatedDate: ad.dtFraicheur
                    }
                });

            return {
                pageNumber: parseInt(recherche.pageCourante),
                pageCount: parseInt(recherche.pageMax),
                items
            }
        })
}


export async function findAllAds() {
    let pageNumber = 1;
    let results;
    let items = [];

    do {
        results = await apiLoadAdsTransformed({pageNumber});
        pageNumber++;

        items = [...items, ...results.items];

        console.log('pageNumber', results.pageNumber, results.pageCount)

    } while (results.pageNumber < results.pageCount);

    const localAds = await getAds();
    const mapLocalAds = {};
    localAds.forEach(ad => mapLocalAds[ad.id] = ad);

    return Promise.all(items
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
}

export async function findAllAdsOld() {
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
            results = await loadAds(data);

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