export default function generateRandomCoupon(length = 8) {
  const chars = "ABCDEFGHIJKLMNPQRSTUVWXYZ0123456789"; // Allowed characters excluding O to  avoid confusion with 0

  let coupon = "";

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * chars.length); // Get a random index
    coupon += chars[randomIndex]; // Append the character at the random index
  }

  return coupon; // Return the generated coupon
}
