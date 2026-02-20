import { getEvent, getEventsList, getSearchEvents } from './api';

// import { getRawEventsList } from './api/gamma';

console.log('getSearchEvents')
try {
  for await (const event of getSearchEvents({ tags: ['elon-tweets'], limit: 10 })) {
    console.log('slug:', event.slug);
  }
} catch (error) {
  console.error(error.stack);
}

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
