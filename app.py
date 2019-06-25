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

            session["simulation"] = RandomSimulation(sim_form.clients.data, (
                sim_form.arv_min.data, sim_form.arv_max.data), (
                    sim_form.atd_min.data, sim_form.atd_max.data), "uniform").__dict__

            return render_template("random.html.j2", simulation=session["simulation"])

        return render_template("home.html.j2", form=sim_form, failure=True)

    return render_template("home.html.j2", form=sim_form)


# Global code

if __name__ == "__main__":
    APP.run(debug=True)
