var express   = require('express');
var router    = express.Router();
const service = require("./../lib/service");

/* GET home page. */
router.get('/', function (req, res, next) {
    res.render('index', {title: 'Hey', message: 'Hello there!'});
    // res.render('index', {title: 'Express'});
});


router.get('/api/dashboard', function (req, res, next) {
    return service.show(req, res);
});

router.get('/dashboard', function (req, res, next) {
    res.render('dashboard', {});
});


module.exports = router;
