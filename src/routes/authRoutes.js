import express from 'express';
import { login, register, getTestStatus, getImageKitAuth } from '../controllers/authController.js';

const router = express.Router();

// GET /api/auth/test - Easy Postman test endpoint
router.get('/test', getTestStatus);

// GET /api/auth/imagekit-auth - Client ImageKit auth params
router.get('/imagekit-auth', getImageKitAuth);

// POST /api/auth/register - Register user
router.post('/register', register);

// POST /api/auth/login - Login user
router.post('/login', login);

export default router;
