const axios = require('axios');
const key = require('../config/key');
const baseUrl = require('../config/url');

const detail = async (contentId, contentTypeId, callback) => {
    const searchUrl = baseUrl.tourUrl;
    const detailUrl = `${searchUrl}/detailCommon1`;
    const serviceKey = decodeURIComponent(key.publicTourKey);

    try {
        const response = await axios.get(
            detailUrl,
            {
                params : {
                    serviceKey : serviceKey,
                    MobileOS : 'WIN',
                    MobileApp : 'tourTest',
                    numOfRows : 12,
                    contentId : contentId,
                    pageNo : 1,
                    _type : 'json',
                    contentTypeId : contentTypeId,
                    defaultYN : 'Y',
                    firstImageYN : 'Y',
                    areacodeYN : 'Y',
                    catcodeYN: 'Y',
                    addrinfoYN: 'Y',
                    mapinfoYN: 'Y',
                    overviewYN: 'Y',
                }
            }
        )

        const result = response.data.response?.body?.items.item;
        
        await callback(undefined, {result})
    } catch (error) {
        console.log(error);
    }

}

module.exports = detail;