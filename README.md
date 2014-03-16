PolyChrome
=====

A web application framework for collaborative web browsing of both static web pages and dynamic web visualizations.

### To build:

Prerequisites (both Windows and Unix):

    * Node.js (http://nodejs.org/download/)
    
   
How to download:

    * git clone https://github.com/karthikbadam/PolyChrome.git

  
How to install and run:

    - PolyChrome has numerous dependencies, but thanks to node.js, there can all be installed through a single command. Open the PolyChrome folder in your command prompt or terminal and type in:
    
    * npm install
    
    - This should take care of the dependencies. Note that PolyChrome is built to use [Express](http://expressjs.com/), a web application framework for node.js.
    
    - Now, PolyChrome can be run using:
    
    * node polychrome-server.js

    - PolyChrome has two components: (1) A proxy server to handle requests from the clients (running at port 3000), and (2) a modified version of [PeerJS](http://peerjs.com/) server to handle the connections between peers/clients (running at port 8080).
    
    - 
    
