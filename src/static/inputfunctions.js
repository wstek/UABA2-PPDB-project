let counter = 0;
// add row
$("#addRow").click(function () {
    var algorithmname = document.getElementById('algorithmname').value

    var html = '';
    let algorithm = "Algorithm" + counter

    html += '<div id="algorithm">'
    html += '<div id="' + algorithm + '">'
    html += '<strong><div style="text-align: center;">' + algorithmname + '</div></strong>'
    html += '<div class="row text-center justify-content-center align-items-center offset-lg-1">'

    html += '<div class="col-12 text-center">'
    html += '<label for="TrainingsInterval">TrainingsInterval</label>'
    html += '<input type="number" class="form-control" id="TrainingsInterval" min="1" placeholder="Enter trainings-interval">'
    html += '</div>'
    console.log(algorithmname)
    if (algorithmname === 'Recency'){
        //    Recency specific fields
    }
    else if (algorithmname === 'Popularity'){
        //    Recency specific fields
        html = appendRealNumberField(html,"x_days_goback", "Enter X days to go back","X days to look back" )

    }
    else if (algorithmname === 'ItemKNN'){
        //    Recency specific fields
        html = appendRealNumberField(html,"knn_k_nearest", "Enter K","K nearest neighbours" )
        html = appendRealNumberField(html,"knn_window", "Enter Window","Window/Days to look back" )
        html = appendRealNumberField(html,"knn_normalize", "Enter Normalize","Normalize vector?" )

    }
    html += '<div class="row text-center justify-content-center align-items-center mb-5 offset-lg-1">'
    html += '<div class="col-12 text-center">'
    html += '<button id="removeRow">remove</button>'
    html += '</div>'
    html += '</div>'
    html += '</div>'
    html += '</div>'
    html += '</div>'
    html += '</div>'
    $('#newRow').append(html);

    console.log(algorithm)
    counter += 1;
});
function appendRealNumberField(html, id, placeholder, field ){
    console.log("hi")
    html += '<div class="col-12 text-center">'
    html += '<label for="'+id+'">'+field+'</label>'
    html += '<input type="number" class="form-control" id="'+id+'" min="1" placeholder="'+placeholder+'">'
    html += '</div>'
    return html
}
// remove row
$(document).on('click', '#removeRow', function () {
    counter = Math.max(0, counter - 1)
    $(this).closest('#algorithm').remove();
});


