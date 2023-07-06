import numpy as np
import gdrive
import pickle
import settings

samples = {}
loaded = False

class G25_Sample:
    def __init__(self, g25str):
        g25data = g25str.split(",")
        self.name = g25data[0]
        g25 = []
        for i in range(1, len(g25data)):
            g25.append(float(g25data[i]))
        self.g25 = np.array(g25)
    
    def __repr__(self) -> str:
        return self.name + "," + ','.join(str(i) for i in self.g25)

def DownloadG25Data():
    gdrive.Download(settings.G25_ANCIENT_AVERAGED_SCALED, "ancient-averages.csv")
    gdrive.Download(settings.G25_MODERN_AVERAGED_SCALED, "modern-averages.csv")

def ReadSamplesfromCSV(csv_name):
    global samples
    csv_file = open(csv_name)
    line = csv_file.readline()
    n = 0
    while line:
        line = csv_file.readline()
        sample = G25_Sample(line)
        samples[sample.name] = sample
        n += 1
    print(f"Total read {n} samples from {csv_name}")

def RefreshData():
    global samples
    DownloadG25Data()
    ReadSamplesfromCSV("ancient-averages.csv")
    ReadSamplesfromCSV("modern-averages.csv")
    print(samples["RUS_Sintashta_MLBA"])
    print(samples["Bhumihar_Bihar"])
    with(open('g25.pkl', 'wb') as f):
        pickle.dump(samples, f)

def LoadData():
    global samples, loaded
    try:
        resource_file = open('g25.pkl', 'rb')
        samples = pickle.load(resource_file)
    except AttributeError:
        DownloadG25Data()
        RefreshData()
        resource_file = open('g25.pkl', 'rb')
        samples = pickle.load(resource_file)
    
    loaded = True

def GetSample(sample_name: str) -> G25_Sample: 
    if(not loaded):
        print("Warning: G25 data not loaded, returning None")
        return None
    
    return samples[sample_name]

if __name__ == "__main__":
    RefreshData()

LoadData()
