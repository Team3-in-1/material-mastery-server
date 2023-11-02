'use strict';
const express = require('express');
const { checkApiKeyV0 } = require('../auth/checkAuth');
const router = express.Router();

router.use(checkApiKeyV0);

router.use('/v1/api/category', require('./category/index'));
router.use('/v1/api/key', require('./apiKey/index'));
router.use('/v1/api/user', require('./user/index'));
router.use('/v1/api/product', require('./product/index'));
router.use('/v1/api', require('./access/index'));

module.exports = router;
