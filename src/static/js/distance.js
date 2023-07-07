function EmptyDistance()
{
    result_element = document.getElementById("distance_result");
    result_element.innerHTML = ""
}

function GetDistance(target)
{
    if(g25_sources.length == 0)
    {
        DisplayErrorMessage("Error: No sources selected. Select AT LEAST one source.");
        return;
    }
    $("#distance_result_oninit").remove();
    result_element = document.getElementById("distance_result")
    var xhr = new XMLHttpRequest();
    var url =  '/api/distance';
    xhr.open("POST", url, true);
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
            // Append table data
            result_text = "<b>Distance To: </b>" + target + "<br>"
            result_text += xhr.responseText;
            result_text += '<br><br>'
            result_element.innerHTML = result_text + result_element.innerHTML;
        }
    }

    // Remove prefix 'User >' from the samples before sending
    g25_sources_cleaned = []
    for(var i = 0; i < g25_sources.length; i++)
    {
        var src = g25_sources[i];
        g25_sources_cleaned.push(src.replace("User > ", ""));
    }
    if(target.startsWith('User > '))
    {
        target = target.replace('User > ', '');
    }

    var data = JSON.stringify({ "target": target, "sources": g25_sources_cleaned, "table": true, "custom_samples": custom_samples_list });
    xhr.send(data);
}