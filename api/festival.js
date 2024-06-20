const axios = require('axios');
const key = require('../config/key');
const baseUrl = require('../config/url');

const festival = async (startDate, pageNo, callback) => {
    const url = baseUrl.tourUrl;
    const festivalUrl = `${url}/searchFestival1`;
    const serviceKey = decodeURIComponent(key.publicTourKey);

    try {
        const response = await axios.get(
            festivalUrl,
            {
                params : {
                    serviceKey : serviceKey,
                    MobileOS : 'WIN',
                    MobileApp : 'tourTest',
                    numOfRows : 12,
                    pageNo : pageNo,
                    listYN : 'Y',
                    arrange : 'A',
                    eventStartDate : '20170901',
                    _type : 'json',
                }
            }
        )

        const result = response.data.response?.body?.items.item;
        const totalCount = response.data.response?.body?.totalCount;

        await callback(undefined, {result, totalCount})
    } catch (error) {
        console.log(error);
    }

}

module.exports = festival;