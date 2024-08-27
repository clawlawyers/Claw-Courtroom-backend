const {PostController} = require('../../controllers');
const express = require('express');
const router = express.Router();
const {validateRequestMiddleware, authMiddleware} = require('../../middlewares');
const { validatePostUpdateRequest } = require('../../middlewares/validate-request-middleware');


router.get('/', authMiddleware.checkClientAuth, PostController.getPost);
router.post('/',authMiddleware.checkClientAuth, validateRequestMiddleware.validatePostRequest, PostController.createPost);
router.put('/',authMiddleware.checkClientAuth, validateRequestMiddleware.validatePostRequest,validateRequestMiddleware.validatePostUpdateRequest, PostController.updatePost);
router.delete('/', authMiddleware.checkClientAuth, validateRequestMiddleware.validatePostUpdateRequest, PostController.deletePost);
module.exports = router;