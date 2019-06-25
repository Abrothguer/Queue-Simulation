# !/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
    Modelos de distribuição e simulação.
"""

# pylint: disable = R0903
# Classes


class RandomSimulation():
    """
        Classe de simulações aleatórias
    """

    def __init__(self, clients, arrival, attendance, distr):

        self.clients = clients
        if distr not in DISTRS.keys():
            raise ValueError(f"Distribuição {distr} não suportada")
        self.distr = distr

        self.arrival_distr = DISTRS[distr](*arrival).__dict__
        self.attendance_distr = DISTRS[distr](*attendance).__dict__

        self.iterations = 0
        self.iteration_values = []


class UniformDistribution():
    """
        Classe de distribuição uniforme
    """

    def __init__(self, minimum, maximum, int_bound=True):

        self.minimum = minimum
        self.maximum = maximum
        self.int_bound = int_bound


class CustomDistribution():
    """
        Classe de distribuição personalizada
    """

    def __init__(self, values, probabilities):

        self.prob_tuples = sorted([(prob, val) for prob, val in zip(probabilities, values)])
        self.ranges = []

        bound = 0
        for prob, val in self.prob_tuples:
            self.ranges.append((bound, val))
            bound += 0.01 * prob


class ExponentialDistribution():
    """
        Classe de distribuição exponencial
    """
    pass


DISTRS = {"uniform": UniformDistribution,
          "exponential": ExponentialDistribution,
          "custom": CustomDistribution}
