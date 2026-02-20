import { getEvent, getEventsList } from './api';

getEventsList({
  active: true,
  closed: false,
  order: 'id',
  ascending: false,
  limit: 10
}).then(events => {
  console.log('events:', events.length);
  events.forEach(event => {
    console.log('id:', event.id);
    console.log('slug:', event.slug);
    console.log('markets:', event.markets.length);
    console.log('volume:', event.volume1yr);
  });
}).catch(error => {
  console.error(error);
});

// getEvent('eth-updown-5m-1771676700').then(event => {
//   console.log('id:', event.id);
//   console.log('slug:', event.slug);
//   console.log('markets:', event.markets.length);
//   console.log('volume:', event.volume1yr);
// }).catch(error => {
//   console.error('error');
// });

// import { getRawEventsList } from './api/gamma';

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
