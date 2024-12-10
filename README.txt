Team name: 0 Pikachu
Members:
Judy Liu
Alana Moses
Layla Donia
Ian Blackburn

Project 3 Website URL: https://project-3-team-0p.onrender.com/

Our point of sales system utilizes multiple tools to achieve database connectivity, neat aesthetics, and smooth operations. To connect to our database
(which is in PostgreSQL and hosted by Amazon Web Services), we utilized Node.js. All functalities that involve making queries to our database can be located
under server.js. Such examples include accessing the login data, retreiving each inventory item and their quantities, pushing orders into our order history, and more.

To maintain an attractive appearance without having to manage a CSS file, we utilized Tailwind. The configuration file is under tailwind.config.js.

The /src folder contains all other files, such as our HTML interface files and our JavaScript files for other non-database functions such as navigation between
pages, setting button action events, and other. All images used in our interface can be found under the /menu_imgs and /progress_imgs folders.

All html pages are labeled with their designated persona, folowed by a short description of which page it is meant to be. All files labelled "customer" are unique to the
customer interface, all "employee" pages are unique to cashiers, and all "manager" pages are unique to managers. The only exception to this rule is the "index" and "login"
html pages, which can be accessed by all users.

We used three main JavaScript files. api.js was used specifically for the various api functions we added, such as the translation and weather api.

script.js was used to hold all functions for the cashier and customer interface that did not require accessing the database. This included automatic
navigation to other pages, adding button listeners, and storing orders until they were placed.

manager.js was used to hold all functions for the manager interface that did not require accessing the database. Much like script.js, this involved button listeners,
selections of items, navigation between pages, and more.

All other files, such as our output.css file and images.json, were used to add images and add functionality for Tailwind.

For our "above and beyond" requirement, we fulfilled employee management, dynamic menu management, and dynamic pricing.