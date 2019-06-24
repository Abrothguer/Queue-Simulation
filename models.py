# !/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
    Modelos de distribuição e simulação.
"""

# pylint: disable = R0903

# Imports
from random import random, randint
# from flask_restless import DefaultSerializer

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
        self.distr = distr

        self.arrival_distr = DISTRS[distr](*arrival).__dict__
        self.attendance_distr = DISTRS[distr](*attendance).__dict__

    def generate_objects(self):

        self.arrival_distr_obj = DISTRS[self.distr](self.arrival_distr["minimum"], self.arrival_distr["maximum"])
        self.attendance_distr_obj = DISTRS[self.distr](self.attendance_distr["minimum"], self.attendance_distr["maximum"])

    def get_next(self):
        """
            Gera a próxima iteração da simulação
        """

        return{"client-number": 0,
               "arrival-last": self.arrival_distr_obj.get_value(),
               "arrival-total": 1,
               "attendance": self.attendance_distr_obj.get_value(),
               "attendance-begin": 1,
               "queue": 1,
               "attendance-end": 1,
               "system-total": 1,
               "server-free": 1
              }

    def get_summary(self):
        """
            Retorna o sumário da simulação
        """
        return {}


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
