# iFrame EventManager

## Goals

 * Broadcast events
 * Handle events in page and in other iFrames
 * iframe may be a different domain
 
Questions
  
 * If we have multile pages how does the EventManager work?  Do we need to introduce channels?
 
 ## Setup

Set up pow.cs with sitea.dev and siteb.dev
 
    $ cd ~/.pow
    $ ln -s ~/v/js-eventmanager sitea
    $ ln -s ~/v/js-eventmanager siteb