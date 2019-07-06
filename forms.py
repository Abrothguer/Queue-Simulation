# !/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
    Implementação de formulários
"""

from flask_wtf import FlaskForm
from wtforms import RadioField, IntegerField, FloatField, SubmitField, StringField


class SimulationForm(FlaskForm):  # pylint: disable=R0903
    """
        Formulário de simulação - deterministica
    """

    # Commom
    # TODO: Adicionar ('deterministic', 'Deterministico')
    arrival_type = RadioField("Tempo de Chegada", choices=[
        ('random', 'Aleatório')])
    # TODO: Adicionar distribuição personalizada e normal: ('custom', 'Personalizada')
    distributions = RadioField("Distribuições", choices=[(
        'uniform', 'Uniforme'), ('exponential', 'Exponencial')])
    queue_model = RadioField("Modelo de filas", choices=[(
        'mm1', 'M/M/1'), ('mm2', 'M/M/2')])
    clients = IntegerField("Número de clientes")

    # Deterministic
    arv_values = StringField("")
    atd_values = StringField("")

    # Random distributions

    # Uniforme
    arv_min = FloatField("Tempo mínimo entre chegadas")
    arv_max = FloatField("Tempo máximo entre chegadas")
    atd_min = FloatField("Tempo mínimo de atendimento")
    atd_max = FloatField("Tempo máximo de atendimento")

    # Exponential
    arv_exp_mean = FloatField("Tempo médio de chegada")
    atd_exp_mean = FloatField("Tempo médio de atendimento")

    # Submit
    submit = SubmitField("Simular")
