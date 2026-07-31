import Razorpay from 'razorpay';
import dotenv from 'dotenv';

dotenv.config();

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_SuTbMm0NMt6r8b',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'f7uhfL6OP9Xe7WMr9ITWLDVB',
});

export default razorpay;
