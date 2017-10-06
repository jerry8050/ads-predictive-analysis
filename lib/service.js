const Bluebird   = require('bluebird');
const mysql      = Bluebird.promisifyAll(require('mysql'));
const _          = require("lodash");
const connection = mysql.createConnection({
    connectionLimit: 10,
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
campaign_reports_test_new c,
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
    let byIndustry            = stats.byIndustry || {};
    if (_.isArray(items)) {
        items.forEach(item => {
            numberOfSegments++;
            let totalSegmentValue      = 0;
            item["click_through_rate"] = item.total_clicks && stats.totalImpressions ? parseFloat(((item.total_clicks / stats.totalImpressions) * 100 ).toFixed(3)) : 0;

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
                ind["click_through_rate"] = ind.total_clicks && ind.total_impressions ? parseFloat(((ind.total_clicks / ind.total_impressions) ).toFixed(3)) : 0;

                // ind["click_percentage"]      = ind.total_clicks && byIndustry[key].total_clicks ? parseFloat(((ind.total_clicks / byIndustry[key].total_clicks * 100).toFixed(3))) : 0;
                // byIndustry[key]["total_ctr"] = byIndustry[key]["total_ctr"] ? byIndustry[key]["total_ctr"] + ind["click_percentage"] : ind["click_percentage"];

                // ind["z_score"]            = parseFloat(((ind.click_through_rate - avgClickThroughRate)).toFixed(3));
                /*                ind["p_value"]            = function () {

                 }();*/
                totalClickThroughRate += ind["click_through_rate"];
            }
        });
        items.forEach(item => {
            numberOfSegments++;

            for (let key in item.industries) {
                let ind          = item.industries[key];
                // let avgCtr       = byIndustry[key].total_ctr / byIndustry[key].count;
                let avgCtr       = parseFloat((byIndustry[key].total_clicks / byIndustry[key].total_impressions).toFixed(3));
                ind["index"]     = parseFloat(((ind.click_through_rate / avgCtr) * 100).toFixed(3));
                let stdDeviation = parseFloat((Math.sqrt(Math.pow(ind.click_through_rate - avgCtr, 2) / byIndustry[key].count).toFixed(5)));
                ind["z_score"]   = parseFloat(((ind.click_through_rate - avgCtr).toFixed(5) / stdDeviation).toFixed(3));
                totalClickThroughRate += ind["click_through_rate"];
            }
        });

         // let avgClickThroughRate = parseFloat((totalClickThroughRate / items.length).toFixed(2));
/*        items.forEach(x => {
            x["index"]       = parseFloat((x.click_through_rate / avgClickThroughRate * 100).toFixed(2));
            let stdDeviation = Math.sqrt(Math.pow(x.click_through_rate - avgClickThroughRate, 2) / stats.totalCount);
            x["z_score"]     = parseFloat(((x.click_through_rate - avgClickThroughRate)).toFixed(3));
        });*/
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
                let byIndustry       = {};
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
                        let asdsd= 0;
                        item.forEach((x) => {
                            if (!byIndustry[x.industry] || !byIndustry[x.industry]["total_clicks"]) {
                                byIndustry[x.industry]                 = {};
                                byIndustry[x.industry]["total_clicks"] = 0;
                                byIndustry[x.industry]["count"]        = 0;
                            }
                            if (!byIndustry[x.industry] || !byIndustry[x.industry]["total_impressions"]) {
                                byIndustry[x.industry]                      = {};
                                byIndustry[x.industry]["total_impressions"] = 0;
                                byIndustry[x.industry]["count"]             = 0;
                            }

                            if(!x.total_clicks){
                                x.total_clicks =0;
                            }
                            byIndustry[x.industry]["total_clicks"]      = byIndustry[x.industry]["total_clicks"] ? byIndustry[x.industry]["total_clicks"] + x.total_clicks : x.total_clicks;
                            if(x.total_clicks){
                                asdsd+= x.total_clicks
                            }
                            byIndustry[x.industry]["total_impressions"] = byIndustry[x.industry] && byIndustry[x.industry]["total_impressions"] ? byIndustry[x.industry]["total_impressions"] + x.total_impressions : x.total_impressions;
                            byIndustry[x.industry]["count"]++;
                            doc.industries[x.industry] = {
                                "total_clicks":      x.total_clicks,
                                "total_impressions": x.total_impressions
                            };
                            doc.total_clicks += x.total_clicks;
                            doc.total_impressions += x.total_impressions;
                        });
                        console.log("total",asdsd)
                        totalImpressions += doc.total_impressions;
                        totalClicks += doc.total_clicks;
                        endResult.push(doc);
                    }
                    resultWithStats = addStats(endResult, {
                        totalClicks,
                        totalImpressions,
                        totalCount: result.length,
                        byIndustry
                    });
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