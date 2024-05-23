"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const stripeController_1 = require("../controllers/stripeController");
const router = (0, express_1.Router)();
router.post('/create-checkout-session', stripeController_1.createCheckoutSession);
exports.default = router;
