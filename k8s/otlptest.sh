#!/bin/bash

# OTLP Protobuf Log Tester for VictoriaLogs
# Uses otel-cli to send proper OTLP protobuf logs
# Usage: ./test_vlogs_otlp.sh [endpoint] [count]

# Configuration
ENDPOINT=${1:-"http://localhost:9481"}
COUNT=${2:-5}
OTLP_ENDPOINT="$ENDPOINT/insert/opentelemetry/v1/logs"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${BLUE}=== VictoriaLogs OTLP Protobuf Log Tester ===${NC}"
echo -e "${BLUE}Endpoint: $OTLP_ENDPOINT${NC}"
echo -e "${BLUE}Logs to send: $COUNT${NC}"
echo ""

# Check if otel-cli is available
if ! command -v otel-cli &> /dev/null; then
    echo -e "${YELLOW}otel-cli not found. Installing...${NC}"
    
    # Download otel-cli
    if command -v wget &> /dev/null; then
        wget -O /tmp/otel-cli https://github.com/equinix-labs/otel-cli/releases/latest/download/otel-cli-linux-amd64
    elif command -v curl &> /dev/null; then
        curl -L -o /tmp/otel-cli https://github.com/equinix-labs/otel-cli/releases/latest/download/otel-cli-linux-amd64
    else
        echo -e "${RED}Error: Neither wget nor curl found. Please install otel-cli manually.${NC}"
        echo "Download from: https://github.com/equinix-labs/otel-cli/releases"
        exit 1
    fi
    
    chmod +x /tmp/otel-cli
    sudo mv /tmp/otel-cli /usr/local/bin/ 2>/dev/null || {
        echo -e "${YELLOW}Cannot move to /usr/local/bin, using from /tmp${NC}"
        export PATH="/tmp:$PATH"
    }
fi

# Test connectivity
echo -e "${BLUE}Testing connectivity...${NC}"
if curl -f -s -m 5 -o /dev/null "$ENDPOINT/health" 2>/dev/null; then
    echo -e "${GREEN}✓ VictoriaLogs health endpoint responded${NC}"
elif curl -f -s -m 5 --head "$OTLP_ENDPOINT" 2>/dev/null; then
    echo -e "${GREEN}✓ OTLP endpoint is reachable${NC}"
else
    echo -e "${RED}✗ Cannot reach endpoint. Make sure port forwarding is running:${NC}"
    echo -e "${YELLOW}kubectl port-forward service/vlc-victoria-logs-cluster-vlinsert 9481:9481 -n monitoring${NC}"
    exit 1
fi

# Arrays for random data
SERVICES=("web-api" "auth-service" "user-service" "payment-gateway" "notification-service" "data-processor")
LEVELS=("info" "warn" "error" "debug")
MESSAGES=(
    "User authentication successful"
    "Database connection established" 
    "Processing payment transaction"
    "Cache miss for key user:12345"
    "HTTP request completed"
    "Background job started"
    "Email notification sent"
    "API rate limit exceeded"
    "Health check passed"
    "Configuration reloaded"
)

# Function to get random element from array
get_random() {
    local arr=("$@")
    echo "${arr[$RANDOM % ${#arr[@]}]}"
}

# Function to send log using otel-cli
send_otlp_log() {
    local service=$(get_random "${SERVICES[@]}")
    local level=$(get_random "${LEVELS[@]}")  
    local message=$(get_random "${MESSAGES[@]}")
    local user_id=$((RANDOM % 10000))
    local request_id="req-$(openssl rand -hex 4 2>/dev/null || echo $(date +%s))"
    
    # Set environment variables for otel-cli
    export OTEL_EXPORTER_OTLP_ENDPOINT="$ENDPOINT"
    export OTEL_EXPORTER_OTLP_LOGS_ENDPOINT="$OTLP_ENDPOINT"
    export OTEL_SERVICE_NAME="$service"
    export OTEL_SERVICE_VERSION="1.0.0"
    export OTEL_RESOURCE_ATTRIBUTES="environment=test,host.name=test-host-$((RANDOM % 3 + 1)),k8s.namespace.name=default"
    
    # Send log using otel-cli
    if otel-cli logs add \
        --endpoint "$OTLP_ENDPOINT" \
        --service-name "$service" \
        --service-version "1.0.0" \
        --level "$level" \
        --body "$message" \
        --attrs "user.id=$user_id,request.id=$request_id,test.run=bash-otlp-test,http.method=GET,http.status_code=$((200 + RANDOM % 300))" \
        --timeout 10s \
        >/dev/null 2>&1; then
        
        echo -e "${GREEN}✓${NC} [$1] OTLP log sent: ${YELLOW}$service${NC} - $level - $message"
        return 0
    else
        echo -e "${RED}✗${NC} [$1] Failed to send OTLP log"
        return 1
    fi
}

# Alternative method using grpcurl (if available)
send_with_grpcurl() {
    if ! command -v grpcurl &> /dev/null; then
        return 1
    fi
    
    local service=$(get_random "${SERVICES[@]}")
    local message=$(get_random "${MESSAGES[@]}")
    
    # Create protobuf message (simplified)
    local proto_message='{
        "resource_logs": [{
            "resource": {
                "attributes": [{
                    "key": "service.name",
                    "value": {"string_value": "'$service'"}
                }]
            },
            "scope_logs": [{
                "log_records": [{
                    "time_unix_nano": "'$(date +%s%N)'",
                    "severity_text": "INFO",
                    "body": {"string_value": "'$message'"}
                }]
            }]
        }]
    }'
    
    # This would need the actual proto definition
    # grpcurl -plaintext -d "$proto_message" localhost:4317 opentelemetry.proto.collector.logs.v1.LogsService/Export
    return 1
}

# Alternative method using otelcol-contrib as a proxy
send_via_otelcol() {
    echo -e "${BLUE}Alternative: Creating temporary otel-collector config...${NC}"
    
    cat > /tmp/otel-proxy-config.yaml << EOF
receivers:
  otlp:
    protocols:
      http:
        endpoint: 0.0.0.0:4318

exporters:
  otlphttp/vlogs:
    endpoint: $OTLP_ENDPOINT
    compression: gzip

service:
  pipelines:
    logs:
      receivers: [otlp]
      exporters: [otlphttp/vlogs]
EOF

    echo -e "${YELLOW}You can run a temporary collector with:${NC}"
    echo "otelcol-contrib --config=/tmp/otel-proxy-config.yaml"
    echo ""
    echo -e "${YELLOW}Then send logs via:${NC}"
    echo 'curl -X POST http://localhost:4318/v1/logs \'
    echo '  -H "Content-Type: application/json" \'  
    echo '  -d '\''{"resourceLogs":[{"scopeLogs":[{"logRecords":[{"body":{"stringValue":"test"}}]}]}]}'\'''
}

# Docker-based solution
send_via_docker() {
    echo -e "${BLUE}Alternative: Using Docker with otel/opentelemetry-collector-contrib...${NC}"
    
    # Create config
    cat > /tmp/otel-docker-config.yaml << EOF
receivers:
  otlp:
    protocols:
      http:
        endpoint: 0.0.0.0:4318

exporters:
  otlphttp/vlogs:
    endpoint: $OTLP_ENDPOINT
    compression: gzip
    timeout: 30s

service:
  pipelines:
    logs:
      receivers: [otlp]
      exporters: [otlphttp/vlogs]
EOF

    echo -e "${YELLOW}Run this Docker command:${NC}"
    echo "docker run --rm -p 4318:4318 -v /tmp/otel-docker-config.yaml:/etc/otel/config.yaml otel/opentelemetry-collector-contrib:latest --config=/etc/otel/config.yaml"
    echo ""
    echo -e "${YELLOW}Then send logs via JSON to the Docker collector:${NC}"
    echo 'curl -X POST http://localhost:4318/v1/logs \'
    echo '  -H "Content-Type: application/json" \'
    echo '  -d '\''{"resourceLogs":[{"resource":{"attributes":[{"key":"service.name","value":{"stringValue":"docker-test"}}]},"scopeLogs":[{"logRecords":[{"timeUnixNano":"'$(date +%s%N)'","body":{"stringValue":"Docker test message"}}]}]}]}'\'''
}

# Main execution
if command -v otel-cli &> /dev/null; then
    echo -e "${BLUE}Sending OTLP protobuf logs using otel-cli...${NC}"
    
    sent=0
    failed=0
    
    for i in $(seq 1 $COUNT); do
        if send_otlp_log $i; then
            ((sent++))
        else
            ((failed++))
        fi
        sleep 1
    done
    
    echo ""
    echo -e "${GREEN}=== Test Summary ===${NC}"
    echo -e "${GREEN}OTLP logs sent: $sent${NC}"
    echo -e "${RED}Failed: $failed${NC}"
    
    if [ $sent -gt 0 ]; then
        echo ""
        echo -e "${YELLOW}Query VictoriaLogs to verify:${NC}"
        query_endpoint="$ENDPOINT/select/logsql/query"
        echo "curl -G '$query_endpoint' --data-urlencode 'query={test.run=\"bash-otlp-test\"}[5m]' --data-urlencode 'limit=10'"
    fi
else
    echo -e "${RED}otel-cli installation failed or not working.${NC}"
    echo ""
    echo -e "${YELLOW}Here are alternative methods:${NC}"
    echo ""
    
    send_via_otelcol
    echo ""
    send_via_docker
    
    echo ""
    echo -e "${BLUE}=== Manual Kubernetes Testing ===${NC}"
    echo "You can also test by deploying an OpenTelemetry collector in Kubernetes:"
    echo ""
    echo "kubectl apply -f - << EOF"
    cat << 'EOF'
apiVersion: v1
kind: ConfigMap
metadata:
  name: otel-test-config
data:
  config.yaml: |
    receivers:
      otlp:
        protocols:
          http:
            endpoint: 0.0.0.0:4318
    exporters:
      otlphttp/vlogs:
        endpoint: http://vlc-victoria-logs-cluster-vlinsert.monitoring.svc.cluster.local:9481/insert/opentelemetry/v1/logs
        compression: gzip
    service:
      pipelines:
        logs:
          receivers: [otlp]
          exporters: [otlphttp/vlogs]
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: otel-test-collector
spec:
  selector:
    matchLabels:
      app: otel-test
  template:
    metadata:
      labels:
        app: otel-test
    spec:
      containers:
      - name: collector
        image: otel/opentelemetry-collector-contrib:latest
        args: ["--config=/etc/otel/config.yaml"]
        volumeMounts:
        - name: config
          mountPath: /etc/otel
        ports:
        - containerPort: 4318
      volumes:
      - name: config
        configMap:
          name: otel-test-config
---
apiVersion: v1
kind: Service
metadata:
  name: otel-test-service
spec:
  selector:
    app: otel-test
  ports:
  - port: 4318
    targetPort: 4318
EOF
    
    echo ""
    echo "Then port-forward and send JSON logs:"
    echo "kubectl port-forward service/otel-test-service 4318:4318"
    echo 'curl -X POST http://localhost:4318/v1/logs -H "Content-Type: application/json" -d '\''{"resourceLogs":[{"scopeLogs":[{"logRecords":[{"body":{"stringValue":"K8s test log"}}]}]}]}'\'''
fi

echo ""
echo -e "${BLUE}Test completed!${NC}"