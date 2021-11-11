// Imports
import express from 'express';

// Instantiate router component
const router = express.Router();

/**
 * Root directory
 *
 * @author Alec M.
 */
router.get('/', async (request, response) => {
  // Send default response
  response.render('index', {config: {app_name: "Test App"}});
});

// Export Router
export default router;
