const axios = require('axios');
const key = require('../config/key');
const baseUrl = require('../config/url');

const areaBasedSearch = async (areaCode, pageNo, callback) => {
    const searchUrl = baseUrl.tourUrl;
    const areaBasedSearchUrl = `${searchUrl}/areaBasedList1`;
    const serviceKey = decodeURIComponent(key.publicTourKey);

    try {
        const response = await axios.get(
            areaBasedSearchUrl,
            {
                params : {
                    serviceKey : serviceKey,
                    MobileOS : 'WIN',
                    MobileApp : 'tourTest',
                    numOfRows : 12,
                    pageNo : pageNo,
                    _type : 'json',
                    listYN : 'Y',
                    arrange: 'A',
                    areaCode : areaCode,
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

module.exports = areaBasedSearch;