# !/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
    Modelos de distribuição e simulação.
"""

# pylint: disable = R0903

# Imports
from random import random, randint

# Classes


class RandomSimulation():

    def __init__(self, clients, arv_min, arv_max, atd_min, atd_max):

        self.clients = clients
        self.arv_min = arv_min
        self.arv_max = arv_max
        self.atd_min = atd_min
        self.atd_max = atd_max


class NewRandomSimulation():
    """
        Classe de simulações aleatórias
    """

    def __init__(self, clients, arrival, attendance, distr):

        self.clients = clients
        if distr not in DISTRS.keys():
            raise ValueError(f"Distribuição {distr} não suportada")

        self.arrival_distr = DISTRS[distr](*arrival).__dict__
        self.attendance_distr = DISTRS[distr](*attendance).__dict__

    def get_row(self):
        """
            Gera números aleatórios para chegadas e atendimentos
        """
        return {"arrival": self.arrival_distr.get_value(),
                "attendance": self.attendance_distr.get_value()}


class UniformDistribution():
    """
        Classe de distribuição uniforme
    """

    def __init__(self, minimum, maximum, int_bound=True):

        self.minimum = minimum
        self.maximum = maximum
        self.int_bound = int_bound

    def get_value(self):
        """
            Gera e retorna um valor aleatório da distribuição uniforme
        """
        if self.int_bound:
            return randint(self.minimum, self.maximum)
        return self.minimum + (random() * (self.maximum - self.minimum))


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

    def get_value(self):
        """
            Gera e retorna um valor da distribuição
        """
        generated = random()

        for val, limit in self.ranges:
            if generated > limit:
                value = val
            else:
                break
        return value


class ExponentialDistribution():
    pass


DISTRS = {"uniform": UniformDistribution,
          "exponential": ExponentialDistribution,
          "custom": CustomDistribution}
