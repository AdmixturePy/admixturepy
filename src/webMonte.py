import global25
import nMonte
import gradient_generator
from collections import OrderedDict

# Gradient generator, I believe ultimately this stuff needs to go to the front end including the table generation bit
fit_gradient = gradient_generator.GradientGenerator(0, 10, (110, 230, 150), (250, 130, 150))
admixture_gradient = gradient_generator.GradientGenerator(0, 1, (255, 255, 255), (10, 200, 100))
distance_gradient = gradient_generator.GradientGenerator(0.02, 0.20, (250, 200, 60), (0, 50, 250))
def returnAllSamples():
    return { "samples": list(global25.samples.keys()) }

def returnSample(id):
    if(id in global25.samples.keys()):
        return { f"{id}": list(global25.GetSample(id).g25) }
    else:
        return { "error_message" : f"{id}: no such sample in database." }

def returnSamplePC(id, pc):
    if(id in global25.samples.keys()):
        # Use 1-indexing as PC is usually PC1 to PC25
        if(pc-1 <= len(global25.GetSample(id).g25) and pc > 0):
            return { f"PC{pc}": list(global25.GetSample(id).g25)[pc-1] }
        else:
            return { "error_message": f"{id},{pc}: invalid principal component"}
    else:
        return { "error_message" : f"{id}: no such sample in database." }

def returnDistance(JSON_data):
    try:
        source_strings = JSON_data["sources"]
        target = JSON_data["target"]
        table_output = False

        if("table" in JSON_data):
            table_output = JSON_data["table"]
        
        results = {}
        for source in source_strings:
            results[source] = nMonte.DistanceTwoElements(global25.GetSample(source), global25.GetSample(target))

        sorted_result_list = sorted(results.items(), key=lambda x: x[1])
        import sys
        print(sorted_result_list, file=sys.stderr)
        sorted_results = {}

        for i, item in enumerate(sorted_result_list):
            sorted_results[int(i)] = [item[0], item[1]]

        if(table_output):
            table = "<table>"
            for item in sorted_result_list:
                table += "<tr>"
                table += f"<td style=\"background-color: #" + distance_gradient.GenerateColorHEX(item[1]) + "\">" + f"{item[1]}</td>"
                table += f"<td>{item[0]}</td>"
                table += "</tr>"
            table += "</table>"
            return table
        else:
            return sorted_results
    except:
        import traceback
        return {"error_message": f"something went wrong! {traceback.format_exc()}"}
    
def webMonte(JSON_data):
    try:
        source_strings = JSON_data["sources"]
        target_strings = JSON_data["targets"]
        table_output = False
        table_id = ""

        # Check if HTML table output is desired.
        if "table" in JSON_data:
            table_output = JSON_data["table"]
        
        # Are we provided with a table id?
        if "table_id" in JSON_data:
            table_id = JSON_data["table_id"]
        
        g25_sources = []
        g25_targets = []

        # Add them to sources
        for source in source_strings:
            g25_sources.append(global25.GetSample(source))
        
        for target in target_strings:
            g25_targets.append(global25.GetSample(target))
        
        if not table_output:
            full_result = { "results": {} }
        else:
            # Prepare HTML table
            table_data = f"<table id=\"{table_id}\">"
            table_data += "<tr>"
            table_data += "<th>Target</th>"
            table_data += "<th>Fit</th>"
            for source in source_strings:
                table_data += "<th>" + source + "</th>"
            table_data += "</tr>"

        for target in g25_targets:
            # Run nMonte with batch=100 and cycles=500, good enough for web
            result_dict, fit = nMonte.nMonte(g25_sources, target, 0.001, 100, 500)
            if not table_output:
                result_dict["fit"] = fit
                full_result["results"][target.name] = result_dict
            else:
                table_data += "<tr>"
                table_data += "<td>" + target.name + "</td>"
                table_data += "<td style=\"background-color: #" + fit_gradient.GenerateColorHEX(fit) + "\">" + str(fit) + "</td>"
                # This is because the order of .keys() is preserved, so result_dict.keys() has the same order as source_strings
                # So we don't have to think much about adding them to the
                # Python dict preserves order since Python 3.6
                # https://docs.python.org/3/whatsnew/3.6.html#whatsnew36-compactdict
                for key in result_dict.keys():
                    table_data += "<td style=\"background-color: #" + admixture_gradient.GenerateColorHEX(result_dict[key]) + "\">" + str(result_dict[key]) + "</td>"
                table_data += "</tr>"
        
        if not table_output:
            full_result["error_message"] = ""
            return full_result
        else:
            table_data += "</table>"
            return table_data
    
    except KeyError as e:
        return {"error_mesage": f"sample '{e.args[0]}' not found"}
    except:
        import traceback
        return {"error_message": f"something went wrong! {traceback.format_exc()}"}

def returnSamplesPCBatch(JSON_data):
    try:
        PCs_to_retrieve = JSON_data["pc"]
        sample_strings = JSON_data["samples"]

        result = {}
        for i in PCs_to_retrieve:
            result["PC" + str(i)] = []

        for sample in sample_strings:
            pc_list = global25.GetSample(sample).g25
            for i in range(0, len(pc_list)):
                if(i in PCs_to_retrieve):
                    result["PC" + str(i)].append(pc_list[i])
        return result
    except:
        import traceback
        return {"error_message": f"something went wrong! {traceback.format_exc()}"}