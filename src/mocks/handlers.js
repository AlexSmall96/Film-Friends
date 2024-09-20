import { http, HttpResponse } from "msw";

export const handlers = [
  // Deault handler for sign up - mock valid sign up data
  http.post('http://localhost:3001/users', () => {
    return HttpResponse.json(null, {status: 201})
  })
]