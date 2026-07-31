import bcrypt from 'bcrypt';
import ImageKit from 'imagekit';
import generateToken from '../utils/generateToken.js';
import User from '../models/user.js';

const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY || 'public_12EI=',
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY || 'private_3/5P4lDozb8=',
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT || 'https://ik.imagekit.io/12EI',
});

/**
 * GET /api/auth/imagekit-auth
 * Provides authentication tokens for client-side ImageKit upload
 */
export const getImageKitAuth = async (req, res) => {
  try {
    const authenticationParameters = imagekit.getAuthenticationParameters();
    res.json({
      ...authenticationParameters,
      publicKey: process.env.IMAGEKIT_PUBLIC_KEY || 'public_12EI=',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * POST /api/upload-image
 * Backend direct ImageKit file upload using private key
 */
export const uploadImageToImageKit = async (req, res) => {
  try {
    const { file, fileName } = req.body;
    if (!file) {
      return res.status(400).json({ success: false, message: 'File is required' });
    }

    const uploadResponse = await imagekit.upload({
      file, // base64 string or image URL
      fileName: fileName || `upload_${Date.now()}.png`,
      useUniqueFileName: true,
    });

    res.json({ success: true, url: uploadResponse.url });
  } catch (error) {
    console.error('Backend ImageKit upload error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * POST /api/auth/register
 * Registers a new user as 'admin' or 'customer'.
 * Body: { name, email, password, role?, phoneNumber?, DOB?, profileImage? }
 */
export const register = async (req, res) => {
  try {
    const { name, email, password, role, phoneNumber, DOB, profileImage } = req.body;

    // Validation
    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Name is required' });
    }
    if (!email || !email.trim()) {
      return res.status(400).json({ success: false, message: 'Email is required' });
    }
    if (!password || password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const userRole = role === 'admin' ? 'admin' : 'customer';

    let parsedDOB = null;
    if (DOB) {
      const d = new Date(DOB);
      if (!isNaN(d.getTime())) parsedDOB = d;
    }

    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      role: userRole,
      phoneNumber: phoneNumber ? String(phoneNumber).trim() : '',
      DOB: parsedDOB,
      profileImage: profileImage || '',
    });

    const token = generateToken(user);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phoneNumber: user.phoneNumber,
        DOB: user.DOB,
        profileImage: user.profileImage,
      },
      token,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * POST /api/auth/login
 * Body: { email, password }
 * Returns: { user, token }
 */
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const token = generateToken(user);

    res.json({
      success: true,
      message: 'Login successful',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phoneNumber: user.phoneNumber,
        DOB: user.DOB,
        profileImage: user.profileImage,
      },
      token,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * GET /api/auth/test
 */
export const getTestStatus = async (req, res) => {
  res.json({
    success: true,
    message: 'Auth routes are working!',
    timestamp: new Date().toISOString(),
  });
};
