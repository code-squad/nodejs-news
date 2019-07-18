const IndexController = {};

/*
    GET /
    GET /index
*/
IndexController.index = async (req, res) => {
    res.render('index', { _title : `Today's News - Main` });
}

module.exports = IndexController;