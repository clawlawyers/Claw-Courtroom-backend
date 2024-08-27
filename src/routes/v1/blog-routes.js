const express = require("express");
const { BlogController } = require("../../controllers");
const router = express.Router();


router.get("/", BlogController.getAllBlogs);
router.get("/:blogName", BlogController.getBlogByName);
router.get("/linkingBlogs/:excludedBlogName", BlogController.getLinkingBlogs);
router.post("/publish", BlogController.createBlogs);

module.exports = router;