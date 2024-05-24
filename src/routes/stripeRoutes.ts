import { Router } from 'express';
import { createCheckoutSession, handleWebhook } from '../controllers/stripeController';
import bodyParser from 'body-parser'

const router = Router();

router.post('/create-checkout-session', createCheckoutSession);
router.post('/webhook', bodyParser.raw({ type: 'application/json' }), handleWebhook);

export default router;