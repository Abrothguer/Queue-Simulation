# !/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
    Modelagem e Simulação de um sistema de Filas - APP Flask
"""

# Imports
import json
from flask import Flask, render_template, request, Response, session
from forms import SimulationForm
from models import RandomSimulation, RandomMM2Simulation
from simulation import get_simulation_data, get_general_summary
from simulation import get_mm2_simulation_data

# Global Variables

APP = Flask(__name__)
APP.secret_key = "socrates-plato-aristotle-zeno"

# Routes


@APP.route("/get_mm2_simulation")
def get_mm2_simulation():
    """
        Retorna uma simulação realizada - modelo mm2
    """

    distr = request.args.get('distr')
    if distr == "uniform":
        simulation = RandomMM2Simulation(
            session["simulations"]["clients"],
            (session["simulations"]["arv_min"], session["simulations"]["arv_max"]),
            (session["simulations"]["atd_min"], session["simulations"]["atd_max"]),
            "uniform").__dict__
    elif distr == "exponential":
        simulation = RandomMM2Simulation(
            session["simulations"]["clients"],
            session["simulations"]["arv_exp_mean"],
            session["simulations"]["atd_exp_mean"],
            "exponential").__dict__

    get_mm2_simulation_data(simulation)
    print("\nMY SIMULATION AFTER  IS ", simulation)

    print(session["simulations"])
    session["simulations"]["iterations"] += 1
    session["simulations"]["queue_total"] += simulation["summary"]["queue_total"]
    session["simulations"]["system_total"] += simulation["summary"]["system_total"]
    session["simulations"]["service_total"] += simulation["summary"]["service_total"]
    session["simulations"]["server_free"] += simulation["summary"]["server_free"]

    session.modified = True
    return Response(json.dumps(simulation), mimetype="json")


@APP.route("/get_simulation")
def get_simulation():
    """
        Retorna uma simulação realizada
    """

    distr = request.args.get('distr')
    if distr == "uniform":
        simulation = RandomSimulation(
            session["simulations"]["clients"],
            (session["simulations"]["arv_min"], session["simulations"]["arv_max"]),
            (session["simulations"]["atd_min"], session["simulations"]["atd_max"]),
            "uniform").__dict__
    elif distr == "exponential":
        simulation = RandomSimulation(
            session["simulations"]["clients"],
            session["simulations"]["arv_exp_mean"],
            session["simulations"]["atd_exp_mean"],
            "exponential").__dict__

    get_simulation_data(simulation)
    print("\nMY SIMULATION AFTER  IS ", simulation)

    print(session["simulations"])
    session["simulations"]["iterations"] += 1
    session["simulations"]["queue_total"] += simulation["summary"]["queue_total"]
    session["simulations"]["system_total"] += simulation["summary"]["system_total"]
    session["simulations"]["service_total"] += simulation["summary"]["service_total"]
    session["simulations"]["server_free"] += simulation["summary"]["server_free"]

    session.modified = True
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
        queue_model = sim_form.queue_model.data
        queue_model = queue_model if queue_model is not None and queue_model != "" else "mm1"
        if arrival_type is None or sim_form.clients.data is None:
            return render_template("home.html.j2", form=sim_form, failure=True)

        if arrival_type == "random" and queue_model == "mm1":

            if sim_form.distributions.data == "uniform" and None not in[
                    sim_form.arv_min.data, sim_form.arv_max.data, sim_form.atd_min.data,
                    sim_form.atd_max.data, sim_form.distributions.data]:

                session["simulations"] = {
                    "simulations": [], "clients": sim_form.clients.data, "distr": "uniform",
                    "arv_min": sim_form.arv_min.data, "arv_max": sim_form.arv_max.data,
                    "atd_min": sim_form.atd_min.data, "atd_max": sim_form.atd_max.data,
                    "iterations": 0, "queue_total": 0, "system_total": 0,
                    "service_total": 0, "server_free": 0, "queue_model": "mm1"
                }
                return render_template(
                    "random.html.j2", clients=sim_form.clients.data, distr="uniform", model="mm1")

            if (sim_form.distributions.data == "exponential" and
                    sim_form.arv_exp_mean.data is not None and
                    sim_form.atd_exp_mean.data is not None):

                session["simulations"] = {
                    "simulations": [], "clients": sim_form.clients.data, "distr": "exponential",
                    "arv_exp_mean": sim_form.arv_exp_mean.data,
                    "atd_exp_mean": sim_form.atd_exp_mean.data,
                    "iterations": 0, "queue_total": 0, "system_total": 0,
                    "service_total": 0, "server_free": 0, "queue_model": "mm1"
                }
                return render_template(
                    "random.html.j2", clients=sim_form.clients.data, distr="exponential", model="mm1")

        if arrival_type == "random" and queue_model == "mm2":
            if sim_form.distributions.data == "uniform" and None not in[
                    sim_form.arv_min.data, sim_form.arv_max.data, sim_form.atd_min.data,
                    sim_form.atd_max.data, sim_form.distributions.data]:

                session["simulations"] = {
                    "simulations": [], "clients": sim_form.clients.data, "distr": "uniform",
                    "arv_min": sim_form.arv_min.data, "arv_max": sim_form.arv_max.data,
                    "atd_min": sim_form.atd_min.data, "atd_max": sim_form.atd_max.data,
                    "iterations": 0, "queue_total": 0, "system_total": 0,
                    "service_total": 0, "server_free": 0, "queue_model": "mm2"
                }
                return render_template(
                    "random.html.j2", clients=sim_form.clients.data, distr="uniform", model="mm2")

            if (sim_form.distributions.data == "exponential" and
                    sim_form.arv_exp_mean.data is not None and
                    sim_form.atd_exp_mean.data is not None):

                session["simulations"] = {
                    "simulations": [], "clients": sim_form.clients.data, "distr": "exponential",
                    "arv_exp_mean": sim_form.arv_exp_mean.data,
                    "atd_exp_mean": sim_form.atd_exp_mean.data,
                    "iterations": 0, "queue_total": 0, "system_total": 0,
                    "service_total": 0, "server_free": 0, "queue_model": "mm2"
                }
                return render_template(
                    "random.html.j2", clients=sim_form.clients.data, distr="exponential", model="mm2")

        return render_template("home.html.j2", form=sim_form, failure=True)

    return render_template("home.html.j2", form=sim_form)


# Global code

if __name__ == "__main__":
    APP.run(host='0.0.0.0', debug=True)
