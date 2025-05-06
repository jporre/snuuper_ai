 #!/bin/bash

gcloud config set project snuuper-01
# Nombre de la regla de firewall en GCP
FIREWALL_RULE_NAME="default-allow-ssh"

# Obtener la dirección IP pública
MY_IP=$(curl -s https://api.ipify.org)

# Obtener los rangos de IP actuales en la regla de firewall
CURRENT_IP_RANGES=$(gcloud compute firewall-rules describe $FIREWALL_RULE_NAME --format="value(sourceRanges)")

# Reemplazar punto y coma por comas en la lista de rangos de IP actuales
CURRENT_IP_RANGES=${CURRENT_IP_RANGES//;/,}

# Verificar si la IP pública ya está en la regla de firewall
if [[ $CURRENT_IP_RANGES != *"$MY_IP"* ]]; then
    # Agregar la IP pública a la lista de rangos de IP
    NEW_IP_RANGES="${CURRENT_IP_RANGES},${MY_IP}"

    # Actualizar la regla de firewall
    gcloud compute firewall-rules update $FIREWALL_RULE_NAME --source-ranges=$NEW_IP_RANGES

    echo "La dirección IP $MY_IP ha sido agregada a la regla de firewall $FIREWALL_RULE_NAME."
else
    echo "La dirección IP $MY_IP ya está en la regla de firewall $FIREWALL_RULE_NAME."
fi