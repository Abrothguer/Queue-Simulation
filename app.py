# !/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
    Modelagem e Simulação de um sistema de Filas - APP Flask
"""

# Imports
import json
from flask import Flask, render_template, request, Response, session
from forms import SimulationForm
from models import RandomSimulation
from simulation import get_simulated_data

# Global Variables

APP = Flask(__name__)
APP.secret_key = "socrates-plato-aristotle-zeno"

# Routes


@APP.route("/get_random")
def simulate_random():
    """
        Retorna uma funcao que gera tuplas de chegada e atendimento
    """
    data = get_simulated_data(session["simulation"])
    print("\nAfter", session["simulation"])
    session.modified = True
    return Response(json.dumps(data), mimetype="json")


@APP.route("/get_simulation")
def get_simulation():
    """
        Retorna uma simulação realizada
    """
    data = [{'arrival-last': 9, 'arrival-total': 9, 'attendance': 10, 'attendance-begin': 9,
             'attendance-end': 19, 'queue': 0, 'server-free': 9, 'system-total': 10},
            {'arrival-last': 10, 'arrival-total': 19, 'attendance': 8, 'attendance-begin': 19,
                'attendance-end': 27, 'queue': 0, 'server-free': 0, 'system-total': 8},
            {'arrival-last': 9, 'arrival-total': 28, 'attendance': 8, 'attendance-begin': 28,
                'attendance-end': 36, 'queue': 0, 'server-free': 1, 'system-total': 8},
            {'arrival-last': 10, 'arrival-total': 38, 'attendance': 8, 'attendance-begin': 38,
                'attendance-end': 46, 'queue': 0, 'server-free': 2, 'system-total': 8},
            {'arrival-last': 10, 'arrival-total': 48, 'attendance': 9, 'attendance-begin': 48,
                'attendance-end': 57, 'queue': 0, 'server-free': 2, 'system-total': 9},
            {'arrival-last': 9, 'arrival-total': 57, 'attendance': 8, 'attendance-begin': 57,
                'attendance-end': 65, 'queue': 0, 'server-free': 0, 'system-total': 8},
            {'arrival-last': 11, 'arrival-total': 68, 'attendance': 10, 'attendance-begin': 68,
                'attendance-end': 78, 'queue': 0, 'server-free': 3, 'system-total': 10},
            {'arrival-last': 10, 'arrival-total': 78, 'attendance': 8, 'attendance-begin': 78,
                'attendance-end': 86, 'queue': 0, 'server-free': 0, 'system-total': 8},
            {'arrival-last': 10, 'arrival-total': 88, 'attendance': 8, 'attendance-begin': 88,
                'attendance-end': 96, 'queue': 0, 'server-free': 2, 'system-total': 8},
            {'arrival-last': 9, 'arrival-total': 97, 'attendance': 8, 'attendance-begin': 97,
                'attendance-end': 105, 'queue': 0, 'server-free': 1, 'system-total': 8},
            {'arrival-last': 10, 'arrival-total': 107, 'attendance': 10, 'attendance-begin': 107,
                'attendance-end': 117, 'queue': 0, 'server-free': 2, 'system-total': 10},
            {'arrival-last': 10, 'arrival-total': 117, 'attendance': 8, 'attendance-begin': 117,
                'attendance-end': 125, 'queue': 0, 'server-free': 0, 'system-total': 8},
            {'arrival-last': 11, 'arrival-total': 128, 'attendance': 10, 'attendance-begin': 128,
                'attendance-end': 138, 'queue': 0, 'server-free': 3, 'system-total': 10},
            {'arrival-last': 10, 'arrival-total': 138, 'attendance': 8, 'attendance-begin': 138,
                'attendance-end': 146, 'queue': 0, 'server-free': 0, 'system-total': 8},
            {'arrival-last': 10, 'arrival-total': 148, 'attendance': 9, 'attendance-begin': 148,
                'attendance-end': 157, 'queue': 0, 'server-free': 2, 'system-total': 9},
            {'arrival-last': 10, 'arrival-total': 158, 'attendance': 8, 'attendance-begin': 158,
                'attendance-end': 166, 'queue': 0, 'server-free': 1, 'system-total': 8},
            {'arrival-last': 9, 'arrival-total': 167, 'attendance': 10, 'attendance-begin': 167,
                'attendance-end': 177, 'queue': 0, 'server-free': 1, 'system-total': 10},
            {'arrival-last': 9, 'arrival-total': 176, 'attendance': 8, 'attendance-begin': 177,
                'attendance-end': 185, 'queue': 1, 'server-free': 0, 'system-total': 9},
            {'arrival-last': 11, 'arrival-total': 187, 'attendance': 9, 'attendance-begin': 187,
                'attendance-end': 196, 'queue': 0, 'server-free': 2, 'system-total': 9},
            {'arrival-last': 11, 'attendance': 10, 'arrival-total': 198, 'system-total': 10,
                'queue': 0, 'attendance-begin': 198, 'attendance-end': 208, 'server-free': 2}]
    session["simulations"].append(data)
    return Response(json.dumps(data), mimetype="json")


@APP.route("/", methods=['GET', 'POST'])
def home():
    """
        Home route.
    """
    sim_form = SimulationForm()
    if request.method == "POST":

        arrival_type = sim_form.arrival_type.data
        if arrival_type is None or sim_form.clients.data is None:
            return render_template("home.html.j2", form=sim_form, failure=True)

        if (arrival_type == "deterministic" and sim_form.lambd.data != None and
                sim_form.mi.data != None):
            return render_template("deterministic.html.j2", clients=sim_form.clients.data)

        elif (arrival_type == "random" and sim_form.arv_min.data != None and
              sim_form.arv_max.data != None and sim_form.atd_min.data != None and
              sim_form.atd_max.data != None):

            session["simulations"] = []
            session["simulation"] = RandomSimulation(sim_form.clients.data, (
                sim_form.arv_min.data, sim_form.arv_max.data), (
                    sim_form.atd_min.data, sim_form.atd_max.data), "uniform").__dict__

            return render_template("random.html.j2", simulation=session["simulation"])

        return render_template("home.html.j2", form=sim_form, failure=True)

    return render_template("home.html.j2", form=sim_form)


# Global code

if __name__ == "__main__":
    APP.run(debug=True)
