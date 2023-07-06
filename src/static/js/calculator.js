function AddToInternalList(input_source, html_list_element, actual_list, removal_func, direct_add=false)
{
    // direct_add will directly use input_source while not having it means the function will query the element
    // selector and the input_source is an actual HTML element to be queryed.
    // This is to ensure the same function is used by both the UI and the JSON loader under "LoadModel()".
    if(direct_add)
    {
        source_to_add = input_source;
    }
    else
    {
        source_to_add = document.getElementById(input_source).value;
        document.getElementById(input_source).value = "";
    }
    // Check if sample exists
    if(!g25_sample_list.includes(source_to_add))
    {
        DisplayErrorMessage('Error: No such sample "' + source_to_add + '" in list of available samples!');
        return;
    }

    if(source_to_add == "")
    {
        DisplayWarningMessage('Warning: Empty source field. Not addding.');
        return;
    }

    if(actual_list.includes(source_to_add))
    {
        DisplayWarningMessage('Warning: It is already added to the required list. Not adding.');
        return;
    }
    // If it's a target add to distance calculator
    if(actual_list == g25_targets)
    {
        AddDistanceButton(source_to_add);
    }
    // Limit text output to 20 characters (otherwise it can cause weird glitches)
    var element_text = source_to_add
    if(element_text.length > 20)
    {
        element_text = element_text.slice(0, 17)
        element_text += "..."
    }
    // Add to HTML list
    content = "";
    // Classify it as list element to be removed by EmptyModel()
    content += '<div class="pymonte_list_element">'
    // Add the list element itself
    content += '<li title="' + source_to_add + '" class="list-group-item mt-1">' + element_text + '';
    // Add a removal button that will call RemoveSource / RemoveTarget
    content += '<button onClick="' + removal_func + '(this, \'' + source_to_add + '\')"'
    // Style the button
    content += 'style="float:right" class="btn btn-sm btn-outline-danger">'
    // This is to center the button
    content += '<div class="d-flex align-items-center justify-content-center">'
    // Add the icon from Font Awesome
    content += '<span class="fa fa-sm fa-minus"></span></div></button></li></div>';

    $(html_list_element).append(content);
    actual_list.push(source_to_add);
}

// Add the distance button when an element is added to the target list
function AddDistanceButton(source_name)
{
    distance_button = '<button class="btn btn-primary truncate" id="' + source_name + "_distance_button" + '"onClick="GetDistance(\'' + source_name + '\')" style="width: 200px;">' + source_name + '</button>';
    distance_button_element = document.getElementById("distance_buttons");
    distance_button_element.innerHTML += distance_button;
}

function AddSource()
{
    AddToInternalList("input_source_textbox", "#sources_list", g25_sources, "RemoveSource");
}

function AddTarget()
{
    AddToInternalList("input_target_textbox", "#target_list", g25_targets, "RemoveTarget");
}

function RemoveSource(e, source_to_remove)
{
    RemoveParentElement(e);
    g25_sources = g25_sources.filter(e => e !== source_to_remove);
}

function RemoveTarget(e, target_to_remove)
{
    RemoveParentElement(e);
    $("#" + target_to_remove + "_distance_button").remove();
    g25_targets = g25_targets.filter(e => e !== target_to_remove);
}

/* Helper functions to allow user to press enter and add source instead of clicking on the button */
function OnSourceBoxEnter(event)
{
    if(event.keyCode === 13)
    {
        AddSource()
    }
}

function OnTargetBoxEnter(event)
{
    if(event.keyCode === 13)
    {
        AddTarget()
    }
}
function EmptyModel()
{
    g25_sources = []
    g25_targets = []
    document.querySelectorAll('.pymonte_list_element').forEach(e => e.remove());
}

function EmptyResult()
{
    document.getElementById("calculator_result").innerHTML = "";
    EmptyDistance()
}

/*
    PyMonte() function
    Takes the sources and target and sends it Flask Application.
*/
function PyMonte()
{
    var result_element = document.getElementById("calculator_result");
    if(g25_sources.length == 0 || g25_targets.length == 0)
    {
        DisplayErrorMessage('You have to select AT LEAST one source and target.');
        return;
    }

    // Remove the init message
    $("#calculator_result_oninit").remove()

    // Table id, will be used for saving the CSV
    var table_id = "table_result_" + Date.now() + "_" + Math.round((Math.random()*100))

    // Request server for nMonte
    var xhr = new XMLHttpRequest();
    var url =  '/api/nmonte';
    xhr.open("POST", url, true);
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
            // Remove spinner 
            $("#calculator_spinner").remove()
            // Append table data
            var old = result_element.innerHTML;
            var result_html = '<div class="contianer">';
            result_html += '<div class="row">';
            result_html += '<div class="col-12">'
            result_html += '<div class="table-responsive" style="padding-left:3%;padding-right:3%">' + xhr.responseText + '</div>';
            result_html += '</div></div>'
            result_html += '<div class="row"><div class="col-8"></div><div class="col-4" style="padding-top:5%">'
            // Add the Export to CSV button
            result_html += '<button class="btn btn-sm btn-primary" style="float:right;" onClick="ExportTable(\'' + table_id + '\', \'csv\')"><span class="fa fa-file-excel-o"> CSV</span></button>';
            result_html += '</div></div>'
            result_element.innerHTML = result_html;
            result_element.innerHTML += old
            
            // Renable the button
            $('#pymonte_button').prop('disabled', false);
        }
    };
    
    // Add spinner
    var old = result_element.innerHTML
    result_element.innerHTML = '<div class="spinner-border d-flex justify-content-center text-success" id="calculator_spinner" role="status">'
    result_element.innerHTML += '<span class="sr-only"></span>'
    result_element.innerHTML += '</div>' + old

    // Disable the button
    $('#pymonte_button').prop('disabled', true);
    // Request output in form of a table.
    var data = JSON.stringify({"sources": g25_sources, "targets": g25_targets, "table": true , "table_id": table_id});
    xhr.send(data);
}

async function SaveModel()
{
    if(g25_sources.length == 0 || g25_targets.length == 0)
    {
        DisplayWarningMessage("Um... there's nothing to save.");
        return;
    }
    JSON_to_save = { "sources": g25_sources, "targets": g25_targets };
    JSON_txt = JSON.stringify(JSON_to_save, null, '\t');
    var blob = new Blob([JSON_txt], {type: "text/plain;charset=utf-8"});
    await saveAs(blob, "model.json");
}

function ExportTable(table_id, ext)
{
    var wb = XLSX.utils.table_to_book(document.getElementById(table_id));
    XLSX.writeFile(wb, table_id + "." + ext);
}

function LoadModelFromJSONString(JSON_string)
{
    EmptyModel();
    try
    {
        JSON_data = JSON.parse(JSON_string);
    }
    catch(e)
    {
        DisplayErrorMessage("Error: Failed to parse JSON file.");
        return;
    }
    new_sources = JSON_data["sources"];
    new_targets = JSON_data["targets"];
    for(var i = 0; i < new_sources.length; i++)
    {
        AddToInternalList(new_sources[i], "#sources_list", g25_sources, "RemoveSource", true);
    }
    for(var i = 0; i < new_targets.length; i++)
    {
        AddToInternalList(new_targets[i], "#target_list", g25_targets, "RemoveTarget", true);
    }
}
// Loads a model from JSON into the view.
function LoadModel()
{
    if(document.getElementById("input_model_file").value == "") 
    {
        DisplayWarningMessage("Choose a JSON file that contains your model.");
        return;
    }
    
    file_handle = document.getElementById("input_model_file").files[0];
    var file_reader = new FileReader();
    file_reader.onload = () => {  
        LoadModelFromJSONString(file_reader.result);
        document.getElementById("input_model_file").value = ''; 
    }
    file_reader.readAsText(file_handle);
}

