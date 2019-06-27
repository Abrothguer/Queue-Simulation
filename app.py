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
from simulation import get_simulation_data, get_general_summary

# Global Variables

APP = Flask(__name__)
APP.secret_key = "socrates-plato-aristotle-zeno"

# Routes

@APP.route("/get_simulation")
def get_simulation():
    """
        Retorna uma simulação realizada
    """

    simulation = RandomSimulation(
        session["simulations"]["clients"],
        (session["simulations"]["arv_min"], session["simulations"]["arv_max"]),
        (session["simulations"]["atd_min"], session["simulations"]["atd_max"]),
        "uniform").__dict__

    print("\nMY SIMULATION BEFORE IS ", simulation)
    get_simulation_data(simulation)
    print("\nMY SIMULATION AFTER  IS ", simulation)

    session["simulations"]["simulations"].append(simulation)
    return Response(json.dumps(simulation), mimetype="json")

@APP.route("/general_summary")
def get_summary():
    """
        Retorna o resumo geral das simulações realizadas
    """

    return Response(json.dumps(get_general_summary(session["simulations"])), mimetype="json")


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

        if arrival_type == "deterministic":
            return render_template("deterministic.html.j2", clients=sim_form.clients.data)

        if arrival_type == "random":

            if sim_form.distributions.data == "uniform" and None not in[
                    sim_form.arv_min.data, sim_form.arv_max.data, sim_form.atd_min.data,
                    sim_form.atd_max.data, sim_form.distributions.data]:

                session["simulations"] = {
                    "simulations": [], "clients": sim_form.clients.data, "distr": "random",
                    "arv_min":sim_form.arv_min.data, "arv_max":sim_form.arv_max.data,
                    "atd_min":sim_form.atd_min.data, "atd_max":sim_form.atd_max.data
                }
                return render_template(
                    "random.html.j2", clients=sim_form.clients.data, distr="random")

            if (sim_form.distributions.data == "exponential" and
                    sim_form.arv_exp_mean.data is not None and
                    sim_form.atd_exp_mean.data is not None):

                session["simulations"] = {
                    "simulations": [], "clients": sim_form.clients.data, "distr": "exponential",
                    "arv_exp_mean": sim_form.arv_exp_mean.data,
                    "atd_exp_mean": sim_form.atd_exp_mean.data
                }
                return render_template(
                    "random.html.j2", clients=sim_form.clients.data, distr="exponential")


        return render_template("home.html.j2", form=sim_form, failure=True)

    return render_template("home.html.j2", form=sim_form)


# Global code

if __name__ == "__main__":
    APP.run(host='0.0.0.0', debug=True)
