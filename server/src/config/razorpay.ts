import Razorpay from 'razorpay';

let client: Razorpay | undefined;
export const getRazorpay = () =>
  (client ??= new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID as string,
    key_secret: process.env.RAZORPAY_KEY_SECRET as string,
  }));