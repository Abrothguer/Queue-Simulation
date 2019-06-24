"""
    Simulação do sistema de filas
"""

# Imports

from random import randint


def generate_random_times(clients, t_min, t_max):
    """
        Gera valores de chegada aleatórios entre o intervalo para todos os clientes.
        Todos os intervalos tem a mesma chance de probabilidade
    """

    return [randint(t_min, t_max) for _ in range(clients)]
