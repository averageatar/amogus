console.log("wait has commenced!!!");
setTimeout(() => {  console.log("waiting done"); 
                    window.location.replace("redirect2.html");
}, 5000);

/*
function wait(ms){
    var start = new Date().getTime();
    var end = start;
    while(end < start + ms) {
      end = new Date().getTime();
   }
 }

console.log("waiting program starting...");
wait(5000);
console.log("go byou keika");
*/