import type { MediaItem } from './types';

/**
 * Offline seed data.
 *
 * Rendered instantly on first paint and used whenever an upstream provider is
 * unreachable, so the grid is never empty. Metadata only — no media is hosted.
 */
export const FALLBACK: MediaItem[] = [
  {
    uid: 'anime:5114', id: 5114, kind: 'anime',
    title: 'Fullmetal Alchemist: Brotherhood',
    year: 2009,
    synopsis: 'Two brothers search for the Philosopher\u2019s Stone to restore what a forbidden alchemical ritual took from them.',
    poster: 'https://cdn.myanimelist.net/images/anime/1223/96541.jpg',
    backdrop: 'https://cdn.myanimelist.net/images/anime/1223/96541l.jpg',
    score: 9.1, genres: ['Action', 'Adventure', 'Drama'], studio: 'Bones',
    episodes: 64, rating: 'R-17+', hindi: true,
    languages: ['Hindi', 'English', 'Japanese'],
    trending: true, newRelease: false
  },
  {
    uid: 'anime:1535', id: 1535, kind: 'anime',
    title: 'Death Note',
    year: 2006,
    synopsis: 'A gifted student finds a notebook that kills anyone whose name is written in it, and a nameless detective sets out to stop him.',
    poster: 'https://cdn.myanimelist.net/images/anime/9/9453.jpg',
    backdrop: 'https://cdn.myanimelist.net/images/anime/9/9453l.jpg',
    score: 8.6, genres: ['Mystery', 'Thriller', 'Supernatural'], studio: 'Madhouse',
    episodes: 37, rating: 'R-17+', hindi: true,
    languages: ['Hindi', 'English', 'Japanese'],
    trending: true, newRelease: false
  },
  {
    uid: 'anime:16498', id: 16498, kind: 'anime',
    title: 'Attack on Titan',
    year: 2013,
    synopsis: 'Humanity shelters behind enormous walls from the Titans that devour them, until one wall is breached.',
    poster: 'https://cdn.myanimelist.net/images/anime/10/47347.jpg',
    backdrop: 'https://cdn.myanimelist.net/images/anime/10/47347l.jpg',
    score: 8.5, genres: ['Action', 'Drama', 'Suspense'], studio: 'Wit Studio',
    episodes: 25, rating: 'R-17+', hindi: true,
    languages: ['Hindi', 'English', 'Japanese'],
    trending: true, newRelease: false
  },
  {
    uid: 'anime:40748', id: 40748, kind: 'anime',
    title: 'Jujutsu Kaisen',
    year: 2020,
    synopsis: 'A high-schooler swallows a cursed relic and is pulled into a hidden war between sorcerers and curses.',
    poster: 'https://cdn.myanimelist.net/images/anime/1171/109222.jpg',
    backdrop: 'https://cdn.myanimelist.net/images/anime/1171/109222l.jpg',
    score: 8.6, genres: ['Action', 'Supernatural'], studio: 'MAPPA',
    episodes: 24, rating: 'R-17+', hindi: true,
    languages: ['Hindi', 'English', 'Japanese'],
    trending: true, newRelease: false
  },
  {
    uid: 'anime:38000', id: 38000, kind: 'anime',
    title: 'Demon Slayer: Kimetsu no Yaiba',
    year: 2019,
    synopsis: 'After his family is killed and his sister cursed, a boy joins the corps that hunts demons.',
    poster: 'https://cdn.myanimelist.net/images/anime/1286/99889.jpg',
    backdrop: 'https://cdn.myanimelist.net/images/anime/1286/99889l.jpg',
    score: 8.4, genres: ['Action', 'Adventure', 'Fantasy'], studio: 'ufotable',
    episodes: 26, rating: 'R-17+', hindi: true,
    languages: ['Hindi', 'English', 'Japanese'],
    trending: true, newRelease: false
  },
  {
    uid: 'anime:52299', id: 52299, kind: 'anime',
    title: 'Solo Leveling',
    year: 2024,
    synopsis: 'The weakest hunter alive gains the singular ability to grow stronger without limit.',
    poster: 'https://cdn.myanimelist.net/images/anime/1926/140799.jpg',
    backdrop: 'https://cdn.myanimelist.net/images/anime/1926/140799l.jpg',
    score: 8.2, genres: ['Action', 'Fantasy'], studio: 'A-1 Pictures',
    episodes: 12, rating: 'PG-13', hindi: true,
    languages: ['Hindi', 'English', 'Japanese'],
    trending: true, newRelease: true
  },
  {
    uid: 'anime:21', id: 21, kind: 'anime',
    title: 'One Piece',
    year: 1999,
    synopsis: 'A crew of pirates sails an endless ocean chasing the greatest treasure ever hidden.',
    poster: 'https://cdn.myanimelist.net/images/anime/6/73245.jpg',
    backdrop: 'https://cdn.myanimelist.net/images/anime/6/73245l.jpg',
    score: 8.7, genres: ['Action', 'Adventure', 'Fantasy'], studio: 'Toei Animation',
    episodes: 1100, rating: 'PG-13', hindi: true,
    languages: ['Hindi', 'English', 'Japanese'],
    trending: true, newRelease: false
  },
  {
    uid: 'anime:11061', id: 11061, kind: 'anime',
    title: 'Hunter x Hunter (2011)',
    year: 2011,
    synopsis: 'A boy sets out to become a Hunter and find the father who left him behind.',
    poster: 'https://cdn.myanimelist.net/images/anime/1337/99013.jpg',
    backdrop: 'https://cdn.myanimelist.net/images/anime/1337/99013l.jpg',
    score: 9.0, genres: ['Action', 'Adventure', 'Fantasy'], studio: 'Madhouse',
    episodes: 148, rating: 'PG-13', hindi: false,
    languages: ['English', 'Japanese'],
    trending: false, newRelease: false
  },
  {
    uid: 'anime:9253', id: 9253, kind: 'anime',
    title: 'Steins;Gate',
    year: 2011,
    synopsis: 'A self-styled mad scientist stumbles onto time travel and then has to undo what it costs him.',
    poster: 'https://cdn.myanimelist.net/images/anime/1935/127974.jpg',
    backdrop: 'https://cdn.myanimelist.net/images/anime/1935/127974l.jpg',
    score: 9.0, genres: ['Drama', 'Sci-Fi', 'Suspense'], studio: 'White Fox',
    episodes: 24, rating: 'PG-13', hindi: false,
    languages: ['English', 'Japanese'],
    trending: false, newRelease: false
  },
  {
    uid: 'anime:30276', id: 30276, kind: 'anime',
    title: 'One Punch Man',
    year: 2015,
    synopsis: 'A hero who wins every fight with one punch struggles with how boring that has become.',
    poster: 'https://cdn.myanimelist.net/images/anime/12/76049.jpg',
    backdrop: 'https://cdn.myanimelist.net/images/anime/12/76049l.jpg',
    score: 8.5, genres: ['Action', 'Comedy'], studio: 'Madhouse',
    episodes: 12, rating: 'R-17+', hindi: true,
    languages: ['Hindi', 'English', 'Japanese'],
    trending: false, newRelease: false
  },
  {
    uid: 'anime:44511', id: 44511, kind: 'anime',
    title: 'Chainsaw Man',
    year: 2022,
    synopsis: 'A young debtor merges with his chainsaw devil dog and is drafted into hunting other devils.',
    poster: 'https://cdn.myanimelist.net/images/anime/1806/126216.jpg',
    backdrop: 'https://cdn.myanimelist.net/images/anime/1806/126216l.jpg',
    score: 8.5, genres: ['Action', 'Fantasy'], studio: 'MAPPA',
    episodes: 12, rating: 'R-17+', hindi: false,
    languages: ['English', 'Japanese'],
    trending: false, newRelease: true
  },
  {
    uid: 'anime:269', id: 269, kind: 'anime',
    title: 'Bleach',
    year: 2004,
    synopsis: 'A teenager inherits a Soul Reaper\u2019s power and takes on the duty of guarding the living.',
    poster: 'https://cdn.myanimelist.net/images/anime/3/40451.jpg',
    backdrop: 'https://cdn.myanimelist.net/images/anime/3/40451l.jpg',
    score: 7.9, genres: ['Action', 'Adventure', 'Supernatural'], studio: 'Pierrot',
    episodes: 366, rating: 'PG-13', hindi: true,
    languages: ['Hindi', 'English', 'Japanese'],
    trending: false, newRelease: false
  }
];
