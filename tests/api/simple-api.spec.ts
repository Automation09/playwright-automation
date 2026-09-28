import { test, expect, APIRequestContext } from '@playwright/test';

const baseBooking = {
  firstname: 'Jim',
  lastname: 'Brown',
  totalprice: 111,
  depositpaid: true,
  bookingdates: {
    checkin: '2024-01-01',
    checkout: '2024-01-05',
  },
  additionalneeds: 'Breakfast',
};

async function createToken(request: APIRequestContext) {
  const response = await request.post('/auth', {
    data: {
      username: 'admin',
      password: 'password123',
    },
  });

  expect(response.status()).toBe(200);
  const body = await response.json();
  expect(body.token).toBeTruthy();
  return body.token as string;
}

async function createBooking(request: APIRequestContext) {
  const response = await request.post('/booking', {
    data: baseBooking,
  });

  expect(response.status()).toBe(200);
  const body = await response.json();
  expect(body.bookingid).toBeTruthy();
  return { bookingId: body.bookingid, booking: body.booking };
}

async function authenticatedRequest(
  request: APIRequestContext,
  method: 'get' | 'post' | 'put' | 'patch' | 'delete',
  url: string,
  options?: any,
) {
  let token = await createToken(request);
  let response = await request[method](url, {
    ...options,
    headers: {
      ...(options?.headers || {}),
      Cookie: `token=${token}`,
    },
  });

  if (response.status() === 401 || response.status() === 403) {
    token = await createToken(request);
    response = await request[method](url, {
      ...options,
      headers: {
        ...(options?.headers || {}),
        Cookie: `token=${token}`,
      },
    });
  }

  return response;
}

test.describe('Restful Booker CRUD operations @api', () => {
  test('GET all booking IDs returns a valid list @api', async ({ request }) => {
    console.log('RUNNING: api - GET all booking IDs');

    const response = await request.get('/booking');
    console.log('Response status: ' + response.status());

    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(Array.isArray(body)).toBeTruthy();
    expect(body.length).toBeGreaterThan(0);
    expect(body[0]).toHaveProperty('bookingid');
  });

  test('GET a booking by id returns the expected booking details @api', async ({ request }) => {
    console.log('RUNNING: api - GET booking by id');

    const response = await request.get('/booking/2');
    console.log('Response status: ' + response.status());

    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body).toHaveProperty('firstname');
    expect(body).toHaveProperty('lastname');
    expect(body).toHaveProperty('bookingdates');
  });

  test('POST creates a new booking @api', async ({ request }) => {
    console.log('RUNNING: api - POST create booking');

    const response = await request.post('/booking', {
      data: baseBooking,
    });

    console.log('Response status: ' + response.status());
    const body = await response.json();
    console.log('Response body: ' + JSON.stringify(body, null, 2));

    expect(response.status()).toBe(200);
    expect(body.bookingid).toBeTruthy();
    expect(body.booking).toMatchObject(baseBooking);
  });

  test('PUT updates an existing booking @api', async ({ request }) => {
    console.log('RUNNING: api - PUT update booking');

    const token = await createToken(request);
    const createdBooking = await createBooking(request);

    const updatedBooking = {
      ...baseBooking,
      firstname: 'Updated',
      lastname: 'User',
      totalprice: 222,
      additionalneeds: 'Dinner',
    };

    const response = await authenticatedRequest(request, 'put', `/booking/${createdBooking.bookingId}`, {
      data: updatedBooking,
      headers: {
        Cookie: `token=${token}`,
      },
    });

    console.log('Response status: ' + response.status());
    const body = await response.json();
    console.log('Response body: ' + JSON.stringify(body, null, 2));

    expect(response.status()).toBe(200);
    expect(body).toMatchObject({
      firstname: 'Updated',
      lastname: 'User',
      totalprice: 222,
      additionalneeds: 'Dinner',
    });
  });

  test('PATCH updates selected fields on an existing booking @api', async ({ request }) => {
    console.log('RUNNING: api - PATCH partial update booking');

    const token = await createToken(request);
    const createdBooking = await createBooking(request);

    const response = await authenticatedRequest(request, 'patch', `/booking/${createdBooking.bookingId}`, {
      data: {
        firstname: 'Patched',
        additionalneeds: 'Lunch',
      },
      headers: {
        Cookie: `token=${token}`,
      },
    });

    console.log('Response status: ' + response.status());
    const body = await response.json();
    console.log('Response body: ' + JSON.stringify(body, null, 2));

    expect(response.status()).toBe(200);
    expect(body.firstname).toBe('Patched');
    expect(body.additionalneeds).toBe('Lunch');
  });

  test('DELETE removes an existing booking @api', async ({ request }) => {
    console.log('RUNNING: api - DELETE booking');

    const token = await createToken(request);
    const createdBooking = await createBooking(request);

    const deleteResponse = await authenticatedRequest(request, 'delete', `/booking/${createdBooking.bookingId}`, {
      headers: {
        Cookie: `token=${token}`,
      },
    });

    console.log('Delete status: ' + deleteResponse.status());
    expect(deleteResponse.status()).toBe(201);

    const getResponse = await request.get(`/booking/${createdBooking.bookingId}`);
    expect(getResponse.status()).toBe(404);
  });
});