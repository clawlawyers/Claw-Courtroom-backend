const moment = require("moment");
const NewsRespository = require("../repositories/news-repository");
const { MEDIA_STACK_ACCESS_KEY } = require("../config/server-config");

async function fetchNews(news_type = 0) {
    // designed for a 1 hour cron job
    let keywords = [];
    let searchQuery = "";
    const newsRespository = new NewsRespository();
    if (news_type === 0) {
        keywords = ['gst', 'tax', 'budget', 'sebi', 'corporate', 'finance', 'rbi', 'indicator', 'economic', 'economy', 'audit', 'exchange', 'regulation', 'ibc', 'custom', 'excise', 'duties', 'market', 'fdi', 'payment', 'merger', 'acquisition', 'compliance', 'litigation']
    }
    else {
        keywords = ['adr', 'legal', 'privacy', 'laws', 'law', 'property', 'criminal', 'civil', 'court', 'cyber', 'corpoprate', 'case', 'right', 'rights', 'judicial', 'reform', 'legislation', 'constitution', 'high_court', 'supreme_court']
    }
    try {
        let errorCount = 0;
        // insert the updated news 
        searchQuery = keywords.join(" ");
        const response = await fetch("http://api.mediastack.com/v1/news?access_key=" + MEDIA_STACK_ACCESS_KEY + "&limit=100" + "&keywords=" + searchQuery + "&countries=in&date=" + moment().format("YYYY-MM-DD"));
        const parsedResponse = await response.json();

        const db_update = parsedResponse.data.map(async ({ title, description, url, published_at, image }) => {
            try {
                await newsRespository.create({
                    title,
                    description,
                    publishedAt: published_at,
                    imageUrl: image,
                    sourceUrl: url,
                    type: news_type
                })
            }
            catch (error) {
                errorCount++;
            }
        });
        await Promise.all(db_update);

        // delete older news - time threshold - 40 mins
        const deletedNews = await newsRespository.deleteOlderThan(news_type, moment().subtract(48, 'hours').toDate());
        console.log(deletedNews, "deletions");
    }
    catch (err) {
        console.log(err);
    }
}

module.exports = {
    fetchNews
}