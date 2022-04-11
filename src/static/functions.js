counter = 0;

function addAlgorithm(){
    $( ".algorithm" ).first().clone().appendTo( ".container-fluid" );
   // a = document.getElementById("algorithms").innerHTML
   // a +='<div class="message">Add Message<br>Title: <input type="text" id="title"><br>Text: <input type="text" id="message"><br><br></div>';
   //  document.getElementById("algorithms").innerHTML = a
};
function removeAlgorithm(){
document.getElementById("algorithms").innerHTML -=

'<div class="message">Add Message<br>Title: <input type="text" id="title"><br>Text: <input type="text" id="message"><br><br></div>';
};

