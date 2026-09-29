const mongoose = require('mongoose');
require('dotenv').config();
const Movie = require('../models/Movie');

const updates = [
  { title: 'Bethlehem Kudumba Unit', poster: '/posters/bethlehem_kudumba_unit.jpg', order: 1 },
  { title: 'Prathama Drishtya Kuttakar', poster: '/posters/prathama_drishtya_kuttakar.jpg', order: 2 },
  { title: 'Aasha', poster: '/posters/aasha.jpg', order: 3 },
  { title: 'Khalifa', poster: '/posters/khalifa.jpg', order: 4 },
  { title: 'DC', poster: '/posters/dc.jpg', order: 5 },
  { title: 'Sardar 2', poster: '/posters/sardar2.jpg', order: 6 },
  { title: 'Paradise', poster: '/posters/paradise.jpg', order: 7 },
  { title: 'Bramayugam', poster: '/posters/bramayugam.jpg', order: 8 },
  { title: 'Manjummel Boys', poster: '/posters/manjummel_boys.jpg', order: 9 },
  { title: 'Thudakkam', poster: '/posters/thudakkam.jpg', order: 10 },
  { title: 'Premalu', poster: '/posters/premalu.jpg', order: 11 },
  { title: 'Aavesham', poster: '/posters/aavesham.jpg', order: 12 },
  { title: 'Primetime', poster: '/posters/primetime.jpg', order: 13 },
  { title: 'Oye Chill Maar', poster: '/posters/oye_chill_maar.jpg', order: 14 },
  { title: 'Runner', poster: '/posters/runner.jpg', order: 15 },
  { title: 'Meesaya Murukku 2', poster: '/posters/meesaya_murukku2.jpg', order: 16 },
  { title: 'Ramayana', poster: '/posters/ramayana.jpg', order: 17 },
  { title: 'Street Fighter', poster: '/posters/street_fighter.jpg', order: 18 },
  { title: 'Dune: Messiah', poster: '/posters/dune_messiah.jpg', order: 19 },
];

async function updateDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    for (const item of updates) {
      const res = await Movie.updateOne(
        { title: item.title },
        { $set: { posterUrl: item.poster, bannerUrl: item.poster, order: item.order } }
      );
      console.log(item.title, 'updated:', res.modifiedCount, 'order:', item.order);
    }
    console.log('All MongoDB movies successfully updated with orders & posters!');
    process.exit(0);
  } catch (err) {
    console.error('Error updating DB:', err);
    process.exit(1);
  }
}

updateDB();
