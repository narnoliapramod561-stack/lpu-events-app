import assert from 'node:assert/strict';
import { PublicApiClient } from '../src/api/publicApi.ts';
import { NativeCache } from '../src/cache/nativeCache.ts';

const jsonResponse = (value: unknown, status = 200): Response =>
  new Response(JSON.stringify(value), {
    status,
    headers: { 'content-type': 'application/json' },
  });

const event = {
  id: '00000000-0000-0000-0000-000000000001',
  name: 'Test event',
  description: '',
  start_at: '2026-10-31T10:00:00Z',
  end_at: '2026-10-31T11:00:00Z',
  venue_name: 'LPU',
  registration_mode: 'NONE',
  pricing_type: 'FREE',
  banner_media_id: null,
  organizations: null,
};

const homepage = {
  categories: [],
  carousel: [],
  featured: [],
  trending: [],
  settings: [],
  events: [event],
};

async function runIsolatedChecks(): Promise<void> {
  const cache = new NativeCache();
  const isString = (value: unknown): value is string => typeof value === 'string';
  await cache.write('expiry-check', 'cached', 50, 1000);
  assert.equal((await cache.read('expiry-check', isString))?.data, 'cached');
  await new Promise((resolve) => setTimeout(resolve, 75));
  assert.equal((await cache.read('expiry-check', isString))?.data, undefined);
  assert.equal((await cache.read('expiry-check', isString, { allowStale: true }))?.stale, true);

  let calls = 0;
  const client = new PublicApiClient({
    timeoutMs: 20,
    fetchFn: async () => {
      calls += 1;
      await new Promise((resolve) => setTimeout(resolve, 5));
      return jsonResponse(homepage);
    },
  });
  const [first, second] = await Promise.all([client.getHomepage(true), client.getHomepage(true)]);
  assert.deepEqual(first.data, second.data);
  assert.equal(calls, 1, 'same-key requests must share one promise');

  const invalid = new PublicApiClient({ fetchFn: async () => jsonResponse({ nope: true }) });
  const invalidResult = await invalid.getHomepage(true);
  assert.equal(invalidResult.error?.code, 'INVALID_RESPONSE');

  const timeout = new PublicApiClient({
    timeoutMs: 1,
    fetchFn: async (_url, init) => new Promise((_resolve, reject) => {
      init?.signal?.addEventListener('abort', () => reject(new DOMException('timeout', 'AbortError')));
    }),
  });
  const timeoutResult = await timeout.getHomepage(true);
  assert.equal(timeoutResult.error?.code, 'TIMEOUT');

  let failing = false;
  const staleClient = new PublicApiClient({
    fetchFn: async () => failing ? jsonResponse({ broken: true }) : jsonResponse(homepage),
  });
  assert.equal((await staleClient.getHomepage(true)).data?.events.length, 1);
  failing = true;
  const stale = await staleClient.getHomepage(true);
  assert.equal(stale.data, null, 'force refresh explicitly invalidates the cache');

  const fallbackClient = new PublicApiClient({
    fetchFn: async (input) => String(input).includes('manifest') ? jsonResponse({ broken: true }) : jsonResponse(homepage),
  });
  const snapshot = await fallbackClient.getHomepageWithSnapshot();
  assert.equal(snapshot.data?.events.length, 1, 'invalid snapshots must fall back to API data');
}

async function runLiveChecks(): Promise<void> {
  const client = new PublicApiClient({ timeoutMs: 20_000 });
  const homepageResult = await client.getHomepage(true);
  assert.ok(homepageResult.data, homepageResult.error?.message ?? 'homepage failed');
  const feedResult = await client.getEventFeed({ limit: 2, offset: 0 }, true);
  assert.ok(feedResult.data, feedResult.error?.message ?? 'feed failed');
  assert.ok(feedResult.data!.length <= 2);
  const firstId = feedResult.data![0]?.id;
  if (firstId) {
    const detailResult = await client.getEventDetails(firstId);
    assert.ok(detailResult.data, detailResult.error?.message ?? 'detail failed');
  }
  const manifestResult = await client.getSnapshotManifest(true);
  assert.ok(manifestResult.data, manifestResult.error?.message ?? 'manifest failed');
  const snapshotResult = await client.getHomepageSnapshot();
  assert.ok(snapshotResult.data, snapshotResult.error?.message ?? 'snapshot failed');
  console.log(`Live API checks passed: homepage, feed, detail, manifest, snapshot (${manifestResult.data!.revision})`);
}

await runIsolatedChecks();
await runLiveChecks();
console.log('Native API/cache checks passed: parsing, deduplication, timeout, invalid response, and fallback paths.');
