const axios = require('axios');
const key = require('../config/key');
const baseUrl = require('../config/url');

const search = async (keyword, pageNo, callback) => {
    const searchUrl = baseUrl.tourUrl;
    const keywordSearchUrl = `${searchUrl}/searchKeyword1`;
    const serviceKey = decodeURIComponent(key.publicTourKey);

    try {
        const response = await axios.get(
            keywordSearchUrl,
            {
                params : {
                    serviceKey : serviceKey,
                    MobileOS : 'WIN',
                    MobileApp : 'tourTest',
                    numOfRows : 12,
                    keyword : keyword,
                    pageNo : pageNo,
                    _type : 'json',
                    listYN : 'Y'
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

module.exports = search;