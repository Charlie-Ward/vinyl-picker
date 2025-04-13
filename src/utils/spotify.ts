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

const albumArtCache: { [key: string]: string } = {}; // In-memory cache

export async function fetchAlbumArt(albumName: string): Promise<string> {
  // Check if the album art is already in the cache
  if (albumArtCache[albumName]) {
    console.log(`Cache hit for album: ${albumName}`);
    return albumArtCache[albumName];
  }

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
    albumArtCache[albumName] = albumArtUrl;

    return albumArtUrl;
  } catch (error) {
    console.error("Error fetching album art:", error);
    return "/albumArt/default.jpg"; // Fallback to default image
  }
}