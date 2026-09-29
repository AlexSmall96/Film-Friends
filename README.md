# Film Friends
Film Friends is a full-stack film sharing and reviewing app where users can save and rate films, add friends, and share recommendations. The frontend is built with React and Bootstrap, with a Node.js and Express backend using MongoDB for data persistence. Film data is provided by the [Open Movie Database (OMDB) API](https://www.omdbapi.com/).

![](documentation/screenshots/amiresponsive.jpg)

### [🌐 Live Site](https://film-friends.onrender.com)

### [📖 Repository](https://github.com/AlexSmall96/Film-Friends)

### Features

Users can search for films and view film details without creating an account. Registered users can:

- Search and save films
- Rate films and track watched status
- Add and manage friends
- Send and receive film recommendations
- Manage their profile

A shared Guest Account is also available for exploring the site's functionality without creating an account. Destructive actions such as profile updates, film removal, and account deletion are disabled for guests to prevent data loss.

The application is deployed on Render. It normally runs on the free tier, with the paid Starter tier used during application periods to eliminate cold-start loading times.

## 💻 Tech Stack
| Backend | Frontend | Database | Testing (Vitest) | Other Tools |
| :------:|:------: | :------: | :------: | :------: |
| Node.js   |   React      | MongodDB       | Supertest         |  GitHub       |  
| Express  |    Bootstrap  | Mongoose       | React Testing Library   | Postman        |  


## 🧪 Testing Strategy
The application uses automated component and integration testing to verify frontend behaviour and backend API functionality.

- Frontend: Component and integration tests were written using Vitest and React Testing Library to verify component behaviour, user interactions, and complete frontend workflows.
- Backend: Integration tests were written using Supertest for each API router, testing endpoints and their interactions with the database.
- Manual testing: Key user journeys and functionality were manually tested throughout development.

## 👤Author
Alex Small | [GitHub](https://github.com/AlexSmall96) | [LinkedIn](https://www.linkedin.com/in/alex-small-a8977116b/)

## 🤝 Credits
### Courses
 - [https://www.udemy.com/course/the-complete-nodejs-developer-course-2](https://www.udemy.com/course/the-complete-nodejs-developer-course-2)
 - [https://www.udemy.com/course/react-testing-library](https://www.udemy.com/course/react-testing-library)
### APIs
The film data is taken from the [Open Movie Database (OMDB) API](https://www.omdbapi.com/).
### Code
Code was taken from/inspired by the below articles. Whenever the code is used, it is referenced as a comment.

- Deploying to Render:
[https://dev.to/pixelrena/deploying-your-reactjs-expressjs-server-to-rendercom-4jbo](https://dev.to/pixelrena/deploying-your-reactjs-expressjs-server-to-rendercom-4jbo)

- Uploading images to cloudinary: https://dev.to/njong_emy/how-to-store-images-in-mongodb-using-cloudinary-mern-stack-imos

- Removing match media errors from certain tests: https://stackoverflow.com/questions/39830580/jest-test-fails-typeerror-window-matchmedia-is-not-a-function

- To track screen width: https://stackoverflow.com/questions/36862334/get-viewport-window-height-in-reactjs 

- To send OTP: https://www.makeuseof.com/password-reset-forgot-react-node-how-handle/

- To automatically change home page carousel: https://upmostly.com/tutorials/settimeout-in-react-components-using-hooks 

- To show search suggestion on home page: https://www.dhiwise.com/post/how-to-build-react-search-bar-with-suggestions#customizing-the-autocomplete-behavior 

- To convert an image to base 64 was taken from https://dev.to/njong_emy/how-to-store-images-in-mongodb-using-cloudinary-mern-stack-im

- To set the preview file was taken from: https://www.geeksforgeeks.org/how-to-upload-image-and-preview-it-using-reactjs/

- The plotPreview class was inspired by https://stackoverflow.com/questions/7993067/text-overflow-ellipsis-not-working

- The filmRow:hover class was taken from Taken from https://stackoverflow.com/questions/33203148/how-to-make-a-div-box-look-3d 

- The code used in renderWithProviders.jsx to render the component with memory router was taken from: https://medium.com/@bobjunior542/using-useparams-in-react-router-6-with-jest-testing-a29c53811b9e

- Scrollbar styling: https://css-tricks.com/classy-and-cool-custom-css-scrollbars-a-showcase/
