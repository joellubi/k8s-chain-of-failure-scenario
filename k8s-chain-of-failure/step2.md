### Play around with any of the following parameters
```yaml{8,27,29,31,33,78,80}
apiVersion: apps/v1
kind: Deployment
metadata:
  labels:
    app: microservice
  name: microservice
spec:
  replicas: 1
  selector:
    matchLabels:
      app: microservice
  template:
    metadata:
      labels:
        app: microservice
    spec:
      containers:
      - image: joellubi/k8s-chain-of-failure-server
        name: k8s-chain-of-failure-server
        readinessProbe:
          httpGet:
            path: /healthz
            port: 3000
          periodSeconds: 1
        env:
        - name: AVERAGE_REQUESTS_UNTIL_FAILURE
          value: "10"
        - name: TRIAL_NUMBER
          value: "0"
        - name: BECOMES_UNRESPONSIVE
          value: "false"
        - name: SIMULATE_RESOURCES
          value: "false"
        resources:
          limits:
            cpu: 100m
            memory: 256Mi
          requests:
            cpu: 100m
            memory: 256Mi
---
apiVersion: v1
kind: Service
metadata:
  labels:
    app: microservice
  name: microservice
spec:
  ports:
  - port: 80
    protocol: TCP
    targetPort: 3000
  selector:
    app: microservice
  type: ClusterIP
---
apiVersion: apps/v1
kind: Deployment
metadata:
  labels:
    app: load-generator
  name: load-generator
spec:
  replicas: 1
  selector:
    matchLabels:
      app: load-generator
  template:
    metadata:
      labels:
        app: load-generator
    spec:
      containers:
      - image: joellubi/k8s-chain-of-failure-load-generator
        name: k8s-chain-of-failure-load-generator
        env:
        - name: REQUESTS_PER_MINUTE
          value: "10"
        - name: NUM_BACKENDS_EXPECTED
          value: "1" # This should always match 'replicas' of the microservice Deployment
        resources:
          limits:
            cpu: 200m
            memory: 256Mi
          requests:
            cpu: 200m
            memory: 256Mi
```