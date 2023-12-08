# 015-01-Group-Project

Application Description:
	Our product aims to provide users with a streamlined way to collect YouTube videos that piqued their interest but they didn’t have enough time to watch it as soon as it was recommended. When the user logs in to our website, they will be greeted with an elegant page featuring a text box where they can insert a link to a YouTube video that they want to add to their WatchL8r account. 
	We will use a YouTube API to allow our users to search for YouTube videos on our website, so there is no need to go back and forth from YouTube and our website to save video links. Our website’s login is separate from YouTube, so the user does not have to be logged into YouTube to save links. 

Contributors:
  Michael Gladstone
  Nathan Khazam
  Johny Lam
  Austin Layne
  Henry Miller

Technology Stack:
  HTML
  CSS
  JavaScript
  NodeJS
  Youtube API

Prerequisites to run:
  Docker

Running Application Locally:
  To run locally you will need Docker. With Docker you can run the website with "docker compose up -d" in the terminal inside the project folder.
  To restart the docker you can do "docker-compose restart"
  To close the docker you can do "docker-compose down
  On the off chance there is an issue with docker about any node_module then the user will need to completely delete the node_modules folder and the package-lock.json. Once this is done when the user runs Docker again it should reinstall the node_modules locally and the application should run properly.

Running Tests:
Some tests are done automatically through mocha and chai

Link to application: 
http://recitation-15-team-01.eastus.cloudapp.azure.com:3000/login

If website is no longer hosted there here is the link back to the github if needed:
https://github.com/johnyafk/015-01-Group-Project
