export const moviePosterMap = {
  'bethlehem': '/posters/bethlehem_kudumba_unit.jpg',
  'kudumba': '/posters/bethlehem_kudumba_unit.jpg',
  'prathama': '/posters/prathama_drishtya_kuttakar.jpg',
  'pradhama': '/posters/prathama_drishtya_kuttakar.jpg',
  'kuttakar': '/posters/prathama_drishtya_kuttakar.jpg',
  'aasha': '/posters/aasha.jpg',
  'asha': '/posters/aasha.jpg',
  'khalifa': '/posters/khalifa.jpg',
  'dc': '/posters/dc.jpg',
  'sardar': '/posters/sardar2.jpg',
  'paradise': '/posters/paradise.jpg',
  'bramayugam': '/posters/bramayugam.jpg',
  'manjummel': '/posters/manjummel_boys.jpg',
  'thudakkam': '/posters/thudakkam.jpg',
  'premalu': '/posters/premalu.jpg',
  'aavesham': '/posters/aavesham.jpg',
  'primetime': '/posters/primetime.jpg',
  'chill maar': '/posters/oye_chill_maar.jpg',
  'oye chill': '/posters/oye_chill_maar.jpg',
  'runner': '/posters/runner.jpg',
  'meesaya': '/posters/meesaya_murukku2.jpg',
  'murukku': '/posters/meesaya_murukku2.jpg',
  'ramayana': '/posters/ramayana.jpg',
  'street fighter': '/posters/street_fighter.jpg',
  'dune': '/posters/dune_messiah.jpg',
};

export const movieTrailerMap = {
  'bethlehem': 'https://www.youtube.com/watch?v=YoHD9XEInc0',
  'kudumba': 'https://www.youtube.com/watch?v=YoHD9XEInc0',
  'prathama': 'https://www.youtube.com/watch?v=EXeTwQWrcwY',
  'pradhama': 'https://www.youtube.com/watch?v=EXeTwQWrcwY',
  'kuttakar': 'https://www.youtube.com/watch?v=EXeTwQWrcwY',
  'aasha': 'https://www.youtube.com/watch?v=zSWdZVtXT7E',
  'asha': 'https://www.youtube.com/watch?v=zSWdZVtXT7E',
  'khalifa': 'https://www.youtube.com/watch?v=q6E0U9Mvdzg',
  'dc': 'https://www.youtube.com/watch?v=f9vT80a187g',
  'sardar': 'https://www.youtube.com/watch?v=8367_pG521Q',
  'paradise': 'https://www.youtube.com/watch?v=r0wO_T0d_rE',
  'bramayugam': 'https://www.youtube.com/watch?v=pks3_oPspUo',
  'manjummel': 'https://www.youtube.com/watch?v=id848Ww1YLo',
  'thudakkam': 'https://www.youtube.com/watch?v=CqYf_5zD16s',
  'premalu': 'https://www.youtube.com/watch?v=r_2Xb-Q2K7o',
  'aavesham': 'https://www.youtube.com/watch?v=L0yEMFQs3ab',
  'primetime': 'https://www.youtube.com/watch?v=mqqft2x_Aa4',
  'chill maar': 'https://www.youtube.com/watch?v=qE3Jp4tE1Zk',
  'oye chill': 'https://www.youtube.com/watch?v=qE3Jp4tE1Zk',
  'runner': 'https://www.youtube.com/watch?v=Kz6M8x7bFm0',
  'meesaya': 'https://www.youtube.com/watch?v=aG3m8e5k7T0',
  'murukku': 'https://www.youtube.com/watch?v=aG3m8e5k7T0',
  'ramayana': 'https://www.youtube.com/watch?v=G3q01rV8R1E',
  'street fighter': 'https://www.youtube.com/watch?v=3u_sH4h9_nI',
  'dune': 'https://www.youtube.com/watch?v=Way9Dexny3w',
};

export const getPosterFallback = (title) => {
  const t = (title || '').toLowerCase().trim();
  for (const [key, poster] of Object.entries(moviePosterMap)) {
    if (t.includes(key)) {
      return poster;
    }
  }
  return '/posters/bethlehem_kudumba_unit.jpg';
};

export const getMoviePosterUrl = (movie) => {
  if (!movie) return '/posters/bethlehem_kudumba_unit.jpg';

  if (typeof movie === 'string') {
    if (movie.startsWith('http') || movie.startsWith('/')) {
      return movie;
    }
    return getPosterFallback(movie);
  }

  if (movie.posterUrl && typeof movie.posterUrl === 'string' && movie.posterUrl.trim() !== '') {
    const url = movie.posterUrl.trim();
    if (url.startsWith('/uploads/')) {
      const apiHost = import.meta.env?.VITE_API_URL
        ? import.meta.env.VITE_API_URL.replace(/\/api\/?$/, '')
        : 'http://localhost:5001';
      return `${apiHost}${url}`;
    }
    return url;
  }

  return getPosterFallback(movie.title) || '/posters/bethlehem_kudumba_unit.jpg';
};

export const getMovieTrailerUrl = (movie) => {
  if (!movie) return 'https://www.youtube.com';

  const title = typeof movie === 'string' ? movie : movie.title;

  if (title && title.trim() !== '') {
    return `https://www.youtube.com/results?search_query=${encodeURIComponent(title.trim() + ' official trailer')}`;
  }

  return 'https://www.youtube.com';
};
