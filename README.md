PolyChrome
=====

A web application framework for collaborative web browsing of both static web pages and dynamic web visualizations.

### To build:

Prerequisites (both Windows and Unix):

    * Node.js (http://nodejs.org/download/)
    
   
How to download:

    * git clone https://github.com/karthikbadam/PolyChrome.git

  
###How to install and run:

- PolyChrome has numerous dependencies, but thanks to node.js, they can all be installed with a single command. Open the PolyChrome folder in your command prompt or terminal and type in:


    * npm install
    
    "npm" is the package manager for node.js
    
- This should take care of the dependencies. Note that PolyChrome is built to use [Express](http://expressjs.com/), a web application framework for node.js.
    
- Now, you can run PolyChrome using:


    * node polychrome-server.js

- PolyChrome has two server components: (1) A proxy server to handle requests from the clients (running at port 3000), and (2) a modified version of [PeerJS](http://peerjs.com/) server to handle the connections between peers/clients (running at port 8080).
    

###How to use PolyChrome:

- Open your browser and enter the url "localhost:3000" or "[hostname]:3000", depending on where you are running the server. This will open the following page:
<br><br>
<img src="https://github.com/karthikbadam/PolyChrome/blob/master/screenshots/screenshot-0.PNG?raw=true">

- Note that if you want to try out PolyChrome collaboration on the same device, you have to open the above URL ("[hostname]:3000") in two different tabs, as each tab gets a unique deviceID. 

- Type in a URL in the respective space, and click the triangular icon to submit. Now, PolyChrome fetches the content of this URL by acting as a proxy, and opens it in a new window as follows: 
<br><br>
<img src="https://github.com/karthikbadam/PolyChrome/blob/master/screenshots/screenshot-1.PNG?raw=true">


-  The feedback panel on top right of this page, shows the details of the events being captured, and also the connected peers (highlighted).
<br><br>
<img src="https://github.com/karthikbadam/PolyChrome/blob/master/screenshots/screenshot-2.PNG?raw=true">
  

Resources for Newcomers
---
- [How to install node.js on Windows](http://dailyjs.com/2012/05/03/windows-and-node-1/)
- [The Wiki](https://github.com/karthikbadam/polychrome/wiki)
- A simple multi-device drawing application is also provided with this framework. You can try it out by running PolyChrome and opening "[hostname]:3000/drawing" in your browser.
<br><br>
<img src="https://github.com/karthikbadam/PolyChrome/blob/master/screenshots/screenshot-3.PNG?raw=true">
 
- Some sample webpages that can be used with PolyChrome

   * http://bl.ocks.org/mbostock/raw/4343214/7156108135e543e2bc60543a05bc9e9abf4a928c/
   * http://multiviz.gforge.inria.fr/scatterdice/oscars/
   * http://bl.ocks.org/VisDockHub/raw/8973882/b0df0fe605374ad0a1950faf2dec5c21b235dd16/

