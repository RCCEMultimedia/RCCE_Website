const GRAPH_API = 'https://graph.instagram.com';
const PHOTO_TYPES = new Set(['IMAGE', 'CAROUSEL_ALBUM']);
const MAX_POSTS = 16; // Four rows in the homepage's four-column desktop grid.

export default async function handler() {
  const accessToken = process.env.INSTAGRAM_ACCESS_TOKEN;
  // Most Instagram tokens support `me`; set INSTAGRAM_USER_ID only if your
  // Meta app requires the numeric Instagram account ID instead.
  const userId = process.env.INSTAGRAM_USER_ID || 'me';

  if (!accessToken) {
    return Response.json(
      { error: 'Instagram feed has not been configured.' },
      { status: 503, headers: cacheHeaders(60) },
    );
  }

  try {
    const posts = [];
    let nextUrl = new URL(`${GRAPH_API}/${encodeURIComponent(userId)}/media`);
    nextUrl.searchParams.set('fields', 'id,caption,media_type,media_url,thumbnail_url,permalink,timestamp,children{id,media_type,media_url,thumbnail_url}');
    nextUrl.searchParams.set('limit', '100');
    nextUrl.searchParams.set('access_token', accessToken);

    // Follow Meta's pagination so the page can display every eligible photo post.
    while (nextUrl && posts.length < MAX_POSTS) {
      const response = await fetch(nextUrl);
      if (!response.ok) throw new Error(`Instagram API returned ${response.status}`);

      const payload = await response.json();
      posts.push(...(payload.data || [])
        .filter(post => PHOTO_TYPES.has(post.media_type) && (post.media_url || post.thumbnail_url))
        .slice(0, MAX_POSTS - posts.length));
      nextUrl = payload.paging?.next ? new URL(payload.paging.next) : null;
    }

    return Response.json(
      { data: posts },
      { headers: cacheHeaders(900) },
    );
  } catch (error) {
    console.error('Unable to load Instagram media:', error.message);
    return Response.json(
      { error: 'Unable to load the Instagram feed.' },
      { status: 502, headers: cacheHeaders(60) },
    );
  }
}

function cacheHeaders(seconds) {
  return {
    'Cache-Control': `public, max-age=${seconds}, s-maxage=${seconds}, stale-while-revalidate=86400`,
  };
}
