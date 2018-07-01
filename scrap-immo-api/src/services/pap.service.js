import axios from 'axios';

const API_DOMAIN = 'https://ws.pap.fr';

// https://ws.pap.fr/immobilier/annonces?recherche[nb_pieces][min]=2&recherche[surface][min]=40&recherche[prix][max]=550000&recherche[geo][ids][]=37781

// https://www.pap.fr/json/ac-geo?q=75

class PapService {
    constructor() {
        this.zipToPlace = {};
        this.placeToZip = {};
    }

    async findInternalZipCode(zipCode) {
        const {data} = await axios
            .get('https://www.pap.fr/json/ac-geo', {
                params: {
                    q: zipCode
                }
            });

        if (!data.length) {
            return;
        }

        const place = data[0];

        this.zipToPlace[zipCode] = place.id;
        this.placeToZip[place.id] = zipCode;

        return place.id;
    }

    getAnnounces({zipInternalCodes}) {
        const placeIds = zipInternalCodes
            .map(code => 'recherche[geo][ids][]=' + code)
            .join('&');

        return axios
            .get(API_DOMAIN + '/immobilier/annonces?' +
                'recherche[nb_pieces][min]=2&' +
                'recherche[surface][min]=40&' +
                'recherche[prix][min]=400000&' +
                'recherche[prix][max]=550000&' +
                placeIds)
            .then(response => response.data);
    }

    async getAnnounce(id) {
        const {data} = await axios.get(`${API_DOMAIN}/immobilier/annonces/${id}`)
        return data;
    }

    async findAllAnnounces({zipCodes}) {
        const zipInternalCodes = await Promise.all(zipCodes.map(this.findInternalZipCode.bind(this)));

        const announces = await this.getAnnounces({zipInternalCodes});

        return Promise.all(announces._embedded.annonce.map(async ({id}) => {
            const announce = await this.getAnnounce(id);

            const _embedded = announce._embedded;
            const zip = _embedded.place ? this.placeToZip[_embedded.place[0].id] : null;
            const cover = _embedded.photo ? _embedded.photo[0]._links.self.href : null;
            const updatedDate = new Date(announce.date_classement * 1000).toISOString();

            return {
                id: announce.id,
                zip,
                price: announce.prix,
                rooms: announce.nb_pieces,
                floor: null,
                bedrooms: announce.nb_chambres_max,
                space: announce.surface,
                url: announce._links.desktop.href,
                cover,
                agency: null,
                description: announce.texte,
                tags: [],
                vendorUpdateDate: updatedDate,
                vendorCreatedDate: updatedDate,
                vendor: 'pap'
            }
        }))
    }
}

export const papService = new PapService();