const axios = require('axios');
const key = require('../config/key');
const baseUrl = require('../config/url');

const locationBasedSearch = async (mapX, mapY, pageNo, callback) => {
    const searchUrl = baseUrl.tourUrl;
    const locationBasedSearchUrl = `${searchUrl}/locationBasedList1`;
    const serviceKey = decodeURIComponent(key.publicTourKey);

    try {
        const response = await axios.get(
            locationBasedSearchUrl,
            {
                params : {
                    serviceKey : serviceKey,
                    MobileOS : 'WIN',
                    MobileApp : 'tourTest',
                    numOfRows : 10,
                    pageNo : pageNo,
                    _type : 'json',
                    listYN : 'Y',
                    arrange: 'A',
                    mapX : mapY, // x좌표
                    mapY : mapX, // y좌표
                    radius : 100, // 거리반경
                }
            }
        )

        // console.log(response.data.response?.body?.items, "response")
        console.log(response, "response")

        const result = response.data.response?.body?.items.item;
        const totalCount = response.data.response?.body?.totalCount;
        
        await callback(undefined, {result, totalCount})
    } catch (error) {
        console.log(error);
    }

}

module.exports = locationBasedSearch;