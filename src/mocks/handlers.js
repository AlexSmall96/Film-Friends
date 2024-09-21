import { http, HttpResponse } from "msw";

export const handlers = [

  // Default handler for sign up - mock valid sign up data
  http.post('http://localhost:3001/users', () => {
    return HttpResponse.json(null, {status: 201})
  }),

  // Default handler for login - mock valid sign up data
  http.post('http://localhost:3001/users/login', () => {
    return HttpResponse.json({
      user: {
        username: 'user one',
        _id: '123'
      },
      token: 'useronetoken'
    }, {status: 200})
  }),

  // Default handler to check if token is still valid
  http.get('http://localhost:3001/users/token', () => {
    return HttpResponse.json(null, {status: 200})
  }),

  // Default handler for logout
  http.post('http://localhost:3001/users/logout', () => {
    return HttpResponse.json(null, {status: 200})
  })
]