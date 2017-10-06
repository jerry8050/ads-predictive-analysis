const Bluebird   = require('bluebird');
const mysql      = Bluebird.promisifyAll(require('mysql'));
const _          = require("lodash");
const connection = mysql.createConnection({
    onnectionLimit: 10,
    host:           'rdc-hack.c3d8n8cosrif.us-west-2.rds.amazonaws.com',
    user:           'root',
    password:       'realtor.com',
    database:       'ads_analysis'
});
const db         = Bluebird.promisifyAll(connection);

let sqlQuery = `SELECT
SUM(c.total_clicks) AS total_clicks, ad_position, ad_property_type,
    SUM(c.total_impressions) AS total_impressions, industry,
    c.segment_key,
    s.description
FROM
campaign_reports_test c,
    segments s
WHERE
c.segment_key = s.id and date > ? and date < ?
GROUP BY description, industry;`;


function addStats(items, stats = {}) {
    let avgScoreMap           = {};
    let totalImpressions      = 0;
    let totalClicks           = 0;
    let numberOfSegments      = 0;
    let totalClickThroughRate = 0;
    if (_.isArray(items)) {
        items.forEach(item => {
            numberOfSegments++;
            let totalSegmentValue = 0;
            item["click_through_rate"] = item.total_clicks && stats.totalImpressions ? parseFloat(((item.total_clicks / stats.totalImpressions) * 100).toFixed(5)) : 0;

            for (let key in item.industries) {
                let avgIndValue             = 0;
                let ind                     = item.industries[key];
                let totalSegmentImpressions = items.total_impressions || 0;
                let totalSegmentClicks      = items.total_clicks || 0;
                if (totalSegmentClicks) {
                    totalClicks += totalSegmentClicks;
                }
                if (totalSegmentImpressions) {
                    totalImpressions += totalSegmentImpressions;
                }
                ind["click_through_rate"] = ind.total_clicks && item.total_impressions ? parseFloat(((ind.total_clicks / item.total_impressions) * 100).toFixed(2)) : 0;
                ind["click_percentage"]   = ind.total_clicks && item.total_clicks ? parseFloat(((ind.total_clicks / item.total_clicks * 100).toFixed(2))) : 0;
/*                ind["z_score"]            = function () {
                    ind["click_through_rate"]
                }();*/
                ind["p_value"]            = function () {

                }();
                totalClickThroughRate += ind["click_through_rate"];
            }
        });
        let avgClickThroughRate = parseFloat((totalClickThroughRate / items.length).toFixed(2));
        items.forEach(x => {
            x["index"] = parseFloat((x.click_through_rate / avgClickThroughRate * 100).toFixed(2));
            let stdDeviation = Math.sqrt(Math.pow(x.click_through_rate - avgClickThroughRate, 2) / stats.totalCount);
            x["z_score"] = parseFloat(((x.click_through_rate - avgClickThroughRate)).toFixed(3));
        });
        return items;
    }
    return items;
}

module.exports.show = function (req, res) {
    let endResult = [];
    let startDate = (req.query.startDate && new Date(req.query.startDate)) || new Date();
    let endDate   = (req.query.endDate && new Date(req.query.endDate)) || new Date();
    return db.queryAsync(sqlQuery, [startDate, endDate])
        .then((result) => {
                let groupedRes       = [];
                let totalImpressions = 0;
                let totalClicks      = 0;
                let resultWithStats  = [];
                if (_.isArray(result)) {
                    groupedRes = _.groupBy(result, (item) => {
                        return item.segment_key;
                    });
                    for (let key in groupedRes) {
                        let item = groupedRes[key];
                        let doc  = {
                            "segment":           item[0].description.substr(item[0].description.indexOf('-') + 2),
                            "ad_position":       item[0].ad_position,
                            "ad_property_type":  item[0].ad_property_type,
                            "total_clicks":      0,
                            "total_impressions": 0,
                            "industries":        {},
                        };
                        item.forEach((x) => {
                            doc.industries[x.industry] = {
                                "total_clicks":      x.total_clicks,
                                "total_impressions": x.total_impressions
                            };
                            doc.total_clicks += x.total_clicks;
                            doc.total_impressions += x.total_impressions;
                        });
                        totalImpressions += doc.total_impressions;
                        totalClicks += doc.total_clicks;
                        endResult.push(doc);
                    }

                    resultWithStats = addStats(endResult, {totalClicks, totalImpressions, totalCount: result.length});
                    // console.log(addStats(endResult));
                }
                res.status(200).send(resultWithStats);
                return result;
            }
        )
        .catch((err) => {
            console.log(err);
            res.status(500).send(err);
        })
}
;