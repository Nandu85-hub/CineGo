const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const connectDB = require('../config/db');
const Movie = require('../models/Movie');

const trailerMap = {
  'Bethlehem Kudumba Unit': 'https://www.youtube.com/watch?v=YoHD9XEInc0',
  'Prathama Drishtya Kuttakar': 'https://www.youtube.com/watch?v=EXeTwQWrcwY',
  'Aasha': 'https://www.youtube.com/watch?v=zSWdZVtXT7E',
  'Khalifa': 'https://www.youtube.com/watch?v=q6E0U9Mvdzg',
  'DC': 'https://www.youtube.com/watch?v=f9vT80a187g',
  'Sardar 2': 'https://www.youtube.com/watch?v=8367_pG521Q',
  'Paradise': 'https://www.youtube.com/watch?v=r0wO_T0d_rE',
  'Bramayugam': 'https://www.youtube.com/watch?v=pks3_oPspUo',
  'Manjummel Boys': 'https://www.youtube.com/watch?v=id848Ww1YLo',
  'Thudakkam': 'https://www.youtube.com/watch?v=CqYf_5zD16s',
  'Premalu': 'https://www.youtube.com/watch?v=r_2Xb-Q2K7o',
  'Aavesham': 'https://www.youtube.com/watch?v=L0yEMFQs3ab',
  'Primetime': 'https://www.youtube.com/watch?v=mqqft2x_Aa4',
  'Oye Chill Maar': 'https://www.youtube.com/watch?v=qE3Jp4tE1Zk',
  'Runner': 'https://www.youtube.com/watch?v=Kz6M8x7bFm0',
  'Meesaya Murukku 2': 'https://www.youtube.com/watch?v=aG3m8e5k7T0',
  'Ramayana': 'https://www.youtube.com/watch?v=G3q01rV8R1E',
  'Street Fighter': 'https://www.youtube.com/watch?v=3u_sH4h9_nI',
  'Dune: Messiah': 'https://www.youtube.com/watch?v=Way9Dexny3w',
};

const updateTrailers = async () => {
  try {
    await connectDB();
    console.log('Connected to DB. Updating movie trailer URLs...');

    let updatedCount = 0;
    for (const [title, trailerUrl] of Object.entries(trailerMap)) {
      const res = await Movie.updateMany(
        { title: { $regex: new RegExp(`^${title.trim()}$`, 'i') } },
        { $set: { trailerUrl } }
      );
      if (res.matchedCount > 0) {
        console.log(`✓ Updated "${title}" -> ${trailerUrl} (${res.modifiedCount} modified)`);
        updatedCount += res.modifiedCount;
      }
    }

    console.log(`Trailer update completed. Total movies modified: ${updatedCount}`);
    process.exit(0);
  } catch (error) {
    console.error('Error updating trailers:', error);
    process.exit(1);
  }
};

updateTrailers();
