"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const db_1 = __importDefault(require("./config/db"));
const dotenv_1 = __importDefault(require("dotenv"));
const productRoutes_1 = __importDefault(require("./routes/productRoutes"));
const userRoutes_1 = __importDefault(require("./routes/userRoutes"));
const orderRoutes_1 = __importDefault(require("./routes/orderRoutes"));
const uploadRoutes_1 = __importDefault(require("./routes/uploadRoutes"));
const morgan_1 = __importDefault(require("morgan"));
const errorMiddleware_1 = require("./middleware/errorMiddleware");
const cors_1 = __importDefault(require("cors"));
const path_1 = __importDefault(require("path"));
const config_1 = __importDefault(require("./config"));
const stripeRoutes_1 = __importDefault(require("./routes/stripeRoutes"));
const verifyController_1 = require("./controllers/verifyController");
const resetPasswordController_1 = require("./controllers/resetPasswordController");
dotenv_1.default.config({
    path: path_1.default.resolve(__dirname, '.env'),
});
(0, db_1.default)();
const app = (0, express_1.default)();
if (config_1.default.NODE_ENV === 'development') {
    app.use((0, morgan_1.default)('dev'));
}
app.use((0, cors_1.default)());
app.use((req, res, next) => {
    if (req.originalUrl.endsWith('/webhook')) {
        next();
    }
    else {
        express_1.default.json()(req, res, next);
    }
});
app.post('/api/forgot-password', resetPasswordController_1.forgotPassword);
app.post('/api/reset-password', resetPasswordController_1.resetPassword);
app.get('/api/verify/verify-email', verifyController_1.verifyEmail);
app.use('/api/stripe', stripeRoutes_1.default);
app.use('/api/products', productRoutes_1.default);
app.use('/api/users', userRoutes_1.default);
app.use('/api/orders', orderRoutes_1.default);
app.use('/api/uploads', uploadRoutes_1.default);
app.use(errorMiddleware_1.notFound);
app.use(errorMiddleware_1.errorHandler);
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
