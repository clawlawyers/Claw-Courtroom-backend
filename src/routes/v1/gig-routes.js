const {GigController} = require('../../controllers');
const express = require('express');
const router = express.Router();

router.get('/', GigController.getGig);
router.post('/', GigController.createGig);
router.put('/', GigController.updateGig);
router.delete('/', GigController.deleteGig);
module.exports = router;