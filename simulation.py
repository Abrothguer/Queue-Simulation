"""
    Simulação do sistema de filas
"""

# Imports

from random import randint, random


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


def get_summary(simulation):
    """
        Retorna o sumário da simulação
    """
    return {}


def get_value_uniform(distr_info):
    """
        Gera e retorna um valor aleatório da distribuição uniforme
    """
    if distr_info["int_bound"]:
        return randint(distr_info["minimum"], distr_info["maximum"])
    return distr_info["minimum"] + (random() * (distr_info["maximum"] - distr_info["minimum"]))


def get_value_custom(distr_info):
    """
        Gera e retorna um valor da distribuição
    """
    generated = random()

    for val, limit in distr_info["ranges"]:
        if generated > limit:
            value = val
        else:
            break
    return value


DISTRS_GETS = {
    "uniform": get_value_uniform,
    "custom": get_value_custom
}
