function AddSample()
{
    sample_to_add = document.getElementById("input_sample_textbox").value;
    if(sample_to_add == "")
    {
        DisplayWarningMessage("Warning: Empty sample name in input. Ignoring.");
        return;
    }

    if(!g25_sample_list.includes(sample_to_add))
    {
        DisplayErrorMessage("Error: No such sample '" + sample_to_add + " exists in database!");
        return;
    }

    if(selected_samples.includes(sample_to_add))
    {
        DisplayWarningMessage("Warning: Sample already selected previously. Ignoring.");
        return;
    }
    // Limit text output to 20 characters (otherwise it can cause weird glitches)
    var element_text = sample_to_add
    if(element_text.length > 20)
    {
        element_text = element_text.slice(0, 17)
        element_text += "..."
    }
    document.getElementById("input_sample_textbox").value = "";
    // Add to HTML list
    content = "";
    // Classify it as list element to be removed by EmptyModel()
    content += '<div class="pymonte_list_element">'
    // Add the list element itself
    content += '<li title="' + sample_to_add + '" class="list-group-item mt-1">' + element_text + '';
    // Add a removal button that will call RemoveSource / RemoveTarget
    content += '<button onClick="RemoveSample(this, \'' + sample_to_add + '\')"'
    // Style the button
    content += 'style="float:right" class="btn btn-sm btn-outline-danger">'
    // This is to center the button
    content += '<div class="d-flex align-items-center justify-content-center">'
    // Add the icon from Font Awesome
    content += '<span class="fa fa-sm fa-minus"></span></div></button></li></div>';

    $("#selected_samples_list").append(content);
    selected_samples.push(sample_to_add);
}

function DecrementInput(elem_id)
{
    
    elem = document.getElementById(elem_id);
    elem.value = Number(elem.value) - 1;
    if(elem.value < 1)
        elem.value = 1;
}

function IncrementInput(elem_id)
{
    elem = document.getElementById(elem_id)
    elem.value = Number(elem.value) + 1;
    if(elem.value >= 25)
        elem.value = 25
}

function OnSampleBoxEnter(event)
{
    if(event.keyCode === 13)
    {
        AddSample();
    }
}
function RemoveSample(e, sample_to_remove)
{
    RemoveParentElement(e);
    selected_samples = selected_samples.filter(e => e !== sample_to_remove);
}

function PlotPCA()
{
    var X_PC = document.getElementById('X_PC').value
    var Y_PC = document.getElementById('Y_PC').value

    JSON_to_send = { "pc": [Number(X_PC), Number(Y_PC)], "samples": selected_samples }
    url = '/api/samples/batch'
    var xhr = new XMLHttpRequest();
    xhr.open("POST", url, true);
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
            JSON_data = JSON.parse(xhr.responseText)
            X_array = JSON_data["PC" + X_PC]
            Y_array = JSON_data["PC" + Y_PC]
        }
        plotly_elem = document.getElementById("plotly_pca_plot");
        var data = { x: X_array, y: Y_array, mode: 'markers+text', type: 'scatter', name: 'PCA Plot', text: selected_samples, textposition: 'top center', marker: { size: 12 } };
        Plotly.newPlot(plotly_elem, [data]);
    }
    xhr.send(JSON.stringify(JSON_to_send))
}