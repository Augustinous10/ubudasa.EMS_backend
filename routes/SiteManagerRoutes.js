const express = require('express');
const router = express.Router();
const {
  getSiteManagers,
  addSiteManager,
  deleteSiteManager
} = require('../controllers/SiteManagerController');

// Routes
router.get('/', getSiteManagers);
router.post('/', addSiteManager);
router.delete('/:id', deleteSiteManager);

module.exports = router;
