import {database} from '../database';

export async function getAds() {
    return await database.query('select id, data, create_date as createDate, update_date as updateDate from ad',
        {type: database.QueryTypes.SELECT});
}

export async function createAd(ad) {
    ad.createDate = new Date().toISOString();

    await database.query(
        `insert into ad(id, data, create_date) values(:id, :data, :createDate)`, {
            replacements: {...ad, data: JSON.stringify(ad.data || null)}
        });

    return ad;
}

export async function updateAd(ad) {
    ad.updateDate = new Date().toISOString();

    await database.query(
        `update ad set data = :data, update_date = :updateDate where id = :id`, {
            replacements: {...ad, data: JSON.stringify(ad.data || null)}
        });

    return ad;
}