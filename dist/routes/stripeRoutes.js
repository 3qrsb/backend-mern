"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const stripeController_1 = require("../controllers/stripeController");
const body_parser_1 = __importDefault(require("body-parser"));
const router = (0, express_1.Router)();
router.post('/create-checkout-session', stripeController_1.createCheckoutSession);
router.post('/webhook', body_parser_1.default.raw({ type: 'application/json' }), stripeController_1.handleWebhook);
exports.default = router;
