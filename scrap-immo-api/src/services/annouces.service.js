import {papService} from './pap.service';
import {findAllAds} from './seloger.service';
import {leboncoinService} from './leboncoin.service';
import {createAd, getAds} from './announces.repository';

const PORTE_ORLEANS = 'porteOrleans';
const CITE_UNIVERSITAIRE = 'citéUniversitaire';
const PERNETY = 'pernety';

export async function getAnnounces(params) {
    const announcesArray = await Promise.all([
        papService.findAllAnnounces(params),
        leboncoinService.findAllAnnounces(params),
        findAllAds(params)
    ]);

    const localAds = await getAds();
    const mapLocalAds = {};
    localAds.forEach(ad => mapLocalAds[ad.id] = ad);

    const augmentedAnnounces = announcesArray
        .reduce((accu, value) => [...accu, ...value], [])
        .map(transform)
        .map(augmented(mapLocalAds));

    return Promise.all(augmentedAnnounces);
}

function transform(announce) {
    const tags = [];
    const descriptif = (announce.description || '').toLowerCase();

    if (/porte d'orléans/.test(descriptif)) { tags.push(PORTE_ORLEANS); }
    if (/cité universitaire/.test(descriptif)) { tags.push(CITE_UNIVERSITAIRE); }
    if (/pernety/.test(descriptif)) { tags.push(PERNETY); }
    if (/plaisance/.test(descriptif)) { tags.push('plaisance'); }
    if (/sans ascenseur/.test(descriptif)) { tags.push('sansAscenseur'); }
    if (/didot/.test(descriptif)) { tags.push('didot'); }

    return {
        ...announce,
        tags
    };
}

const augmented = mapLocalAds => async (announce) => {
    let localAd = mapLocalAds[announce.id];

    if (!localAd) {
        const tags = announce.tags;
        const ignored = tags.includes(PORTE_ORLEANS) ||
            tags.includes(PERNETY) ||
            tags.includes(CITE_UNIVERSITAIRE);

        localAd = await createAd({id: announce.id, data: {new: !ignored, ignored}})
    }

    return {
        ...announce,
        ...localAd
    }
};