#!/usr/bin/python3
# Pythonic version of nMonte3.R (originally created by Huijbregts)
# (C) AASI_Amsha, June 2023

import numpy as np
import global25
from global25 import G25_Sample
from numba import njit

def GenerateSourceMatrix(source_samples: list[G25_Sample], target_sample: G25_Sample):
    source_mat = []
    for source in source_samples:
        source_mat.append(target_sample.g25 - source.g25)
    
    return np.array(source_mat, dtype=np.float64)

# Calculate fit, generally a value of less than 2.00 is good.
def CalculateFit(source_matrix, final_matrix, target_matrix):
    PCT = 100 if np.max(source_matrix[0]) > 2 else 1
    estim = np.transpose(np.mean(final_matrix, axis=0) + target_matrix)
    dif = estim - target_matrix
    dist1_2 = np.sqrt(np.sum(dif**2))/PCT
    return round(100 * dist1_2, 4)

# Monte Carlo Algorithm for calculating ADMIXTURE
# Create source matrix by turning source samples into a matrix
# then subtracting the target.
# First sample nBatch random rows 
# Then take the mean, this is err1. (Error, ideally, the mean should be zero for a perfect mixture)
# Then iterate through nCycles
# Each cycle do the following:
#   1. Sample another nBatch random rows
#   2. Iterate through 1 to nBatch, say the iterator is b
#   3. Every iteration replace 1:b rows of the matrix with the newly sampled matrix
#   4. Calculate err2.
#   5. If err2 is less than err1, then err2 = err1, and we are in the correct direction,
#   6. So add the newly sampled rows to the matrix
def nMonte(source_samples: list[G25_Sample], target: G25_Sample, pf=0.001, nb=500, nc=1000):

    source_mat = GenerateSourceMatrix(source_samples, target)
    n_sources = len(source_samples)

    sample_rows, final_matrix = nMonte_loop(source_mat, n_sources, pf, nb, nc)
    
    source_sample_names = [source.name for source in source_samples]
    result_dict = PrepareResults(sample_rows, source_sample_names)
    
    # Determine fit
    fit = CalculateFit(source_mat, final_matrix, target.g25)
    return (dict(result_dict), fit)

@njit
def PrepareResults(sample_rows, source_samples):
    # Prepare results dict
    # Every row in the final_matrix corresponds to a source sample
    # Find which rows belong to which source sample
    source_fractions = [0.0] * len(source_samples)

    for sample in sample_rows:
        source_fractions[sample] += 1
    
    # Divide by total to get fraction
    for i in range(0, len(source_fractions)):
        source_fractions[i] /= float(len(sample_rows))
    
    # Prepare Dictionary
    result_dict = {}
    for i in range(len(source_samples)):
        result_dict[source_samples[i]] = source_fractions[i]
    
    return result_dict

@njit
def nMonte_loop(source_mat: np.array, n_sources: int, penalty_factor: float, n_batch: int, n_cycles: int):
    sample_rows = np.array([int(np.random.sample()*n_sources)%n_sources for i in range(n_batch)])
    final_matrix = source_mat[sample_rows]
    err1 = (1 + penalty_factor)*(np.sum(colMeans(final_matrix) ** 2))
    for i in range(0, n_cycles):
        new_sample_rows = np.array([int(np.random.sample()*n_sources)%n_sources for i in range(n_batch)])
        sampled_matrix = source_mat[new_sample_rows]

        for j in range(0, n_batch):
            store = final_matrix[j].copy()
            final_matrix[j] = sampled_matrix[j]
            penalty = penalty_factor * np.sum(colMeans(final_matrix) ** 2)
            err2 = np.sum(colMeans(final_matrix) ** 2) + penalty
            if(err2 <= err1):
                err1 = err2
                sample_rows[j] = new_sample_rows[j]
            else:
                final_matrix[j] = store
    
    return (sample_rows, final_matrix)

@njit
def colMeans(arr: np.array):
    result = []
    for i in range(0, arr.shape[1]):
        result.append(arr[:, i].mean())
    
    return np.array(result)

def DistanceTwoElements(t1: G25_Sample, t2: G25_Sample):
    return round(np.sum(np.square(t1.g25 - t2.g25)), 10)

# Implements Vahaduo DISTANCE
def Distance(sources: list[G25_Sample], target: G25_Sample):
    result_dict = {}
    for source in sources:
        result_dict[source.name] = DistanceTwoElements(source, target)

    return result_dict

if __name__ == '__main__':
    global25.LoadData()

    # G25 samples
    G25_RUS_SINTASHTA = global25.GetSample('RUS_Sintashta_MLBA')
    G25_IRN_GANJ_DAREH_N = global25.GetSample('IRN_Ganj_Dareh_N')
    G25_SIMULATED_AASI = global25.GetSample('Onge')
    G25_DUSADH = global25.GetSample('Dusadh')

    # Model (K=3 South Asia)
    TARGET = G25_DUSADH
    SOURCES = [G25_RUS_SINTASHTA, G25_IRN_GANJ_DAREH_N, G25_SIMULATED_AASI]

    print(nMonte(SOURCES, TARGET))
    print(Distance(SOURCES, TARGET))