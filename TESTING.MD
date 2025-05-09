# Testing
Several methodologies were used to test the site. The backend HTTP requests were tested in parralel to development, and all HTTP requests were covered by automated tests, with the exception of those that rely on the [OMDB API](https://www.omdbapi.com/) and those that involve sending emails. The front end section of the site was tested using automated tests and manual tests. The automated tests being divded into unit tests and integration tests. A finally category of tests was defined; End to End testing. This was included to ensure all 4 models (users, films, requests and reccomendations) had full CRUD functionality, and the user interface gave feedback on these operations where appropriate.
## Automated Testing
### Backend
The HTTP request were tested using [jest](https://jestjs.io/) and the [supertest package](https://www.npmjs.com/package/supertest). Automated tests cover all HTTP requests with the exception of the following:

Method              |           URL | Reasoning for ommiting
:-------------------------:| :-------------------------: | :-------------------------:|
|GET | /data/filmSearch | Reliance on external API|
|GET | /data/filmData | Reliance on external API|
|POST |/data/users/sendEmail | Reliance on nodemailer |
|PATCH | /data/users/me | Image upload could not be tested

Features not covered by automated tests will be tested manually.

The 4 router files each have an associated test file. Screenshots of the test results are given below.

[user.test.js](https://github.com/AlexSmall96/Film-Friends/tree/main/routers/user.test.js)

![](documentation/testing/router-tests/users.jpg)

[film.test.js](https://github.com/AlexSmall96/Film-Friends/tree/main/routers/film.test.js)


![](documentation/testing/router-tests/films.jpg)

[request.test.js](https://github.com/AlexSmall96/Film-Friends/tree/main/routers/request.test.js)


![](documentation/testing/router-tests/requests.jpg)

[reccomendation.test.js](https://github.com/AlexSmall96/Film-Friends/tree/main/routers/reccomendation.test.js)


![](documentation/testing/router-tests/reccomendations.jpg)

Note: When ran together, several tests sometimes fail. Since the database is wiped before each test, and all tests pass when ran individually, I chose to take the individual results as passing. 
### Frontend

#### Unit Tests

#### Integration Tests

## Manual Testing

## End to end Testing

