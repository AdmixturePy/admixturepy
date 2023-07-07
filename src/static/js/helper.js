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

// Parse CSV file
function GetSampleNamesFromCSV(csv_string)
{
    sample_names = [];
    sample_strings = [];
    try
    {
        sample_array = csv_string.split("\n");
        for(var i = 0; i < sample_array.length; i++)
        {
            if(sample_array[i] != "")
            {
                sample_strings.push(sample_array[i]);
                sample_names.push(sample_array[i].split(",")[0]);
            }
        }
    }
    catch
    {
        DisplayErrorMessage("Error: Cannot parse CSV.");
        return [[], []];
    }

    return [sample_names, sample_strings];
}

// Load custom samples from "custom_samples_input"
function LoadCustomSamples()
{
    // Empty all internal lists
    g25_sample_list = [];
    custom_samples_list = [];
    custom_sample_names = [];
    $("#g25_sample_list").empty();

    // Reload samples
    GetG25SampleList();
    result = GetSampleNamesFromCSV($("#custom_samples_input").val());
    custom_sample_names = result[0];
    custom_samples_list =  result[1];

    // Prepare to add them to options list
    contents = []
    for(let name of custom_sample_names)
    {
        // Add a 'User >' prefix
        option_value = 'User > ' + name;
        contents.push('<option value="' + option_value + '">');
    }

    // Add these to the list
    $("#g25_sample_list").append(contents.join(""));
}