# !/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
    Simulação do sistema de filas
"""

# Imports

import numpy as np

# Functions


def get_simulated_data(simulation):
    """
        Gera os valores para uma iteração da simulação.
    """
    iteration = simulation["iterations"]
    simulation["iterations"] = iteration + 1

    values = {}
    values["arrival-last"] = DISTRS_GETS[simulation["distr"]](simulation["arrival_distr"])
    values["attendance"] = DISTRS_GETS[simulation["distr"]](simulation["attendance_distr"])
    values["arrival-total"] = values["arrival-last"]
    values["system-total"] = values["attendance"]

    if iteration == 0:
        values["attendance-begin"] = values["arrival-last"]
        values["queue"] = 0
        values["attendance-end"] = values["attendance"] + values["arrival-last"]
        values["server-free"] = values["arrival-last"]

    else:
        previous = simulation["iteration_values"][iteration - 1]
        values["arrival-total"] += previous["arrival-total"]
        queue = previous["attendance-end"] - values["arrival-total"]

        values["queue"] = 0 if queue <= 0 else queue
        values["attendance-begin"] = values["arrival-total"] + values["queue"]
        values["attendance-end"] = values["attendance-begin"] + values["attendance"]

        values["server-free"] = 0 if queue >= 0 else abs(queue)
        values["system-total"] += values["queue"]

    simulation["iteration_values"].append(values)
    return values


def get_simulation_data(simulation):
    """
        Gera todos os valores para a simulação
    """
    simulation["iterations"] = 0
    for _ in range(simulation["clients"]):
        get_simulated_data(simulation)
    get_summary(simulation)


def get_summary(simulation):
    """
        Retorna o sumário da simulação
    """
    simulation["summary"] = {}
    iterations = simulation["iteration_values"]

    # Tempo total na fila
    queue_total = 0
    # Intervalo médio de chegada
    arrival_total = 0
    # Intervalo médio de atendimento
    attendance_total = 0
    # Tempo total no sistema
    system_total = 0
    # Tempo livre do operador
    server_total = 0
    # Probabilidade do operador ocioso
    waited = 0

    for iteration in iterations:
        queue_total += iteration["queue"]
        arrival_total += iteration["arrival-last"]
        attendance_total += iteration["attendance"]
        system_total += iteration["system-total"]
        server_total += iteration["server-free"]
        if iteration["queue"] > 0:
            waited += 1

    clients = simulation["clients"]

    simulation["summary"] = {
        "queue_total": queue_total,
        "queue_mean": queue_total / waited if waited != 0 else 0,
        "queue_prob": waited / clients,
        "arrival_mean": arrival_total / clients,
        "attendance_mean": attendance_total / clients,
        "service_total": iterations[-1]["attendance-end"],
        "system_total": system_total,
        "system_mean": system_total / clients,
        "server_free": server_total,
        "server_prob": server_total / iterations[-1]["attendance-end"],
    }


def get_general_summary(simulations):
    """
        Gera o relatório geral das simulações
    """

    return {
        "g-mean-duration": simulations["service_total"] / simulations["iterations"],
        "g-mean-system":
            simulations["system_total"] / (simulations["iterations"] * simulations["clients"]),
        "g-mean-queue":
            simulations["queue_total"] / (simulations["iterations"] * simulations["clients"]),
        "g-mean-server": simulations["server_free"] / simulations["iterations"]
    }


def get_value_uniform(distr_info):
    """
        Gera e retorna um valor aleatório da distribuição uniforme
    """
    if distr_info["int_bound"]:
        return round(np.random.randint(distr_info["minimum"], distr_info["maximum"]))
    return np.random.uniform(distr_info["minimum"], distr_info["maximum"])


def get_value_custom(distr_info):
    """
        Gera e retorna um valor aleatório da distribuição personalizada
    """
    generated = np.random.random()

    for val, limit in distr_info["ranges"]:
        if generated > limit:
            value = val
        else:
            break
    return value


def get_value_exponential(distr_info):
    """
        Gera e retorna um valor aleatório da distribuição exponencial
        Transformação inversa Xi = F^(-1)(Ri) = -(1/lamda)*ln(1-R) onde R é uniforme
    """
    return -(distr_info["mean"]) * np.log(1 - np.random.random())


DISTRS_GETS = {
    "uniform": get_value_uniform,
    "custom": get_value_custom,
    "exponential": get_value_exponential
}
