import axios from 'axios';
import {parseString} from 'xml2js';
import {createAd, getAds} from './announces.repository';

const API_DOMAIN = 'http://ws.seloger.com';

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
                    const descriptif = ad.descriptif.toLowerCase();
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
                        vendorUpdateDate: ad.dtFraicheur,
                        vendorCreatedDate: ad.dtFraicheur,
                        vendor: 'seloger'
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

    return items;

    // const localAds = await getAds();
    // const mapLocalAds = {};
    // localAds.forEach(ad => mapLocalAds[ad.id] = ad);
    //
    // return Promise.all(items
    //     .map(async ad => {
    //         let localAd = mapLocalAds[ad.id];
    //
    //         if (!localAd) {
    //             localAd = await createAd({id: ad.id, data: {new: true}})
    //         }
    //
    //         return {
    //             ...ad,
    //             ...localAd
    //         }
    //     }));
}