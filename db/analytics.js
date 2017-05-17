//var db = require('node-mysql');
var db = require('node-mysql');
var DB = db.DB;
var box = new DB({
    host     : 'mysql-test.playbuzz.com',
    user     : 'root',
    password : '',
    database : 'page_analytics'
});

var runQuery = function(sql, data, done){
    box.connect(function(conn) {
        conn.query(sql, data, done);
    });
}

var selectAllSql = "SELECT `timestamp`,`user-id`,`page-id`,`page-url`,`page-referrer`,\
    `user-agent`,`screen-resolution`,`user-ip`,`user-browser`,`user-country` FROM `page_views`"

var analytics = {
    createPageViewRecord: function(record, done){
        runQuery('INSERT INTO page_views SET ?', record, done);
    },
    getPageViewsByPageId: function(id, done){
        if(id){
            runQuery(selectAllSql + " WHERE `page-id` = ?", id, done);
        } else {
            runQuery("SELECT `page-id`, COUNT(*) as 'views' FROM page_views GROUP BY `page-id`", null, done);
        }
    },
    getPageViewsByBrowser: function(id, done){
        if(id){
            runQuery(selectAllSql + " WHERE `user-browser` = ?", id, done);
        } else {
            runQuery("SELECT `user-browser`, COUNT(*) as 'views' FROM page_views GROUP BY `user-browser`", null, done);
        }
    },
    getPageViewsByCountry: function(id, done){
        if(id){
            runQuery(selectAllSql + " WHERE `user-country` = ?", id, done);
        } else {
            runQuery("SELECT `user-country`, COUNT(*) as 'views' FROM page_views GROUP BY `user-country`", null, done);
        }
    }
}

module.exports = analytics;