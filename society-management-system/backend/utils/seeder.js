// Seed script: creates two separate demo societies (to prove multi-tenancy works),
// each with an admin, security guard, residents, flats, notices, and amenities.
// Run with: npm run seed
require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');

const User = require('../models/User');
const Society = require('../models/Society');
const Flat = require('../models/Flat');
const Notice = require('../models/Notice');
const Amenity = require('../models/Amenity');
const { generateUniqueSocietyCode } = require('./generateSocietyCode');

const seedSociety = async ({ societyName, city, adminEmail, adminName, securityEmail, residentEmail, residentName }) => {
  const code = await generateUniqueSocietyCode();

  const admin = await User.create({
    name: adminName,
    email: adminEmail,
    password: 'Admin@123',
    phone: '9999900000',
    role: 'admin',
    isApproved: true,
  });

  const society = await Society.create({
    name: societyName,
    code,
    city,
    createdBy: admin._id,
  });

  admin.society = society._id;
  await admin.save();

  const security = await User.create({
    name: 'Ramesh Singh',
    email: securityEmail,
    password: 'Security@123',
    phone: '9999900001',
    role: 'security',
    society: society._id,
    isApproved: true,
  });

  const flats = await Flat.insertMany([
    { society: society._id, flatNumber: '101', block: 'A', floor: 1, type: '2BHK', monthlyMaintenance: 2500 },
    { society: society._id, flatNumber: '102', block: 'A', floor: 1, type: '3BHK', monthlyMaintenance: 3000 },
    { society: society._id, flatNumber: '201', block: 'A', floor: 2, type: '2BHK', monthlyMaintenance: 2500 },
  ]);

  const resident = await User.create({
    name: residentName,
    email: residentEmail,
    password: 'Resident@123',
    phone: '9999900002',
    role: 'resident',
    society: society._id,
    isApproved: true,
    flat: flats[0]._id,
  });

  flats[0].owner = resident._id;
  flats[0].members = [resident._id];
  flats[0].status = 'occupied';
  await flats[0].save();

  await Notice.insertMany([
    {
      society: society._id,
      title: 'Annual General Meeting',
      description: 'The AGM will be held in the community hall. All residents are requested to attend.',
      category: 'meeting',
      important: true,
      postedBy: admin._id,
    },
    {
      society: society._id,
      title: 'Water Supply Maintenance',
      description: 'Water supply will be interrupted for maintenance work between 10 AM and 2 PM.',
      category: 'maintenance',
      important: true,
      postedBy: admin._id,
    },
  ]);

  await Amenity.insertMany([
    { society: society._id, name: 'Clubhouse', description: 'Community hall for events and gatherings', capacity: 100, pricePerHour: 500 },
    { society: society._id, name: 'Swimming Pool', description: 'Olympic size swimming pool', capacity: 30, pricePerHour: 0 },
    { society: society._id, name: 'Gymnasium', description: 'Fully equipped gym', capacity: 20, pricePerHour: 0 },
  ]);

  return { society, admin, security, resident };
};

const seed = async () => {
  await connectDB();

  console.log('Clearing existing data...');
  await Promise.all([
    User.deleteMany(),
    Society.deleteMany(),
    Flat.deleteMany(),
    Notice.deleteMany(),
    Amenity.deleteMany(),
  ]);

  console.log('Creating demo society #1: Sunrise Residency...');
  const soc1 = await seedSociety({
    societyName: 'Sunrise Residency',
    city: 'Pune',
    adminName: 'Admin User',
    adminEmail: 'admin@society.com',
    securityEmail: 'security@society.com',
    residentName: 'Anita Sharma',
    residentEmail: 'resident@society.com',
  });

  console.log('Creating demo society #2: Palm Grove Apartments (to prove multi-tenancy)...');
  const soc2 = await seedSociety({
    societyName: 'Palm Grove Apartments',
    city: 'Bengaluru',
    adminName: 'Rekha Nair',
    adminEmail: 'admin2@society.com',
    securityEmail: 'security2@society.com',
    residentName: 'Vikram Rao',
    residentEmail: 'resident2@society.com',
  });

  console.log('\nSeed data created successfully!');
  console.log('----------------------------------------------------');
  console.log(`Society 1: ${soc1.society.name}  (join code: ${soc1.society.code})`);
  console.log('  Admin login:    admin@society.com / Admin@123');
  console.log('  Security login: security@society.com / Security@123');
  console.log('  Resident login: resident@society.com / Resident@123');
  console.log('----------------------------------------------------');
  console.log(`Society 2: ${soc2.society.name}  (join code: ${soc2.society.code})`);
  console.log('  Admin login:    admin2@society.com / Admin@123');
  console.log('  Security login: security2@society.com / Security@123');
  console.log('  Resident login: resident2@society.com / Resident@123');
  console.log('----------------------------------------------------');
  console.log('Try registering a new resident with either join code above to see the approval flow.');

  mongoose.connection.close();
  process.exit();
};

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
