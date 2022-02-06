import type { LoaderFunction } from 'remix';
import { getDbCollections } from '../db/db.server';
import { JokeInterface } from '../db/uiInterfaces';
import { COL_USERS } from '../db/collectionNames';

function escapeCdata(string?: string) {
  return string?.replaceAll(']]>', ']]]]><![CDATA[>') || '';
}

function escapeHtml(string?: string) {
  return (
    string
      ?.replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#039;') || ''
  );
}

export const loader: LoaderFunction = async ({ request }) => {
  const collections = await getDbCollections();
  const jokesCollection = collections.jokesCollection();
  const jokes = await jokesCollection
    .aggregate<JokeInterface>([
      {
        $sort: {
          _id: -1,
        },
      },
      {
        $limit: 100,
      },
      {
        $lookup: {
          from: COL_USERS,
          as: 'jokester',
          let: {
            jokesterId: '$jokesterId',
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ['$$jokesterId', '$_id'],
                },
              },
            },
            {
              $project: {
                username: true,
              },
            },
          ],
        },
      },
      {
        $addFields: {
          jokester: {
            $arrayElemAt: ['$jokester', 0],
          },
        },
      },
    ])
    .toArray();

  const host = request.headers.get('X-Forwarded-Host') ?? request.headers.get('host');
  if (!host) {
    throw new Error('Could not determine domain URL.');
  }
  const protocol = host.includes('localhost') ? 'http' : 'https';
  const domain = `${protocol}://${host}`;
  const jokesUrl = `${domain}/jokes`;

  const rssString = `
    <rss xmlns:blogChannel="${jokesUrl}" version="2.0">
      <channel>
        <title>Remix Jokes</title>
        <link>${jokesUrl}</link>
        <description>Some funny jokes</description>
        <language>en-us</language>
        <generator>Kody the Koala</generator>
        <ttl>40</ttl>
        ${jokes
          .map((joke) => {
            return `
            <item>
              <title><![CDATA[${escapeCdata(joke.name)}]]></title>
              <description><![CDATA[A funny joke called ${escapeHtml(joke.name)}]]></description>
              <author><![CDATA[${escapeCdata(joke.jokester?.username)}]]></author>
              <pubDate>${joke.createdAt?.toUTCString()}</pubDate>
              <link>${jokesUrl}/${joke._id}</link>
              <guid>${jokesUrl}/${joke._id}</guid>
            </item>
          `.trim();
          })
          .join('\n')}
      </channel>
    </rss>
  `.trim();

  return new Response(rssString, {
    headers: {
      'Cache-Control': `public, max-age=${60 * 10}, s-maxage=${60 * 60 * 24}`,
      'Content-Type': 'application/xml',
      'Content-Length': String(Buffer.byteLength(rssString)),
    },
  });
};
