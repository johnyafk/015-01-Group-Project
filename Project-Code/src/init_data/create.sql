/* DROP TABLE IF EXISTS users CASCADE;
CREATE TABLE IF NOT EXISTS users (
  username VARCHAR PRIMARY KEY,
  password VARCHAR NOT NULL,
  email VARCHAR,
  first_name VARCHAR,
  last_name VARCHAR
); */

/* DROP TABLE IF EXISTS videos CASCADE;
CREATE TABLE IF NOT EXISTS videos (
    video_id INT PRIMARY KEY,
    title VARCHAR NOT NULL,
    url VARCHAR NOT NULL
) */

CREATE TABLE users(
  username VARCHAR(50) PRIMARY KEY,
  password VARCHAR(60) NOT NULL,
  email VARCHAR,
  first_name VARCHAR,
  last_name VARCHAR,
  profilepicurl VARCHAR
);

CREATE TABLE userVideos(
  username VARCHAR NOT NULL,
  videoID VARCHAR NOT NULL,
  videoTitle VARCHAR NOT NULL
);