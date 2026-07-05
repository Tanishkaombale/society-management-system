const Society = require('../models/Society');

// Excludes visually ambiguous characters (0/O, 1/I/L) so codes are easy to read aloud
// and type correctly when shared with residents.
const ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';

const randomCode = (length = 6) => {
  let code = '';
  for (let i = 0; i < length; i += 1) {
    code += ALPHABET.charAt(Math.floor(Math.random() * ALPHABET.length));
  }
  return code;
};

// Generates a code and guarantees it doesn't already exist in the database.
const generateUniqueSocietyCode = async () => {
  let code;
  let exists = true;
  let attempts = 0;

  while (exists && attempts < 10) {
    code = randomCode();
    // eslint-disable-next-line no-await-in-loop
    exists = await Society.exists({ code });
    attempts += 1;
  }

  if (exists) {
    throw new Error('Could not generate a unique society code, please try again');
  }

  return code;
};

module.exports = { generateUniqueSocietyCode };
