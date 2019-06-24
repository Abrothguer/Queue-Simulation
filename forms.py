"""
    Implementação de formulários
"""

from flask_wtf import FlaskForm
from wtforms import RadioField, IntegerField, FloatField, SubmitField


class SimulationForm(FlaskForm):  # pylint: disable=R0903
    """
        Formulário de simulação - deterministica
    """

    # Commom
    arrival_type = RadioField("Tempo de Chegada", choices=[(
        'deterministic', 'Deterministico'), ('random', 'Aleatório')])
    clients = IntegerField("Número de clientes")

    # Deterministic
    lambd = FloatField("Tempo média entre chegadas (lambda)")
    mi = FloatField("Tempo médio de atendimento (mi)")

    # Random
    arv_min = FloatField("Tempo mínimo entre chegadas")
    arv_max = FloatField("Tempo máximo entre chegadas")
    atd_min = FloatField("Tempo mínimo de atendimento")
    atd_max = FloatField("Tempo máximo de atendimento")

    # Submit
    submit = SubmitField("Simular")
