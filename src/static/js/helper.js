// Gets the sample list from t he PyMone server and appends it to the g25_sample_list which is used by 
// input modals.
async function GetG25SampleList()
{
    await $.getJSON('/api/samples', (data) => { 
        g25_sample_list = data["samples"]; 
        let contents = []
        for(let name of g25_sample_list)
        {
            contents.push('<option value="' + name + '">');
        }
        $("#g25_sample_list").append(contents.join(""));
    })
}

// Helper function to display error message
function DisplayErrorMessage(msg)
{
    document.getElementById("error_message_alert").innerHTML = '<i class="fa fa-exclamation-triangle" aria-hidden="true"></i>\t' + msg;
    $("#error_message_alert").fadeTo(2000, 500).slideUp(500, function(){
        $("#error_message_alert").slideUp(500);
    });
    return; 
}

// Helper function to display warning message.
function DisplayWarningMessage(msg)
{
    document.getElementById("warning_message_alert").innerHTML = '<i class="fa fa-exclamation-triangle" aria-hidden="true"></i>\t' + msg;
    $("#warning_message_alert").fadeTo(2000, 500).slideUp(500, function(){
        $("#warning_message_alert").slideUp(500);
    });
    return; 
}

// Hepler function to remove the parent element.
function RemoveParentElement(e)
{
    e.parentElement.remove();
}