// Imports
import express from 'express';
import faker from 'faker';
import config from '../configuration.js';

// Instantiate router component
const router = express.Router();

/**
 * Root directory
 *
 * @author Alec M.
 */
router.get('/', async (request, response) => {
  // Send default response
  response.render('index', {config, faker});
});

router.get('/vehicles/:vehicle', async (request, response) => {
  // Send default response
  response.render('listing', {config, faker});
});

// Export Router
export default router;
