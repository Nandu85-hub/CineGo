const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const connectDB = require('../config/db');
const User = require('../models/User');
const Movie = require('../models/Movie');
const Showtime = require('../models/Showtime');
const Seat = require('../models/Seat');
const Booking = require('../models/Booking');
const Payment = require('../models/Payment');

const sampleMovies = [
 
  {
    title: 'Bethlehem Kudumba Unit',
    description: 'Bethlehem Kudumba Unit revolves around heartwarming family moments, hilarious situations, and emotional relationships in Kerala.',
    genre: ['Drama', 'Comedy', 'Family'],
    language: 'Malayalam',
    duration: 135,
    posterUrl: '/posters/bethlehem_kudumba_unit.jpg',
    bannerUrl: '/posters/bethlehem_kudumba_unit.jpg',
    trailerUrl: 'https://www.youtube.com/watch?v=YoHD9XEInc0',
    rating: 8.7,
    votesCount: '34.5K+',
    certification: 'U',
    formats: ['2D', 'Dolby Atmos 7.1'],
    availableLanguages: ['Malayalam'],
    releaseDate: new Date('2024-09-30'),
    status: 'now_showing',
    order: 1,
  },
  {
    title: 'Prathama Drishtya Kuttakar',
    description: 'An intense suspense mystery thriller tracing unexpected twists, deep secrets, and unforgettable investigation thrills.',
    genre: ['Thriller', 'Mystery', 'Drama'],
    language: 'Malayalam',
    duration: 138,
    posterUrl: '/posters/prathama_drishtya_kuttakar.jpg',
    bannerUrl: '/posters/prathama_drishtya_kuttakar.jpg',
    trailerUrl: 'https://www.youtube.com/watch?v=EXeTwQWrcwY',
    rating: 8.6,
    votesCount: '28.4K+',
    certification: 'UA16+',
    formats: ['2D', 'Dolby Atmos'],
    availableLanguages: ['Malayalam'],
    releaseDate: new Date('2024-09-29'),
    status: 'now_showing',
    order: 2,
  },
  {
    title: 'Aasha',
    description: 'Aasha is a touching Malayalam family drama film featuring renowned actress Urvashi in a major role, exploring deep emotional storytelling.',
    genre: ['Drama', 'Family', 'Romance'],
    language: 'Malayalam',
    duration: 140,
    posterUrl: '/posters/aasha.jpg',
    bannerUrl: '/posters/aasha.jpg',
    trailerUrl: 'https://www.youtube.com/watch?v=zSWdZVtXT7E',
    rating: 8.5,
    votesCount: '18.2K+',
    certification: 'U',
    formats: ['2D'],
    availableLanguages: ['Malayalam'],
    releaseDate: new Date('2024-09-28'),
    status: 'now_showing',
    order: 3,
  },
  {
    title: 'Khalifa',
    description: 'A captivating action thriller following courage, ambition, rivalry, and high-stakes encounters across atmospheric settings.',
    genre: ['Action', 'Thriller', 'Drama'],
    language: 'Malayalam',
    duration: 145,
    posterUrl: '/posters/khalifa.jpg',
    bannerUrl: '/posters/khalifa.jpg',
    trailerUrl: 'https://www.youtube.com/watch?v=q6E0U9Mvdzg',
    rating: 8.4,
    votesCount: '25.9K+',
    certification: 'UA16+',
    formats: ['2D', 'Dolby Atmos'],
    availableLanguages: ['Malayalam', 'Tamil'],
    releaseDate: new Date('2024-09-27'),
    status: 'now_showing',
    order: 4,
  },

  {
    title: 'DC',
    description: 'DC is a high-octane Tamil action thriller movie directed by Arun Matheswaran, featuring filmmaker Lokesh Kanagaraj in a major lead role.',
    genre: ['Action', 'Crime', 'Thriller'],
    language: 'Tamil',
    duration: 142,
    posterUrl: '/posters/dc.jpg',
    bannerUrl: '/posters/dc.jpg',
    trailerUrl: 'https://www.youtube.com/watch?v=f9vT80a187g',
    rating: 8.6,
    votesCount: '45.1K+',
    certification: 'UA16+',
    formats: ['2D', 'IMAX 2D'],
    availableLanguages: ['Tamil', 'Telugu', 'Hindi'],
    releaseDate: new Date('2024-09-26'),
    status: 'now_showing',
    order: 5,
  },
  {
    title: 'Sardar 2',
    description: 'The high-octane spy action thriller sequel following an elite operative taking down global criminal cartels.',
    genre: ['Action', 'Thriller'],
    language: 'Tamil',
    duration: 150,
    posterUrl: '/posters/sardar2.jpg',
    bannerUrl: '/posters/sardar2.jpg',
    trailerUrl: 'https://www.youtube.com/watch?v=8367_pG521Q',
    rating: 8.8,
    votesCount: '38.4K+',
    certification: 'UA16+',
    formats: ['2D', 'Dolby Cinema'],
    availableLanguages: ['Tamil', 'Malayalam', 'Hindi'],
    releaseDate: new Date('2024-09-25'),
    status: 'now_showing',
    order: 6,
  },
  {
    title: 'Paradise',
    description: 'Paradise is a gripping Tamil action drama film starring Nani in a major role, portraying an intense story of resilience and passion.',
    genre: ['Action', 'Drama', 'Thriller'],
    language: 'Tamil',
    duration: 155,
    posterUrl: '/posters/paradise.jpg',
    bannerUrl: '/posters/paradise.jpg',
    trailerUrl: 'https://www.youtube.com/watch?v=r0wO_T0d_rE',
    rating: 8.9,
    votesCount: '52.7K+',
    certification: 'UA16+',
    formats: ['2D', 'IMAX 2D'],
    availableLanguages: ['Tamil', 'Telugu', 'Malayalam', 'Hindi'],
    releaseDate: new Date('2024-09-24'),
    status: 'now_showing',
    order: 7,
  },
  {
    title: 'Bramayugam',
    description: 'In 17th-century Malabar, a court singer fleeing slavery stumbles upon a mysterious dilapidated mansion trapped in ancient witchcraft.',
    genre: ['Horror', 'Thriller', 'Mystery'],
    language: 'Malayalam',
    duration: 139,
    posterUrl: '/posters/bramayugam.jpg',
    bannerUrl: '/posters/bramayugam.jpg',
    trailerUrl: 'https://www.youtube.com/watch?v=pks3_oPspUo',
    rating: 8.9,
    votesCount: '95.6K+',
    certification: 'UA16+',
    formats: ['2D', 'Black & White Cinema Experience'],
    availableLanguages: ['Malayalam', 'Tamil', 'Telugu', 'Hindi', 'Kannada'],
    releaseDate: new Date('2024-09-23'),
    status: 'now_showing',
    order: 8,
  },

  {
    title: 'Manjummel Boys',
    description: 'A group of close friends from Kochi embark on a trip to Kodaikanal, where an unexpected crisis tests their unbreakable friendship.',
    genre: ['Survival', 'Thriller', 'Drama'],
    language: 'Malayalam',
    duration: 135,
    posterUrl: '/posters/manjummel_boys.jpg',
    bannerUrl: '/posters/manjummel_boys.jpg',
    trailerUrl: 'https://www.youtube.com/watch?v=id848Ww1YLo',
    rating: 9.5,
    votesCount: '210.0K+',
    certification: 'U',
    formats: ['2D', 'Dolby Atmos 7.1'],
    availableLanguages: ['Malayalam', 'Tamil', 'Telugu', 'Hindi'],
    releaseDate: new Date('2024-09-22'),
    status: 'now_showing',
    order: 9,
  },
  {
    title: 'Thudakkam',
    description: 'A gripping drama detailing fresh beginnings, courageous struggles, and intense personal transformation in modern Kerala.',
    genre: ['Drama', 'Thriller'],
    language: 'Malayalam',
    duration: 132,
    posterUrl: '/posters/thudakkam.jpg',
    bannerUrl: '/posters/thudakkam.jpg',
    trailerUrl: 'https://www.youtube.com/watch?v=CqYf_5zD16s',
    rating: 8.4,
    votesCount: '21.0K+',
    certification: 'UA16+',
    formats: ['2D', 'Dolby Atmos'],
    availableLanguages: ['Malayalam'],
    releaseDate: new Date('2024-09-21'),
    status: 'now_showing',
    order: 10,
  },
  {
    title: 'Premalu',
    description: 'Sachin pursues romance in Hyderabad, leading to funny misunderstandings, laughter, and heartwarming moments between unexpected friends.',
    genre: ['Romance', 'Comedy'],
    language: 'Malayalam',
    duration: 156,
    posterUrl: '/posters/premalu.jpg',
    bannerUrl: '/posters/premalu.jpg',
    trailerUrl: 'https://www.youtube.com/watch?v=r_2Xb-Q2K7o',
    rating: 9.2,
    votesCount: '120.8K+',
    certification: 'U',
    formats: ['2D', 'Dolby Atmos'],
    availableLanguages: ['Malayalam', 'Tamil', 'Telugu'],
    releaseDate: new Date('2024-09-20'),
    status: 'now_showing',
    order: 11,
  },
  {
    title: 'Aavesham',
    description: 'Three college students in Bengaluru get into trouble and seek help from Ranga, an eccentric yet lovable local gangster.',
    genre: ['Action', 'Comedy'],
    language: 'Malayalam',
    duration: 158,
    posterUrl: '/posters/aavesham.jpg',
    bannerUrl: '/posters/aavesham.jpg',
    trailerUrl: 'https://www.youtube.com/watch?v=L0yEMFQs3ab',
    rating: 9.1,
    votesCount: '150.4K+',
    certification: 'UA16+',
    formats: ['2D', '4K Laser', 'Dolby Atmos'],
    availableLanguages: ['Malayalam', 'Tamil', 'Hindi'],
    releaseDate: new Date('2024-09-19'),
    status: 'now_showing',
    order: 12,
  },

  {
    title: 'Primetime',
    description: 'An intense biography crime drama thriller starring Robert Pattinson, uncovering breaking high-stakes broadcast mysteries.',
    genre: ['Biography', 'Crime', 'Drama', 'Thriller'],
    language: 'English',
    duration: 140,
    posterUrl: '/posters/primetime.jpg',
    bannerUrl: '/posters/primetime.jpg',
    trailerUrl: 'https://www.youtube.com/watch?v=mqqft2x_Aa4',
    rating: 8.8,
    votesCount: '13.3K+ Likes',
    certification: 'UA16+',
    formats: ['2D', 'IMAX 2D', 'Dolby Cinema'],
    availableLanguages: ['English', 'Hindi'],
    releaseDate: new Date('2026-09-25'),
    status: 'now_showing',
    order: 13,
  },
  {
    title: 'Oye Chill Maar',
    description: 'A hilarious comedy drama thriller tracking funny twists, misunderstandings, and unforgettable adventures among young friends.',
    genre: ['Comedy', 'Drama', 'Thriller'],
    language: 'Hindi',
    duration: 135,
    posterUrl: '/posters/oye_chill_maar.jpg',
    bannerUrl: '/posters/oye_chill_maar.jpg',
    trailerUrl: 'https://www.youtube.com/watch?v=qE3Jp4tE1Zk',
    rating: 8.5,
    votesCount: '10.2K+ Likes',
    certification: 'UA16+',
    formats: ['2D', 'Dolby Atmos'],
    availableLanguages: ['Hindi', 'Telugu'],
    releaseDate: new Date('2026-09-25'),
    status: 'now_showing',
    order: 14,
  },
  {
    title: 'Runner',
    description: 'A relentless action thriller following an adrenaline-fueled high-stakes mission against time and explosive danger.',
    genre: ['Action', 'Thriller'],
    language: 'Hindi',
    duration: 142,
    posterUrl: '/posters/runner.jpg',
    bannerUrl: '/posters/runner.jpg',
    trailerUrl: 'https://www.youtube.com/watch?v=Kz6M8x7bFm0',
    rating: 8.4,
    votesCount: '7.7K+ Likes',
    certification: 'UA16+',
    formats: ['2D', '4K Laser'],
    availableLanguages: ['Hindi', 'Tamil'],
    releaseDate: new Date('2026-09-25'),
    status: 'now_showing',
    order: 15,
  },
  {
    title: 'Meesaya Murukku 2',
    description: 'The energetic Tamil musical drama sequel celebrating youth, passion, independent music, and courage.',
    genre: ['Drama', 'Musical'],
    language: 'Tamil',
    duration: 148,
    posterUrl: '/posters/meesaya_murukku2.jpg',
    bannerUrl: '/posters/meesaya_murukku2.jpg',
    trailerUrl: 'https://www.youtube.com/watch?v=aG3m8e5k7T0',
    rating: 8.6,
    votesCount: '6.6K+ Likes',
    certification: 'U',
    formats: ['2D', 'Dolby Atmos'],
    availableLanguages: ['Tamil'],
    releaseDate: new Date('2026-09-25'),
    status: 'now_showing',
    order: 16,
  },

  {
    title: 'Ramayana',
    description: 'An epic mythological saga bringing to life the divine story of Lord Rama, Sita, and the triumph of good over evil.',
    genre: ['Fantasy', 'Action', 'Period'],
    language: 'Hindi',
    duration: 180,
    posterUrl: '/posters/ramayana.jpg',
    bannerUrl: '/posters/ramayana.jpg',
    trailerUrl: 'https://www.youtube.com/watch?v=G3q01rV8R1E',
    rating: 9.5,
    votesCount: '80.0K+',
    certification: 'U',
    formats: ['3D', 'IMAX 3D'],
    availableLanguages: ['Hindi', 'Malayalam', 'Tamil', 'Telugu', 'Kannada'],
    releaseDate: new Date('2026-12-30'),
    status: 'coming_soon',
    order: 17,
  },
  {
    title: 'Street Fighter',
    description: 'The live-action martial arts spectacle following world-renowned fighters gathering for the ultimate tournament of strength.',
    genre: ['Action', 'Adventure'],
    language: 'English',
    duration: 145,
    posterUrl: '/posters/street_fighter.jpg',
    bannerUrl: '/posters/street_fighter.jpg',
    trailerUrl: 'https://www.youtube.com/watch?v=3u_sH4h9_nI',
    rating: 8.8,
    votesCount: '42.1K+',
    certification: 'UA16+',
    formats: ['2D', 'IMAX 2D'],
    availableLanguages: ['English', 'Hindi'],
    releaseDate: new Date('2026-12-28'),
    status: 'coming_soon',
    order: 18,
  },
  {
    title: 'Dune: Messiah',
    description: 'The mythic journey of Paul Atreides continues as he navigates the complex political and religious landscape of Arrakis.',
    genre: ['Sci-Fi', 'Adventure'],
    language: 'English',
    duration: 166,
    posterUrl: '/posters/dune_messiah.jpg',
    bannerUrl: '/posters/dune_messiah.jpg',
    trailerUrl: 'https://www.youtube.com/watch?v=Way9Dexny3w',
    rating: 9.2,
    votesCount: '150.0K+',
    certification: 'UA16+',
    formats: ['IMAX 2D', 'Dolby Cinema'],
    availableLanguages: ['English', 'Hindi'],
    releaseDate: new Date('2026-12-27'),
    status: 'coming_soon',
    order: 19,
  },
];

const seedData = async () => {
  try {
    await connectDB();

    console.log('Clearing existing database collections...');
    await User.deleteMany();
    await Movie.deleteMany();
    await Showtime.deleteMany();
    await Seat.deleteMany();
    await Booking.deleteMany();
    await Payment.deleteMany();

    console.log('Seeding Users...');
    const salt = await bcrypt.genSalt(10);
    const adminPasswordHash = await bcrypt.hash('admin123', salt);
    const userPasswordHash = await bcrypt.hash('user123', salt);

    const admin = await User.create({
      name: 'System Admin',
      email: 'admincine12@gmail.com',
      passwordHash: adminPasswordHash,
      role: 'admin',
    });

    const demoUser = await User.create({
      name: 'Nandhana',
      email: 'user@moviebook.com',
      passwordHash: userPasswordHash,
      role: 'user',
    });

    console.log(`Created Admin: ${admin.email} (password: admin123)`);
    console.log(`Created Demo User: ${demoUser.email} (password: user123)`);

    console.log('Seeding Movies...');
    const createdMovies = await Movie.insertMany(sampleMovies);

    console.log('Seeding Showtimes & Seat Maps...');
    const today = new Date();

    const theaters = [
      { name: 'PVR Lulu Mall Kochi', screen: 'IMAX Screen 1', timeOffsetHours: 14, basePrice: 240 },
      { name: 'Shenoys Cinemas Ernakulam', screen: 'Screen 1 (4K Laser)', timeOffsetHours: 17, basePrice: 200 },
      { name: 'Ariesplex SL Cinemas 4K', screen: 'Audi 1 (Dolby Atmos)', timeOffsetHours: 20, basePrice: 220 },
    ];

    for (let index = 0; index < createdMovies.length; index++) {
      const movie = createdMovies[index];
      if (movie.status === 'now_showing') {
        for (let t = 0; t < theaters.length; t++) {
          const theaterInfo = theaters[t];
          const showDate = new Date(today.getTime() + 1 * 24 * 60 * 60 * 1000 + theaterInfo.timeOffsetHours * 60 * 60 * 1000);

          const showtime = await Showtime.create({
            movieId: movie._id,
            theaterName: theaterInfo.name,
            screenName: theaterInfo.screen,
            dateTime: showDate,
            totalSeats: 40,
            seatLayout: { rows: 5, cols: 8 },
            basePrice: theaterInfo.basePrice,
          });

          const rowLetters = ['A', 'B', 'C', 'D', 'E'];
          const seatsToInsert = [];

          for (let r = 0; r < 5; r++) {
            const rowName = rowLetters[r];
            for (let c = 1; c <= 8; c++) {
              let seatType = 'standard';
              let seatPrice = theaterInfo.basePrice;
              if (r === 0) {
                seatType = 'vip';
                seatPrice = theaterInfo.basePrice + 150;
              } else if (r === 1) {
                seatType = 'premium';
                seatPrice = theaterInfo.basePrice + 80;
              }

              seatsToInsert.push({
                showtimeId: showtime._id,
                seatNumber: `${rowName}${c}`,
                row: rowName,
                col: c,
                seatType,
                price: seatPrice,
                status: 'available',
              });
            }
          }

          await Seat.insertMany(seatsToInsert);
        }
      }
    }

    console.log('Database seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error during database seeding:', error);
    process.exit(1);
  }
};

seedData();
