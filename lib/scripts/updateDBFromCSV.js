const mysql   = require('mysql');
const xlsx    = require('node-xlsx');
const fs      = require('fs');
const Promise = require("bluebird");
const parse   = require('csv-parse/lib/sync');
const csv     = require('fast-csv');

const connection = mysql.createPool({
    onnectionLimit: 10,
    host:           'rdc-hack.c3d8n8cosrif.us-west-2.rds.amazonaws.com',
    user:           'root',
    password:       'realtor.com',
    database:       'ads_analysis'
});


function readFromCSVStream(fileName) {
    let counter = 0;
    fs.createReadStream(`${__dirname}/../../data/${fileName}`)
        .pipe(csv())
        .on("data", function (data) {
            counter++;
            if (counter > 20) {
                let formattedData = ((row) => {

                    let segments = function () {
                        let unitTypes = row[3].split("�");
                        if (unitTypes && unitTypes.length === 4) {
                            return {
                                ad_site:        unitTypes[0].substr(0, unitTypes[0].indexOf(" (")),
                                ad_site_id:     unitTypes[0].slice(unitTypes[0].indexOf('(') + 1, unitTypes[0].length - 2),
                                ad_page:        unitTypes[1].substr(1, unitTypes[1].indexOf(" (") - 1),
                                ad_page_id:     unitTypes[1].slice(unitTypes[1].indexOf('(') + 1, unitTypes[1].length - 2),
                                ad_property:    unitTypes[2].substr(1, unitTypes[2].indexOf(" (") - 1),
                                ad_property_id: unitTypes[2].slice(unitTypes[2].indexOf('(') + 1, unitTypes[2].length - 2),
                                ad_position:    unitTypes[3].substr(1, unitTypes[3].indexOf(" (") - 1),
                                ad_position_id: unitTypes[3].slice(unitTypes[3].indexOf('(') + 1, unitTypes[3].length - 2)
                            }
                        } else {
                            console.log("asdd")
                        }

                    }();
                    return {
                        "proposal":              row[0],
                        "proposal_line_item":    row[1],
                        "segment_key":           row[2] ? row[2].toLowerCase() : undefined,
                        "ad_site_id":            segments && parseInt(segments.ad_site_id),
                        "ad_site":               segments && segments.ad_site,
                        "ad_page_id":            segments && parseInt(segments.ad_page_id),
                        "ad_page":               segments && segments.ad_page,
                        "ad_property_type_id":   segments && parseInt(segments.ad_property_id),
                        "ad_property_type":      segments && segments.ad_property,
                        "ad_position_id":        segments && parseInt(segments.ad_position_id),
                        "ad_position":           segments && segments.ad_position,
                        "date":                  new Date(row[4]),
                        "proposal_id":           row[5],
                        "proposal_line_item_id": row[6],
                        "industry":              row[9],
                        "total_impressions":     row[10],
                        "total_clicks":          row[11]
                    };
                })(data);
                updateSingle(formattedData);
            }
        })
        .on("end", function () {
            console.log("done reading csv file")
        })
        .on("error", function (err) {
            console.log(err)
        });
}


function updateSingle(data) {
    connection.query('INSERT INTO ads_analysis.campaign_reports_test_full SET ?', data, function (error, results) {
        if (error) {
            console.log("Problem inserting record into DB");
        } else
            console.log("Writing record to DB");
    });

}

readFromCSVStream("report-without.csv");


