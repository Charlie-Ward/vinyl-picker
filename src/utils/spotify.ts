export async function getSpotifyAccessToken() {
  const response = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${btoa(
        `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
      )}`,
    },
    body: "grant_type=client_credentials",
  });

  const data = await response.json();
  return data.access_token;
}

const albumArtCache: { [key: string]: { url: string; expiry: number } } = {}; // In-memory cache
const CACHE_TTL = 60 * 60 * 1000; // 1 hour in milliseconds

export async function fetchAlbumArt(albumName: string, localImagePath: string): Promise<string> {
  const now = Date.now();

  // Check if the album art is in the cache and not expired
  if (albumArtCache[albumName] && albumArtCache[albumName].expiry > now) {
    console.log(`Cache hit for album: ${albumName}`);
    return albumArtCache[albumName].url;
  }

  // Step 1: Check if the local file exists
  const localFileExists = await checkLocalFileExists(localImagePath);
  if (localFileExists) {
    console.log(`Local file found for album: ${albumName}`);
    albumArtCache[albumName] = { url: localImagePath, expiry: now + CACHE_TTL };
    return localImagePath;
  }

  // Step 2: Fetch from Spotify API
  try {
    const accessToken = await getSpotifyAccessToken();

    const response = await fetch(
      `https://api.spotify.com/v1/search?q=${encodeURIComponent(albumName)}&type=album&limit=1`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    const data = await response.json();
    const albumArtUrl = data.albums?.items[0]?.images[0]?.url || "/albumArt/default.jpg";

    // Store the result in the cache
    albumArtCache[albumName] = { url: albumArtUrl, expiry: now + CACHE_TTL };

    return albumArtUrl;
  } catch (error) {
    console.error("Error fetching album art from Spotify:", error);
  }

  // Step 3: Fallback to default image
  console.log(`Using default image for album: ${albumName}`);
  return "/albumArt/default.jpg";
}

async function checkLocalFileExists(filePath: string): Promise<boolean> {
  try {
    const response = await fetch(filePath, { method: "HEAD" });
    return response.ok;
  } catch {
    return false;
  }
}