// Imports
import express from 'express';
import faker from 'faker';

// Instantiate router component
const router = express.Router();

/**
 * Root directory
 *
 * @author Alec M.
 */
router.get('/', async (request, response) => {
  // Send default response
  response.render('index', {config: {app_name: "Test App"}, faker});
});

router.get('/vehicles/:vehicle', async (request, response) => {
  // Send default response
  response.render('listing', {config: {app_name: "Test App"}, faker});
});

// Export Router
export default router;
