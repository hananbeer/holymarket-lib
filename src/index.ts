import { getEvent, getEventsList, getSearchEvents, getUserPortfolioValue } from './api';

import { getUserPositions, getUserTrades, getUserTraded } from './api';
import { UserPositionsQueryParams } from './api/types';
// import { getRawEventsList } from './api/gamma';
import { getRawUserTraded } from './api/data'

getUserPortfolioValue({ address: '0x1880E2b176Fbe2b59F425a8c912970850806381B' }).then(console.log)
// getUserTraded('0x1880E2b176Fbe2b59F425a8c912970850806381B').then(console.log)
// getRawUserTraded('0x1880E2b176Fbe2b59F425a8c912970850806381B').then(console.log)

// for await (const trade of getUserTrades({
//   address: '0x1880E2b176Fbe2b59F425a8c912970850806381B',
//   limit: 10,
//   batchSize: 10,
// })) {
//   console.log(trade);
//   console.log('-----\n')
// }

// console.log('getRawUserPositions')
// const params: UserPositionsQueryParams = {
//   address: '0x1880E2b176Fbe2b59F425a8c912970850806381B',
//   sizeThreshold: 0.1
// }

// getUserPositions(params).then(positions => {
//   console.log(positions);
// }).catch(error => {
//   console.error(error.stack);
// });

// console.log('getSearchEvents')
// try {
//   for await (const event of getSearchEvents({ tags: ['elon-tweets'], limit: 10 })) {
//     console.log('slug:', event.slug);
//   }
// } catch (error) {
//   console.error(error.stack);
// }

// console.log('getEventsList')
// for await (const event of getEventsList({
//   active: true,
//   closed: false,
//   order: 'id',
//   ascending: false,
//   limit: 10
// })) {
//   console.log('id:', event.id);
//   console.log('slug:', event.slug);
//   console.log('markets:', event.markets.length);
//   console.log('volume:', event.volume1yr);
// }

// console.log('getEvent')
// getEvent('eth-updown-5m-1771676700').then(event => {
//   console.log('id:', event.id);
//   console.log('slug:', event.slug);
//   console.log('markets:', event.markets.length);
//   console.log('volume:', event.volume1yr);
// }).catch(error => {
//   console.error('error');
// });

// getRawEventsList({
//   active: true,
//   closed: false,
//   order: 'id',
//   ascending: false,
//   limit: 10
// }).then(response => {
//   response.forEach(event => { 
//     console.log(event.slug);
//   });
// }).catch(error => {
//   console.error('error');
// });
