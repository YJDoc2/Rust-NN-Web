var express = require("express");
var router = express.Router();

const { connectBack } = require("../controller/NN");

router.post("/connect", connectBack);

module.exports = router;
