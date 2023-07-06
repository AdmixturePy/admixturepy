import numpy as np
import sys 

class GradientGenerator:
    
    def __init__(self, start, end, start_color=(0,0,0), end_color=(0,0,0)):
        self.start = start
        self.end = end
        self.diff = self.end - self.start
        self.start_color = np.array(start_color)
        self.end_color = np.array(end_color)
    
    def GenerateColor(self, value):
        if(value < self.start):
            value = self.start
        
        if(value > self.end):
            value = self.end
        
        t = (value - self.start)/(float(self.diff))

        return (1-t)*self.start_color + t*(self.end_color)

    def GenerateColorHEX(self, value):
        color = self.GenerateColor(value)
        color = [int(c) for c in color]
        output = ""
        for rgb in color:
            output += format(rgb, '02X')
        return output 