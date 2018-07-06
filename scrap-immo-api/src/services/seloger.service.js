import axios from 'axios';
import {parseString} from 'xml2js';

const API_DOMAIN = 'http://ws.seloger.com';

async function findInternalZipCode(zipCode) {
    const response = await axios.get('https://autocomplete.svc.groupe-seloger.com/auto/complete/0/ALL/6', {
        params: {
            text: zipCode
        }
    });

    const codes = response.data;

    if (!codes && codes.length === 0) {
        return null;
    }

    return codes[0].Params.ci;
}

export function apiLoadAds({zipInternalCodes = '750114', pageNumber = 1}) {
    return axios
        .get(API_DOMAIN + '/search.xml', {
            params: {
                ci: zipInternalCodes.join(','),
                idtt: 2,
                idtypebien: 1,
                naturebien: '1,2,4',
                nb_pieces: '2,3',
                pxbtw: '400000/530000',
                surfacebtw: '40/NaN',
                'SEARCHpg': pageNumber
            }
        })
        .then(response => response.data)
        .then(data => new Promise(resolve => parseString(data, {explicitArray: false}, (err, result) => resolve(result))))
        .catch(error => {
            console.error('Error when getting seloger announces', error);
        })
}

function apiLoadAdsTransformed(options) {
    return apiLoadAds(options)
        .then(({recherche}) => {
            const annonces = recherche.annonces;
            const items = (annonces ? annonces.annonce : [])
                .map(ad => {
                    const bedrooms = ad.nbChambre;
                    const descriptif = ad.descriptif.toLowerCase();
                    const findFloor = descriptif.match(/([^ ]+) étage/);
                    const photosLength = Number(ad.nbPhotos);
                    let cover;

                    if (photosLength > 0) {
                        const picture = Array.isArray(ad.photos.photo) ? ad.photos.photo[0] : ad.photos.photo;
                        cover = picture ? picture.stdurl : '';
                    }

                    return {
                        id: ad.idAnnonce,
                        zip: ad.cp,
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

export async function findAllAds({zipCodes = ['75014']}) {
    let pageNumber = 1;
    let results;
    let items = [];

    const zipInternalCodes = await Promise.all(zipCodes.map(findInternalZipCode));

    do {
        results = await apiLoadAdsTransformed({zipInternalCodes, pageNumber});
        pageNumber++;

        items = [...items, ...results.items];

        console.log('pageNumber', results.pageNumber, results.pageCount)

    } while (results.pageNumber < results.pageCount);

    return items;
}