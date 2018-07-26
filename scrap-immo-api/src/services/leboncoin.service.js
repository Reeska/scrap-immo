import axios from 'axios';

const API_DOMAIN = 'https://api.leboncoin.fr';

class LeBoncoinService {
    getAnnounces({zipInternalCodes, priceMin = 400000, priceMax = 550000, sizeMin = 40, sizeMax}) {
        return axios
            .post(API_DOMAIN + '/finder/search', {
                "limit": 35,
                "limit_alu": 3,
                "filters": {
                    "category": {"id": "9"},
                    "enums": {"ad_type": ["offer"]},
                    "location": {
                        "city_zipcodes": [
                            {"city": "Paris", "zipcode": "75014", "label": "Paris (75014)"}
                        ],
                        "region": "12"
                    },
                    "keywords": {},
                    "ranges": {
                        "price": {"min": (parseInt(priceMin) || 0), "max": (parseInt(priceMax) || null)},
                        "rooms": {"min": 2},
                        "square": {"min": (parseInt(sizeMin) || 0)}
                    }
                }
            }, {
                headers: {
                    api_key: process.env.LEBONCOIN_API
                }
            })
            .then(response => response.data);
    }

    async findAllAnnounces({zipCodes, priceMin, priceMax, sizeMin, sizeMax}) {
        const {ads} = await this.getAnnounces({zipInternalCodes: zipCodes, priceMin, priceMax, sizeMin, sizeMax});

        return ads.map(announce => {
            const location = announce.location || {};
            const attributes = announce.attributes || [];

            const rooms = attributes.filter(attr => attr.key === 'rooms')
                .reduce((accu, attr) => attr.value, null);

            const space = attributes.filter(attr => attr.key === 'square')
                .reduce((accu, attr) => attr.value, null);

            const description = announce.body;
            const [,floor] = description.match(/([^ ]+) étage/) || [,null];

            return {
                id: announce.list_id,
                zip: location.zipcode,
                price: announce.price[0],
                rooms,
                floor,
                bedrooms: null,
                space,
                url: announce.url,
                cover: announce.images.thumb_url,
                agency: null,
                description,
                tags: [],
                vendorUpdateDate: announce.index_date,
                vendorCreatedDate: announce.first_publication_date,
                vendor: 'leboncoin'
            }
        })
    }
}

export const leboncoinService = new LeBoncoinService();