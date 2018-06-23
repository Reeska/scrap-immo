import {findAllAnnounces} from './pap.service';
import {findAllAds} from './seloger.service';
import {createAd, getAds} from './announces.repository';

export async function getAnnounces() {
    const announcesArray = await Promise.all([findAllAnnounces(), findAllAds()]);

    const localAds = await getAds();
    const mapLocalAds = {};
    localAds.forEach(ad => mapLocalAds[ad.id] = ad);

    const augmentedAnnounces = announcesArray.reduce((accu, value) => [...accu, ...value], [])
        .map(transform)
        .map(augmented(mapLocalAds));

    return Promise.all(augmentedAnnounces);
}

function transform(announce) {
    const tags = [];
    const descriptif = (announce.description || '').toLowerCase();

    if (/porte d'orléans/.test(descriptif)) { tags.push('porteOrleans'); }
    if (/plaisance/.test(descriptif)) { tags.push('plaisance'); }
    if (/sans ascenseur/.test(descriptif)) { tags.push('sansAscenseur'); }
    if (/didot/.test(descriptif)) { tags.push('didot'); }
    if (/pernety/.test(descriptif)) { tags.push('pernety'); }
    if (/cité universitaire/.test(descriptif)) { tags.push('citéUniversitaire'); }

    return {
        ...announce,
        tags
    };
}

const augmented = mapLocalAds => async (announce) => {
    let localAd = mapLocalAds[announce.id];

    if (!localAd) {
        localAd = await createAd({id: announce.id, data: {new: true}})
    }

    return {
        ...announce,
        ...localAd
    }
};