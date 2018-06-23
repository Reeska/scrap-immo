import axios from 'axios';

const API_DOMAIN = 'https://ws.pap.fr';

// https://ws.pap.fr/immobilier/annonces?recherche[nb_pieces][min]=2&recherche[surface][min]=40&recherche[prix][max]=550000&recherche[geo][ids][]=37781

export function getAnnounces() {
    return axios
        .get(API_DOMAIN + '/immobilier/annonces?' +
            'recherche[nb_pieces][min]=2&' +
            'recherche[surface][min]=40&' +
            'recherche[prix][min]=400000&' +
            'recherche[prix][max]=550000&' +
            'recherche[geo][ids][]=37781')
        .then(response => response.data);
}

export async function findAllAnnounces() {
    const announces = await getAnnounces();

    return announces._embedded.annonce.map(announce => {
        return {
            id: announce.id,
            price: announce.prix,
            rooms: announce.nb_pieces,
            floor: null,
            bedrooms: announce.nb_chambres_max,
            space: announce.surface,
            url: announce._links.desktop.href,
            cover: announce._embedded.photo[0]._links.self.href,
            agency: null,
            description: null,
            tags: [],
            vendorUpdateDate: null,
            vendorCreatedDate: null,
            vendor: 'pap'
        }
    })
}