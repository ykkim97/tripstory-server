const axios = require('axios');
const key = require('../config/key');
const baseUrl = require('../config/url');

const areaCode = async (pageNo, callback) => {
    const url = baseUrl.tourUrl;
    const areaCodeUrl = `${url}/areaCode1`;
    const serviceKey = decodeURIComponent(key.publicTourKey);

    try {
        const response = await axios.get(
            areaCodeUrl,
            {
                params : {
                    serviceKey : serviceKey,
                    MobileOS : 'WIN',
                    MobileApp : 'tourTest',
                    numOfRows : 17,
                    pageNo : pageNo,
                    _type : 'json',
                }
            }
        )
        const result = response.data.response?.body?.items.item;
        const totalCount = response.data.response?.body?.totalCount;

        // console.log('result ==> ' + JSON.stringify(result));

        await callback(undefined, {result, totalCount})
    } catch (error) {
        console.log(error);
    }
}

module.exports = areaCode;