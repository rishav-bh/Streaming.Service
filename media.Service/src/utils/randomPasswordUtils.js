export default function generateRandomPassword(length) {
  const chars = "0123456789"; // Allowed characters (numbers)
  let password = "";

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * chars.length); // Get a random index
    password += chars[randomIndex]; // Append the character at the random index
  }

  return password; // Return the generated password
}
