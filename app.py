"""
    Modelagem e Simulação de um sistema de Filas - APP Flask
"""

# Imports
import json
from random import randint
from flask import Flask, render_template, request, Response, session
from forms import SimulationForm
from models import RandomSimulation, NewRandomSimulation

# Global Variables

APP = Flask(__name__)
APP.secret_key = "socrates-plato-aristotle-zeno"

RND_SIM = None


@APP.route("/rnd_sim")
def random_simulation():
    """
        Retorna uma funcao que gera tuplas de chegada e atendimento
    """
    def generate():
        """
            Gera tuplas chegada-atendimento
        """
        yield json.dumps({"arv": randint(RND_SIM.arv_min, RND_SIM.arv_max),
                          "atd": randint(RND_SIM.atd_min, RND_SIM.atd_max)})

    return Response(generate(), mimetype="json")

@APP.route("/get_random")
def simulate_random():
    """
        Retorna uma funcao que gera tuplas de chegada e atendimento
    """
    def generate_json(simulation):
        """
            Converte tuplas para json
        """

        yield json.dumps(simulation.get_next())

    simu_dict = session["simulation"]
    print(simu_dict)
    simu_obj = NewRandomSimulation(*[
        simu_dict["clients"],
        (simu_dict["arrival_distr"]["minimum"], simu_dict["arrival_distr"]["maximum"]),
        (simu_dict["attendance_distr"]["minimum"], simu_dict["attendance_distr"]["maximum"]),
        simu_dict["distr"]])
    simu_obj.generate_objects()

    return Response(generate_json(simu_obj), mimetype="json")

# Routes


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
            global RND_SIM
            RND_SIM = RandomSimulation(sim_form.clients.data, sim_form.arv_min.data,
                                       sim_form.arv_max.data, sim_form.atd_min.data,
                                       sim_form.atd_max.data)

            session["simulation"] = NewRandomSimulation(sim_form.clients.data, (
                sim_form.arv_min.data, sim_form.arv_max.data), (
                    sim_form.atd_min.data, sim_form.atd_max.data), "uniform").__dict__

            return render_template("random2.html.j2", simulation=session["simulation"])

        return render_template("home.html.j2", form=sim_form, failure=True)

    return render_template("home.html.j2", form=sim_form)


# Global code

if __name__ == "__main__":
    APP.run(debug=True)
