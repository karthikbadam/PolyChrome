PolyChrome
=====

A web application framework for collaborative web browsing of both static web pages and dynamic web visualizations.

### To build:

Prerequisites (both Windows and Unix):

    * Node.js (http://nodejs.org/download/)
    
   
How to download:

    * git clone https://github.com/karthikbadam/PolyChrome.git

  
###How to install and run:

- PolyChrome has numerous dependencies, but thanks to node.js, there can all be installed through a single command. Open the PolyChrome folder in your command prompt or terminal and type in:


    * npm install
    
- This should take care of the dependencies. Note that PolyChrome is built to use [Express](http://expressjs.com/), a web application framework for node.js.
    
- Now, PolyChrome can be run using:


    * node polychrome-server.js

- PolyChrome has two components: (1) A proxy server to handle requests from the clients (running at port 3000), and (2) a modified version of [PeerJS](http://peerjs.com/) server to handle the connections between peers/clients (running at port 8080).
    

###How to use PolyChrome:

- Open your browser and enter the url "localhost:3000" or "serverIP:3000", depending on where you are running the server. This will open the following page:
<br><br>
<img src="https://github.com/karthikbadam/PolyChrome/blob/master/screenshots/screenshot-0.PNG?raw=true">

- Note that if you want to try out PolyChrome collaboration on the same device, you have to open the above URL ("serverIP:3000") in two tabs, as each tab gets a unique peerID. 

- Type in a URL in the respective space, and click the triangular icon to submit. Now, PolyChrome fetches the content of this URL by acting as a proxy, and opens it in a new window as follows: 
<br><br>
<img src="https://github.com/karthikbadam/PolyChrome/blob/master/screenshots/screenshot-1.PNG?raw=true">


-  The feedback panel on top right of this page, shows the details of the events being captured, and also connected peers (highlighted).
<br><br>
<img src="https://github.com/karthikbadam/PolyChrome/blob/master/screenshots/screenshot-2.PNG?raw=true">
  

Resources for Newcomers
---
- [The Wiki](https://github.com/karthikbadam/polychrome/wiki)
- A simple multi-device drawing application is also provided with this framework. It can be opened by running PolyChrome and opening "serverIP:3000/drawing" in your browser.
<br><br>
<img src="https://github.com/karthikbadam/PolyChrome/blob/master/screenshots/screenshot-3.PNG?raw=true">
 


