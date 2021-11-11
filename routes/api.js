// Imports
import express from 'express';
import RateLimit from 'express-rate-limit';

// Instantiate router component
const router = express.Router();

// Use RateLimit Module
router.use(new RateLimit({
  windowMs: 15 * 1000,
  max: 5
}));

/**
 * Root directory
 *
 * @author Alec M.
 */
router.get('/', async (request, response) => {
  // Send default response
  response.send('<h1>Root</h1>');
});

/**
 * Temporary Endpoint Example
 *
 * @author Alec M.
 * @date 2021-11-11 17:52:00
 */
router.get('/test', async (request, response) => {
  // TEMP
  response.json({status: "failure", data: null, message: "unknown error"});
});

// Export Router
export default router;
