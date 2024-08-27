const express = require('express');
const { MailingListController } = require("../../controllers");

const router = express.Router();

router.post('/', MailingListController.addSubscriber);

module.exports = router;