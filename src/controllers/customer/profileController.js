import User from '../../models/user.js';
import bcrypt from 'bcrypt';

export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { name, email, password, phoneNumber, DOB, profileImage } = req.body;
    const updates = {};

    if (name) updates.name = name.trim();

    if (email && email.trim()) {
      const trimmedEmail = email.trim().toLowerCase();
      const existingUser = await User.findOne({ email: trimmedEmail, _id: { $ne: req.user.id } });
      if (existingUser) {
        return res.status(400).json({ success: false, message: 'Email address is already in use by another account' });
      }
      updates.email = trimmedEmail;
    }

    if (password && password.trim()) {
      const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;
      if (!PASSWORD_REGEX.test(password.trim())) {
        return res.status(400).json({
          success: false,
          message: 'New password must be min 8 chars with 1 uppercase, 1 number, and 1 symbol (#, @, $, !, %, etc.)',
        });
      }
      const salt = await bcrypt.genSalt(10);
      updates.password = await bcrypt.hash(password.trim(), salt);
    }

    if (phoneNumber !== undefined) updates.phoneNumber = phoneNumber;
    if (DOB !== undefined) updates.DOB = DOB;
    if (profileImage !== undefined) updates.profileImage = profileImage;

    const user = await User.findByIdAndUpdate(req.user.id, updates, { returnDocument: 'after', runValidators: true }).select('-password');
    res.json({ success: true, message: 'Profile details updated successfully', user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};