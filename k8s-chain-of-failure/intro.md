This scenario involves a replicated microservice and a load-generator targeting it.

The entire scenario is defined in the manifest found at `/assets/scenario.yaml`{{}}.

Deploy the scenario by running
`kubectl apply -f /assets/scenario.yaml`

Tear down the scenario by running
`kubectl delete -f /assets/scenario.yaml`

You may edit various parameters of the manifest with
`vi /assets/scenario.yaml`


See the next page for more details regarding the parameters that may be configured.