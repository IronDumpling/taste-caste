import { Router } from 'express';

const router = Router();

router.post('/token', (req, res) => {
  res.json({
    access_token: 'mock-token-' + Date.now(),
    expires_in: 3600,
  });
});

export default router;
