
const request = require('supertest');
const db = require('../data/dbConfig');
const server = require('./server');

// Write your tests here

beforeAll(async () => {
  await db.migrate.rollback();
  await db.migrate.latest();
})

beforeEach(async () => {
  await db('users').truncate();
})

afterAll(async () => {
  await db.destroy()
})

const testUser = {"username": "Al Pacino", "password": "Password123"};

test('[0] sanity check', () => {
  expect(true).not.toBe(false)
})

describe('Testing register endpoint', () => {
  test('[1] Successfully register new user', async () => {
    const response  = await request(server).post('/api/auth/register').send(testUser)
    expect(response.body).toMatchObject({username: testUser.username})
    expect(response.status).toEqual(200)
  }, 500)

  test('[2] Returns proper error message when username or password are wrong', async () => {
    const response  = await request(server).post('/api/auth/register').send({username: 'Al Pacino'})
    expect(response.body.message).toBe('username and password required')

    const response2  = await request(server).post('/api/auth/register').send({password: 'Password123'})
    expect(response2.body.message).toBe('username and password required')

    const response3  = await request(server).post('/api/auth/register').send({})
    expect(response3.body.message).toBe('username and password required')
  }, 1000)
})

describe('Testing login endpoint', () => {
  test('[3] Successfully logs in and returns a token', async () => {
    await request(server).post('/api/auth/register').send(testUser)
    const response  = await request(server).post('/api/auth/login').send(testUser)
     expect(response.body.token).toBeDefined()
  }, 1000)

  test('[4] Unable to login without correct username, password, and token', async () => {
    await request(server).post('/api/auth/register').send(testUser)
    const response  = await request(server).post('/api/auth/login').send({username: 'Johnny Depp', password: 'Password123'})
    expect(response.body.message).toBe('invalid credentials')
    const response2  = await request(server).post('/api/auth/login').send({username: 'Al Pacino', password: '123Password'})
    expect(response2.body.message).toBe('invalid credentials')
}, 1000)
})

describe('Testing Joke Endpoints', () => {
  test('[5] gets all jokes when user is logged in', async () => {
    await request(server).post('/api/auth/register').send(testUser)
    const response  = await request(server).post('/api/auth/login').send(testUser)
    expect(response.body.token).toBeDefined()
    const response2 = await request(server).get('/api/jokes').set({Authorization: response.body.token})
    expect (response2.body).not.toBeNull()
    expect(response2.body).toHaveLength(3)
  }, 1000)

  test('[6] return an error message if user is not logged in', async () => {
    const jokesError = await request(server).get('/api/jokes')
    expect(jokesError.body.message).toBe('token required')
    expect(jokesError.status).toEqual(401)
  }, 1000)
})