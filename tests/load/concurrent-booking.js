import http from 'k6/http';
import {check} from 'k6';

const TOKEN = __ENV.TOKEN;
const SEAT_ID = __ENV.SEAT_ID;
const TRIP_ID = __ENV.TRIP_ID;

export const options = {
    vus:50,
    iterations:50
}

export default function (){
  const url = 'http://localhost:3000/api/v1/bookings';
  
  const payload = JSON.stringify({
    trip_id: TRIP_ID,
    seat_id: SEAT_ID
  });

  const params = {
    headers: {
        Authorization: `Bearer ${TOKEN}`,
        'Content-Type': 'application/json'
    }
  }

  const res = http.post(url, payload, params);
  console.log(`Status: ${res.status} | Body: ${res.body}`);
  check(res, {
    'status is 201 or 409': (r) => r.status === 201 || r.status === 409,
    'status is 201': (r) => r.status === 201,
    'status is 409': (r) => r.status === 409
  });
}