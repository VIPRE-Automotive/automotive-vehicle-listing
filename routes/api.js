// Imports
import express from 'express';
import ratelimit from 'express-rate-limit';
import qr from 'qrcode';

// Instantiate router component
const router = express.Router();

// Use RateLimit Module
router.use(new ratelimit({
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
  response.status(404).send("");
});

/**
 * Render a QR Code link for vehicle sharing
 *
 * @author Alec M.
 * @date 2021-11-12 13:56:00
 */
router.get('/vehicle/:catalogID/qr', async (request, response) => {
  try {
    // Generate QR Image
    const d = await qr.toDataURL("https://xyz.com");

    // Send Data
    response.send(d);
  } catch (e) {
    response.status(500).send("");
  }
});

// Export Router
export default router;
