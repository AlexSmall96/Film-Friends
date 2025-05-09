# Testing
Several methodologies were used to test the site. The backend HTTP requests were tested in parralel to development, and all HTTP requests were covered by automated tests, with the exception of those that rely on the [OMDB API](https://www.omdbapi.com/) and those that involve sending emails. The front end section of the site was tested using automated tests and manual tests. The automated tests being divded into unit tests and integration tests. A finally category of tests was defined; End to End testing. This was included to ensure all 4 models (users, films, requests and reccomendations) had full CRUD functionality, and the user interface gave feedback on these operations where appropriate.
## Automated Testing
### Backend
The HTTP request were tested using [vitest](https://vitest.dev/) and the [supertest package](https://www.npmjs.com/package/supertest). Automated tests cover all HTTP requests with the exception of the following:

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
The front end section of the site was tested with automated and manual tests, using Vitest and React Testing Library. Where appropriate, a test file for each React component was created. Mock data was used in the tests, these were passed into the components either diectly through props or contexts, or using  [Mock Service Worker (MSW)](https://mswjs.io/) to intercept and mock request handlers. The methodology for the following automated tests was based on the Udemy course:
[https://www.udemy.com/course/react-testing-library](https://www.udemy.com/course/react-testing-library)

#### Unit Tests
For relevant subcomponents, a test file was created. Screenshots of the results for each test file are given below.

[Avatar.test.jsx](https://github.com/AlexSmall96/Film-Friends/tree/main/src/components/Avatar.test.jsx)

![](documentation/testing/unit-tests/Avatar.jpg)

[DeleteModal.test.jsx](https://github.com/AlexSmall96/Film-Friends/tree/main/src/components/DeleteModal.test.jsx)

![](documentation/testing/unit-tests/DeleteModal.jpg)

[FilmPreview.test.jsx](https://github.com/AlexSmall96/Film-Friends/tree/main/src/components/FilmPreview.test.jsx)

![](documentation/testing/unit-tests/FilmPreview.jpg)

[NavBar.test.jsx](https://github.com/AlexSmall96/Film-Friends/tree/main/src/components/NavBar.test.jsx)

![](documentation/testing/unit-tests/NavBar.jpg)

[ResultsPagination.test.jsx](https://github.com/AlexSmall96/Film-Friends/tree/main/src/components/ResultsPagination.test.jsx)

![](documentation/testing/unit-tests/ResultsPagination.jpg)

[SaveDropdown.test.jsx](https://github.com/AlexSmall96/Film-Friends/tree/main/src/components/SaveDropdown.test.jsx)

![](documentation/testing/unit-tests/SaveDropdown.jpg)

[EllipsisMenu.test.jsx](https://github.com/AlexSmall96/Film-Friends/tree/main/src/pages/films/EllipsisMenu.test.jsx)

![](documentation/testing/unit-tests/EllipsisMenu.jpg)

[Film.test.jsx](https://github.com/AlexSmall96/Film-Friends/tree/main/src/pages/films/Film.test.jsx)

![](documentation/testing/unit-tests/Film.jpg)

[Filters.test.jsx](https://github.com/AlexSmall96/Film-Friends/tree/main/src/pages/films/Filters.test.jsx)

![](documentation/testing/unit-tests/Filters.jpg)

[IconRating.test.jsx](https://github.com/AlexSmall96/Film-Friends/tree/main/src/pages/films/IconRating.test.jsx)

![](documentation/testing/unit-tests/IconRating.jpg)

[PublicProfile.test.jsx](https://github.com/AlexSmall96/Film-Friends/tree/main/src/pages/films/PublicProfile.test.jsx)

![](documentation/testing/unit-tests/PublicProfile.jpg)

[FriendRequestButtons.test.jsx](https://github.com/AlexSmall96/Film-Friends/tree/main/src/pages/friends/FriendRequestButtons.test.jsx)

![](documentation/testing/unit-tests/FriendRequestButtons.jpg)

[ShareModal.test.jsx](https://github.com/AlexSmall96/Film-Friends/tree/main/src/pages/friends/ShareModal.test.jsx)

![](documentation/testing/unit-tests/ShareModal.jpg)

[FilmBadges.test.jsx](https://github.com/AlexSmall96/Film-Friends/tree/main/src/pages/home/FilmBadges.jsx)

![](documentation/testing/unit-tests/FilmBadges.jpg)

[FilmPosterCarousel.test.jsx](https://github.com/AlexSmall96/Film-Friends/tree/main/src/pages/home/FilmPosterCarousel.jsx)

![](documentation/testing/unit-tests/FilmPosterCarousel.jpg)

#### Integration Tests
A selection of features were tested using integration tests, where multiple components were rendered on the same page, or a process relied on code from different components. Each integration test file with results is given below.

[FilmSearch.test.jsx](https://github.com/AlexSmall96/Film-Friends/tree/main/src/integration-tests/FilmSearch.test.jsx)

![](documentation/testing/integration-tests/FilmSearch.jpg)

[Friends.test.jsx](https://github.com/AlexSmall96/Film-Friends/tree/main/src/integration-tests/Friends.test.jsx)

![](documentation/testing/integration-tests/Friends.jpg)

[LoginLogout.test.jsx](https://github.com/AlexSmall96/Film-Friends/tree/main/src/integration-tests/LoginLogout.test.jsx)

![](documentation/testing/integration-tests/LoginLogout.jpg)

[Signup.test.jsx](https://github.com/AlexSmall96/Film-Friends/tree/main/src/integration-tests/Signup.test.jsx)

![](documentation/testing/integration-tests/Signup.jpg)


## Manual Testing
Manual testing was carried out on the remaining pages not covered by automated tests: Films Page, Reccomendations and Profile. The following tests cover front end user interaction and client side validation, any features that require HTTP requests are covered in End to End testing.

### Films Page

Test No.             |           Pass Criteria  | Screenshot
:-------------------------:| :-------------------------: |  :-------:|
1.1 | Correct films load in films list  |![](documentation/testing/manual-tests/1.1.jpg) 
1.2 | Default Main Film is first in list  | ![](documentation/testing/manual-tests/1.2.jpg) 
1.3 | Clicking a film in film list changes main film  |![](documentation/testing/manual-tests/1.3.gif) 
1.4 | Filtering public/private changes which films are shown | ![](documentation/testing/manual-tests/1.4.gif)
1.5 | Filtering all/watched/still to watch changes which films are shown | ![](documentation/testing/manual-tests/1.5.gif)
1.6 | Sorting alphabetically/last updated changes order of films | ![](documentation/testing/manual-tests/1.6.gif)
1.7 | Message appears when no films match current filters  | ![](documentation/testing/manual-tests/1.7.jpg)
1.8 | Viewing another users watchlist only shows public films | ![](documentation/testing/manual-tests/1.8.jpg)
1.9 | When screen width is less than 768px, full view is only shown for one film at at time| ![](documentation/testing/manual-tests/1.9.gif)
1.10 | If a film in search results has go to watchlist link, clicking link goes to the current users watchlist, and clicked film is in main view|![](documentation/testing/manual-tests/1.10.gif) 

### Reccomendations
Test No.             |           Pass Criteria  | Screenshot
:-------------------------:| :-------------------------: |  :-------:|
2.1 | Correct films load in reccomendations list with messages |![](documentation/testing/manual-tests/2.1.jpg) 
2.2 | Hovering over a film shows plot | ![](documentation/testing/manual-tests/2.2.gif) 
2.3 | Filtering by sender changes which films are shown |![](documentation/testing/manual-tests/2.3.gif) 
2.4 | Sorting alphabetically or last sent changes order of films|![](documentation/testing/manual-tests/2.4.gif) 
2.5 | When screen width is less than 768px, only film images are shown, and the full view is only shown for one film at a time |![](documentation/testing/manual-tests/2.5.gif) 
2.6 | When user has recieved more than 10 reccomendations, pagination is displayed and changing page number chagnes which films are displayed |![](documentation/testing/manual-tests/2.6.gif) 
2.7 | If a film has go to watchlist link, clicking link goes to the current users watchlist, and clicked film is in main view|![](documentation/testing/manual-tests/2.7.gif) 

### Profile
Test No.             |           Pass Criteria  | Screenshot
:-------------------------:| :-------------------------: |  :-------:|
3.1 | Correct username and profile image load| ![](documentation/testing/manual-tests/3.1.jpg) 
3.2 | Clicking tabs changes what is displayed |![](documentation/testing/manual-tests/3.2.gif) 
3.3 | Clicking your watchlist takes the user to thier own watchlist | ![](documentation/testing/manual-tests/3.3.gif) 
3.4 | Save button is disabled and becomes enabled if username or profile image is changed | ![](documentation/testing/manual-tests/3.4.gif) 
3.5 | If too large an image is uploaded, error message appears|![](documentation/testing/manual-tests/3.5.gif) 


## End to End Testing
The purpose of this section is to ensure that all 4 models (users, films, requests and reccomendations) can be created, updated, read and deleted, and that these operations are visible in the database UI [Mongo DB Compass](https://www.mongodb.com/products/tools/compass) as well as the client. Read is not included as an operation in this section as this was coverd by manual and automated tests. 

### Users
Operation             | Functional Meaning           | Front end change | Database UI Change|
:-------------------------:| :-------------------------: |  :-------:|:-------:|
CREATE | Signing up | N/A | ![](documentation/testing/end-to-end-tests/u1.jpg)|
UPDATE | Updating Profile Data | ![](documentation/testing/end-to-end-tests/U2.jpg) |![](documentation/testing/end-to-end-tests/u2a.jpg) |
UPDATE | Updating email address |![](documentation/testing/end-to-end-tests/u3.jpg) ![](documentation/testing/end-to-end-tests/u3a.jpg) ![](documentation/testing/end-to-end-tests/u3b.jpg) | ![](documentation/testing/end-to-end-tests/u3c.jpg) |
UPDATE | Updating password |![](documentation/testing/end-to-end-tests/u4.jpg) | ![](documentation/testing/end-to-end-tests/u4a.jpg)
UPDATE | Resetting forgotten password |![](documentation/testing/end-to-end-tests/u5.jpg) ![](documentation/testing/end-to-end-tests/u5a.jpg) ![](documentation/testing/end-to-end-tests/u5b.jpg)| ![](documentation/testing/end-to-end-tests/u5c.jpg)
DELETE | Deleting account | ![](documentation/testing/end-to-end-tests/u6a.jpg)|![](documentation/testing/end-to-end-tests/u6b.jpg)

### Films
Operation             | Functional Meaning           | Front end change | Database UI Change|
:-------------------------:| :-------------------------: |  :-------:|:-------:|
CREATE | Saving a film via search results | ![](documentation/testing/end-to-end-tests/f1.gif)|![](documentation/testing/end-to-end-tests/f2.jpg)|
UPDATE | Rating a film, marking as watched, making public/private|![](documentation/testing/end-to-end-tests/f3.gif) |![](documentation/testing/end-to-end-tests/f4.jpg)|
DELETE | Removing a film from watchlist | ![](documentation/testing/end-to-end-tests/f5.gif)|![](documentation/testing/end-to-end-tests/f6.jpg)

### Requests
Operation             | Functional Meaning           | Front end change | Database UI Change|
:-------------------------:| :-------------------------: |  :-------:|:-------:|
CREATE | Send a friend request | ![](documentation/testing/end-to-end-tests/r1.gif) |![](documentation/testing/end-to-end-tests/r2.jpg)|
UPDATE |Accept a friend request | ![](documentation/testing/end-to-end-tests/r3.gif) | ![](documentation/testing/end-to-end-tests/r4.jpg)
DELETE | Decline or remove a friend request |![](documentation/testing/end-to-end-tests/r5.gif) ![](documentation/testing/end-to-end-tests/r7.gif) | ![](documentation/testing/end-to-end-tests/r6.jpg)

### Reccomendations 
Operation             | Functional Meaning           | Front end change | Database UI Change|
:-------------------------:| :-------------------------: |  :-------:|:-------:|
CREATE | Send a reccomendation | ![](documentation/testing/end-to-end-tests/rc1.gif) | ![](documentation/testing/end-to-end-tests/rc2.jpg) 
DELETE | Remove a reccomendation |![](documentation/testing/end-to-end-tests/rc3.gif) | ![](documentation/testing/end-to-end-tests/rc4.jpg)
## Responsiveness

