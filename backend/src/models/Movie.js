const mongoose = require('mongoose');

const movieSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Movie title is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
    },
    genre: {
      type: [String],
      required: true,
    },
    language: {
      type: String,
      required: true,
      default: 'English',
    },
    duration: {
      type: Number,
      required: true, 
    },
    posterUrl: {
      type: String,
      required: true,
    },
    bannerUrl: {
      type: String,
    },
    trailerUrl: {
      type: String,
    },
    rating: {
      type: Number,
      default: 8.5,
    },
    votesCount: {
      type: String,
      default: '50.2K+',
    },
    certification: {
      type: String,
      default: 'UA16+',
    },
    formats: {
      type: [String],
      default: ['2D', 'HDR By Barco', 'IMAX 2D', 'DOLBY CINEMA 2D'],
    },
    availableLanguages: {
      type: [String],
      default: ['Malayalam', 'Tamil', 'Hindi'],
    },
    releaseDate: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ['now_showing', 'coming_soon'],
      default: 'now_showing',
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Movie', movieSchema);
