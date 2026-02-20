let buildId: string | undefined;
let deploymentId: string | undefined;

export async function refreshTokens(): Promise<boolean> {
  const html = await fetch('https://polymarket.com/').then(res => res.text());
  buildId = html.match(/"buildId":"([^"]+)"/)?.[1];
  deploymentId = html.match(/\?dpl=(dpl_[^"]+)/)?.[1];

  return (Boolean(buildId) && Boolean(deploymentId));
}

export type PriceToBeat = {
  openPrice: number
  closePrice: number
}

/*
this simple tool uses polymarket web (nextjs, no official api) to scrape the price to beat
for crypto markets.

for different events may need to change the slug formula.

and it outputs to stdout, so potentially pipe "tsx tools/scan/price_to_beat | tee -a price_to_beat.csv"
*/
export async function getPriceToBeat(slug: string, retries: number = 2, retryDelayMs: number = 250): Promise<PriceToBeat | undefined> {
  for (let i = 0; i < retries; i++) {
    if (!buildId || !deploymentId) {
      if (!await refreshTokens()) {
        continue;
      }
    }

    if (!buildId || !deploymentId) {
      return undefined;
    }

    const url = `https://polymarket.com/_next/data/${buildId}/en/event/${slug}.json`;

    try {
      const response = await fetch(url, {
        headers: {
          'X-Deployment-Id': deploymentId
        }
      });
      const data = await response.json() as any;
      const queryData = data.pageProps.dehydratedState.queries.find(query => query.queryKey[0] === 'crypto-prices')?.state?.data;
      if (!queryData) {
        continue;
      }
      const { openPrice, closePrice } = queryData;
      if (openPrice) {
        return { openPrice, closePrice };
      }
    } catch {
      buildId = undefined;
      deploymentId = undefined;
    }

    await new Promise((resolve) => setTimeout(resolve, retryDelayMs));
  }

  return undefined;
}
